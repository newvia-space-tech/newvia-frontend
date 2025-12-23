'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFirstBookingDiscount } from '@/hooks/landing/useFirstBookingDiscount';

// Image assets
const arrowIcon = '/figma-assets/arrow-right.svg';

export default function FirstBookingBanner() {
  const { isAuthenticated } = useAuth();
  const { data: isEligible, isLoading } = useFirstBookingDiscount();
  const router = useRouter();

  // Show banner if:
  // 1. Not logged in (show without API call)
  // 2. Logged in, API loaded, and returns true
  // Don't show if:
  // - Logged in and API returns false
  // - Logged in and still loading
  const shouldShow = !isAuthenticated || (isAuthenticated && !isLoading && isEligible === true);

  if (!shouldShow) {
    return null;
  }

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/auth/login/customer');
    }
    if (isAuthenticated) {
      router.push('/services');
    }
    // If authenticated, do nothing for now (as per requirements)
  };

  return (
    <div className="bg-gradient-to-r from-[#eee8a9] to-[#dbe4d6] px-4 sm:px-8 lg:px-15 py-1.5">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
        <p className="text-black text-xs sm:text-sm font-normal text-center">
          First-Time Users Get 10% Off Instantly!
        </p>
        <button
          onClick={handleClick}
          className="flex items-center gap-1 text-black text-xs sm:text-sm font-normal underline hover:no-underline transition-all cursor-pointer"
        >
          <span>{isAuthenticated ? 'Book Now' : 'Login to Claim'}</span>
          <Image
            src={arrowIcon}
            alt="Arrow Right"
            width={8}
            height={8}
            className="w-2 h-2 brightness-0"
          />
        </button>
      </div>
    </div>
  );
}

