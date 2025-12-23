import { useQuery } from '@tanstack/react-query';
import { getAdminProviderManagement } from '@/services/admin/admin';
import { AdminProviderManagementResponse } from '@/types';

export const useAdminProviderManagement = (
  adminToken: string | null,
  page: number = 1,
  perPage: number = 10
) => {
  return useQuery<AdminProviderManagementResponse>({
    queryKey: ['adminProviderManagement', page, perPage],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminProviderManagement(adminToken, page, perPage);
    },
    enabled: !!adminToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

