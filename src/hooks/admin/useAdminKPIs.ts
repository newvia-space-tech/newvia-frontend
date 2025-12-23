import { useQuery } from '@tanstack/react-query';
import { getAdminKPIs } from '@/services/admin/admin';
import { AdminKPIsResponse } from '@/types';

export const useAdminKPIs = (adminToken: string | null) => {
  return useQuery<AdminKPIsResponse>({
    queryKey: ['adminKPIs'],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getAdminKPIs(adminToken);
    },
    enabled: !!adminToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

