import { useQuery } from '@tanstack/react-query';
import { getAdminRefundManagement } from '@/services/admin/admin';
import { AdminRefundManagementResponse } from '@/types';

export const useAdminRefundManagement = (
  adminToken: string | null,
  page: number = 1,
  perPage: number = 10,
  search: string = ''
) => {
  return useQuery<AdminRefundManagementResponse>({
    queryKey: ['adminRefundManagement', page, perPage, search],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminRefundManagement(adminToken, page, perPage, search);
    },
    enabled: !!adminToken,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};

