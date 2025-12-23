import { useQuery } from '@tanstack/react-query';
import { getAdminSubscriptionPlans } from '@/services/admin/admin';
import { AdminSubscriptionPlansResponse } from '@/types';

export const useAdminSubscriptionPlans = (adminToken: string | null) => {
  return useQuery<AdminSubscriptionPlansResponse>({
    queryKey: ['adminSubscriptionPlans'],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminSubscriptionPlans(adminToken);
    },
    enabled: !!adminToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

