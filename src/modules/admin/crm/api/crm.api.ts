import { apiFetch } from '@/lib/api-client';
import { SiteContent } from '@/types';

export const fetchContacts = async (companyId: string) => {
  return apiFetch(`/erp/${companyId}/contacts`);
};

export const fetchDeals = async (companyId: string) => {
  return apiFetch(`/erp/${companyId}/deals`);
};

export const createContact = async (companyId: string, data: any) => {
  return apiFetch(`/erp/${companyId}/contacts`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateContact = async (contact: any) => {
  return apiFetch(`/erp/contacts/${contact.id}`, {
    method: 'PATCH',
    body: JSON.stringify(contact),
  });
};

export const deleteContact = async (id: string) => {
  return apiFetch(`/erp/contacts/${id}`, {
    method: 'DELETE',
  });
};

export const updateDeal = async (deal: any) => {
  return apiFetch(`/erp/deals/${deal.id}`, {
    method: 'PATCH',
    body: JSON.stringify(deal),
  });
};

export const createDeal = async (companyId: string, data: any) => {
  return apiFetch(`/erp/${companyId}/deals`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const deleteDeal = async (id: string) => {
  return apiFetch(`/erp/deals/${id}`, {
    method: 'DELETE',
  });
};
