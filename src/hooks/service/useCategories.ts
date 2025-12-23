import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/services/service/service';
import type { Category } from '@/types';

export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

