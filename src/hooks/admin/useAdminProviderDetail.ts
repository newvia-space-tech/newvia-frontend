import { useQuery } from '@tanstack/react-query';
import { getAdminProviderDetail } from '@/services/admin/admin';
import { AdminProviderDetailResponse } from '@/types';

export const useAdminProviderDetail = (
  adminToken: string | null,
  businessId: string | null
) => {
  return useQuery<AdminProviderDetailResponse>({
    queryKey: ['adminProviderDetail', businessId],
    queryFn: async () => {
      if (!adminToken || !businessId) {
        throw new Error('Admin token and business ID are required');
      }
      return await getAdminProviderDetail(adminToken, businessId);
    },
    enabled: !!adminToken && !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

