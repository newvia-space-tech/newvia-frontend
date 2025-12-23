import { useQuery } from '@tanstack/react-query';
import { getAdminPaymentManagement } from '@/services/admin/admin';
import { AdminPaymentManagementResponse } from '@/types';

export const useAdminPaymentManagement = (
  adminToken: string | null,
  page: number = 1,
  perPage: number = 10,
  search: string = ''
) => {
  return useQuery<AdminPaymentManagementResponse>({
    queryKey: ['adminPaymentManagement', page, perPage, search],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminPaymentManagement(adminToken, page, perPage, search);
    },
    enabled: !!adminToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

