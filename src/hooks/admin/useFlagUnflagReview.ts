import { useMutation, useQueryClient } from '@tanstack/react-query';
import { flagUnflagReview, FlagUnflagReviewRequest, FlagUnflagReviewResponse } from '@/services/admin/admin';

export const useFlagUnflagReview = (adminToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<FlagUnflagReviewResponse, Error, FlagUnflagReviewRequest>({
    mutationFn: async (payload: FlagUnflagReviewRequest) => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await flagUnflagReview(payload, adminToken);
    },
    onSuccess: () => {
      // Invalidate and refetch admin review queries
      queryClient.invalidateQueries({ queryKey: ['adminReviewManagement'] });
    },
  });
};

