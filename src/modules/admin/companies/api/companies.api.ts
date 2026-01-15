
import { apiFetch } from '@/lib/api-client';

export const fetchMyCompanies = () => apiFetch('/companies');

export const createCompany = (data: any) => apiFetch('/companies', {
    method: 'POST',
    body: JSON.stringify(data)
});

export const fetchPublicCompanies = () => apiFetch('/companies/public');
