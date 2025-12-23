import { useQuery } from '@tanstack/react-query';
import { getServices } from '@/services/service/service';
import { useAuth } from '@/context/AuthContext';
import type { Service } from '@/types';

export const useServices = (businessId: string, userId: string, enabled: boolean = true) => {
  const { authToken } = useAuth();

  return useQuery<Service[], Error>({
    queryKey: ['services', businessId, userId],
    queryFn: async () => {
      if (!authToken) {
        throw new Error('No authentication token available');
      }
      const response = await getServices(businessId, userId, authToken);
      // Filter out deleted services
      return (response.payload || []).filter(service => !service.is_deleted);
    },
    enabled: enabled && !!businessId && !!userId && !!authToken,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};

