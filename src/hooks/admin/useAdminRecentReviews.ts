import { useQuery } from '@tanstack/react-query';
import { getAdminRecentReviews } from '@/services/admin/admin';
import { AdminRecentReviewsResponse } from '@/types';

export const useAdminRecentReviews = (
  adminToken: string | null,
  page: number = 1,
  perPage: number = 3
) => {
  return useQuery<AdminRecentReviewsResponse>({
    queryKey: ['adminRecentReviews', page, perPage],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminRecentReviews(adminToken, page, perPage);
    },
    enabled: !!adminToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

