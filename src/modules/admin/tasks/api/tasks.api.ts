
import { apiFetch } from '@/lib/api-client';

export const fetchTasks = async (companyId: string, params?: any) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const data = await apiFetch(`/erp/${companyId}/tasks${query}`);
    return data.map((t: any) => ({
        ...t,
        assignedToName: t.assignedTo?.fullName,
        clientName: t.client?.companyName || t.client?.contactName,
        supplierName: t.supplier?.name,
        productName: t.product?.name
    }));
};

export const createTask = async (companyId: string, data: any) => {
    return apiFetch(`/erp/${companyId}/tasks`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const updateTask = async (task: any) => {
    return apiFetch(`/erp/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify(task),
    });
};

export const deleteTask = async (id: string) => {
    return apiFetch(`/erp/tasks/${id}`, {
        method: 'DELETE',
    });
};
