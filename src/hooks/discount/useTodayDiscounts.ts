import { useQuery } from '@tanstack/react-query';
import { getTodayDiscounts } from '@/services/discount/discount';
import type { Discount } from '@/types';

export function useTodayDiscounts() {
  return useQuery<Discount[], Error>({
    queryKey: ['todayDiscounts'],
    queryFn: getTodayDiscounts,
    staleTime: 1 * 60 * 1000, // 1 minute (discounts can change frequently)
  });
}

