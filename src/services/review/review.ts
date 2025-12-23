import { BusinessReviewsResponse } from '@/types';
import { apiRequest } from '../common/apiRequest';

// Public: Get business reviews by business ID
export const getBusinessReviews = async (businessId: string, page: number = 1, perPage: number = 4): Promise<BusinessReviewsResponse> => {
  const response = await apiRequest(`reviews/business-reviews?business_id=${businessId}&page=${page}&perPage=${perPage}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch business reviews');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch business reviews');
  }

  return data;
};

// Customer: Add a review
export const addReview = async (reviewData: {
  business_id: string;
  user_id: string;
  booking_id: string;
  service_id: string;
  rating: number;
  comment: string;
}, authToken: string): Promise<{ status: boolean; message: string; data?: unknown }> => {
  const response = await apiRequest('reviews/reviews', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add review');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to add review');
  }

  return data;
};

