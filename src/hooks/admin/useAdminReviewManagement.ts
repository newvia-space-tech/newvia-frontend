import { useQuery } from '@tanstack/react-query';
import { getAdminReviewManagement } from '@/services/admin/admin';
import { AdminReviewManagementResponse } from '@/types';

export const useAdminReviewManagement = (
  adminToken: string | null,
  page: number = 1,
  perPage: number = 10
) => {
  return useQuery<AdminReviewManagementResponse>({
    queryKey: ['adminReviewManagement', page, perPage],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminReviewManagement(adminToken, page, perPage);
    },
    enabled: !!adminToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

