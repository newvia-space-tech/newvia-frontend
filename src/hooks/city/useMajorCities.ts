import { useQuery } from '@tanstack/react-query';
import { getMajorCities } from '@/services/city/city';
import type { MajorCity } from '@/types';

export function useMajorCities() {
  return useQuery<MajorCity[], Error>({
    queryKey: ['majorCities'],
    queryFn: getMajorCities,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

