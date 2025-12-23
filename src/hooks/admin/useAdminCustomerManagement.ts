import { useQuery } from '@tanstack/react-query';
import { getAdminCustomerManagement } from '@/services/admin/admin';
import { AdminCustomerManagementResponse } from '@/types';

export const useAdminCustomerManagement = (
  adminToken: string | null,
  page: number = 1,
  perPage: number = 10,
  search: string = ''
) => {
  return useQuery<AdminCustomerManagementResponse>({
    queryKey: ['adminCustomerManagement', page, perPage, search],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminCustomerManagement(adminToken, page, perPage, search);
    },
    enabled: !!adminToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

