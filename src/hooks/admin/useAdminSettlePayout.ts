import { useQuery } from '@tanstack/react-query';
import { getAdminSettlePayout } from '@/services/admin/admin';
import { AdminSettlePayoutResponse } from '@/types';

export const useAdminSettlePayout = (
  adminToken: string | null,
  businessId: string | null,
  page: number = 1,
  perPage: number = 4
) => {
  return useQuery<AdminSettlePayoutResponse>({
    queryKey: ['adminSettlePayout', businessId, page, perPage],
    queryFn: async () => {
      if (!adminToken || !businessId) {
        throw new Error('Admin token and business ID are required');
      }
      return await getAdminSettlePayout(adminToken, businessId, page, perPage);
    },
    enabled: !!adminToken && !!businessId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};

