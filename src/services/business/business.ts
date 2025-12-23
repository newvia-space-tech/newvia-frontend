import {
  BusinessDetailResponse,
  BusinessHoursResponse,
  BusinessImagesResponse,
  BusinessListingResponse,
  PriorityListingResponse,
  ProviderKPIsResponse,
  BookingReviewDashboardResponse,
  BookingManagementResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  ReviewManagementResponse,
  FlagReviewRequest,
  FlagReviewResponse,
  BusinessInfoResponse,
  EditBusinessInfoRequest,
  EditBusinessInfoResponse,
  LocationAvailabilityResponse,
  EditBusinessLocationRequest,
  EditBusinessLocationResponse,
  EditWorkingHoursRequest,
  EditWorkingHoursResponse,
  EditBusinessImagesRequest,
  EditBusinessImagesResponse,
  UploadImagesResponse,
} from '@/types';
import type { ApiOnboardingPayload } from '@/types/onboarding';
import { apiRequest } from '../common/apiRequest';

// Public: Get business detail by ID
export const getBusinessDetail = async (businessId: string, userId?: string): Promise<BusinessDetailResponse> => {
  const params = new URLSearchParams();
  if (userId) {
    params.append('user_id', userId);
  }
  const queryString = params.toString();
  const url = `businesses/business/${businessId}${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiRequest(url, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch business details');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch business details');
  }

  return data;
};

// Public: Get business hours by business ID
export const getBusinessHours = async (businessId: string): Promise<BusinessHoursResponse> => {
  const response = await apiRequest(`businesses/business-hours?business_id=${businessId}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch business hours');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch business hours');
  }

  return data;
};

// Protected: Get business hours by business ID (requires authentication)
export const getBusinessHoursProtected = async (
  businessId: string,
  authToken: string
): Promise<BusinessHoursResponse> => {
  const response = await apiRequest(
    `businesses/business-hours?business_id=${businessId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch business hours');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch business hours');
  }

  return data;
};

// Protected: Get location availability (requires authentication)
export const getLocationAvailability = async (
  businessId: string,
  userId: string,
  authToken: string
): Promise<LocationAvailabilityResponse> => {
  const response = await apiRequest(
    `businesses/location-availability?business_id=${businessId}&user_id=${userId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch location availability');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch location availability');
  }

  return data;
};

// Protected: Edit business location (requires authentication)
export const editBusinessLocation = async (
  payload: EditBusinessLocationRequest,
  authToken: string
): Promise<EditBusinessLocationResponse> => {
  const response = await apiRequest(
    'businesses/edit-business-location',
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update business location');
  }

  const data = await response.json();
  
  // Handle nested response structure
  const responseData = data.response || data;
  
  if (!responseData.status) {
    throw new Error(responseData.message || 'Failed to update business location');
  }

  return data;
};

// Public: Get business images by business ID
export const getBusinessImages = async (businessId: string): Promise<BusinessImagesResponse> => {
  const response = await apiRequest(`businesses/images?business_id=${businessId}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch business images');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch business images');
  }

  return data;
};

// Public: Get business listing
export const getBusinessListing = async (cityId?: string, categoryId?: string, highestReview: boolean = false): Promise<BusinessListingResponse> => {
  const params = new URLSearchParams();
  if (cityId) {
    params.append('city_id', cityId);
  }
  if (categoryId) {
    params.append('category_id', categoryId);
  }
  if (highestReview) {
    params.append('highest_review', 'true');
  }
  
  const queryString = params.toString();
  const response = await apiRequest(`businesses/listing?${queryString}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch business listing');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch business listing');
  }

  return data;
};

// Public: Get priority listing businesses
export const getPriorityListing = async (categoryId?: string, page: number = 1, perPage: number = 5): Promise<PriorityListingResponse> => {
  const params = new URLSearchParams();
  if (categoryId) {
    params.append('category_id', categoryId);
  }
  params.append('page', page.toString());
  params.append('perPage', perPage.toString());
  
  const queryString = params.toString();
  const response = await apiRequest(`businesses/priority-listing?${queryString}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch priority listing');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch priority listing');
  }

  return data;
};

// Protected: Submit provider onboarding (requires authentication)
export const submitProviderOnboarding = async (payload: ApiOnboardingPayload, authToken: string): Promise<unknown> => {
  const response = await apiRequest(
    'provider/add-provider', 
    { 
      method: 'POST',
      body: JSON.stringify(payload)
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to submit provider onboarding');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to submit provider onboarding');
  }

  return data;
};

// Protected: Get provider KPIs (requires authentication)
export const getProviderKPIs = async (businessId: string, userId: string, authToken: string): Promise<ProviderKPIsResponse> => {
  const response = await apiRequest(
    `provider/kpis?business_id=${businessId}&user_id=${userId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch provider KPIs');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch provider KPIs');
  }

  return data;
};

// Protected: Get provider booking-review dashboard (requires authentication)
export const getBookingReviewDashboard = async (
  businessId: string, 
  userId: string, 
  authToken: string,
  upcomingBookingsPerPage: number = 5,
  reviewsPerPage: number = 3
): Promise<BookingReviewDashboardResponse> => {
  const response = await apiRequest(
    `provider/booking-review-dashboard?business_id=${businessId}&user_id=${userId}&upcoming_bookings_per_page=${upcomingBookingsPerPage}&reviews_per_page=${reviewsPerPage}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch booking-review dashboard');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch booking-review dashboard');
  }

  return data;
};

// Protected: Get provider booking management (requires authentication)
export const getBookingManagement = async (
  businessId: string, 
  userId: string, 
  filter: 'upcoming' | 'past' | 'cancelled',
  authToken: string
): Promise<BookingManagementResponse> => {
  const response = await apiRequest(
    `provider/booking-mgmt?business_id=${businessId}&user_id=${userId}&filter=${filter}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch bookings');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch bookings');
  }

  return data;
};

// Protected: Cancel booking (requires authentication)
export const cancelBooking = async (
  payload: CancelBookingRequest,
  authToken: string
): Promise<CancelBookingResponse> => {
  const response = await apiRequest(
    'provider/cancel-booking',
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to cancel booking');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to cancel booking');
  }

  return data;
};

// Protected: Get provider review management (requires authentication)
export const getReviewManagement = async (
  businessId: string,
  userId: string,
  isFlagged: boolean,
  authToken: string
): Promise<ReviewManagementResponse> => {
  const response = await apiRequest(
    `provider/review-mgmt?business_id=${businessId}&user_id=${userId}&is_flagged=${isFlagged}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch reviews');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch reviews');
  }

  return data;
};

// Protected: Flag review (requires authentication)
export const flagReview = async (
  payload: FlagReviewRequest,
  authToken: string
): Promise<FlagReviewResponse> => {
  const response = await apiRequest(
    'reviews/flag',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to flag review');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to flag review');
  }

  return data;
};

// Protected: Get business info (requires authentication)
export const getBusinessInfo = async (
  businessId: string,
  userId: string,
  authToken: string
): Promise<BusinessInfoResponse> => {
  const response = await apiRequest(
    `businesses/get-business-info?business_id=${businessId}&user_id=${userId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch business info');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch business info');
  }

  return data;
};

// Protected: Edit business info (requires authentication)
export const editBusinessInfo = async (
  payload: EditBusinessInfoRequest,
  authToken: string
): Promise<EditBusinessInfoResponse> => {
  const response = await apiRequest(
    'businesses/edit-business-info',
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update business info');
  }

  const data = await response.json();
  
  // Handle nested response structure
  const responseData = data.response || data;
  
  if (!responseData.status) {
    throw new Error(responseData.message || 'Failed to update business info');
  }

  return data;
};

// Protected: Edit working hours (requires authentication)
export const editWorkingHours = async (
  payload: EditWorkingHoursRequest,
  authToken: string
): Promise<EditWorkingHoursResponse> => {
  const response = await apiRequest(
    'businesses/edit-working-hours',
    {
      method: 'PUT',
      body: JSON.stringify(payload)
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update working hours');
  }

  const data = await response.json();
  
  // Handle nested response structure if present
  const responseData = data.response || data;
  
  if (!responseData.status) {
    throw new Error(responseData.message || 'Failed to update working hours');
  }

  return data;
};

// Protected: Get account details (requires authentication)
export interface AccountDetailsResponse {
  status: boolean;
  message: string;
  payload: {
    id: string;
    owner_user_id: string;
    business_name: string;
    account_name: string;
    account_number: string;
    bank_name: string;
  };
}

export const getAccountDetails = async (
  businessId: string,
  userId: string,
  authToken: string
): Promise<AccountDetailsResponse> => {
  const response = await apiRequest(
    `businesses/account-info?business_id=${businessId}&user_id=${userId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch account details');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch account details');
  }

  return data;
};

// Protected: Add account details (requires authentication)
export interface AddAccountDetailsRequest {
  user_id: string;
  business_id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
}

export interface AddAccountDetailsResponse {
  status: boolean;
  message: string;
}

export const addAccountDetails = async (
  payload: AddAccountDetailsRequest,
  authToken: string
): Promise<AddAccountDetailsResponse> => {
  const response = await apiRequest(
    'businesses/add-account-details',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add account details');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to add account details');
  }

  return data;
};

// Protected: Upload images (requires authentication)
export const uploadImages = async (
  images: File[],
  userId: string,
  authToken: string
): Promise<UploadImagesResponse> => {
  const formData = new FormData();
  
  // Append each image file with the 'images[]' field name
  images.forEach((image) => {
    formData.append('images[]', image);
  });
  
  // Append user_id
  formData.append('user_id', userId);

  const response = await apiRequest(
    'utils/upload-images',
    {
      method: 'POST',
      body: formData,
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload images');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to upload images');
  }

  return data;
};

// Protected: Edit business images (requires authentication)
export const editBusinessImages = async (
  payload: EditBusinessImagesRequest,
  authToken: string
): Promise<EditBusinessImagesResponse> => {
  const response = await apiRequest(
    'businesses/edit-business-images',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update business images');
  }

  const data = await response.json();
  
  // Handle nested response structure if present
  const responseData = data.response || data;
  
  if (!responseData.status) {
    throw new Error(responseData.message || 'Failed to update business images');
  }

  return data;
};
