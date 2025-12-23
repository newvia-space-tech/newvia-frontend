import { Category, ServiceListingResponse, Service, AddServiceRequest, AddServiceResponse, EditServiceRequest, EditServiceResponse } from '@/types';
import { apiRequest } from '../common/apiRequest';

// Public: Get categories for landing page
export const getCategories = async (): Promise<Category[]> => {
  const response = await apiRequest('services/categories', { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch categories');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch categories');
  }

  return data?.payload?.categories ?? [];
};

// Public: Get service listing
export const getServiceListing = async (businessId: string, price: string = 'desc', page: number = 1, perPage: number = 3): Promise<ServiceListingResponse> => {
  const response = await apiRequest(`services/listing?business_id=${businessId}&price=${price}&page=${page}&perPage=${perPage}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch service listing');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch service listing');
  }

  return data;
};

// Protected: Get services for a business (requires authentication)
export const getServices = async (
  businessId: string,
  userId: string,
  authToken: string
): Promise<{ status: boolean; message: string; payload: Service[] }> => {
  const response = await apiRequest(
    `services/get-service?business_id=${businessId}&user_id=${userId}`,
    { method: 'GET' },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch services');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch services');
  }

  return data;
};

// Protected: Add service (requires authentication)
export const addService = async (
  payload: AddServiceRequest,
  authToken: string
): Promise<AddServiceResponse> => {
  const response = await apiRequest(
    'services/add-services',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add service');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to add service');
  }

  return data;
};

// Protected: Edit service (requires authentication)
export const editService = async (
  payload: EditServiceRequest,
  authToken: string
): Promise<EditServiceResponse> => {
  const response = await apiRequest(
    'services/edit-service',
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update service');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to update service');
  }

  return data;
};

// Protected: Delete service (requires authentication)
export interface DeleteServiceRequest {
  user_id: string;
  service_id: string;
  business_id: string;
}

export interface DeleteServiceResponse {
  status: boolean;
  message: string;
}

export const deleteService = async (
  payload: DeleteServiceRequest,
  authToken: string
): Promise<DeleteServiceResponse> => {
  const response = await apiRequest(
    'services/delete-service',
    {
      method: 'DELETE',
      body: JSON.stringify(payload),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete service');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to delete service');
  }

  return data;
};

