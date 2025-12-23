import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settlePayout, SettlePayoutRequest } from '@/services/admin/admin';

export const useSettlePayout = (adminToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SettlePayoutRequest) => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await settlePayout(payload, adminToken);
    },
    onSuccess: () => {
      // Invalidate and refetch provider management and settle payout queries
      queryClient.invalidateQueries({ queryKey: ['adminProviderManagement'] });
      queryClient.invalidateQueries({ queryKey: ['adminSettlePayout'] });
    },
  });
};

