import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api-client';

export interface AuditLog {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    oldValue: any;
    newValue: any;
    ipAddress: string;
    userAgent: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

export const useAuditLogs = (companyId: string, filters: any = {}) => {
    return useQuery({
        queryKey: ['audit-logs', companyId, filters],
        queryFn: async (): Promise<AuditLog[]> => {
            const queryParams = new URLSearchParams();
            if (filters.entity) queryParams.append('entity', filters.entity);
            if (filters.action) queryParams.append('action', filters.action);
            if (filters.userId) queryParams.append('userId', filters.userId);
            if (filters.limit) queryParams.append('limit', filters.limit.toString());

            const queryString = queryParams.toString();
            const url = `/erp/${companyId}/audit-logs${queryString ? `?${queryString}` : ''}`;

            return apiFetch(url);
        },
        enabled: !!companyId,
        staleTime: 1000 * 30, // 30 seconds
    });
};
