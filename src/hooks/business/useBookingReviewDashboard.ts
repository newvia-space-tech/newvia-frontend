import { useQuery } from '@tanstack/react-query';
import { getBookingReviewDashboard } from '@/services/business/business';
import { BookingReviewDashboardResponse } from '@/types';

export const useBookingReviewDashboard = (
  businessId: string | null, 
  userId: string | null, 
  authToken: string | null,
  upcomingBookingsPerPage: number = 5,
  reviewsPerPage: number = 3
) => {
  return useQuery<BookingReviewDashboardResponse>({
    queryKey: ['bookingReviewDashboard', businessId, userId, upcomingBookingsPerPage, reviewsPerPage],
    queryFn: async () => {
      if (!businessId || !userId || !authToken) {
        throw new Error('Missing required parameters: businessId, userId, or authToken');
      }
      return await getBookingReviewDashboard(businessId, userId, authToken, upcomingBookingsPerPage, reviewsPerPage);
    },
    enabled: !!businessId && !!userId && !!authToken,
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for bookings/reviews)
    retry: 2,
  });
};

