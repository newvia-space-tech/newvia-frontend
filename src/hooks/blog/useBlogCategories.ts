import { useQuery } from '@tanstack/react-query';
import { getBlogCategories, BlogCategory } from '@/services/blog/blog';

export const useBlogCategories = (adminToken: string | null) => {
  return useQuery<BlogCategory[]>({
    queryKey: ['blogCategories'],
    queryFn: async () => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await getBlogCategories(adminToken);
    },
    enabled: !!adminToken, // Only fetch when adminToken is available
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

