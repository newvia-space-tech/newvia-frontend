import { MajorCity, CitiesResponse, State, City } from '@/types';
import { apiRequest } from '../common/apiRequest';

// Public: Get major cities
export const getMajorCities = async (): Promise<MajorCity[]> => {
  const response = await apiRequest('cities/get-major-cities', { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch major cities');
  }

  const data = await response.json();
  return data?.payload ?? [];
};

// Public: Get all cities with pagination
export const getAllCities = async (page: number = 1, perPage: number = 4): Promise<CitiesResponse> => {
  const response = await apiRequest(`cities/get-all-cities?page=${page}&perPage=${perPage}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch cities');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch cities');
  }

  return data?.payload ?? { itemsReceived: 0, curPage: 1, nextPage: null, prevPage: null, offset: 0, perPage: 4, itemsTotal: 0, pageTotal: 0, items: [] };
};

// Public: Get all states
export const getStates = async (): Promise<State[]> => {
  const response = await apiRequest('cities/get-states', { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch states');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch states');
  }

  return data?.payload ?? [];
};

// Public: Get cities by state ID
export const getCitiesByState = async (stateId: string): Promise<City[]> => {
  const response = await apiRequest(`cities/get-all-cities?state_id=${stateId}`, { method: 'GET' });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch cities by state');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to fetch cities by state');
  }

  return data?.payload?.items ?? [];
};

