import { useQuery } from '@tanstack/react-query';
import { getBlogHeroVideos } from '@/services/landing/landing';
import { HeroVideo } from '@/types';

export const useBlogHeroVideos = () => {
  return useQuery<HeroVideo[]>({
    queryKey: ['blogHeroVideos'],
    queryFn: async () => {
      try {
        const response = await getBlogHeroVideos();
        console.log('Blog Hero Videos API Response:', response);
        // Filter only active videos
        const activeVideos = response.payload?.filter((video) => video.is_active) || [];
        console.log('Active Blog Videos:', activeVideos);
        return activeVideos;
      } catch (error) {
        console.error('Error fetching blog hero videos:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

