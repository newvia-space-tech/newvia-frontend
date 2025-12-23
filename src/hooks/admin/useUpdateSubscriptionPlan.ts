import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAdminSubscriptionPlan } from '@/services/admin/admin';
import { UpdateSubscriptionPlanRequest, UpdateSubscriptionPlanResponse } from '@/types';

export const useUpdateSubscriptionPlan = (adminToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateSubscriptionPlanResponse, Error, UpdateSubscriptionPlanRequest>({
    mutationFn: async (payload: UpdateSubscriptionPlanRequest) => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await updateAdminSubscriptionPlan(payload, adminToken);
    },
    onSuccess: () => {
      // Invalidate and refetch subscription plans after successful update
      queryClient.invalidateQueries({ queryKey: ['adminSubscriptionPlans'] });
    },
  });
};

