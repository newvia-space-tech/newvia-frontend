import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteBlog, DeleteBlogRequest, DeleteBlogResponse } from '@/services/blog/blog';

export const useDeleteBlog = (adminToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteBlogResponse, Error, DeleteBlogRequest>({
    mutationFn: async (payload: DeleteBlogRequest) => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await deleteBlog(payload, adminToken);
    },
    onSuccess: () => {
      // Invalidate and refetch blogs queries
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });
};

