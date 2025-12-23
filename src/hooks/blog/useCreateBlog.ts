import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBlog, CreateBlogRequest, CreateBlogResponse } from '@/services/blog/blog';

export const useCreateBlog = (adminToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<CreateBlogResponse, Error, CreateBlogRequest>({
    mutationFn: async (payload: CreateBlogRequest) => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await createBlog(payload, adminToken);
    },
    onSuccess: () => {
      // Invalidate and refetch blogs queries
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

