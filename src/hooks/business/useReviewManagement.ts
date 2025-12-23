import { useQuery } from '@tanstack/react-query';
import { getReviewManagement } from '@/services/business/business';
import { ReviewManagementResponse } from '@/types';

export const useReviewManagement = (
  businessId: string | null,
  userId: string | null,
  isFlagged: boolean,
  authToken: string | null
) => {
  return useQuery<ReviewManagementResponse>({
    queryKey: ['reviewManagement', businessId, userId, isFlagged],
    queryFn: async () => {
      if (!businessId || !userId || !authToken) {
        throw new Error('Missing required parameters: businessId, userId, or authToken');
      }
      return await getReviewManagement(businessId, userId, isFlagged, authToken);
    },
    enabled: !!businessId && !!userId && !!authToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

