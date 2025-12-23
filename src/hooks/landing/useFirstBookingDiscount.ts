import { useQuery } from '@tanstack/react-query';
import { getFirstBookingDiscount } from '@/services/landing/landing';
import { useAuth } from '@/context/AuthContext';

export function useFirstBookingDiscount() {
  const { isAuthenticated, user, authToken } = useAuth();

  return useQuery<boolean, Error>({
    queryKey: ['firstBookingDiscount', user?.id],
    queryFn: async () => {
      if (!user?.id || !authToken) {
        throw new Error('User not authenticated');
      }
      const response = await getFirstBookingDiscount(user.id, authToken);
      return response.payload;
    },
    enabled: isAuthenticated && !!user?.id && !!authToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

