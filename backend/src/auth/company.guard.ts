import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    let companyId = request.params.companyId || request.body.companyId || request.query.companyId;

    const params = request.params;
    const id = params.id;

    // If we have an ID but no companyId, we need to find the companyId of the entity
    if (!companyId && id) {
      const url = request.url;
      if (url.includes('/stock/')) {
        const item = await this.prisma.stockItem.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/contacts/')) {
        const item = await this.prisma.contactCrm.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/employees/')) {
        const item = await this.prisma.employee.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/deals/')) {
        const item = await this.prisma.deal.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/quotes/')) {
        const item = await this.prisma.quote.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/invoices/')) {
        const item = await this.prisma.invoice.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/purchase-orders/')) {
        const item = await this.prisma.purchaseOrder.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/suppliers/')) {
        const item = await this.prisma.supplier.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/accounting/')) {
        const item = await this.prisma.accountingEntry.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/tasks/')) {
        const item = await this.prisma.task.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/leave-requests/')) {
        const item = await this.prisma.leaveRequest.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      } else if (url.includes('/movements/')) {
        const item = await this.prisma.stockMovement.findUnique({
          where: { id },
          select: { companyId: true },
        });
        companyId = item?.companyId;
      }
    }

    if (!companyId) {
      // Optional: If you want to force companyId on all ERP routes
      // throw new ForbiddenException('Company ID is required for this action');
      return true;
    }

    request.companyId = companyId; // Store it for PermissionsGuard

    if (user.globalRole === 'SUPER_ADMIN') return true;

    const isOwner = user.ownedCompanyIds.includes(companyId);
    if (isOwner) return true;

    const isEmployee = user.employeeProfiles.some(
      (ep: any) => ep.companyId === companyId && ep.status === 'ACTIVE',
    );
    if (isEmployee) return true;

    throw new ForbiddenException('You do not have access to this company data');
  }
}
