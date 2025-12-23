import { useQuery } from '@tanstack/react-query';
import { getBusinessHoursProtected } from '@/services/business/business';
import { useAuth } from '@/context/AuthContext';

export const useBusinessHoursProtected = (businessId: string, enabled: boolean = true) => {
  const { authToken } = useAuth();

  return useQuery({
    queryKey: ['businessHoursProtected', businessId],
    queryFn: () => {
      if (!authToken) {
        throw new Error('No authentication token available');
      }
      return getBusinessHoursProtected(businessId, authToken);
    },
    enabled: enabled && !!businessId && !!authToken,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};

