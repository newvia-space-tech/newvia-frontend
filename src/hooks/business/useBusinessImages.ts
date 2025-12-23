import { useQuery } from '@tanstack/react-query';
import { getBusinessImages } from '@/services/business/business';
import { BusinessImagesResponse } from '@/types';

export const useBusinessImages = (businessId: string, enabled: boolean = true) => {
  return useQuery<BusinessImagesResponse>({
    queryKey: ['businessImages', businessId],
    queryFn: () => getBusinessImages(businessId),
    enabled: enabled && !!businessId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    retry: 2,
  });
};


