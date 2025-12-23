import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from '@/services/business/business';
import { CancelBookingRequest, CancelBookingResponse } from '@/types';

export const useCancelBooking = (authToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<CancelBookingResponse, Error, CancelBookingRequest>({
    mutationFn: async (payload: CancelBookingRequest) => {
      if (!authToken) {
        throw new Error('Missing authentication token');
      }
      return await cancelBooking(payload, authToken);
    },
    onSuccess: () => {
      // Invalidate and refetch booking queries
      queryClient.invalidateQueries({ queryKey: ['bookingManagement'] });
      queryClient.invalidateQueries({ queryKey: ['bookingReviewDashboard'] });
    },
  });
};

