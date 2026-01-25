import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const companyId =
      request.companyId ||
      request.params.companyId ||
      request.body.companyId ||
      request.query.companyId;

    if (!user) return false;

    // 0. Super Admins bypass everything
    if (user.globalRole === 'SUPER_ADMIN') {
      return true;
    }

    // 1. Owners have ALL permissions on their companies
    if (user.ownedCompanyIds.includes(companyId)) {
      return true;
    }

    // 2. Check employee profile for this company
    const profile = user.employeeProfiles.find((ep: any) => ep.companyId === companyId);
    if (!profile) {
      throw new ForbiddenException('No profile found for this company');
    }

    // Check if employee is still active
    if (profile.status !== 'ACTIVE') {
      throw new ForbiddenException('Your employee account is not active');
    }

    // 3. Simple role check (ADMIN and SUPER_ADMIN have full access)
    if (['ADMIN', 'SUPER_ADMIN'].includes(profile.role)) return true;

    // 4. Check flattened permissions from JWT
    const userPermissions: string[] = profile.permissions || [];
    const hasPermission = requiredPermissions.every(
      (perm) => userPermissions.includes(perm) || userPermissions.includes('*'),
    );

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
