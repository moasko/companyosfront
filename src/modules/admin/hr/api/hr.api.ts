import { apiFetch } from '@/lib/api-client';
import { Employee, Payslip, Attendance, LeaveRequest } from '@/types';

export const fetchEmployees = async (companyId: string): Promise<Employee[]> => {
  return apiFetch(`/erp/${companyId}/employees`);
};

export const fetchPayslips = async (companyId: string): Promise<Payslip[]> => {
  return apiFetch(`/erp/${companyId}/payslips`);
};

export const createEmployee = async (companyId: string, data: any) => {
  return apiFetch(`/erp/${companyId}/employees`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateEmployee = async (employee: Employee) => {
  return apiFetch(`/erp/employees/${employee.id}`, {
    method: 'PATCH',
    body: JSON.stringify(employee),
  });
};

export const deleteEmployee = async (id: string) => {
  return apiFetch(`/erp/employees/${id}`, {
    method: 'DELETE',
  });
};

export const createPayslip = async (companyId: string, data: any) => {
  return apiFetch(`/erp/${companyId}/payslips`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// --- ATTENDANCE ---
export const fetchAttendances = async (companyId: string, params?: any): Promise<Attendance[]> => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return apiFetch(`/erp/${companyId}/attendances${query}`);
};

export const createAttendance = async (companyId: string, data: any) => {
  return apiFetch(`/erp/${companyId}/attendances`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// --- LEAVE REQUESTS ---
export const fetchLeaveRequests = async (
  companyId: string,
  params?: any,
): Promise<LeaveRequest[]> => {
  const query = params ? `?${new URLSearchParams(params).toString()}` : '';
  return apiFetch(`/erp/${companyId}/leave-requests${query}`);
};

export const createLeaveRequest = async (companyId: string, data: any) => {
  return apiFetch(`/erp/${companyId}/leave-requests`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateLeaveRequest = async (id: string, data: any) => {
  return apiFetch(`/erp/leave-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};
