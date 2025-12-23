import { useQuery } from '@tanstack/react-query';
import { getCitiesByState } from '@/services/city/city';
import type { City } from '@/types';

export function useCitiesByState(stateId: string | null) {
  return useQuery<City[], Error>({
    queryKey: ['citiesByState', stateId],
    queryFn: () => getCitiesByState(stateId!),
    enabled: !!stateId, // Only fetch when stateId is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

