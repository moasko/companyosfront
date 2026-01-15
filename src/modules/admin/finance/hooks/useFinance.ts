
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    fetchQuotes,
    fetchAccounting,
    createQuote,
    updateQuote,
    deleteQuote,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice
} from '../api/finance.api';

export const useFinance = (companyId: string, filters?: any) => {
    const queryClient = useQueryClient();

    const quotesQuery = useQuery({
        queryKey: ['quotes', companyId, filters],
        queryFn: () => fetchQuotes(companyId, filters),
        enabled: !!companyId,
    });

    const accountingQuery = useQuery({
        queryKey: ['accounting', companyId, filters],
        queryFn: () => fetchAccounting(companyId, filters),
        enabled: !!companyId,
    });

    const createQuoteMutation = useMutation({
        mutationFn: (data: any) => createQuote(companyId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes', companyId] }),
    });

    const updateQuoteMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => updateQuote(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes', companyId] }),
    });

    const deleteQuoteMutation = useMutation({
        mutationFn: deleteQuote,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotes', companyId] }),
    });

    const createTransactionMutation = useMutation({
        mutationFn: (data: any) => createTransaction(companyId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounting', companyId] }),
    });

    const updateTransactionMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => updateTransaction(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounting', companyId] }),
    });

    const deleteTransactionMutation = useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['accounting', companyId] }),
    });

    const invoicesQuery = useQuery({
        queryKey: ['invoices', companyId, filters],
        queryFn: () => fetchInvoices(companyId, filters),
        enabled: !!companyId,
    });

    const createInvoiceMutation = useMutation({
        mutationFn: (data: any) => createInvoice(companyId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices', companyId] }),
    });

    const updateInvoiceMutation = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => updateInvoice(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices', companyId] }),
    });

    const deleteInvoiceMutation = useMutation({
        mutationFn: deleteInvoice,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['invoices', companyId] }),
    });

    return {
        quotes: quotesQuery.data || [],
        accounting: accountingQuery.data || [],
        invoices: invoicesQuery.data || [],
        isLoading: quotesQuery.isLoading || accountingQuery.isLoading || invoicesQuery.isLoading,
        createQuote: createQuoteMutation.mutate,
        updateQuote: updateQuoteMutation.mutate,
        deleteQuote: deleteQuoteMutation.mutate,
        createTransaction: createTransactionMutation.mutate,
        updateTransaction: updateTransactionMutation.mutate,
        deleteTransaction: deleteTransactionMutation.mutate,
        createInvoice: createInvoiceMutation.mutate,
        updateInvoice: updateInvoiceMutation.mutate,
        deleteInvoice: deleteInvoiceMutation.mutate,
    };
};
