import { apiFetch } from '@/lib/api-client';
import { SiteContent } from '@/types';

export const fetchCmsContent = async (companyId: string): Promise<SiteContent | null> => {
    return apiFetch(`/cms/${companyId}`);
};

export const updateCmsSection = async ({ companyId, section, data }: { companyId: string, section: string, data: any }) => {
    return apiFetch(`/cms/${companyId}/${section}`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const seedCmsContent = async (companyId: string) => {
    return apiFetch(`/cms/${companyId}/seed`, {
        method: 'POST',
    });
};
