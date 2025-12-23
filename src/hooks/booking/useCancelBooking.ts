import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking, CancelBookingRequest, CancelBookingResponse } from '@/services/booking/booking';

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
      // Invalidate and refetch appointment queries
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};

