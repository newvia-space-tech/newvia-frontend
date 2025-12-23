import { useQuery } from '@tanstack/react-query';
import { getProviderProfile } from '@/services/profile/profile';
import { useAuth } from '@/context/AuthContext';

export const useProviderProfile = (userId: string) => {
  const { authToken } = useAuth();

  return useQuery({
    queryKey: ['providerProfile', userId],
    queryFn: () => {
      if (!authToken) {
        throw new Error('No authentication token available');
      }
      return getProviderProfile(userId, authToken);
    },
    enabled: !!userId && !!authToken,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};

