import { useQuery } from '@tanstack/react-query';
import { getHeroVideos } from '@/services/landing/landing';
import { HeroVideo } from '@/types';

export const useHeroVideos = () => {
  return useQuery<HeroVideo[]>({
    queryKey: ['heroVideos'],
    queryFn: async () => {
      try {
        const response = await getHeroVideos();
        console.log('Hero Videos API Response:', response);
        // Filter only active videos
        const activeVideos = response.payload?.filter((video) => video.is_active) || [];
        console.log('Active Videos:', activeVideos);
        return activeVideos;
      } catch (error) {
        console.error('Error fetching hero videos:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

