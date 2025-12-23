import { useQuery } from '@tanstack/react-query';
import { getBookingDiscount, BookingDiscountPayload } from '@/services/booking/booking';
import { useAuth } from '@/context/AuthContext';

interface UseBookingDiscountParams {
  businessId: string;
  userId: string;
  serviceId: string;
  enabled?: boolean;
}

export const useBookingDiscount = ({
  businessId,
  userId,
  serviceId,
  enabled = true,
}: UseBookingDiscountParams) => {
  const { authToken } = useAuth();

  return useQuery<BookingDiscountPayload>({
    queryKey: ['booking-discount', businessId, userId, serviceId, authToken],
    queryFn: async () => {
      if (!authToken) {
        throw new Error('Authentication required');
      }
      const response = await getBookingDiscount(businessId, userId, serviceId, authToken);
      return response.payload;
    },
    enabled: enabled && !!businessId && !!userId && !!serviceId && !!authToken,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
};


