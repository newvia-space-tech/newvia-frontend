import { useQuery } from '@tanstack/react-query';
import { getBlogs } from '@/services/blog/blog';
import { BlogsResponse } from '@/types';

export const useBlogs = (
  page: number = 1,
  perPage: number = 10
) => {
  return useQuery<BlogsResponse>({
    queryKey: ['blogs', page, perPage],
    queryFn: async () => {
      return await getBlogs(page, perPage);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

