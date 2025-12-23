import { apiRequest } from '../common/apiRequest';

export interface UpdateCustomerSettingsRequest {
  user_id: string;
  email: boolean;
  marketting: boolean; // Note: API uses "marketting" (typo) instead of "marketing"
}

export interface UpdateCustomerSettingsResponse {
  status: boolean;
  message: string;
  payload?: unknown;
}

// Customer: Update settings
export const updateCustomerSettings = async (
  payload: UpdateCustomerSettingsRequest,
  authToken: string
): Promise<UpdateCustomerSettingsResponse> => {
  const response = await apiRequest(
    `customer/settings`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    authToken
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update customer settings');
  }

  const data = await response.json();
  if (!data.status) {
    throw new Error(data.message || 'Failed to update customer settings');
  }

  return data;
};


