import { CustomerProfileResponse, CustomerProfile, ProviderProfileResponse, ProviderProfile } from '@/types';
import { apiRequest } from '../common/apiRequest';

export interface UpdateCustomerProfileRequest {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  dob?: string;
  gender?: string;
}

export interface UpdateCustomerProfileResponse {
  status: boolean;
  message: string;
  payload: CustomerProfile;
}

export interface UpdateProviderProfileRequest {
  user_id: string;
  first_name: string;
  last_name: string;
  email_id: string;
  dob: string;
  gender: string;
  phone_number: string;
}

export interface UpdateProviderProfileResponse {
  status: boolean;
  message: string;
  payload: ProviderProfile;
}

// Customer: Get profile
export const getCustomerProfile = async (userId: string, authToken: string): Promise<CustomerProfileResponse> => {
  const response = await apiRequest(`customer/customer/${userId}`, { method: 'GET' }, authToken);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch customer profile');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch customer profile');
  }

  return data;
};

// Customer: Update profile
export const updateCustomerProfile = async (
  userId: string,
  updates: UpdateCustomerProfileRequest,
  authToken: string
): Promise<UpdateCustomerProfileResponse> => {
  const response = await apiRequest(
    `customer/customer/${userId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update customer profile');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to update customer profile');
  }

  return data;
};

// Provider: Get profile
export const getProviderProfile = async (userId: string, authToken: string): Promise<ProviderProfileResponse> => {
  const response = await apiRequest(`provider/provider/${userId}`, { method: 'GET' }, authToken);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch provider profile');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch provider profile');
  }

  return data;
};

// Provider: Update profile
export const updateProviderProfile = async (
  userId: string,
  updates: UpdateProviderProfileRequest,
  authToken: string
): Promise<UpdateProviderProfileResponse> => {
  const response = await apiRequest(
    `provider/provider/${userId}`,
    {
      method: 'PUT',
      body: JSON.stringify(updates),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update provider profile');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to update provider profile');
  }

  return data;
};

