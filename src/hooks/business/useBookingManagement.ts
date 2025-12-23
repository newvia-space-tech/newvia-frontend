import { useQuery } from '@tanstack/react-query';
import { getBookingManagement } from '@/services/business/business';
import { BookingManagementResponse } from '@/types';

export const useBookingManagement = (
  businessId: string | null,
  userId: string | null,
  filter: 'upcoming' | 'past' | 'cancelled',
  authToken: string | null
) => {
  return useQuery<BookingManagementResponse>({
    queryKey: ['bookingManagement', businessId, userId, filter],
    queryFn: async () => {
      if (!businessId || !userId || !authToken) {
        throw new Error('Missing required parameters: businessId, userId, or authToken');
      }
      return await getBookingManagement(businessId, userId, filter, authToken);
    },
    enabled: !!businessId && !!userId && !!authToken,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
};

