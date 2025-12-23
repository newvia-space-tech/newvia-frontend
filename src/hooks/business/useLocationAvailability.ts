import { useQuery } from '@tanstack/react-query';
import { getLocationAvailability } from '@/services/business/business';
import { useAuth } from '@/context/AuthContext';

export const useLocationAvailability = (businessId: string, userId: string, enabled: boolean = true) => {
  const { authToken } = useAuth();

  return useQuery({
    queryKey: ['locationAvailability', businessId, userId],
    queryFn: () => {
      if (!authToken) {
        throw new Error('No authentication token available');
      }
      return getLocationAvailability(businessId, userId, authToken);
    },
    enabled: enabled && !!businessId && !!userId && !!authToken,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};

