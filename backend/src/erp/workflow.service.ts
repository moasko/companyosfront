import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkflowService {
    private readonly logger = new Logger(WorkflowService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Entry point for all automated workflows
     */
    async trigger(event: string, payload: any) {
        this.logger.log(`Triggering workflow for event: ${event}`);

        try {
            switch (event) {
                case 'deal.won':
                    await this.handleDealWon(payload);
                    break;
                case 'invoice.overdue':
                    await this.handleInvoiceOverdue(payload);
                    break;
                case 'stock.low':
                    await this.handleStockLow(payload);
                    break;
                case 'employee.created':
                    await this.handleEmployeeCreated(payload);
                    break;
                default:
                    this.logger.warn(`No workflow defined for event: ${event}`);
            }
        } catch (error: any) {
            this.logger.error(`Error in workflow ${event}: ${error.message}`);
        }
    }

    private async handleDealWon(payload: any) {
        const { dealId, companyId } = payload;

        const deal = await this.prisma.deal.findUnique({
            where: { id: dealId },
            include: { contact: true }
        });

        if (!deal) return;

        const contactName = deal.contact?.companyName || deal.contact?.contactName || 'Client';

        // 1. Auto-generate Draft Quote
        await this.prisma.quote.create({
            data: {
                companyId,
                reference: `DEV-AUTO-${deal.id.slice(-4)}`,
                clientId: deal.contactId,
                clientName: contactName,
                contactCrmId: deal.contactId,
                date: new Date(),
                validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                status: 'Brouillon',
                totalAmount: deal.amount,
                items: {
                    create: {
                        description: `Services pour: ${deal.title}`,
                        quantity: 1,
                        unitPrice: deal.amount,
                        total: deal.amount
                    }
                }
            }
        });

        // 2. Create Project Initialization Task
        await this.prisma.task.create({
            data: {
                companyId,
                title: `🎉 Lancement Projet: ${deal.title}`,
                description: `Le deal pour ${contactName} a été gagné ! \n1. Préparer le contrat final\n2. Créer l'accès client\n3. Assigner l'équipe technique.`,
                priority: 'High',
                status: 'Todo',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            }
        });

        this.logger.log(`Workflow 'deal.won' completed for deal ${dealId}`);
    }

    private async handleInvoiceOverdue(payload: any) {
        const { invoiceId, companyId } = payload;

        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId }
        });

        if (!invoice) return;

        // Create a Debt Collection Task
        await this.prisma.task.create({
            data: {
                companyId,
                title: `⚠️ Relance Paiement: ${invoice.reference}`,
                description: `La facture ${invoice.reference} pour ${invoice.clientName} est en retard de paiement.\nMontant: ${invoice.totalAmount}XOF.\nVeuillez contacter le client immédiatement.`,
                priority: 'Critical',
                status: 'Todo',
                dueDate: new Date(),
            }
        });

        // Update Client Status in CRM to 'At Risk' if it exists
        if (invoice.contactCrmId) {
            await this.prisma.contactCrm.update({
                where: { id: invoice.contactCrmId },
                data: { status: 'Inactif' } // Marking as inactive/at risk
            });
        }

        this.logger.log(`Workflow 'invoice.overdue' completed for invoice ${invoiceId}`);
    }

    private async handleStockLow(payload: any) {
        const { productId, companyId } = payload;

        const product = await this.prisma.stockItem.findUnique({
            where: { id: productId },
            include: { supplier: true }
        });

        if (!product || !product.supplierId) return;

        // Logic already exists in erp.service, but we could centralize here
        // For now, let's add a special "Supply Chain Notification"
        this.logger.log(`Stock low for ${product.name}, automation triggered.`);
    }

    private async handleEmployeeCreated(payload: any) {
        const { employeeId, companyId } = payload;

        const employee = await this.prisma.employee.findUnique({
            where: { id: employeeId }
        });

        if (!employee) return;

        const tasks = [
            { title: 'Signature du contrat', desc: 'Vérifier que le contrat physique est signé.' },
            { title: 'Configuration IT', desc: 'Créer les emails et accès logiciels.' },
            { title: 'Remise du matériel', desc: 'Ordinateur, badge, clés.' }
        ];

        for (const t of tasks) {
            await this.prisma.task.create({
                data: {
                    companyId,
                    title: `📦 Onboarding: ${t.title} (${employee.fullName})`,
                    description: t.desc,
                    priority: 'Medium',
                    status: 'Todo',
                    assignedToId: employeeId,
                    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
                }
            });
        }

        this.logger.log(`Workflow 'employee.created' completed for ${employee.fullName}`);
    }
}
