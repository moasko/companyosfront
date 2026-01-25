import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client';

export interface DictionaryItem {
  id: string;
  type: string;
  value: string;
  code?: string;
  color?: string;
}

export const useSettings = (companyId: string) => {
  const queryClient = useQueryClient();

  const { data: dictionaries = [], isLoading } = useQuery<DictionaryItem[]>({
    queryKey: ['settings', companyId],
    queryFn: () => apiFetch(`/settings/${companyId}`),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<DictionaryItem>) =>
      apiFetch(`/settings/${companyId}`, { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', companyId] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) =>
      apiFetch(`/settings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', companyId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/settings/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings', companyId] }),
  });

  return {
    dictionaries,
    isLoading,
    createSetting: createMutation.mutateAsync,
    updateSetting: updateMutation.mutateAsync,
    deleteSetting: deleteMutation.mutateAsync,
    // Printer helpers
    fetchPrinterSettings: () => apiFetch(`/settings/${companyId}/printers`),
    savePrinterSettings: (data: any) =>
      apiFetch(`/settings/${companyId}/printers`, { method: 'POST', body: JSON.stringify(data) }),
    discoverPrinters: () => apiFetch(`/settings/${companyId}/printers/discover`),
  };
};
