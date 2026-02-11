import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { WebhookQueueService } from '../queue/webhook-queue.service';
import * as fs from 'fs';
import * as path from 'path';

import { WorkflowService } from './workflow.service';

@Injectable()
export class ErpService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private webhookQueue: WebhookQueueService,
    private workflow: WorkflowService,
  ) { }

  private buildDateFilter(dateField: string, year?: number, month?: number) {
    if (!year && !month) return {};

    // Convert string to number if they come as strings
    const y = year ? Number(year) : new Date().getFullYear();
    // If year is not provided but month is, we assume current year for safety, or we could require year.
    // But the controller types are `number`.

    let startDate = new Date(y, 0, 1);
    let endDate = new Date(y, 11, 31, 23, 59, 59, 999);

    if (month) {
      const m = Number(month) - 1; // 0-based
      startDate = new Date(y, m, 1);
      endDate = new Date(y, m + 1, 0, 23, 59, 59, 999);
    }

    return {
      [dateField]: {
        gte: startDate,
        lte: endDate,
      },
    };
  }

  // --- STOCK ---
  async getStock(companyId: string) {
    return this.prisma.stockItem.findMany({
      where: { companyId },
      include: { movements: true, categoryRel: true, supplier: true },
    });
  }

  async createStockItem(companyId: string, data: any, userId?: string) {
    const { id, ...rest } = data;
    const initialQuantity = rest.quantity || 0;

    // Sanitize data
    const sanitizedData = {
      ...rest,
      quantity: 0, // Always start at 0, allow movement to handle it
      companyId,
      supplierId: rest.supplierId || null,
      categoryId: rest.categoryId || null,
      expiryDate: rest.expiryDate ? new Date(rest.expiryDate) : undefined,
      manufacturingDate: rest.manufacturingDate ? new Date(rest.manufacturingDate) : undefined,
    };

    const product = await this.prisma.$transaction(async (tx) => {
      // 1. Create Product
      const newProduct = await tx.stockItem.create({
        data: sanitizedData,
      });

      // 2. If initial quantity > 0, create an Initialization Movement
      if (initialQuantity > 0) {
        // Create movement
        const movement = await tx.stockMovement.create({
          data: {
            companyId,
            type: 'Reception',
            reference: `INIT-${newProduct.ref}-${Date.now()}`, // Unique Init Reference
            date: new Date(),
            partnerId: 'SYSTEM',
            partnerName: 'Inventaire Initial',
            status: 'Validé',
            totalValue: initialQuantity * (newProduct.value || 0),
            items: {
              create: {
                stockItemId: newProduct.id,
                description: `Stock Initial - ${newProduct.name}`,
                quantity: initialQuantity,
                unitPrice: newProduct.value || 0,
              }
            }
          }
        });

        // Update product quantity strictly via atomic increment
        await tx.stockItem.update({
          where: { id: newProduct.id },
          data: { quantity: { increment: initialQuantity } }
        });

        return { ...newProduct, quantity: initialQuantity };
      }

      return newProduct;
    });

    // LOGGING
    await this.audit.log({
      action: 'CREATE',
      entity: 'StockItem',
      entityId: product.id,
      newValue: product,
      userId,
      companyId,
    });

    return product;
  }

  async updateStockItem(id: string, data: any, userId?: string) {
    const { id: _, companyId: __, items, movements, categoryRel, supplier, ...rest } = data; // remove relations and ids
    const sanitizedData: any = { ...rest };

    if (typeof data.supplierId !== 'undefined') sanitizedData.supplierId = data.supplierId || null;
    if (typeof data.categoryId !== 'undefined') sanitizedData.categoryId = data.categoryId || null;
    if (data.expiryDate) sanitizedData.expiryDate = new Date(data.expiryDate);
    if (data.manufacturingDate) sanitizedData.manufacturingDate = new Date(data.manufacturingDate);

    // Fetch old value for audit
    const oldProduct = await this.prisma.stockItem.findUnique({ where: { id } });

    const product = await this.prisma.stockItem.update({
      where: { id },
      data: sanitizedData,
    });

    // CHECK REPLENISHMENT
    await this.checkReplenishment(this.prisma, product.id, product.companyId);

    // LOGGING
    await this.audit.log({
      action: 'UPDATE',
      entity: 'StockItem',
      entityId: product.id,
      oldValue: oldProduct,
      newValue: product,
      userId,
      companyId: product.companyId,
    });

    return product;
  }

  async deleteStockItem(id: string, userId?: string) {
    const oldProduct = await this.prisma.stockItem.findUnique({ where: { id } });
    if (!oldProduct) throw new NotFoundException('Article non trouvé');

    const result = await this.prisma.stockItem.delete({ where: { id } });

    // LOGGING
    await this.audit.log({
      action: 'DELETE',
      entity: 'StockItem',
      entityId: id,
      oldValue: oldProduct,
      userId,
      companyId: oldProduct.companyId,
    });

    return result;
  }

  async getSuppliers(companyId: string) {
    return this.prisma.supplier.findMany({
      where: { companyId },
    });
  }

  async createSupplier(companyId: string, data: any) {
    return this.prisma.supplier.create({
      data: { ...data, companyId },
    });
  }

  async updateSupplier(id: string, data: any) {
    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async deleteSupplier(id: string) {
    return this.prisma.supplier.delete({ where: { id } });
  }

  async getAuditLogs(companyId: string, filters: any = {}) {
    return this.audit.getLogs(companyId, filters);
  }

  async getMovements(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.year || filters.month) {
      Object.assign(where, this.buildDateFilter('date', filters.year, filters.month));
    }

    return this.prisma.stockMovement.findMany({
      where,
      include: { items: true },
      orderBy: { date: 'desc' },
    });
  }

  async createMovement(companyId: string, data: any) {
    const { id, items, ...movementData } = data;
    // Fix: Auto-resolve partnerName if missing but partnerId exists
    if (!movementData.partnerName && movementData.partnerId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: movementData.partnerId },
      });
      if (supplier) {
        movementData.partnerName = supplier.name;
        movementData.supplierId = supplier.id;
      } else {
        const contact = await this.prisma.contactCrm.findUnique({
          where: { id: movementData.partnerId },
        });
        if (contact) {
          movementData.partnerName = contact.companyName || contact.contactName;
        } else {
          movementData.partnerName = 'N/A';
        }
      }
    } else if (!movementData.partnerName) {
      movementData.partnerName = 'N/A';
    }

    return this.prisma.stockMovement.create({
      data: {
        ...movementData,
        companyId,
        date: new Date(movementData.date),
        items: {
          create: items.map((i: any) => ({
            stockItemId: i.stockId,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
  }

  async validateMovement(id: string) {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!movement) throw new NotFoundException('Mouvement non trouvé');
    if (movement.status === 'Validé') return movement;

    // Use a transaction to ensure integrity
    await this.prisma.$transaction(async (tx) => {
      // Mettre à jour les stocks pour chaque item
      for (const item of movement.items) {
        const product = await tx.stockItem.findUnique({ where: { id: item.stockItemId } });
        if (product) {
          if (movement.type === 'Reception') {
            // Calculate Weighted Average Price (PMP)
            const totalValue = (product.quantity * product.value) + (item.quantity * item.unitPrice);
            const totalQty = product.quantity + item.quantity;
            const newPMP = totalQty > 0 ? totalValue / totalQty : product.value;

            await tx.stockItem.update({
              where: { id: item.stockItemId },
              data: {
                quantity: { increment: item.quantity },
                value: newPMP
              },
            });
          } else if (movement.type === 'Inventaire') {
            // In an inventory, the 'quantity' in the movement item is typically the NEW TOTAL quantity
            // to reconcile with.
            await tx.stockItem.update({
              where: { id: item.stockItemId },
              data: { quantity: item.quantity },
            });
          } else {
            // Check for negative stock
            if (product.quantity < item.quantity) {
              throw new Error(`Stock insuffisant pour l'article ${product.name} (Requis: ${item.quantity}, Dispo: ${product.quantity})`);
            }

            await tx.stockItem.update({
              where: { id: item.stockItemId },
              data: { quantity: { decrement: item.quantity } },
            });
          }
        }
      }

      await tx.stockMovement.update({
        where: { id },
        data: { status: 'Validé' },
      });

      // CHECK REPLENISHMENT FOR ALL ITEMS
      for (const item of movement.items) {
        await this.checkReplenishment(tx, item.stockItemId, movement.companyId);
      }

      // TRIGGER WEBHOOK
      if (movement.type === 'Reception') {
        await this.triggerWebhook(movement.companyId, 'stock.reception', {
          movementId: movement.id,
          reference: movement.reference,
          itemsCount: movement.items.length
        });
      }
    });

    return this.prisma.stockMovement.findUnique({
      where: { id },
      include: { items: true }
    });
  }

  async getStockCategories(companyId: string) {
    return this.prisma.stockCategory.findMany({
      where: { companyId },
    });
  }

  async createStockCategory(companyId: string, data: any) {
    return this.prisma.stockCategory.create({
      data: { ...data, companyId },
    });
  }

  // --- CRM ---
  async getContacts(companyId: string) {
    return this.prisma.contactCrm.findMany({
      where: { companyId },
      include: { deals: true, quotes: true },
    });
  }

  async createContact(companyId: string, data: any) {
    return this.prisma.contactCrm.create({
      data: {
        ...data,
        companyId,
        lastContact: data.lastContact ? new Date(data.lastContact) : new Date(),
      },
    });
  }

  async updateContact(id: string, data: any) {
    return this.prisma.contactCrm.update({
      where: { id },
      data: {
        ...data,
        lastContact: data.lastContact ? new Date(data.lastContact) : undefined,
      },
    });
  }

  async deleteContact(id: string) {
    return this.prisma.contactCrm.delete({ where: { id } });
  }

  async getDeals(companyId: string) {
    return this.prisma.deal.findMany({
      where: { companyId },
      include: { contact: true },
    });
  }

  async createDeal(companyId: string, data: any) {
    const deal = await this.prisma.deal.create({
      data: {
        ...data,
        companyId,
        closingDate: data.closingDate ? new Date(data.closingDate) : new Date(),
      },
    });

    await this.triggerWebhook(companyId, 'deal.created', {
      dealId: deal.id,
      title: deal.title,
      amount: deal.amount
    });

    return deal;
  }

  async updateDeal(id: string, data: any) {
    const { id: _, companyId: __, contact, ...dealData } = data; // Remove relations

    const result = await this.prisma.deal.update({
      where: { id },
      data: {
        ...dealData,
        closingDate: dealData.closingDate ? new Date(dealData.closingDate) : undefined,
      },
      include: { contact: true },
    });

    if (result.stage === 'Gagné' || result.stage === 'Won') {
      await this.workflow.trigger('deal.won', {
        dealId: result.id,
        companyId: result.companyId
      });
    }

    await this.triggerWebhook(result.companyId, result.stage === 'Gagné' ? 'deal.won' : 'deal.updated', {
      dealId: result.id,
      title: result.title,
      status: result.stage,
      amount: result.amount
    });

    return result;
  }

  async deleteDeal(id: string) {
    return this.prisma.deal.delete({ where: { id } });
  }

  // --- FINANCE ---
  async getQuotes(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.year || filters.month) {
      Object.assign(where, this.buildDateFilter('date', filters.year, filters.month));
    }

    return this.prisma.quote.findMany({
      where,
      include: { items: true },
    });
  }

  async createQuote(companyId: string, data: any) {
    const { id, items, ...quoteData } = data;
    // Link to CRM if possible
    if (quoteData.clientId) {
      quoteData.contactCrmId = quoteData.clientId;
    }
    return this.prisma.quote.create({
      data: {
        ...quoteData,
        companyId,
        date: new Date(quoteData.date),
        validUntil: quoteData.validUntil ? new Date(quoteData.validUntil) : new Date(),
        items: {
          create: items.map((i: any) => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.total,
          })),
        },
      },
      include: { items: true },
    });
  }

  async updateQuote(id: string, data: any) {
    const { id: _, companyId: __, items, ...quoteData } = data;

    // Simple update: delete items and recreate them (standard practice for simple nested updates)
    if (items) {
      await this.prisma.quoteItem.deleteMany({ where: { quoteId: id } });
      return this.prisma.quote.update({
        where: { id },
        data: {
          ...quoteData,
          date: quoteData.date ? new Date(quoteData.date) : undefined,
          validUntil: quoteData.validUntil ? new Date(quoteData.validUntil) : undefined,
          items: {
            create: items.map((i: any) => ({
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.total,
            })),
          },
        },
        include: { items: true },
      });
    }

    return this.prisma.quote.update({
      where: { id },
      data: quoteData,
      include: { items: true },
    });
  }

  async deleteQuote(id: string) {
    await this.prisma.quoteItem.deleteMany({ where: { quoteId: id } });
    return this.prisma.quote.delete({ where: { id } });
  }

  async getAccounting(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.year || filters.month) {
      Object.assign(where, this.buildDateFilter('date', filters.year, filters.month));
    }

    return this.prisma.accountingEntry.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async createTransaction(companyId: string, data: any) {
    const { id, ...rest } = data;
    return this.prisma.accountingEntry.create({
      data: {
        ...rest,
        companyId,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  async updateTransaction(id: string, data: any) {
    const { id: _, companyId: __, ...rest } = data;
    return this.prisma.accountingEntry.update({
      where: { id },
      data: {
        ...rest,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async deleteTransaction(id: string) {
    return this.prisma.accountingEntry.delete({ where: { id } });
  }

  private mapEmployeeStatus(status: string): any {
    const mapping: any = {
      Actif: 'ACTIVE',
      Congé: 'ON_LEAVE',
      Arrêt: 'INACTIVE',
      Sorti: 'TERMINATED',
      ACTIVE: 'ACTIVE',
      ON_LEAVE: 'ON_LEAVE',
      INACTIVE: 'INACTIVE',
      TERMINATED: 'TERMINATED',
    };
    return mapping[status] || 'ACTIVE';
  }

  private mapContractType(type: string): any {
    const mapping: any = {
      CDI: 'CDI',
      CDD: 'CDD',
      Freelance: 'FREELANCE',
      Stage: 'INTERN',
      FREELANCE: 'FREELANCE',
      INTERN: 'INTERN',
    };
    return mapping[type] || 'CDI';
  }

  async getEmployees(companyId: string) {
    return this.prisma.employee.findMany({
      where: { companyId },
    });
  }

  async createEmployee(companyId: string, data: any) {
    const { id, password, ...employeeData } = data;

    // 1. Gérer le compte utilisateur (User) pour la connexion
    let userId = employeeData.userId;
    if (employeeData.email) {
      let user = await this.prisma.user.findUnique({ where: { email: employeeData.email } });

      if (!user && password) {
        // Créer le compte utilisateur s'il n'existe pas
        user = await this.prisma.user.create({
          data: {
            email: employeeData.email,
            name: employeeData.fullName,
            passwordHash: await bcrypt.hash(password, 10),
            globalRole: 'USER',
          },
        });
      } else if (user && password) {
        // Mettre à jour le mot de passe si l'utilisateur existe déjà
        await this.prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: await bcrypt.hash(password, 10) },
        });
      }
      if (user) userId = user.id;
    }

    const preparedData: any = {
      ...employeeData,
      companyId,
      userId,
      joinDate: new Date(data.joinDate),
      status: this.mapEmployeeStatus(data.status),
      contractType: this.mapContractType(data.contractType),
      role: data.role || 'EMPLOYEE',
    };

    if (password) {
      preparedData.temporaryPassword = await bcrypt.hash(password, 10);
    }

    return this.prisma.$transaction(async (tx) => {
      const employee = await tx.employee.create({
        data: preparedData,
        include: { user: true },
      });

      await this.workflow.trigger('employee.created', {
        employeeId: employee.id,
        companyId
      });

      await this.triggerWebhook(companyId, 'employee.onboarded', {
        employeeId: employee.id,
        fullName: employee.fullName,
        role: employee.role
      });

      return employee;
    });
  }

  async getPayslips(companyId: string) {
    return this.prisma.payslip.findMany({
      where: { companyId },
      include: { employee: true },
    });
  }

  async createPayslip(companyId: string, data: any) {
    const totalEmployer = (data.cnpsEmployer || 0) + (data.taxEmployer || 0);
    return this.prisma.payslip.create({
      data: {
        ...data,
        companyId,
        date: new Date(data.date),
        totalEmployer: data.totalEmployer || totalEmployer
      },
    });
  }

  async updateEmployee(id: string, data: any) {
    console.log('---------------------------------------------------------');
    console.log('UPDATE EMPLOYEE REQUEST RECEIVED');
    console.log('ID:', id);
    console.log('Has faceDescriptor:', !!data.faceDescriptor);
    if (data.faceDescriptor) {
      console.log('faceDescriptor Length:', data.faceDescriptor.length);
      console.log('First 50 chars:', data.faceDescriptor.substring(0, 50));
    }
    console.log('Full Data Keys:', Object.keys(data));
    console.log('---------------------------------------------------------');
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new Error('Employé non trouvé');

    // 1. Manage User Account (if email provided)
    let userId = employee.userId;
    if (data.email) {
      let user = await this.prisma.user.findUnique({ where: { email: data.email } });

      if (user && data.password) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: await bcrypt.hash(data.password, 10) },
        });
      } else if (!user && data.password) {
        user = await this.prisma.user.create({
          data: {
            email: data.email,
            name: data.fullName || employee.fullName,
            passwordHash: await bcrypt.hash(data.password, 10),
            globalRole: 'USER',
          },
        });
      }
      if (user) userId = user.id;
    }

    // 2. Prepare Clean Update Data (Strict Whitelist)
    // We manually pick fields to avoid passing relations (like 'user', 'payslips') to Prisma which throws errors.
    const updateData: any = {
      matricule: data.matricule,
      fullName: data.fullName,
      position: data.position,
      department: data.department,
      email: data.email,
      phone: data.phone,
      address: data.address,
      baseSalary: data.baseSalary ? parseFloat(data.baseSalary.toString()) : undefined,
      companyId: data.companyId,
      userId: userId,

      // Dates
      joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
      leaveDate: data.leaveDate ? new Date(data.leaveDate) : undefined,

      // Enums / Mapped
      status: data.status ? this.mapEmployeeStatus(data.status) : undefined,
      contractType: data.contractType ? this.mapContractType(data.contractType) : undefined,
      role: data.role || undefined,

      // Critical: Face Descriptor
      faceDescriptor: data.faceDescriptor,
    };

    if (data.password) {
      updateData.temporaryPassword = await bcrypt.hash(data.password, 10);
    }

    // Remove undefined keys so we don't overwrite with null unless intended
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    return this.prisma.employee.update({
      where: { id },
      data: updateData,
      include: { user: true },
    });
  }

  async deleteEmployee(id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }

  // ==========================================
  // NOUVELLES FONCTIONNALITÉS (Step 424)
  // ==========================================

  // --- FINANCES: FACTURES ---
  async getInvoices(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.year || filters.month) {
      Object.assign(where, this.buildDateFilter('date', filters.year, filters.month));
    }

    if (filters.search) {
      where.OR = [
        { reference: { contains: filters.search, mode: 'insensitive' } },
        { clientName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.invoice.findMany({
      where,
      include: { items: true, payments: true },
    });
  }

  async createInvoice(companyId: string, data: any, userId?: string) {
    const { id, items, client, ...invoiceData } = data; // Remove potential 'client' object

    // Transaction to update Quote status if linked
    const result = await this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          ...invoiceData,
          companyId,
          date: new Date(invoiceData.date),
          dueDate: new Date(invoiceData.dueDate),
          items: {
            create: (items || []).map((i: any) => ({
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.total,
            })),
          },
        },
        include: { items: true },
      });

      if (invoice.quoteId) {
        await tx.quote.update({
          where: { id: invoice.quoteId },
          data: { status: 'Facturé' },
        });
      }

      // Auto-generate Accounting Entry if Paid immediately
      if (invoice.status === 'Paid') {
        await tx.accountingEntry.create({
          data: {
            companyId,
            date: new Date(),
            ref: invoice.reference,
            label: `Paiement Facture ${invoice.reference}`,
            category: '701 - Ventes',
            amount: invoice.totalAmount,
            type: 'Credit',
            status: 'Validé',
          },
        });
      }

      return invoice;
    });

    await this.triggerWebhook(companyId, 'invoice.created', {
      invoiceId: result.id,
      reference: result.reference,
      total: result.totalAmount
    });

    if (result.status === 'Paid') {
      await this.triggerWebhook(companyId, 'invoice.paid', {
        invoiceId: result.id,
        reference: result.reference,
        total: result.totalAmount
      });
    }

    // LOGGING
    await this.audit.log({
      action: 'CREATE',
      entity: 'Invoice',
      entityId: result.id,
      newValue: result,
      userId,
      companyId,
    });

    return result;
  }

  async updateInvoice(id: string, data: any, userId?: string) {
    const { id: _, companyId: __, items, client, ...invoiceData } = data; // Remove potential 'client' object

    // Fetch old value
    const oldInvoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true }
    });

    const result = await this.prisma.$transaction(async (tx) => {
      // Check previous status to detect change to 'Paid'
      const existingInvoice = await tx.invoice.findUnique({ where: { id } });

      let updatedInvoice;
      if (items) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } });
        updatedInvoice = await tx.invoice.update({
          where: { id },
          data: {
            ...invoiceData,
            date: invoiceData.date ? new Date(invoiceData.date) : undefined,
            dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
            items: {
              create: items.map((i: any) => ({
                description: i.description,
                quantity: i.quantity,
                unitPrice: i.unitPrice,
                total: i.total,
              })),
            },
          },
          include: { items: true },
        });
      } else {
        updatedInvoice = await tx.invoice.update({
          where: { id },
          data: {
            ...invoiceData,
            date: invoiceData.date ? new Date(invoiceData.date) : undefined,
            dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
          },
          include: { items: true },
        });
      }

      // Trigger Accounting Entry if status changed to Paid
      if (existingInvoice && existingInvoice.status !== 'Paid' && updatedInvoice.status === 'Paid') {
        await tx.accountingEntry.create({
          data: {
            companyId: existingInvoice.companyId,
            date: new Date(),
            ref: updatedInvoice.reference,
            label: `Encaissement Facture ${updatedInvoice.reference}`,
            category: '701 - Ventes',
            amount: updatedInvoice.totalAmount,
            type: 'Credit',
            status: 'Validé',
          },
        });

        // TRIGGER WEBHOOK
        await this.triggerWebhook(existingInvoice.companyId, 'invoice.paid', {
          invoiceId: updatedInvoice.id,
          reference: updatedInvoice.reference,
          total: updatedInvoice.totalAmount,
        });
      }

      return updatedInvoice;
    });

    // LOGGING
    await this.audit.log({
      action: 'UPDATE',
      entity: 'Invoice',
      entityId: id,
      oldValue: oldInvoice,
      newValue: result,
      userId,
      companyId: oldInvoice?.companyId,
    });

    return result;
  }

  async deleteInvoice(id: string, userId?: string) {
    const oldInvoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!oldInvoice) throw new NotFoundException('Facture non trouvée');

    await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
    const result = await this.prisma.invoice.delete({ where: { id } });

    // LOGGING
    await this.audit.log({
      action: 'DELETE',
      entity: 'Invoice',
      entityId: id,
      oldValue: oldInvoice,
      userId,
      companyId: oldInvoice.companyId,
    });

    return result;
  }

  // --- STOCK: COMMANDES FOURNISSEURS ---
  async getPurchaseOrders(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.year || filters.month) {
      Object.assign(where, this.buildDateFilter('date', filters.year, filters.month));
    }

    return this.prisma.purchaseOrder.findMany({
      where,
      include: { items: true, supplier: true },
      orderBy: { date: 'desc' },
    });
  }

  async createPurchaseOrder(companyId: string, data: any) {
    const { id, items, supplierName, supplier, ...poData } = data; // Remove frontend-only fields
    return this.prisma.purchaseOrder.create({
      data: {
        ...poData,
        companyId,
        date: new Date(poData.date),
        expectedDate: poData.expectedDate ? new Date(poData.expectedDate) : undefined,
        items: {
          create: items.map((i: any) => ({
            stockItemId: i.stockItemId || null,
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.total,
          })),
        },
      },
      include: { items: true },
    });
  }

  async updatePurchaseOrder(id: string, data: any) {
    const { id: _, companyId: __, items, supplierName, supplier, ...poData } = data; // Remove frontend-only fields

    if (items) {
      await this.prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
      return this.prisma.purchaseOrder.update({
        where: { id },
        data: {
          ...poData,
          date: poData.date ? new Date(poData.date) : undefined,
          expectedDate: poData.expectedDate ? new Date(poData.expectedDate) : undefined,
          items: {
            create: items.map((i: any) => ({
              stockItemId: i.stockItemId || null,
              description: i.description,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              total: i.total,
            })),
          },
        },
        include: { items: true },
      });
    }
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        ...poData,
        date: poData.date ? new Date(poData.date) : undefined,
        expectedDate: poData.expectedDate ? new Date(poData.expectedDate) : undefined,
      },
    });
  }

  async deletePurchaseOrder(id: string) {
    await this.prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: id } });
    return this.prisma.purchaseOrder.delete({ where: { id } });
  }

  // --- RH: POINTAGE & CONGÉS ---
  async getAttendances(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.year || filters.month) {
      Object.assign(where, this.buildDateFilter('date', filters.year, filters.month));
    }

    const attendances = await this.prisma.attendance.findMany({
      where,
      include: { employee: true },
      orderBy: { date: 'desc' },
    });
    return attendances.map((a) => ({
      ...a,
      employeeName: a.employee?.fullName || 'Inconnu',
    }));
  }

  async createAttendance(companyId: string, data: any) {
    const { employeeName, id, ...rest } = data;
    const dateObj = new Date(data.date);

    return this.prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: rest.employeeId,
          date: dateObj,
        },
      },
      update: {
        checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
        status: rest.status,
      },
      create: {
        ...rest,
        companyId,
        date: dateObj,
        checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
        checkOut: data.checkOut ? new Date(data.checkOut) : undefined,
      },
    });
  }

  async getLeaveRequests(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.year || filters.month) {
      Object.assign(where, this.buildDateFilter('startDate', filters.year, filters.month));
    }

    const requests = await this.prisma.leaveRequest.findMany({
      where,
      include: { employee: true },
      orderBy: { startDate: 'desc' },
    });
    return requests.map((r) => ({
      ...r,
      employeeName: r.employee?.fullName || 'Inconnu',
    }));
  }

  async createLeaveRequest(companyId: string, data: any) {
    const { employeeName, id, ...rest } = data;
    return this.prisma.leaveRequest.create({
      data: {
        ...rest,
        companyId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  async updateLeaveRequest(id: string, data: any) {
    const { employeeName, id: dataId, companyId, ...rest } = data;
    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        ...rest,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        approvedAt: data.status === 'Approved' ? new Date() : undefined,
      },
    });
  }

  // --- TÂCHES ---
  async getTasks(companyId: string, filters: any = {}) {
    const where: any = { companyId };
    if (filters.year || filters.month) {
      // Using dueDate for tasks filtering as it's more relevant for planning
      Object.assign(where, this.buildDateFilter('dueDate', filters.year, filters.month));
    }

    return this.prisma.task.findMany({
      where,
      include: {
        assignedTo: true,
        client: true,
        supplier: true,
        product: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createTask(companyId: string, data: any) {
    const { assignedToName, assignedTo, client, supplier, product, ...taskData } = data; // Remove frontend-only/relation objects

    // Sanitize IDs
    if (taskData.assignedToId === '') taskData.assignedToId = null;
    if (taskData.clientId === '') taskData.clientId = null;
    if (taskData.supplierId === '') taskData.supplierId = null;
    if (taskData.productId === '') taskData.productId = null;

    return this.prisma.task.create({
      data: {
        ...taskData,
        companyId,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
        completedAt: taskData.completedAt ? new Date(taskData.completedAt) : undefined,
        estimatedHours: taskData.estimatedHours ? parseFloat(taskData.estimatedHours) : undefined,
        actualHours: taskData.actualHours ? parseFloat(taskData.actualHours) : undefined,
        tags: Array.isArray(taskData.tags) ? taskData.tags : [],
      },
      include: {
        assignedTo: true,
        client: true,
        supplier: true,
        product: true,
      },
    });
  }

  async updateTask(id: string, data: any) {
    const {
      assignedToName,
      assignedTo,
      client,
      supplier,
      product,
      id: _,
      companyId: __,
      ...taskData
    } = data;

    // Sanitize IDs
    if (taskData.assignedToId === '') taskData.assignedToId = null;
    if (taskData.clientId === '') taskData.clientId = null;
    if (taskData.supplierId === '') taskData.supplierId = null;
    if (taskData.productId === '') taskData.productId = null;

    return this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        startDate: taskData.startDate ? new Date(taskData.startDate) : undefined,
        completedAt: taskData.completedAt ? new Date(taskData.completedAt) : undefined,
        estimatedHours: taskData.estimatedHours ? parseFloat(taskData.estimatedHours) : undefined,
        actualHours: taskData.actualHours ? parseFloat(taskData.actualHours) : undefined,
        tags: Array.isArray(taskData.tags) ? taskData.tags : undefined,
      },
      include: {
        assignedTo: true,
        client: true,
        supplier: true,
        product: true,
      },
    });
  }

  async deleteTask(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  // --- PRIVATE AUTOMATIONS ---

  private async checkReplenishment(tx: any, productId: string, companyId: string) {
    const product = await tx.stockItem.findUnique({
      where: { id: productId },
      include: { supplier: true },
    });

    if (
      product &&
      product.quantity < product.minThreshold &&
      product.supplierId
    ) {
      // Find if there is an existing Draft Purchase Order for this supplier
      let po = await tx.purchaseOrder.findFirst({
        where: {
          companyId,
          supplierId: product.supplierId,
          status: 'Draft',
        },
      });

      if (!po) {
        // Create new Draft PO
        po = await tx.purchaseOrder.create({
          data: {
            companyId,
            supplierId: product.supplierId,
            reference: `PO-AUTO-${Date.now()}`,
            date: new Date(),
            status: 'Draft',
            totalAmount: 0,
          },
        });
      }

      // Check if product is already in the PO
      const existingItem = await tx.purchaseOrderItem.findFirst({
        where: {
          purchaseOrderId: po.id,
          stockItemId: productId,
        },
      });

      if (!existingItem) {
        const refillQty = product.minThreshold * 2 - product.quantity;
        const finalQty = refillQty > 0 ? refillQty : product.minThreshold;

        await tx.purchaseOrderItem.create({
          data: {
            purchaseOrderId: po.id,
            stockItemId: productId,
            description: `Auto-Réappro: ${product.name}`,
            quantity: finalQty,
            unitPrice: product.value || 0,
            total: finalQty * (product.value || 0),
          },
        });

        // Update PO total
        await tx.purchaseOrder.update({
          where: { id: po.id },
          data: {
            totalAmount: { increment: finalQty * (product.value || 0) },
          },
        });

        // CREATE TASK FOR MANAGER TO REVIEW PO
        await tx.task.create({
          data: {
            companyId,
            title: `Validation réapprovisionnement: ${po.reference}`,
            description: `Vérifier et valider le bon de commande auto-généré pour le fournisseur ${product.supplier?.name}.`,
            priority: 'High',
            status: 'Todo',
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // +2 days
          },
        });

        // Trigger Webhook for low stock
        await this.triggerWebhook(companyId, 'stock.low', {
          productId: product.id,
          ref: product.ref,
          name: product.name,
          currentQty: product.quantity,
          threshold: product.minThreshold,
        });
      }
    }
  }

  private async checkInvoicesHealth(companyId: string) {
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ['Sent', 'PartiallyPaid'] },
        dueDate: { lt: new Date() }
      }
    });

    for (const inv of overdueInvoices) {
      // Check if a collection task already exists to avoid duplication
      const existingTask = await this.prisma.task.findFirst({
        where: {
          companyId,
          title: { contains: inv.reference }
        }
      });

      if (!existingTask) {
        await this.workflow.trigger('invoice.overdue', {
          invoiceId: inv.id,
          companyId
        });
      }
    }
  }

  private async triggerWebhook(companyId: string, event: string, payload: any) {
    const webhooks = await this.prisma.webhook.findMany({
      where: { companyId, isActive: true, events: { has: event } },
    });

    for (const webhook of webhooks) {
      // Use the queue service for asynchronous, non-blocking delivery with retry logic
      await this.webhookQueue.enqueue(
        webhook.url,
        event,
        {
          ...payload,
          companyId,
          timestamp: new Date().toISOString(),
        },
        webhook.secret || undefined
      );
    }
  }

  // --- WEBHOOKS & API KEYS ---

  async getWebhooks(companyId: string) {
    return this.prisma.webhook.findMany({ where: { companyId } });
  }

  async createWebhook(companyId: string, data: any) {
    return this.prisma.webhook.create({ data: { ...data, companyId } });
  }

  async deleteWebhook(id: string) {
    return this.prisma.webhook.delete({ where: { id } });
  }

  async getApiKeys(companyId: string) {
    return this.prisma.apiKey.findMany({ where: { companyId } });
  }

  async createApiKey(companyId: string, data: any) {
    // Generate a secure API Key
    const key = `pk_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    return this.prisma.apiKey.create({
      data: { ...data, companyId, key },
    });
  }

  async deleteApiKey(id: string) {
    return this.prisma.apiKey.delete({ where: { id } });
  }

  // --- END OLD MULTI-CURRENCY ---

  // --- GESTION DOCUMENTAIRE (GED) ---

  async getFiles(companyId: string) {
    return this.prisma.fileResource.findMany({
      where: { companyId, parentId: null },
      include: { versions: true },
    });
  }

  async uploadFile(companyId: string, data: any) {
    // Basic OCR Simulation
    const ocrContent = `Texte extrait du document ${data.name}...`;
    // Use provided path (from real upload) or fallback to simulation if missing
    const path = data.path || `/uploads/${companyId}/${Date.now()}_${data.name}`;

    return this.prisma.fileResource.create({
      data: {
        ...data,
        companyId,
        ocrContent,
        path // This will use the variable 'path' which takes precedence or falls back
      },
    });
  }

  async createNewVersion(fileId: string, data: any) {
    const original = await this.prisma.fileResource.findUnique({
      where: { id: fileId },
    });
    if (!original) throw new NotFoundException('Fichier non trouvé');

    const path = `/uploads/${original.companyId}/${Date.now()}_${data.name}`;
    return this.prisma.fileResource.create({
      data: {
        ...data,
        parentId: fileId,
        version: original.version + 1,
        companyId: original.companyId,
        path,
      },
    });
  }

  async deleteFile(id: string) {
    const file = await this.prisma.fileResource.findUnique({
      where: { id },
    });

    if (file && file.path) {
      try {
        // Construct absolute path. 
        // file.path stored as '/uploads/2026/01/file.ext' (relative to root? or public?)
        // The UploadController constructs it as `/${relativePath}` where relativePath is `uploads/2026/01/file.ext`
        // So file.path usually starts with `/uploads`.

        // We need to resolve this to the physical path on disk.
        // Assuming process.cwd() is the backend root.

        const relativePath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
        const absolutePath = path.join(process.cwd(), relativePath);

        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      } catch (error) {
        console.error(`Failed to delete physical file for ${id}:`, error);
        // Continue to delete DB record even if file delete fails
      }
    }

    return this.prisma.fileResource.delete({
      where: { id },
    });
  }

  // --- DICTIONARIES ---
  async getDictionaries(companyId: string, type?: string) {
    return this.prisma.dictionary.findMany({
      where: {
        companyId,
        ...(type ? { type } : {})
      },
      orderBy: { value: 'asc' }
    });
  }

  async createDictionary(companyId: string, data: any) {
    return this.prisma.dictionary.create({
      data: {
        ...data,
        companyId
      }
    });
  }

  // --- REPORTING BI ---

  async getBiDashboard(companyId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [revenue, expenses, activeDeals, totalInvoices, monthlyRevenue, monthlyExpenses] = await Promise.all([
      this.prisma.accountingEntry.aggregate({
        where: { companyId, type: 'Credit' },
        _sum: { amount: true },
      }),
      this.prisma.accountingEntry.aggregate({
        where: { companyId, type: 'Debit' },
        _sum: { amount: true },
      }),
      this.prisma.deal.count({
        where: { companyId, stage: { not: 'Gagné' } },
      }),
      this.prisma.invoice.count({
        where: { companyId },
      }),
      // Récupérer les revenus mensuels (entrées de type 'Credit')
      this.prisma.accountingEntry.groupBy({
        by: ['createdAt'],
        where: {
          companyId,
          type: 'Credit',
          createdAt: { gte: sixMonthsAgo }
        },
        _sum: { amount: true },
      }),
      // Récupérer les dépenses mensuelles (entrées de type 'Debit')
      this.prisma.accountingEntry.groupBy({
        by: ['createdAt'],
        where: {
          companyId,
          type: 'Debit',
          createdAt: { gte: sixMonthsAgo }
        },
        _sum: { amount: true },
      })
    ]);

    // Format monthly trends
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends: any[] = [];
    const now = new Date();

    // Regrouper les données par mois
    const revenueByMonth = {};
    const expensesByMonth = {};

    // Regrouper les revenus par mois
    monthlyRevenue.forEach(item => {
      const monthKey = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = 0;
      }
      revenueByMonth[monthKey] += item._sum.amount || 0;
    });

    // Regrouper les dépenses par mois
    monthlyExpenses.forEach(item => {
      const monthKey = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!expensesByMonth[monthKey]) {
        expensesByMonth[monthKey] = 0;
      }
      expensesByMonth[monthKey] += item._sum.amount || 0;
    });

    // Créer les données pour les 6 derniers mois
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = months[d.getMonth()];
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      trends.push({
        month: monthLabel,
        revenue: revenueByMonth[monthKey] || 0,
        expenses: expensesByMonth[monthKey] || 0,
      });
    }

    const rev = revenue._sum.amount || 0;
    const exp = expenses._sum.amount || 0;
    const profit = rev - exp;

    // Calculate Tax Impact (Simplified simulation based on company TVA Rate)
    const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { tvaRate: true } });
    const tvaRate = (company?.tvaRate || 18) / 100;
    const totalTvaCollected = rev * (tvaRate / (1 + tvaRate)); // Estimation from total sales
    const totalTvaDeductible = exp * (tvaRate / (1 + tvaRate)) * 0.7; // Estimation (70% of expenses deductible on average)

    // Financial Health Indicators
    const avgMonthlyExp = trends.length > 0 ? trends.reduce((acc, t) => acc + t.expenses, 0) / trends.length : 0;
    const cashOnHand = profit; // Simplified assuming everything in accounting matches bank
    const runwayMonths = avgMonthlyExp > 0 ? Math.floor(cashOnHand / avgMonthlyExp) : -1;

    // Distributions analysis
    const revenueByCategory = await this.prisma.accountingEntry.groupBy({
      by: ['category'],
      where: {
        companyId,
        type: 'Credit',
        createdAt: { gte: sixMonthsAgo }
      },
      _sum: { amount: true },
    });

    const distribution = revenueByCategory.map((item, index) => ({
      name: item.category || 'Autre',
      value: rev > 0 ? Math.round(((item._sum.amount || 0) / rev) * 100) : 0,
      color: ['#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#8b5cf6'][index % 6]
    })).filter(item => item.value > 0);

    return {
      revenue: rev,
      expenses: exp,
      profit,
      activeDeals,
      totalInvoices,
      margin: rev > 0 ? (profit / rev) * 100 : 0,
      trends,
      distribution,
      tax: {
        estimatedCollected: totalTvaCollected,
        estimatedDeductible: totalTvaDeductible,
        netTaxToPay: Math.max(0, totalTvaCollected - totalTvaDeductible)
      },
      health: {
        runway: runwayMonths,
        cashOnHand,
        burnRate: avgMonthlyExp
      }
    };
  }

  async getDashboardSummary(companyId: string) {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      stockItems,
      allEmployees,
      activeDeals,
      wonDealsSum,
      quotes,
      payslips,
      accountingStats,
    ] = await Promise.all([
      // Stock Stats
      this.prisma.stockItem.findMany({
        where: { companyId },
        select: { id: true, value: true, quantity: true, minThreshold: true },
      }),
      // HR Stats
      this.prisma.employee.findMany({
        where: { companyId },
        select: { id: true, status: true },
      }),
      // CRM Stats
      this.prisma.deal.findMany({
        where: { companyId },
        select: { amount: true, stage: true },
      }),
      // Won Deals specifically
      this.prisma.deal.aggregate({
        where: { companyId, stage: { in: ['Gagné', 'Won'] } },
        _sum: { amount: true },
      }),
      // Finance Stats (Quotes)
      this.prisma.quote.findMany({
        where: { companyId },
        select: { totalAmount: true, status: true },
      }),
      // Monthly Payroll
      this.prisma.payslip.aggregate({
        where: {
          companyId,
          date: { gte: currentMonthStart },
        },
        _sum: { netSalary: true },
      }),
      // Global Balance (from AccountingEntry)
      this.prisma.accountingEntry.groupBy({
        by: ['type'],
        where: { companyId },
        _sum: { amount: true },
      }),
    ]);

    // Calculate Stock
    const totalStockValue = stockItems.reduce((acc, i) => acc + (i.value || 0) * (i.quantity || 0), 0);
    const lowStockCount = stockItems.filter((i) => i.quantity <= (i.minThreshold || 0)).length;

    // Calculate HR
    const totalEmployees = allEmployees.length;
    const activeEmployees = allEmployees.filter((e) => (e.status as any) === 'ACTIVE' || (e.status as any) === 'Actif').length;
    const payrollTotal = payslips._sum.netSalary || 0;

    // Calculate CRM
    const totalDealsValue = activeDeals.reduce((acc, d) => acc + (d.amount || 0), 0);
    const wonDealsValue = wonDealsSum._sum.amount || 0;

    // Calculate Finance
    const acceptedQuotesValue = quotes
      .filter((q) => q.status === 'Accepté' || q.status === 'Facturé')
      .reduce((acc, q) => acc + q.totalAmount, 0);
    const pendingQuotesValue = quotes
      .filter((q) => q.status === 'Envoyé' || q.status === 'Brouillon')
      .reduce((acc, q) => acc + q.totalAmount, 0);

    // Calculate Balance
    const credit = accountingStats.find(s => s.type === 'Credit')?._sum.amount || 0;
    const debit = accountingStats.find(s => s.type === 'Debit')?._sum.amount || 0;

    // Trigger Health Check for Workflows (Simulates periodic job)
    this.checkInvoicesHealth(companyId).catch(err => console.error('Workflow Health Check Error:', err));

    // Get BI Mini Chart Data (merged logic from getBiDashboard but simplified)
    const biData = await this.getBiDashboard(companyId);

    return {
      stats: {
        stock: {
          totalValue: totalStockValue,
          lowStockCount,
          itemCount: stockItems.length,
        },
        hr: {
          totalEmployees,
          activeEmployees,
          payrollTotal,
        },
        crm: {
          dealsCount: activeDeals.length,
          wonDealsValue,
          totalDealsValue,
          pendingQuotesValue,
        },
        finance: {
          acceptedQuotesValue,
          balance: credit - debit,
          taxLiability: biData.tax?.netTaxToPay || 0,
          runway: biData.health?.runway || 0
        }
      },
      bi: {
        trends: biData.trends,
        distribution: biData.distribution,
        summary: {
          revenue: biData.revenue,
          expenses: biData.expenses,
          profit: biData.profit
        }
      }
    };
  }

  async getSupplierById(id: string) {
    return this.prisma.supplier.findUnique({
      where: { id }
    });
  }

  async getSupplierOrders(supplierId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { supplierId },
      include: { items: true },
      orderBy: { date: 'desc' }
    });
  }

  // --- SUPPORT & SAV ---
  async getTickets(companyId: string) {
    return this.prisma.supportTicket.findMany({
      where: { companyId },
      include: {
        contact: true,
        assignedTo: true,
        _count: { select: { messages: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async getTicketById(id: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        contact: true,
        assignedTo: true,
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });
  }

  async createTicket(companyId: string, data: any) {
    // Check if an open ticket already exists for this email
    if (data.customerEmail) {
      const activeTicket = await this.prisma.supportTicket.findFirst({
        where: {
          companyId,
          customerEmail: data.customerEmail,
          status: { in: ['Ouvert', 'En cours', 'En attente'] }
        }
      });

      if (activeTicket) {
        throw new BadRequestException(`Une session est déjà ouverte pour cet email (${activeTicket.reference})`);
      }
    }

    return this.prisma.supportTicket.create({
      data: {
        ...data,
        companyId,
        reference: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: data.status || 'Ouvert',
        priority: data.priority || 'Moyenne'
      }
    });
  }

  async updateTicket(id: string, data: any) {
    return this.prisma.supportTicket.update({
      where: { id },
      data
    });
  }

  async addTicketMessage(ticketId: string, data: any) {
    // Update ticket updatedAt timestamp automatically when message added
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: { updatedAt: new Date() }
    });

    return this.prisma.ticketMessage.create({
      data: {
        ...data,
        ticketId
      }
    });
  }

  async getCompanySettings(companyId: string) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        entityName: true,
        logo: true,
        sector: true,
        address: true,
        phone: true,
        email: true,
        geminiKey: true
      }
    });
  }

  async updateCompanySettings(companyId: string, data: any) {
    return this.prisma.company.update({
      where: { id: companyId },
      data
    });
  }

  // --- CURRENCIES ---
  async getCurrencies(companyId: string) {
    const currencies = await this.prisma.currency.findMany({
      where: { companyId },
      orderBy: { code: 'asc' }
    });

    // If no currencies found, seed some defaults
    if (currencies.length === 0) {
      const defaults = [
        { code: 'XOF', symbol: 'FCFA', name: 'Franc CFA', rate: 1.0, isBase: true },
        { code: 'EUR', symbol: '€', name: 'Euro', rate: 655.957, isBase: false },
        { code: 'USD', symbol: '$', name: 'US Dollar', rate: 600.0, isBase: false },
      ];

      for (const d of defaults) {
        await this.prisma.currency.create({
          data: { ...d, companyId }
        });
      }

      return this.prisma.currency.findMany({
        where: { companyId },
        orderBy: { code: 'asc' }
      });
    }

    return currencies;
  }

  async createCurrency(companyId: string, data: any) {
    if (data.isBase) {
      await this.prisma.currency.updateMany({
        where: { companyId, isBase: true },
        data: { isBase: false }
      });
    }

    return this.prisma.currency.create({
      data: {
        ...data,
        companyId
      }
    });
  }

  async updateCurrency(id: string, data: any) {
    const currency = await this.prisma.currency.findUnique({ where: { id } });
    if (!currency) throw new Error('Currency not found');

    if (data.isBase) {
      await this.prisma.currency.updateMany({
        where: { companyId: currency.companyId, isBase: true, id: { not: id } },
        data: { isBase: false }
      });
    }

    return this.prisma.currency.update({
      where: { id },
      data
    });
  }

  async deleteCurrency(id: string) {
    return this.prisma.currency.delete({ where: { id } });
  }
}
