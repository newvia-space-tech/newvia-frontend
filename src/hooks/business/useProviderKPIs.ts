import { useQuery } from '@tanstack/react-query';
import { getProviderKPIs } from '@/services/business/business';
import { ProviderKPIsResponse } from '@/types';

export const useProviderKPIs = (businessId: string | null, userId: string | null, authToken: string | null) => {
  return useQuery<ProviderKPIsResponse>({
    queryKey: ['providerKPIs', businessId, userId],
    queryFn: async () => {
      if (!businessId || !userId || !authToken) {
        throw new Error('Missing required parameters: businessId, userId, or authToken');
      }
      return await getProviderKPIs(businessId, userId, authToken);
    },
    enabled: !!businessId && !!userId && !!authToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

