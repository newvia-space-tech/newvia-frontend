import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateBlog, UpdateBlogRequest, UpdateBlogResponse } from '@/services/blog/blog';

export const useUpdateBlog = (adminToken: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<UpdateBlogResponse, Error, UpdateBlogRequest>({
    mutationFn: async (payload: UpdateBlogRequest) => {
      if (!adminToken) {
        throw new Error('Admin token is required');
      }
      return await updateBlog(payload, adminToken);
    },
    onSuccess: () => {
      // Invalidate and refetch blogs queries
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['blogDetail'] });
    },
  });
};

