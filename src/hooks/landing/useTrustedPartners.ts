import { useQuery } from '@tanstack/react-query';
import { getTrustedPartners } from '@/services/landing/landing';
import type { TrustedPartner } from '@/types';

export function useTrustedPartners() {
  return useQuery<TrustedPartner[], Error>({
    queryKey: ['trustedPartners'],
    queryFn: getTrustedPartners,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

