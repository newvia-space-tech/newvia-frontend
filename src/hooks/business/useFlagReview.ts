import { useMutation, useQueryClient } from '@tanstack/react-query';
import { flagReview } from '@/services/business/business';
import { FlagReviewRequest, FlagReviewResponse } from '@/types';

export const useFlagReview = (authToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<FlagReviewResponse, Error, FlagReviewRequest>({
    mutationFn: async (payload: FlagReviewRequest) => {
      if (!authToken) {
        throw new Error('Missing authentication token');
      }
      return await flagReview(payload, authToken);
    },
    onSuccess: () => {
      // Invalidate and refetch review queries
      queryClient.invalidateQueries({ queryKey: ['reviewManagement'] });
      queryClient.invalidateQueries({ queryKey: ['bookingReviewDashboard'] });
    },
  });
};

