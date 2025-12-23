import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settleRefund, SettleRefundRequest } from '@/services/admin/admin';

export const useSettleRefund = (adminToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SettleRefundRequest) => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await settleRefund(payload, adminToken);
    },
    onSuccess: () => {
      // Invalidate and refetch refund management queries
      queryClient.invalidateQueries({ queryKey: ['adminRefundManagement'] });
    },
  });
};

