import { useQuery } from '@tanstack/react-query';
import { getBusinessInfo } from '@/services/business/business';
import { useAuth } from '@/context/AuthContext';

export const useBusinessInfo = (businessId: string, userId: string, enabled: boolean = true) => {
  const { authToken } = useAuth();

  return useQuery({
    queryKey: ['businessInfo', businessId, userId],
    queryFn: () => {
      if (!authToken) {
        throw new Error('No authentication token available');
      }
      return getBusinessInfo(businessId, userId, authToken);
    },
    enabled: enabled && !!businessId && !!userId && !!authToken,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};
