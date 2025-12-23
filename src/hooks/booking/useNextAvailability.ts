import { useQuery } from '@tanstack/react-query';
import { getNextAvailability } from '@/services/booking/booking';
import { TimeSlot } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface UseNextAvailabilityParams {
  date: number; // Unix timestamp in milliseconds
  businessId: string;
  serviceId: string;
  enabled?: boolean;
}

export const useNextAvailability = ({
  date,
  businessId,
  serviceId,
  enabled = true,
}: UseNextAvailabilityParams) => {
  const { authToken } = useAuth();

  return useQuery<TimeSlot[]>({
    queryKey: ['next-availability', date, businessId, serviceId, authToken],
    queryFn: async () => {
      if (!authToken) {
        throw new Error('Authentication required');
      }
      const response = await getNextAvailability(date, businessId, serviceId, authToken);
      // Handle both array and object responses
      if (Array.isArray(response.payload)) {
        return response.payload;
      }
      // If payload is an object (not an array), return empty array
      // The API might be returning a different structure
      return [];
    },
    enabled: enabled && !!date && !!businessId && !!serviceId && !!authToken,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
  });
};

