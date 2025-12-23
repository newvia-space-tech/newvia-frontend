import { useQuery } from '@tanstack/react-query';
import { getBlogDetail } from '@/services/blog/blog';
import { BlogDetail } from '@/types';

export const useBlogDetail = (blogId: string | null) => {
  return useQuery<BlogDetail>({
    queryKey: ['blogDetail', blogId],
    queryFn: async () => {
      if (!blogId) {
        throw new Error('Blog ID is required');
      }
      return await getBlogDetail(blogId);
    },
    enabled: !!blogId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

