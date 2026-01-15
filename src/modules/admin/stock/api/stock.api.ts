
import { apiFetch } from '@/lib/api-client';
import { SiteContent } from '@/types';

export const fetchStock = async (companyId: string) => {
    return apiFetch(`/erp/${companyId}/stock`);
};

export const fetchSuppliers = async (companyId: string) => {
    return apiFetch(`/erp/${companyId}/suppliers`);
};

export const fetchMovements = async (companyId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch(`/erp/${companyId}/movements${query}`);
};

export const fetchStockCategories = async (companyId: string) => {
    return apiFetch(`/erp/${companyId}/stock-categories`);
};

export const createStockCategory = async (companyId: string, data: any) => {
    return apiFetch(`/erp/${companyId}/stock-categories`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const createStockItem = async (companyId: string, data: any) => {
    return apiFetch(`/erp/${companyId}/stock`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateStockItem = async (item: any) => {
    return apiFetch(`/erp/stock/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify(item),
    });
};

export const deleteStockItem = async (id: string) => {
    return apiFetch(`/erp/stock/${id}`, {
        method: 'DELETE',
    });
};

export const deleteStockCategory = async (id: string) => {
    return apiFetch(`/erp/stock-categories/${id}`, {
        method: 'DELETE',
    });
};

export const createSupplier = async (companyId: string, data: any) => {
    return apiFetch(`/erp/${companyId}/suppliers`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateSupplier = async (supplier: any) => {
    return apiFetch(`/erp/suppliers/${supplier.id}`, {
        method: 'PATCH',
        body: JSON.stringify(supplier),
    });
};

export const deleteSupplier = async (id: string) => {
    return apiFetch(`/erp/suppliers/${id}`, {
        method: 'DELETE',
    });
};

export const createMovement = async (companyId: string, data: any) => {
    return apiFetch(`/erp/${companyId}/movements`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const validateMovement = async (id: string) => {
    return apiFetch(`/erp/movements/${id}/validate`, {
        method: 'PATCH',
    });
};

export const fetchPurchaseOrders = async (companyId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiFetch(`/erp/${companyId}/purchase-orders${query}`);
};

export const createPurchaseOrder = async (companyId: string, data: any) => {
    return apiFetch(`/erp/${companyId}/purchase-orders`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updatePurchaseOrder = async (order: any) => {
    return apiFetch(`/erp/purchase-orders/${order.id}`, {
        method: 'PATCH',
        body: JSON.stringify(order),
    });
};

export const deletePurchaseOrder = async (id: string) => {
    return apiFetch(`/erp/purchase-orders/${id}`, {
        method: 'DELETE',
    });
};
