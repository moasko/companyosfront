import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log({
        action,
        entity,
        entityId,
        oldValue,
        newValue,
        userId,
        companyId,
        ipAddress,
        userAgent,
    }: {
        action: string;
        entity: string;
        entityId?: string;
        oldValue?: any;
        newValue?: any;
        userId?: string;
        companyId?: string;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            return await this.prisma.auditLog.create({
                data: {
                    action,
                    entity,
                    entityId,
                    oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
                    newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
                    userId,
                    companyId,
                    ipAddress,
                    userAgent,
                },
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
            // We don't want to throw here to not break the main transaction if logging fails
        }
    }

    async getLogs(companyId: string, filters: any = {}) {
        const where: any = { companyId };

        if (filters.entity) where.entity = filters.entity;
        if (filters.action) where.action = filters.action;
        if (filters.userId) where.userId = filters.userId;

        return this.prisma.auditLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: filters.limit ? Number(filters.limit) : 100,
        });
    }
}
