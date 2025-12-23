import { useQuery } from '@tanstack/react-query';
import { getAccountDetails } from '@/services/business/business';
import { useAuth } from '@/context/AuthContext';

export const useAccountDetails = (businessId: string, userId: string, enabled: boolean = true) => {
  const { authToken } = useAuth();

  return useQuery({
    queryKey: ['accountDetails', businessId, userId],
    queryFn: () => {
      if (!authToken) {
        throw new Error('No authentication token available');
      }
      return getAccountDetails(businessId, userId, authToken);
    },
    enabled: enabled && !!businessId && !!userId && !!authToken,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};

