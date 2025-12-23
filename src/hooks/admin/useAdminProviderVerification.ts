import { useQuery } from '@tanstack/react-query';
import { getAdminProviderVerification } from '@/services/admin/admin';
import { AdminProviderVerificationResponse } from '@/types';

export const useAdminProviderVerification = (
  adminToken: string | null,
  filter: string = 'all',
  page: number = 1,
  perPage: number = 4
) => {
  return useQuery<AdminProviderVerificationResponse>({
    queryKey: ['adminProviderVerification', filter, page, perPage],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminProviderVerification(adminToken, filter, page, perPage);
    },
    enabled: !!adminToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

