import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCustomerSettings, UpdateCustomerSettingsRequest, UpdateCustomerSettingsResponse } from '@/services/customer/customer';

export const useCustomerSettings = (authToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateCustomerSettingsResponse, Error, UpdateCustomerSettingsRequest>({
    mutationFn: async (payload: UpdateCustomerSettingsRequest) => {
      if (!authToken) {
        throw new Error('Missing authentication token');
      }
      return await updateCustomerSettings(payload, authToken);
    },
    onSuccess: () => {
      // Invalidate customer-related queries if needed
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['customerSettings'] });
    },
  });
};


