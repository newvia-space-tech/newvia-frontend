import { Discount, BusinessDiscountsResponse } from '@/types';
import { apiRequest } from '../common/apiRequest';

// Public: Get today's discounts
export const getTodayDiscounts = async (): Promise<Discount[]> => {
  const response = await apiRequest('discounts/today-discounts', { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch today\'s discounts');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch today\'s discounts');
  }

  return data?.payload ?? [];
};

// Public: Get business discounts by business ID
export const getBusinessDiscounts = async (businessId: string, page: number = 1, perPage: number = 1): Promise<BusinessDiscountsResponse> => {
  const response = await apiRequest(`discounts/business-discounts?business_id=${businessId}&page=${page}&perPage=${perPage}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch business discounts');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch business discounts');
  }

  return data;
};

