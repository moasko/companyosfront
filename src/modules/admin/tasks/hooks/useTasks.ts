
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks.api';

export const useTasks = (companyId: string, filters?: any) => {
    const queryClient = useQueryClient();

    const tasksQuery = useQuery({
        queryKey: ['tasks', companyId, filters],
        queryFn: () => fetchTasks(companyId, filters),
        enabled: !!companyId,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => createTask(companyId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', companyId] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', companyId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', companyId] });
        },
    });

    return {
        tasks: tasksQuery.data || [],
        isLoading: tasksQuery.isLoading,
        createTask: createMutation.mutate,
        updateTask: updateMutation.mutate,
        deleteTask: deleteMutation.mutate,
    };
};
