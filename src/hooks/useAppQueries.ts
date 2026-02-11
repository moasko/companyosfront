import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api-client';
import { SiteContent } from '../types';

export const useCompanies = (isAuthenticated: boolean) => {
  return useQuery({
    queryKey: ['companies', isAuthenticated],
    queryFn: async (): Promise<any[]> => {
      if (isAuthenticated) {
        return apiFetch('/companies');
      } else {
        return apiFetch('/companies/public');
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};
