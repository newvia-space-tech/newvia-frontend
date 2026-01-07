import { useQuery } from '@tanstack/react-query';
import { getSubscriptionPlans } from '@/services/business/business';
import { AdminSubscriptionPlansResponse } from '@/types';

export const useSubscriptionPlans = (authToken: string | null) => {
  return useQuery<AdminSubscriptionPlansResponse>({
    queryKey: ['subscriptionPlans'],
    queryFn: async () => {
      if (!authToken) {
        throw new Error('Auth token is required');
      }
      return await getSubscriptionPlans(authToken);
    },
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

