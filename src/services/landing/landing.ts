import { TrustedPartner, TodayTopPick, HeroVideosResponse } from '@/types';
import { apiRequest } from '../common/apiRequest';

// Public: Get trusted partners
export const getTrustedPartners = async (): Promise<TrustedPartner[]> => {
  const response = await apiRequest('businesses/trusted-partners', { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch trusted partners');
  }

  const data = await response.json();
  return data?.payload ?? [];
};

// Public: Get today's top picks
export const getTodayTopPicks = async (): Promise<TodayTopPick[]> => {
  const response = await apiRequest('businesses/today-top-picks', { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch today\'s top picks');
  }

  const data = await response.json();
  return data?.payload ?? [];
};

// Public: Get hero section videos
export const getHeroVideos = async (): Promise<HeroVideosResponse> => {
  const response = await apiRequest('landing/hero-section?page=landing', { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch hero videos');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch hero videos');
  }

  return data;
};

// Public: Get blog hero section videos
export const getBlogHeroVideos = async (): Promise<HeroVideosResponse> => {
  const response = await apiRequest('landing/hero-section?page=blog', { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch blog hero videos');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch blog hero videos');
  }

  return data;
};

// Authenticated: Get first booking discount eligibility
export interface FirstBookingDiscountResponse {
  status: boolean;
  message: string;
  payload: boolean;
}

export const getFirstBookingDiscount = async (
  userId: string,
  authToken: string
): Promise<FirstBookingDiscountResponse> => {
  const response = await apiRequest(
    `landing/first-booking-discount?user_id=${userId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch first booking discount');
  }

  const data = await response.json();
  return data;
};

