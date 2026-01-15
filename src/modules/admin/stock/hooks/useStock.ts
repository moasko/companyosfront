
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchStock, fetchSuppliers, fetchMovements, updateStockItem, deleteStockItem, createStockItem, fetchStockCategories, createStockCategory, deleteStockCategory, createSupplier, updateSupplier, deleteSupplier, createMovement, validateMovement, fetchPurchaseOrders, createPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder } from '../api/stock.api';

export const useStock = (companyId: string, filters?: any) => {
    const queryClient = useQueryClient();

    const stockQuery = useQuery({
        queryKey: ['stock', companyId],
        queryFn: () => fetchStock(companyId),
        enabled: !!companyId,
    });

    const suppliersQuery = useQuery({
        queryKey: ['suppliers', companyId],
        queryFn: () => fetchSuppliers(companyId),
        enabled: !!companyId,
    });

    const movementsQuery = useQuery({
        queryKey: ['movements', companyId, filters],
        queryFn: () => fetchMovements(companyId, filters),
        enabled: !!companyId,
    });

    const categoriesQuery = useQuery({
        queryKey: ['stock-categories', companyId],
        queryFn: () => fetchStockCategories(companyId),
        enabled: !!companyId,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createStockItem(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock', companyId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateStockItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock', companyId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStockItem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock', companyId] });
        },
    });

    const createCategoryMutation = useMutation({
        mutationFn: (data: any) => createStockCategory(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock-categories', companyId] });
        },
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: (id: string) => deleteStockCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stock-categories', companyId] });
        },
    });

    const createSupplierMutation = useMutation({
        mutationFn: (data: any) => createSupplier(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers', companyId] });
        },
    });

    const updateSupplierMutation = useMutation({
        mutationFn: updateSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers', companyId] });
        },
    });

    const deleteSupplierMutation = useMutation({
        mutationFn: deleteSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers', companyId] });
        },
    });

    const createMovementMutation = useMutation({
        mutationFn: (data: any) => createMovement(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['movements', companyId] });
        },
    });

    const validateMovementMutation = useMutation({
        mutationFn: validateMovement,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['movements', companyId] });
            queryClient.invalidateQueries({ queryKey: ['stock', companyId] });
        },
    });

    const purchaseOrdersQuery = useQuery({
        queryKey: ['purchase-orders', companyId, filters],
        queryFn: () => fetchPurchaseOrders(companyId, filters),
        enabled: !!companyId,
    });

    const createPurchaseOrderMutation = useMutation({
        mutationFn: (data: any) => createPurchaseOrder(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', companyId] });
        },
    });

    const updatePurchaseOrderMutation = useMutation({
        mutationFn: updatePurchaseOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', companyId] });
        },
    });

    const deletePurchaseOrderMutation = useMutation({
        mutationFn: deletePurchaseOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['purchase-orders', companyId] });
        },
    });

    return {
        items: stockQuery.data || [],
        suppliers: suppliersQuery.data || [],
        movements: movementsQuery.data || [],
        categories: categoriesQuery.data || [],
        purchaseOrders: purchaseOrdersQuery.data || [],
        isLoading: stockQuery.isLoading || suppliersQuery.isLoading || movementsQuery.isLoading || categoriesQuery.isLoading || purchaseOrdersQuery.isLoading,
        createItem: createMutation.mutate,
        updateItem: updateMutation.mutate,
        deleteItem: deleteMutation.mutate,
        createCategory: createCategoryMutation.mutate,
        deleteCategory: deleteCategoryMutation.mutate,
        createSupplier: createSupplierMutation.mutate,
        updateSupplier: updateSupplierMutation.mutate,
        deleteSupplier: deleteSupplierMutation.mutate,
        createMovement: createMovementMutation.mutateAsync,
        validateMovement: validateMovementMutation.mutateAsync,
        createPurchaseOrder: createPurchaseOrderMutation.mutate,
        updatePurchaseOrder: updatePurchaseOrderMutation.mutate,
        deletePurchaseOrder: deletePurchaseOrderMutation.mutate,
    };
};
