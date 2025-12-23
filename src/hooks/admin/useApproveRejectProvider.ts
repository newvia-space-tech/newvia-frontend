import { useMutation, useQueryClient } from '@tanstack/react-query';
import { approveRejectProvider, ApproveRejectProviderRequest } from '@/services/admin/admin';

export const useApproveRejectProvider = (adminToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ApproveRejectProviderRequest) => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await approveRejectProvider(payload, adminToken);
    },
    onSuccess: () => {
      // Invalidate and refetch provider verification queries
      queryClient.invalidateQueries({ queryKey: ['adminProviderVerification'] });
      queryClient.invalidateQueries({ queryKey: ['adminProviderDetail'] });
    },
  });
};

