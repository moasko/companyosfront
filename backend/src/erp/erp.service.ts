
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ErpService {
    constructor(private prisma: PrismaService) { }

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
                lte: endDate
            }
        };
    }

    // --- STOCK ---
    async getStock(companyId: string) {
        return this.prisma.stockItem.findMany({
            where: { companyId },
            include: { movements: true, categoryRel: true, supplier: true }
        });
    }

    async createStockItem(companyId: string, data: any) {
        const { id, ...rest } = data;
        const sanitizedData = {
            ...rest,
            companyId,
            supplierId: rest.supplierId || null,
            categoryId: rest.categoryId || null,
            expiryDate: rest.expiryDate ? new Date(rest.expiryDate) : undefined,
            manufacturingDate: rest.manufacturingDate ? new Date(rest.manufacturingDate) : undefined
        };
        return this.prisma.stockItem.create({
            data: sanitizedData
        });
    }

    async updateStockItem(id: string, data: any) {
        const { id: _, companyId: __, items, movements, categoryRel, supplier, ...rest } = data; // remove relations and ids
        const sanitizedData: any = { ...rest };

        if (typeof data.supplierId !== 'undefined') sanitizedData.supplierId = data.supplierId || null;
        if (typeof data.categoryId !== 'undefined') sanitizedData.categoryId = data.categoryId || null;
        if (data.expiryDate) sanitizedData.expiryDate = new Date(data.expiryDate);
        if (data.manufacturingDate) sanitizedData.manufacturingDate = new Date(data.manufacturingDate);

        return this.prisma.stockItem.update({
            where: { id },
            data: sanitizedData,
        });
    }

    async deleteStockItem(id: string) {
        return this.prisma.stockItem.delete({ where: { id } });
    }

    async getSuppliers(companyId: string) {
        return this.prisma.supplier.findMany({
            where: { companyId }
        });
    }

    async createSupplier(companyId: string, data: any) {
        return this.prisma.supplier.create({
            data: { ...data, companyId }
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

    async getMovements(companyId: string, filters: any = {}) {
        const where: any = { companyId };
        if (filters.year || filters.month) {
            Object.assign(where, this.buildDateFilter('date', filters.year, filters.month));
        }

        return this.prisma.stockMovement.findMany({
            where,
            include: { items: true },
            orderBy: { date: 'desc' }
        });
    }

    async createMovement(companyId: string, data: any) {
        const { id, items, ...movementData } = data;
        // Fix: Auto-resolve partnerName if missing but partnerId exists
        if (!movementData.partnerName && movementData.partnerId) {
            const supplier = await this.prisma.supplier.findUnique({ where: { id: movementData.partnerId } });
            if (supplier) {
                movementData.partnerName = supplier.name;
                movementData.supplierId = supplier.id;
            } else {
                const contact = await this.prisma.contactCrm.findUnique({ where: { id: movementData.partnerId } });
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
                        unitPrice: i.unitPrice
                    }))
                }
            },
            include: { items: true }
        });
    }

    async validateMovement(id: string) {
        const movement = await this.prisma.stockMovement.findUnique({
            where: { id },
            include: { items: true }
        });

        if (!movement) throw new NotFoundException('Mouvement non trouvé');
        if (movement.status === 'Validé') return movement;

        // Mettre à jour les stocks pour chaque item
        for (const item of movement.items) {
            const product = await this.prisma.stockItem.findUnique({ where: { id: item.stockItemId } });
            if (product) {
                const newQuantity = movement.type === 'Reception'
                    ? product.quantity + item.quantity
                    : product.quantity - item.quantity;

                await this.prisma.stockItem.update({
                    where: { id: item.stockItemId },
                    data: { quantity: newQuantity }
                });
            }
        }

        return this.prisma.stockMovement.update({
            where: { id },
            data: { status: 'Validé' },
            include: { items: true }
        });
    }

    async getStockCategories(companyId: string) {
        return this.prisma.stockCategory.findMany({
            where: { companyId }
        });
    }

    async createStockCategory(companyId: string, data: any) {
        return this.prisma.stockCategory.create({
            data: { ...data, companyId }
        });
    }

    // --- CRM ---
    async getContacts(companyId: string) {
        return this.prisma.contactCrm.findMany({
            where: { companyId },
            include: { deals: true, quotes: true }
        });
    }

    async createContact(companyId: string, data: any) {
        return this.prisma.contactCrm.create({
            data: {
                ...data,
                companyId,
                lastContact: data.lastContact ? new Date(data.lastContact) : new Date()
            }
        });
    }

    async updateContact(id: string, data: any) {
        return this.prisma.contactCrm.update({
            where: { id },
            data: {
                ...data,
                lastContact: data.lastContact ? new Date(data.lastContact) : undefined
            },
        });
    }

    async deleteContact(id: string) {
        return this.prisma.contactCrm.delete({ where: { id } });
    }

    async getDeals(companyId: string) {
        return this.prisma.deal.findMany({
            where: { companyId },
            include: { contact: true }
        });
    }

    async createDeal(companyId: string, data: any) {
        return this.prisma.deal.create({
            data: {
                ...data,
                companyId,
                closingDate: data.closingDate ? new Date(data.closingDate) : new Date()
            }
        });
    }

    async updateDeal(id: string, data: any) {
        return this.prisma.deal.update({
            where: { id },
            data: {
                ...data,
                closingDate: data.closingDate ? new Date(data.closingDate) : undefined
            },
        });
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
            include: { items: true }
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
                        total: i.total
                    }))
                }
            },
            include: { items: true }
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
                            total: i.total
                        }))
                    }
                },
                include: { items: true }
            });
        }

        return this.prisma.quote.update({
            where: { id },
            data: quoteData,
            include: { items: true }
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
            orderBy: { date: 'desc' }
        });
    }

    async createTransaction(companyId: string, data: any) {
        return this.prisma.accountingEntry.create({
            data: {
                ...data,
                companyId,
                date: new Date(data.date)
            }
        });
    }

    async updateTransaction(id: string, data: any) {
        return this.prisma.accountingEntry.update({
            where: { id },
            data: {
                ...data,
                date: data.date ? new Date(data.date) : undefined
            },
        });
    }

    async deleteTransaction(id: string) {
        return this.prisma.accountingEntry.delete({ where: { id } });
    }

    private mapEmployeeStatus(status: string): any {
        const mapping: any = {
            'Actif': 'ACTIVE',
            'Congé': 'ON_LEAVE',
            'Arrêt': 'INACTIVE',
            'Sorti': 'TERMINATED',
            'ACTIVE': 'ACTIVE',
            'ON_LEAVE': 'ON_LEAVE',
            'INACTIVE': 'INACTIVE',
            'TERMINATED': 'TERMINATED'
        };
        return mapping[status] || 'ACTIVE';
    }

    private mapContractType(type: string): any {
        const mapping: any = {
            'CDI': 'CDI',
            'CDD': 'CDD',
            'Freelance': 'FREELANCE',
            'Stage': 'INTERN',
            'FREELANCE': 'FREELANCE',
            'INTERN': 'INTERN'
        };
        return mapping[type] || 'CDI';
    }

    async getEmployees(companyId: string) {
        return this.prisma.employee.findMany({
            where: { companyId }
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
                        globalRole: 'USER'
                    }
                });
            } else if (user && password) {
                // Mettre à jour le mot de passe si l'utilisateur existe déjà
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { passwordHash: await bcrypt.hash(password, 10) }
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
            role: data.role || 'EMPLOYEE'
        };

        if (password) {
            preparedData.temporaryPassword = await bcrypt.hash(password, 10);
        }

        return this.prisma.employee.create({
            data: preparedData,
            include: { user: true }
        });
    }

    async getPayslips(companyId: string) {
        return this.prisma.payslip.findMany({
            where: { companyId },
            include: { employee: true }
        });
    }

    async createPayslip(companyId: string, data: any) {
        return this.prisma.payslip.create({
            data: { ...data, companyId, date: new Date(data.date) }
        });
    }

    async updateEmployee(id: string, data: any) {
        console.log("---------------------------------------------------------");
        console.log("UPDATE EMPLOYEE REQUEST RECEIVED");
        console.log("ID:", id);
        console.log("Has faceDescriptor:", !!data.faceDescriptor);
        if (data.faceDescriptor) {
            console.log("faceDescriptor Length:", data.faceDescriptor.length);
            console.log("First 50 chars:", data.faceDescriptor.substring(0, 50));
        }
        console.log("Full Data Keys:", Object.keys(data));
        console.log("---------------------------------------------------------");
        const employee = await this.prisma.employee.findUnique({ where: { id } });
        if (!employee) throw new Error('Employé non trouvé');

        // 1. Manage User Account (if email provided)
        let userId = employee.userId;
        if (data.email) {
            let user = await this.prisma.user.findUnique({ where: { email: data.email } });

            if (user && data.password) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { passwordHash: await bcrypt.hash(data.password, 10) }
                });
            } else if (!user && data.password) {
                user = await this.prisma.user.create({
                    data: {
                        email: data.email,
                        name: data.fullName || employee.fullName,
                        passwordHash: await bcrypt.hash(data.password, 10),
                        globalRole: 'USER'
                    }
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
            faceDescriptor: data.faceDescriptor
        };

        if (data.password) {
            updateData.temporaryPassword = await bcrypt.hash(data.password, 10);
        }

        // Remove undefined keys so we don't overwrite with null unless intended
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        return this.prisma.employee.update({
            where: { id },
            data: updateData,
            include: { user: true }
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
                { clientName: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        return this.prisma.invoice.findMany({
            where,
            include: { items: true, payments: true }
        });
    }

    async createInvoice(companyId: string, data: any) {
        const { id, items, client, ...invoiceData } = data; // Remove potential 'client' object
        return this.prisma.invoice.create({
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
                        total: i.total
                    }))
                }
            },
            include: { items: true }
        });
    }

    async updateInvoice(id: string, data: any) {
        const { id: _, companyId: __, items, client, ...invoiceData } = data; // Remove potential 'client' object
        // If items are provided, replace them
        if (items) {
            await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
            return this.prisma.invoice.update({
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
                            total: i.total
                        }))
                    }
                },
                include: { items: true }
            });
        }
        return this.prisma.invoice.update({
            where: { id },
            data: {
                ...invoiceData,
                date: invoiceData.date ? new Date(invoiceData.date) : undefined,
                dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : undefined,
            },
            include: { items: true }
        });
    }

    async deleteInvoice(id: string) {
        await this.prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
        return this.prisma.invoice.delete({ where: { id } });
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
            orderBy: { date: 'desc' }
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
                        total: i.total
                    }))
                }
            },
            include: { items: true }
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
                            total: i.total
                        }))
                    }
                },
                include: { items: true }
            });
        }
        return this.prisma.purchaseOrder.update({
            where: { id },
            data: {
                ...poData,
                date: poData.date ? new Date(poData.date) : undefined,
                expectedDate: poData.expectedDate ? new Date(poData.expectedDate) : undefined,
            }
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
            orderBy: { date: 'desc' }
        });
        return attendances.map(a => ({
            ...a,
            employeeName: a.employee?.fullName || 'Inconnu'
        }));
    }

    async createAttendance(companyId: string, data: any) {
        const { employeeName, id, ...rest } = data;
        const dateObj = new Date(data.date);

        return this.prisma.attendance.upsert({
            where: {
                employeeId_date: {
                    employeeId: rest.employeeId,
                    date: dateObj
                }
            },
            update: {
                checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
                status: rest.status
            },
            create: {
                ...rest,
                companyId,
                date: dateObj,
                checkIn: data.checkIn ? new Date(data.checkIn) : undefined,
                checkOut: data.checkOut ? new Date(data.checkOut) : undefined
            }
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
            orderBy: { startDate: 'desc' }
        });
        return requests.map(r => ({
            ...r,
            employeeName: r.employee?.fullName || 'Inconnu'
        }));
    }

    async createLeaveRequest(companyId: string, data: any) {
        const { employeeName, id, ...rest } = data;
        return this.prisma.leaveRequest.create({
            data: {
                ...rest,
                companyId,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate)
            }
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
                approvedAt: data.status === 'Approved' ? new Date() : undefined
            }
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
                product: true
            },
            orderBy: { createdAt: 'desc' }
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
                tags: Array.isArray(taskData.tags) ? taskData.tags : []
            },
            include: {
                assignedTo: true,
                client: true,
                supplier: true,
                product: true
            }
        });
    }

    async updateTask(id: string, data: any) {
        const { assignedToName, assignedTo, client, supplier, product, id: _, companyId: __, ...taskData } = data;

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
                tags: Array.isArray(taskData.tags) ? taskData.tags : undefined
            },
            include: {
                assignedTo: true,
                client: true,
                supplier: true,
                product: true
            }
        });
    }

    async deleteTask(id: string) {
        return this.prisma.task.delete({ where: { id } });
    }
}
