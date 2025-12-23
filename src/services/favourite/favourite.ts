import { FavouritesResponse } from '@/types';
import { apiRequest } from '../common/apiRequest';

// Customer: Get favourites
export const getCustomerFavourites = async (userId: string, authToken: string): Promise<FavouritesResponse> => {
  const response = await apiRequest(`favourites/customer-favourites?user_id=${userId}`, { method: 'GET' }, authToken);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch favourites');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch favourites');
  }

  return data;
};

// Customer: Toggle favourite (add or remove)
export const toggleCustomerFavourite = async (
  userId: string,
  businessId: string,
  isDeleted: boolean,
  authToken: string
): Promise<{ status: boolean; message: string }> => {
  const response = await apiRequest(
    `favourites/customer_favourites?user_id=${userId}&business_id=${businessId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        business_id: businessId,
        user_id: userId,
        updated_at: null,
        is_deleted: isDeleted,
      }),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to toggle favourite');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to toggle favourite');
  }

  return data;
};

