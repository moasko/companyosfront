import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContacts,
  fetchDeals,
  updateContact,
  updateDeal,
  createContact,
  deleteContact,
  createDeal,
  deleteDeal,
} from '../api/crm.api';

export const useCrm = (companyId: string) => {
  const queryClient = useQueryClient();

  const contactsQuery = useQuery({
    queryKey: ['contacts', companyId],
    queryFn: () => fetchContacts(companyId),
    enabled: !!companyId,
  });

  const dealsQuery = useQuery({
    queryKey: ['deals', companyId],
    queryFn: () => fetchDeals(companyId),
    enabled: !!companyId,
  });

  const createContactMutation = useMutation({
    mutationFn: (data: any) => createContact(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', companyId] });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: updateContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', companyId] });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', companyId] });
    },
  });

  const createDealMutation = useMutation({
    mutationFn: (data: any) => createDeal(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', companyId] });
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: updateDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', companyId] });
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: deleteDeal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', companyId] });
    },
  });

  return {
    contacts: contactsQuery.data || [],
    deals: dealsQuery.data || [],
    isLoading: contactsQuery.isLoading || dealsQuery.isLoading,
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    createDeal: createDealMutation.mutate,
    updateDeal: updateDealMutation.mutate,
    deleteDeal: deleteDealMutation.mutate,
  };
};
