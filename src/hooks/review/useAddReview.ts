import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addReview } from '@/services/review/review';

interface AddReviewParams {
  business_id: string;
  user_id: string;
  booking_id: string;
  service_id: string;
  rating: number;
  comment: string;
  authToken: string;
}

export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ authToken, ...reviewData }: AddReviewParams) =>
      addReview(reviewData, authToken),
    onSuccess: (data, variables) => {
      // Invalidate and refetch business reviews to show the new review
      queryClient.invalidateQueries({
        queryKey: ['business-reviews', variables.business_id],
      });

      // Optionally invalidate customer appointments if needed
      // This might be useful if the review submission changes appointment status
      queryClient.invalidateQueries({
        queryKey: ['customer-appointments'],
      });
    },
  });
}

