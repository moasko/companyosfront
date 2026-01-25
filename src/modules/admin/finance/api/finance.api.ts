import { apiFetch } from '@/lib/api-client';

export const fetchQuotes = (companyId: string, params?: any) => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return apiFetch(`/erp/${companyId}/quotes${query}`);
};
export const fetchAccounting = (companyId: string, params?: any) => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return apiFetch(`/erp/${companyId}/accounting${query}`);
};

export const createQuote = (companyId: string, data: any) =>
  apiFetch(`/erp/${companyId}/quotes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateQuote = (id: string, data: any) =>
  apiFetch(`/erp/quotes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteQuote = (id: string) =>
  apiFetch(`/erp/quotes/${id}`, {
    method: 'DELETE',
  });

export const createTransaction = (companyId: string, data: any) =>
  apiFetch(`/erp/${companyId}/accounting`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateTransaction = (id: string, data: any) =>
  apiFetch(`/erp/accounting/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteTransaction = (id: string) =>
  apiFetch(`/erp/accounting/${id}`, {
    method: 'DELETE',
  });

// --- INVOICES ---
export const fetchInvoices = (companyId: string, params?: any) => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return apiFetch(`/erp/${companyId}/invoices${query}`);
};

export const createInvoice = (companyId: string, data: any) =>
  apiFetch(`/erp/${companyId}/invoices`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateInvoice = (id: string, data: any) =>
  apiFetch(`/erp/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteInvoice = (id: string) =>
  apiFetch(`/erp/invoices/${id}`, {
    method: 'DELETE',
  });

export const scanInvoice = (companyId: string, filePath: string) =>
  apiFetch(`/erp/${companyId}/scan-invoice`, {
    method: 'POST',
    body: JSON.stringify({ filePath }),
  });

export const fetchBiDashboard = (companyId: string) =>
  apiFetch(`/erp/${companyId}/bi-dashboard`);
