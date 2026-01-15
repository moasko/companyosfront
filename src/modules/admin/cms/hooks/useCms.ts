import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchCmsContent, updateCmsSection, seedCmsContent } from '../api/cms.api';

export const useCms = (companyId: string) => {
    const queryClient = useQueryClient();

    const cmsQuery = useQuery({
        queryKey: ['cms', companyId],
        queryFn: () => fetchCmsContent(companyId),
        enabled: !!companyId,
    });

    const cmsMutation = useMutation({
        mutationFn: (args: { section: string, data: any }) =>
            updateCmsSection({ ...args, companyId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cms', companyId] });
        },
    });

    const seedMutation = useMutation({
        mutationFn: () => seedCmsContent(companyId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cms', companyId] });
        },
    });

    return {
        content: cmsQuery.data,
        isLoading: cmsQuery.isLoading,
        updateSection: (section: string, data: any) => cmsMutation.mutate({ section, data }),
        seedContent: () => seedMutation.mutate(),
        isSeeding: seedMutation.isPending
    };
};
