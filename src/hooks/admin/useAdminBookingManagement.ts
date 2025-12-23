import { useQuery } from '@tanstack/react-query';
import { getAdminBookingManagement } from '@/services/admin/admin';
import { AdminBookingManagementResponse } from '@/types';

export const useAdminBookingManagement = (
  adminToken: string | null,
  filter: string = 'all',
  page: number = 1,
  perPage: number = 10,
  search: string = ''
) => {
  return useQuery<AdminBookingManagementResponse>({
    queryKey: ['adminBookingManagement', filter, page, perPage, search],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminBookingManagement(adminToken, filter, page, perPage, search);
    },
    enabled: !!adminToken,
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter for booking data)
    retry: 2,
  });
};

