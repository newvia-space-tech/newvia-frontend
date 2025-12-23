import { useQuery } from '@tanstack/react-query';
import { getStates } from '@/services/city/city';
import type { State } from '@/types';

export function useStates() {
  return useQuery<State[], Error>({
    queryKey: ['states'],
    queryFn: getStates,
    staleTime: 10 * 60 * 1000, // 10 minutes - states don't change often
  });
}

