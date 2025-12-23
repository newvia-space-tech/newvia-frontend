import { useQuery } from '@tanstack/react-query';
import { getTodayTopPicks } from '@/services/landing/landing';
import type { TodayTopPick } from '@/types';

export function useTodayTopPicks() {
  return useQuery<TodayTopPick[], Error>({
    queryKey: ['todayTopPicks'],
    queryFn: getTodayTopPicks,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

