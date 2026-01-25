import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEmployees,
  fetchPayslips,
  updateEmployee,
  deleteEmployee,
  createEmployee,
  createPayslip,
  fetchAttendances,
  createAttendance,
  fetchLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
} from '../api/hr.api';

export const useHr = (companyId: string, filters?: any) => {
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => fetchEmployees(companyId),
    enabled: !!companyId,
  });

  const payslipsQuery = useQuery({
    queryKey: ['payslips', companyId],
    queryFn: () => fetchPayslips(companyId),
    enabled: !!companyId,
  });

  const attendancesQuery = useQuery({
    queryKey: ['attendances', companyId, filters],
    queryFn: () => fetchAttendances(companyId, filters),
    enabled: !!companyId,
  });

  const leaveRequestsQuery = useQuery({
    queryKey: ['leave-requests', companyId, filters],
    queryFn: () => fetchLeaveRequests(companyId, filters),
    enabled: !!companyId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => createEmployee(data.companyId || companyId, data),
    onSuccess: (_, variables) => {
      const targetId = variables.companyId || companyId;
      queryClient.invalidateQueries({ queryKey: ['employees', targetId] });
      if (targetId !== companyId) {
        queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees', companyId] });
    },
  });

  const createPayslipMutation = useMutation({
    mutationFn: (data: any) => createPayslip(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payslips', companyId] });
    },
  });

  const createAttendanceMutation = useMutation({
    mutationFn: (data: any) => createAttendance(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendances', companyId] });
    },
  });

  const createLeaveRequestMutation = useMutation({
    mutationFn: (data: any) => createLeaveRequest(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests', companyId] });
    },
  });

  const updateLeaveRequestMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests', companyId] });
    },
  });

  return {
    employees: employeesQuery.data || [],
    payslips: payslipsQuery.data || [],
    attendances: attendancesQuery.data || [],
    leaveRequests: leaveRequestsQuery.data || [],
    isLoading:
      employeesQuery.isLoading ||
      payslipsQuery.isLoading ||
      attendancesQuery.isLoading ||
      leaveRequestsQuery.isLoading,
    createEmployee: createMutation.mutate,
    updateEmployee: updateMutation.mutate,
    deleteEmployee: deleteMutation.mutate,
    createPayslip: createPayslipMutation.mutate,
    createAttendance: createAttendanceMutation.mutate,
    createLeaveRequest: createLeaveRequestMutation.mutate,
    updateLeaveRequest: updateLeaveRequestMutation.mutate,
  };
};
