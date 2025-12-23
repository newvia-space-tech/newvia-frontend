'use client';

import React, { use, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Heart, Share2, ChevronRight, ChevronLeft } from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';
import { getBusinessDetail, getBusinessHours, getBusinessImages } from '@/services/business/business';
import { getServiceListing } from '@/services/service/service';
import { getBusinessReviews } from '@/services/review/review';
import { getBusinessDiscounts } from '@/services/discount/discount';
import { toggleCustomerFavourite } from '@/services/favourite/favourite';
import { BusinessDetail, Service, BusinessHourDay, BusinessReview, BusinessImageItem, Discount } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { OnlineConsultancyBookingModal, ConsultancyBookingSuccessModal, BookingFormData } from '@/components/booking';

// Image assets - using existing SVGs and images
const logoImg = '/figma-assets/logo.svg';
const magnifyingGlassIcon = '/figma-assets/magnifying-glass.svg';
const mapPinIcon = '/figma-assets/map-pin.svg';
const forwardArrowIcon = '/figma-assets/forward-arrow.svg';
const listIcon = '/figma-assets/button-icon.svg';
const sealCheckIcon = '/figma-assets/seal-check.svg';
const starIcon = '/figma-assets/sparkle.svg';
const clockIcon = '/figma-assets/clock.svg';
const calendarIcon = '/figma-assets/calendar.svg';
const arrowRightIcon = '/figma-assets/arrow-right.svg';

// Helper function to format next available timestamp (same as ServicesAvailableSection)
const formatNextAvailable = (timestamp: number): string => {
  if (!timestamp || timestamp === 0) {
    return 'Not available';
  }
  
  try {
    // Handle timestamp - could be in seconds or milliseconds
    const timestampMs = timestamp > 1000000000000 ? timestamp : timestamp * 1000;
    const now = new Date();
    const availableDate = new Date(timestampMs);
    
    // Check if date is valid
    if (isNaN(availableDate.getTime())) {
      return 'Not available';
    }
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const availableDay = new Date(availableDate.getFullYear(), availableDate.getMonth(), availableDate.getDate());
    
    let dayLabel = '';
    if (availableDay.getTime() === today.getTime()) {
      dayLabel = 'Today';
    } else if (availableDay.getTime() === tomorrow.getTime()) {
      dayLabel = 'Tomorrow';
    } else {
      dayLabel = availableDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    const time = availableDate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    return `${dayLabel} ${time}`;
  } catch (error) {
    return 'Not available';
  }
};

// Helper function to get business status based on current time and business hours
const getBusinessStatus = (businessHours: BusinessHourDay[]): { isOpen: boolean; statusText: string } => {
  if (!businessHours || businessHours.length === 0) {
    return { isOpen: false, statusText: 'Hours not available' };
  }

  try {
    const now = new Date();
    const currentDayJS = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Convert JS day (0-6) to API day format (1-6, where 1 = Monday)
    // API: 1 = Monday, 2 = Tuesday, ..., 6 = Saturday (no Sunday)
    // JS: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const currentDayAPI = currentDayJS === 0 ? null : currentDayJS; // Sunday has no mapping

    // Find today's business hours
    const todayHours = currentDayAPI ? businessHours.find(h => h.day === currentDayAPI) : null;

    if (!todayHours || !todayHours.is_open) {
      return { isOpen: false, statusText: 'Closed today' };
    }

    // Extract time from the API timestamps
    const startTime = new Date(todayHours.start_time);
    const endTime = new Date(todayHours.end_time);

    // Create date objects for today with the business hours' time
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      startTime.getHours(),
      startTime.getMinutes(),
      startTime.getSeconds()
    );

    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      endTime.getHours(),
      endTime.getMinutes(),
      endTime.getSeconds()
    );

    const currentTime = now.getTime();
    const startTimestamp = todayStart.getTime();
    const endTimestamp = todayEnd.getTime();

    // Check if current time is within business hours
    if (currentTime >= startTimestamp && currentTime <= endTimestamp) {
      // Business is open
      const closeTime = endTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      return { isOpen: true, statusText: `Open until ${closeTime}` };
    } else if (currentTime < startTimestamp) {
      // Business hasn't opened yet today
      const openTime = startTime.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      return { isOpen: false, statusText: `Opens at ${openTime}` };
    } else {
      // Business is closed for the day
      // Check for next day's hours
      const tomorrowJS = (currentDayJS + 1) % 7;
      const tomorrowAPI = tomorrowJS === 0 ? null : tomorrowJS;
      const tomorrowHours = tomorrowAPI ? businessHours.find(h => h.day === tomorrowAPI && h.is_open) : null;
      
      if (tomorrowHours) {
        const tomorrowOpenTime = new Date(tomorrowHours.start_time).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        return { isOpen: false, statusText: `Opens tomorrow at ${tomorrowOpenTime}` };
      }
      
      return { isOpen: false, statusText: 'Closed' };
    }
  } catch (error) {
    console.error('Error calculating business status:', error);
    return { isOpen: false, statusText: 'Closed' };
  }
};

// Sample service data - in a real app this would come from an API
const serviceData = {
  id: 'zen-wellness-spa',
  name: 'Zen Wellness Spa',
  verified: true,
  rating: 4.9,
  reviewCount: 551,
  status: 'Open until 8:00 pm',
  description: 'Welcome to Zen Wellness Spa, your ultimate destination for rejuvenating skin care and luxurious facials. Our expert team is dedicated to enhancing your natural beauty through personalized treatments that cater to your unique skin needs. Experience a serene environment where relaxation meets effective skin solutions, ensuring you leave feeling refreshed and radiant.',
  images: [
    '/figma-assets/massage-therapy.png',
    '/figma-assets/yoga-session.png',
    '/figma-assets/massage-therapy.png',
    '/figma-assets/yoga-session.png',
    '/figma-assets/massage-therapy.png',
  ],
  services: [
    {
      id: 1,
      name: "Men's Grooming Experience",
      description: "Enjoy our salon service with a refreshing hair wash, stylish haircut, and a relaxing spa treatment to rejuvenate your senses.",
      duration: "1h 15min",
      availability: "Next available: Today 3:30 PM",
      originalPrice: 85,
      currentPrice: 70,
      isPopular: true,
    },
    {
      id: 2,
      name: "Precision Fade with Defined Edges",
      description: "Indulge in our salon experience featuring a soothing hair wash, chic haircut, and calming spa service for enhanced relaxation.",
      duration: "1h 15min",
      availability: "Next available: Today 3:30 PM",
      originalPrice: 85,
      currentPrice: 75,
      isPopular: true,
    },
    {
      id: 3,
      name: "Precision Fade with Defined Edges",
      description: "Treat yourself to our salon service, including a revitalizing hair wash, trendy haircut, and luxurious spa experience for ultimate pampering.",
      duration: "1h 15min",
      availability: "Available tomorrow",
      originalPrice: 85,
      currentPrice: 50,
      isPopular: false,
    },
    {
      id: 4,
      name: "Precision Fade with Defined Edges",
      description: "",
      duration: "1h 15min",
      availability: "Available tomorrow",
      originalPrice: 85,
      currentPrice: 82,
      isPopular: false,
    },
  ],
  businessHours: [
    { day: 'Sunday', hours: '09:00 AM to 10:00 PM', isToday: false },
    { day: 'Monday', hours: '09:00 AM to 10:00 PM', isToday: true },
    { day: 'Tuesday', hours: '09:00 AM to 10:00 PM', isToday: false },
    { day: 'Wednesday', hours: '09:00 AM to 10:00 PM', isToday: false },
    { day: 'Thursday', hours: '09:00 AM to 10:00 PM', isToday: false },
    { day: 'Friday', hours: '09:00 AM to 10:00 PM', isToday: false },
    { day: 'Saturday', hours: '09:00 AM to 10:00 PM', isToday: false },
  ],
  reviews: [
    {
      id: 1,
      name: 'Maxwell Carter',
      service: 'Revitalizing Hair Therapy for Men',
      rating: 5,
      date: '2 days ago',
      comment: "I recently visited Zen Wellness Spa for a haircut and was blown away by the service! The staff was super friendly and made me feel right at home. My stylist, Jake, really took the time to understand what I wanted and gave me a fresh look that I absolutely love.",
      avatar: '/figma-assets/massage-therapy.png',
    },
    {
      id: 2,
      name: 'Jordan Smith',
      service: "Men's Hair Restoration Treatment",
      rating: 5,
      date: '1 week ago',
      comment: "I just got a haircut at Zen Wellness Spa and was really impressed! The friendly staff made me feel at ease, and my stylist, Jake, listened to my wishes. I love my fresh look! The calming vibe and",
      avatar: '/figma-assets/yoga-session.png',
    },
    {
      id: 3,
      name: 'Ethan Brown',
      service: "Men's Hair Revive Treatment",
      rating: 5,
      date: '2 weeks ago',
      comment: "I just got a haircut at Zen Wellness Spa and was really impressed! The friendly staff made me feel at ease, and my stylist, Jake, listened to my wishes. I love my fresh look!",
      avatar: '/figma-assets/massage-therapy.png',
    },
    {
      id: 4,
      name: 'Sophie Turner',
      service: "Gentlemen's Nourishing Scalp Therapy",
      rating: 5,
      date: '2 months ago',
      comment: "The ambiance was relaxing, and I appreciated the attention to detail. I highly recommend this salon to any guy looking for a great grooming experience!",
      avatar: '/figma-assets/yoga-session.png',
    },
  ],
  pastWork: [
    '/figma-assets/massage-therapy.png',
    '/figma-assets/yoga-session.png',
    '/figma-assets/massage-therapy.png',
    '/figma-assets/yoga-session.png',
  ],
  discount: {
    title: "Unwind with relaxing massages and enjoy 10% off",
    buttonText: "Book Now",
  },
};

interface ServiceDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ServiceDetailsPage({ params }: ServiceDetailsPageProps) {
  // Unwrap params using React.use()
  const unwrappedParams = use(params);
  const businessId = unwrappedParams.id;
  
  const searchParams = useSearchParams();
  
  // Extract search parameters from URL
  const searchQuery = searchParams.get('q') || '';
  const location = searchParams.get('location') || '';
  const categoryId = searchParams.get('category_id') || undefined;
  const cityId = searchParams.get('city_id') || undefined;
  
  const [businessData, setBusinessData] = useState<BusinessDetail | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHourDay[]>([]);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [businessImages, setBusinessImages] = useState<BusinessImageItem[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [currentDiscountPage, setCurrentDiscountPage] = useState(1);
  const [discountPagination, setDiscountPagination] = useState<{ nextPage: number | null; prevPage: number | null; pageTotal: number }>({ nextPage: null, prevPage: null, pageTotal: 1 });
  const [countdown, setCountdown] = useState<{ hours: string; minutes: string; seconds: string }>({ hours: '00', minutes: '00', seconds: '00' });
  const [currentServicesPage, setCurrentServicesPage] = useState(1);
  const [currentReviewsPage, setCurrentReviewsPage] = useState(1);
  const [hasMoreServices, setHasMoreServices] = useState(false);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavourite, setIsFavourite] = useState<boolean>(false);
  const [isTogglingFavourite, setIsTogglingFavourite] = useState(false);
  const imageCarouselRef = React.useRef<HTMLDivElement>(null);
  const servicesPerPage = 4;
  const reviewsPerPage = 4;
  const { user, logout, loading: authLoading, authToken } = useAuth();
  
  // Online Consultancy Booking Modal state
  const [isConsultancyModalOpen, setIsConsultancyModalOpen] = useState(false);
  const [isConsultancySuccessModalOpen, setIsConsultancySuccessModalOpen] = useState(false);
  const [consultancyBookingData, setConsultancyBookingData] = useState<BookingFormData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Reset pagination state
        setCurrentServicesPage(1);
        setCurrentReviewsPage(1);
        setHasMoreServices(false);
        setHasMoreReviews(false);
        
        const [businessResponse, servicesResponse, hoursResponse, reviewsResponse, imagesResponse, discountsResponse] = await Promise.all([
          getBusinessDetail(businessId, user?.id),
          getServiceListing(businessId, 'asc', 1, servicesPerPage),
          getBusinessHours(businessId),
          getBusinessReviews(businessId, 1, reviewsPerPage),
          getBusinessImages(businessId),
          getBusinessDiscounts(businessId, 1, 1)
        ]);
        
        setBusinessData(businessResponse.payload);
        setIsFavourite(businessResponse.payload.is_favourite || false);
        setServices(servicesResponse.payload.items);
        setHasMoreServices(servicesResponse.payload.nextPage !== null);
        // Extract business_hours from the payload object
        setBusinessHours(hoursResponse.payload && !hoursResponse.payload.is_deleted ? hoursResponse.payload.business_hours : []);
        setReviews(reviewsResponse.payload.items);
        setHasMoreReviews(reviewsResponse.payload.nextPage !== null);
        // Extract business_images from the payload object
        setBusinessImages(imagesResponse.payload && !imagesResponse.payload.is_deleted ? imagesResponse.payload.business_images : []);
        setDiscounts(discountsResponse.payload.items);
        setDiscountPagination({
          nextPage: discountsResponse.payload.nextPage,
          prevPage: discountsResponse.payload.prevPage,
          pageTotal: discountsResponse.payload.pageTotal
        });
        setCurrentDiscountPage(1);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId, servicesPerPage, reviewsPerPage, user?.id]);

  // Countdown timer effect
  useEffect(() => {
    if (discounts.length === 0) return;

    const updateCountdown = () => {
      const discount = discounts[0];
      if (!discount) return;

      const now = Date.now();
      const diff = Math.max(0, discount.valid_till - now);
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setCountdown({
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [discounts]);

  // Track current image index for mobile carousel
  useEffect(() => {
    const carousel = imageCarouselRef.current;
    if (!carousel || businessImages.length === 0) {
      setCurrentImageIndex(0);
      return;
    }

    // Find thumbnail and other images to get total count
    const thumbnailImage = businessImages.find(img => img.is_thumbnail);
    const otherImages = businessImages.filter(img => !img.is_thumbnail).slice(0, 4);
    const allImages = thumbnailImage ? [thumbnailImage, ...otherImages] : otherImages;
    const totalImages = allImages.length;

    if (totalImages <= 1) {
      setCurrentImageIndex(0);
      return;
    }

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const containerWidth = carousel.offsetWidth;
      const gap = 8; // gap-2 = 8px
      // Each image is w-full (100% of container width) + gap
      const itemWidth = containerWidth + gap;
      const currentIndex = Math.round(scrollLeft / itemWidth);
      setCurrentImageIndex(Math.min(Math.max(0, currentIndex), totalImages - 1));
    };

    carousel.addEventListener('scroll', handleScroll);
    // Also check on load
    handleScroll();

    return () => {
      carousel.removeEventListener('scroll', handleScroll);
    };
  }, [businessImages]);

  const loadMoreServices = async () => {
    try {
      const nextPage = currentServicesPage + 1;
      const servicesResponse = await getServiceListing(businessId, 'asc', nextPage, servicesPerPage);
      setServices([...services, ...servicesResponse.payload.items]);
      setCurrentServicesPage(nextPage);
      setHasMoreServices(servicesResponse.payload.nextPage !== null);
    } catch (err) {
      console.error('Failed to load more services:', err);
    }
  };

  const loadMoreReviews = async () => {
    try {
      const nextPage = currentReviewsPage + 1;
      const reviewsResponse = await getBusinessReviews(businessId, nextPage, reviewsPerPage);
      setReviews([...reviews, ...reviewsResponse.payload.items]);
      setCurrentReviewsPage(nextPage);
      setHasMoreReviews(reviewsResponse.payload.nextPage !== null);
    } catch (err) {
      console.error('Failed to load more reviews:', err);
    }
  };

  const loadDiscountPage = async (page: number) => {
    try {
      const discountsResponse = await getBusinessDiscounts(businessId, page, 1);
      setDiscounts(discountsResponse.payload.items);
      setDiscountPagination({
        nextPage: discountsResponse.payload.nextPage,
        prevPage: discountsResponse.payload.prevPage,
        pageTotal: discountsResponse.payload.pageTotal
      });
      setCurrentDiscountPage(page);
    } catch (err) {
      console.error('Failed to load discount page:', err);
    }
  };

  const handleNextDiscount = () => {
    if (discountPagination.nextPage !== null) {
      loadDiscountPage(discountPagination.nextPage);
    }
  };

  const handlePrevDiscount = () => {
    if (discountPagination.prevPage !== null) {
      loadDiscountPage(discountPagination.prevPage);
    }
  };

  const handleDiscountDotClick = (page: number) => {
    loadDiscountPage(page);
  };

  const handleToggleFavourite = async () => {
    if (!user || !authToken || !businessData) return;

    try {
      setIsTogglingFavourite(true);
      const newIsFavourite = !isFavourite;
      await toggleCustomerFavourite(user.id, businessData.id, !newIsFavourite, authToken);
      setIsFavourite(newIsFavourite);
      // Update businessData to reflect the change
      setBusinessData({ ...businessData, is_favourite: newIsFavourite });
    } catch (error) {
      console.error('Error toggling favourite:', error);
      // Optionally show an error message to the user
    } finally {
      setIsTogglingFavourite(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: businessData?.business_name || 'Service',
      text: businessData?.description || 'Check out this service!',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      // Check if Web Share API is available
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy URL to clipboard
        if (typeof window !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(shareData.url);
          // You could show a toast notification here
          alert('Link copied to clipboard!');
        } else {
          // Last resort: Show the URL
          alert(`Share this link: ${shareData.url}`);
        }
      }
    } catch (error) {
      // User cancelled or error occurred
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        if (typeof window !== 'undefined' && navigator.clipboard) {
          try {
            await navigator.clipboard.writeText(shareData.url);
            alert('Link copied to clipboard!');
          } catch (clipboardError) {
            console.error('Error copying to clipboard:', clipboardError);
          }
        }
      }
    }
  };

  // Handle online consultancy booking success
  const handleConsultancyBookingSuccess = (bookingData: BookingFormData) => {
    setConsultancyBookingData(bookingData);
    setIsConsultancyModalOpen(false);
    setIsConsultancySuccessModalOpen(true);
  };

  // Handle consultancy success modal close
  const handleConsultancySuccessClose = () => {
    setIsConsultancySuccessModalOpen(false);
    setConsultancyBookingData(null);
  };

  const isVerified = businessData?.addons?.includes('all') || businessData?.addons?.includes('verified');

  // Get business status based on current time and business hours
  const businessStatus = getBusinessStatus(businessHours);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6290f2] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !businessData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700 }}>
            Unable to Load Service Details
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-6" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400 }}>
            We&apos;re having trouble loading this service. Please try again later or return to the homepage.
          </p>
          <Link href="/">
            <button className="bg-[#6290f2] text-white px-6 py-2.5 rounded-lg text-base font-medium hover:bg-[#4a7ae8] transition-colors" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500 }}>
              Go to Homepage
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const service = serviceData; // Keep for images and other static data

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <UnifiedHeader 
        searchQuery={searchQuery}
        location={location}
        categoryId={categoryId}
        cityId={cityId}
        showSearchBar={true}
      />

      {/* Service Header Section */}
      <div className="bg-[#f8f9f8] py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-15">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-4 sm:mb-5 gap-4">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '36px' }}>
                  {businessData.business_name}
                </h1>
                {isVerified && (
                  <div className="bg-[#6290f2] flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                    <Image
                      src={sealCheckIcon} 
                      alt="Verified"
                      width={18}
                      height={18}
                      className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 brightness-0 invert"
                    />
                    <span className="text-white text-xs sm:text-sm" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                      Verified
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-black text-xs sm:text-sm" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                    {businessData.review_average} <span className="text-[#797e84]">({businessData.review_count} reviews)</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${businessStatus.isOpen ? 'bg-[#1fc16b]' : 'bg-[#e43636]'}`}></div>
                  <span className={`text-xs sm:text-sm ${businessStatus.isOpen ? 'text-[#1fc16b]' : 'text-[#e43636]'}`} style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                    {businessStatus.statusText}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1.5 sm:gap-2">
              {user && user.role === 'customer' && (
                <button 
                  onClick={handleToggleFavourite}
                  disabled={isTogglingFavourite}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Heart 
                    fill={isFavourite ? 'currentColor' : 'none'}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavourite ? 'text-red-500' : 'text-gray-600'}`}
                  />
                  <span className="text-black text-xs sm:text-sm" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                    Favourite
                  </span>
                </button>
              )}
              <button 
                onClick={handleShare}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                <span className="text-black text-xs sm:text-sm" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                  Share
                </span>
              </button>
            </div>
          </div>

          {/* Image Gallery */}
          {businessImages.length > 0 ? (
            (() => {
              // Helper function to check if image URL is valid
              const isValidImage = (img: { image?: string }) => {
                return img.image && img.image.trim() !== '';
              };

              // Find thumbnail image (only if it has valid image URL)
              const thumbnailImage = businessImages.find(img => img.is_thumbnail && isValidImage(img));
              
              // Get remaining images (non-thumbnail) with valid URLs, limit to 4
              const otherImages = businessImages
                .filter(img => !img.is_thumbnail && isValidImage(img))
                .slice(0, 4);
              
              // Check if we have any valid images at all
              const hasThumbnail = !!thumbnailImage;
              const hasOtherImages = otherImages.length > 0;
              const hasAnyImages = hasThumbnail || hasOtherImages;
              
              // Combine all images for mobile carousel (thumbnail first, then others)
              const allImages = thumbnailImage 
                ? [thumbnailImage, ...otherImages]
                : otherImages;
              
              // If no images at all, show single placeholder
              if (!hasAnyImages) {
                return (
                  <>
                    {/* Mobile: Single Placeholder */}
                    <div className="lg:hidden">
                      <div className="w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <svg 
                            className="w-12 h-12" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={1.5} 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                          </svg>
                          <span className="text-xs font-medium">No Images Available</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Single Placeholder */}
                    <div className="hidden lg:flex flex-row gap-2 h-[545px] rounded-2xl overflow-hidden">
                      <div className="w-full flex items-center justify-center bg-gray-100">
                        <div className="flex flex-col items-center gap-2 text-gray-400">
                          <svg 
                            className="w-12 h-12" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={1.5} 
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                            />
                          </svg>
                          <span className="text-xs font-medium">No Images Available</span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              }
              
              return (
                <>
                  {/* Mobile: Horizontal Swipeable Carousel */}
                  <div className="lg:hidden">
                    <div 
                      ref={imageCarouselRef}
                      className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                      {allImages.map((img, index) => (
                        <div 
                          key={index}
                          className="flex-shrink-0 w-full h-64 sm:h-80 rounded-2xl overflow-hidden snap-center"
                        >
                          <Image
                            src={img.image}
                            alt={`Business image ${index + 1}`}
                            width={650}
                            height={545}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {/* Pill Indicators - Only show if more than one image */}
                    {allImages.length > 1 && (
                      <div className="flex items-center justify-center gap-1.5 mt-3">
                        {allImages.map((_, index) => {
                          const handlePillClick = () => {
                            if (imageCarouselRef.current) {
                              const containerWidth = imageCarouselRef.current.offsetWidth;
                              const gap = 8; // gap-2 = 8px
                              const scrollPosition = index * (containerWidth + gap);
                              imageCarouselRef.current.scrollTo({
                                left: scrollPosition,
                                behavior: 'smooth'
                              });
                            }
                          };

                          return (
                            <button
                              key={index}
                              onClick={handlePillClick}
                              className={`transition-all ${
                                index === currentImageIndex
                                  ? 'w-6 h-2 bg-[#6290f2] rounded-full'
                                  : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                              }`}
                              aria-label={`Go to image ${index + 1} of ${allImages.length}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Desktop: Layout - Full width if only thumbnail, Grid if multiple images */}
                  {hasThumbnail && !hasOtherImages ? (
                    // Only thumbnail exists - show full width
                    <div className="hidden lg:flex h-[545px] rounded-2xl overflow-hidden">
                      <div className="w-full overflow-hidden">
                        <Image
                          src={thumbnailImage!.image}
                          alt="Main business image"
                          width={1050}
                          height={545}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    // Grid layout for multiple images or no thumbnail
                    <div className="hidden lg:flex flex-row gap-2 h-[545px] rounded-2xl overflow-hidden">
                      {/* Left Column - Thumbnail Image */}
                      <div className="w-[650px] rounded-l-5 overflow-hidden">
                        {hasThumbnail ? (
                          <Image
                            src={thumbnailImage!.image}
                            alt="Main business image"
                            width={650}
                            height={545}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-gray-400">
                              <svg 
                                className="w-12 h-12" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={1.5} 
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                />
                              </svg>
                              <span className="text-xs font-medium">No Image Available</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Grid - Other Images */}
                      {hasOtherImages ? (
                        <>
                          {otherImages.length === 1 && (
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="flex-1 overflow-hidden rounded-r-5">
                                <Image
                                  src={otherImages[0].image}
                                  alt="Business image"
                                  width={400}
                                  height={545}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}

                          {otherImages.length === 2 && (
                            <div className="flex-1 flex flex-col gap-2">
                              <div className="flex-1 overflow-hidden rounded-tr-5">
                                <Image
                                  src={otherImages[0].image}
                                  alt="Business image"
                                  width={400}
                                  height={272}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 overflow-hidden rounded-br-5">
                                <Image
                                  src={otherImages[1].image}
                                  alt="Business image"
                                  width={400}
                                  height={272}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}

                          {otherImages.length === 3 && (
                            <>
                              <div className="flex-1 flex flex-col gap-2">
                                <div className="flex-1 overflow-hidden">
                                  <Image
                                    src={otherImages[0].image}
                                    alt="Business image"
                                    width={400}
                                    height={272}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <Image
                                    src={otherImages[1].image}
                                    alt="Business image"
                                    width={400}
                                    height={272}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 flex flex-col gap-2">
                                <div className="flex-1 overflow-hidden rounded-tr-5">
                                  <Image
                                    src={otherImages[2].image}
                                    alt="Business image"
                                    width={400}
                                    height={545}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {otherImages.length >= 4 && (
                            <>
                              <div className="flex-1 flex flex-col gap-2">
                                <div className="flex-1 overflow-hidden">
                                  <Image
                                    src={otherImages[0].image}
                                    alt="Business image"
                                    width={400}
                                    height={272}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <Image
                                    src={otherImages[1].image}
                                    alt="Business image"
                                    width={400}
                                    height={272}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                              <div className="flex-1 flex flex-col gap-2">
                                <div className="flex-1 overflow-hidden rounded-tr-5">
                                  <Image
                                    src={otherImages[2].image}
                                    alt="Business image"
                                    width={400}
                                    height={272}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 overflow-hidden rounded-br-5">
                                  <Image
                                    src={otherImages[3].image}
                                    alt="Business image"
                                    width={400}
                                    height={272}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        // No other images - show blank skeleton on right
                        <div className="flex-1 bg-gray-100 rounded-r-5" />
                      )}
                    </div>
                  )}
                </>
              );
            })()
          ) : (
            <div className="flex gap-2 h-64 sm:h-80 lg:h-[545px] rounded-2xl overflow-hidden bg-gray-100">
              <div className="w-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <svg 
                    className="w-12 h-12" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <span className="text-xs font-medium">No Images Available</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-15 py-6 sm:py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-15">
          {/* Left Column - Main Content (70% width) */}
          <div className="w-full lg:w-[70%]">
            {/* About Us Section */}
            <div className="mb-8 sm:mb-10 lg:mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4 lg:mb-5" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '32px' }}>
                About Us
              </h2>
              <p className="text-base sm:text-lg text-[rgba(0,0,0,0.8)]" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '28px' }}>
                {businessData.description}
              </p>
            </div>

            {/* Services Section */}
            <div className="mb-8 sm:mb-10 lg:mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4 lg:mb-5" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '32px' }}>
                Services
              </h2>
              {services.length > 0 ? (
              <div className="space-y-6">
                  {services.map((serviceItem) => {
                    const durationHours = Math.floor(serviceItem.duration_minutes / 60);
                    const durationMinutes = serviceItem.duration_minutes % 60;
                    const durationText = durationHours > 0 
                      ? `${durationHours}h ${durationMinutes > 0 ? `${durationMinutes}min` : ''}` 
                      : `${durationMinutes}min`;
                    
                    // Use the same formatNextAvailable function as the main page
                    const nextAvailableText = formatNextAvailable(serviceItem.next_available);

                    // Check if there's a discount (hide_price is used as original price when > current price)
                    const hasDiscount = serviceItem.hide_price > serviceItem.price;

                    return (
                  <div key={serviceItem.id} className="border border-[#e5e7ea] rounded-lg p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '28px' }}>
                            {serviceItem.name}
                          </h3>
                        </div>
                        {serviceItem.description && (
                          <p className="text-[#797e84] text-sm sm:text-base mb-3 sm:mb-4" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                            {serviceItem.description}
                          </p>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Image
                              src={clockIcon}
                              alt="Clock"
                              width={18}
                              height={18}
                              className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                            />
                            <span className="text-[#797e84] text-sm sm:text-base" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                                  {durationText}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Image
                              src={calendarIcon}
                              alt="Calendar"
                              width={18}
                              height={18}
                              className="w-4 h-4 sm:w-4.5 sm:h-4.5"
                            />
                            <span className="text-[#797e84] text-sm sm:text-base" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                                  Next available: {nextAvailableText}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                        <div className="flex items-end gap-1.5">
                              {hasDiscount && (
                          <span className="text-[#9ea5ad] text-xs sm:text-sm line-through" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}>
                                  RM {serviceItem.hide_price.toFixed(2)}
                          </span>
                              )}
                          <span className="text-[#e43636] text-base sm:text-lg font-medium" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '24px' }}>
                                RM {serviceItem.price.toFixed(2)}
                          </span>
                        </div>
                        <Link href={`/booking?business_id=${businessId}&service_id=${serviceItem.id}`} className="w-full sm:w-auto">
                          <button className="bg-[#6290f2] text-white px-4 py-1.5 rounded-lg text-sm sm:text-base font-medium w-full sm:w-auto cursor-pointer" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '24px' }}>
                            Book Now
                          </button>
                        </Link>
                        <span className="text-[#9ea5ad] text-xs" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '16px' }}>
                          Free cancellation
                        </span>
                      </div>
                    </div>
                  </div>
                    );
                  })}
                  {hasMoreServices && (
                    <button 
                      onClick={loadMoreServices}
                      className="flex items-center justify-center gap-2 w-full hover:bg-gray-50 py-2 rounded-lg transition-colors"
                    >
                  <span className="text-black text-base" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                    View more
                  </span>
                  <ChevronRight className="w-5 h-5 text-black" />
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[#797e84] text-base">No services available at the moment.</p>
              )}
            </div>

            {/* Business Hours Section */}
            <div className="mb-8 sm:mb-10 lg:mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4 lg:mb-5" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '32px' }}>
                Business Hours
              </h2>
              <div className="space-y-1">
                {businessHours.length > 0 ? (
                  (() => {
                    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
                    
                    // Create an array for all days (0-6)
                    const allDays = Array.from({ length: 7 }, (_, i) => i);
                    
                    return allDays.map((dayIndex) => {
                      // Convert JS day (0-6) to API day (1-6 for Mon-Sat, no Sunday)
                      const apiDayIndex = dayIndex === 0 ? null : dayIndex;
                      const hourData = apiDayIndex ? businessHours.find(h => h.day === apiDayIndex) : null;
                      const isToday = dayIndex === today;
                      
                      let hoursText = 'Closed';
                      if (hourData && hourData.is_open) {
                        const startTime = new Date(hourData.start_time);
                        const endTime = new Date(hourData.end_time);
                        const startStr = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        const endStr = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        hoursText = `${startStr} to ${endStr}`;
                      }
                      
                      return (
                        <div
                          key={dayIndex}
                    className={`flex flex-col sm:flex-row items-start sm:items-center gap-1 p-2 rounded-lg ${
                            isToday ? 'bg-[#e9f9f0] text-[#1fc16b]' : ''
                    }`}
                  >
                    <span className="w-full sm:w-25 text-sm sm:text-base font-semibold" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '24px' }}>
                            {dayNames[dayIndex]}
                    </span>
                    <span className="text-sm sm:text-base" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                            {hoursText}
                    </span>
                  </div>
                      );
                    });
                  })()
                ) : (
                  <p className="text-[#797e84] text-base">Business hours not available</p>
                )}
              </div>
            </div>

            {/* Past Work Section */}
            {/* <div className="mb-8 sm:mb-10 lg:mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4 lg:mb-5" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '32px' }}>
                Our Past Work
              </h2>
              <div className="flex flex-col lg:flex-row gap-2 h-auto lg:h-[341px] rounded-2xl overflow-hidden">
                <div className="w-full lg:w-[435px] h-48 sm:h-64 lg:h-auto rounded-t-2xl lg:rounded-l-3 overflow-hidden">
                  <Image
                    src={service.pastWork[0]}
                    alt="Past work"
                    width={435}
                    height={341}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 flex flex-row lg:flex-col gap-2">
                  <div className="flex-1 overflow-hidden h-48 sm:h-64 lg:h-auto">
                    <Image
                      src={service.pastWork[1]}
                      alt="Past work"
                      width={200}
                      height={170}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden h-48 sm:h-64 lg:h-auto">
                    <Image
                      src={service.pastWork[2]}
                      alt="Past work"
                      width={200}
                      height={170}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 flex flex-row lg:flex-col gap-2">
                  <div className="flex-1 overflow-hidden rounded-br-2xl lg:rounded-tr-3 h-48 sm:h-64 lg:h-auto">
                    <Image
                      src={service.pastWork[3]}
                      alt="Past work"
                      width={200}
                      height={170}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden rounded-bl-2xl lg:rounded-br-3 h-48 sm:h-64 lg:h-auto">
                    <Image
                      src={service.pastWork[0]}
                      alt="Past work"
                      width={200}
                      height={170}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-5">
                <span className="text-black text-base" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                  View more
                </span>
                <ChevronRight className="w-5 h-5 text-black" />
              </div>
            </div> */}

            {/* Reviews Section */}
            <div className="mb-8 sm:mb-10 lg:mb-14">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-3 sm:mb-4 lg:mb-5" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '32px' }}>
                Reviews
              </h2>
              {reviews.length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                  {reviews.map((review, index) => {
                    const reviewDate = new Date(review.created_at);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    let timeAgo = '';
                    if (diffDays === 0) {
                      timeAgo = 'Today';
                    } else if (diffDays === 1) {
                      timeAgo = '1 day ago';
                    } else if (diffDays < 7) {
                      timeAgo = `${diffDays} days ago`;
                    } else if (diffDays < 30) {
                      const weeks = Math.floor(diffDays / 7);
                      timeAgo = weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
                    } else if (diffDays < 365) {
                      const months = Math.floor(diffDays / 30);
                      timeAgo = months === 1 ? '1 month ago' : `${months} months ago`;
                    } else {
                      const years = Math.floor(diffDays / 365);
                      timeAgo = years === 1 ? '1 year ago' : `${years} years ago`;
                    }

                    const userName = `${review.user_first_name} ${review.user_last_name}`;
                    const hasAvatar = review.user_profile_pic && review.user_profile_pic.trim() !== '';

                    return (
                  <div key={review.id} className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center flex-shrink-0">
                              {hasAvatar ? (
                          <Image
                                  src={review.user_profile_pic}
                                  alt={userName}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                              ) : (
                                <span className="text-gray-600 font-semibold text-sm sm:text-lg">
                                  {review.user_first_name.charAt(0)}{review.user_last_name.charAt(0)}
                                </span>
                              )}
                        </div>
                        <div>
                          <h4 className="text-base sm:text-lg font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '28px' }}>
                                {userName}
                          </h4>
                          <p className="text-[#797e84] text-sm sm:text-base" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                                {review.service_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-start sm:items-end">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-[#797e84] text-xs sm:text-base" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                              {timeAgo}
                        </span>
                      </div>
                    </div>
                    <p className="text-base sm:text-lg text-black" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, lineHeight: '28px' }}>
                      {review.comment}
                    </p>
                        {index < reviews.length - 1 && (
                      <div className="w-full h-px bg-[#e5e7ea]"></div>
                    )}
                  </div>
                    );
                  })}
                  {hasMoreReviews && (
                    <button 
                      onClick={loadMoreReviews}
                      className="flex items-center justify-center gap-2 w-full hover:bg-gray-50 py-2 rounded-lg transition-colors"
                    >
                  <span className="text-black text-base" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                    View more
                  </span>
                  <ChevronRight className="w-5 h-5 text-black" />
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-[#797e84] text-base">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Right Column - Discount & Consultancy Section (30% width) */}
          <div className="w-full lg:w-[30%]">
            <div className="sticky top-20">
              {/* Wrap everything in w-120 container to match card width */}
              <div className="w-full lg:w-120 space-y-6">
                {/* Discount Section - Only show if discounts exist */}
                {discounts.length > 0 && (
                  <div>
                  {/* Header with Navigation Arrows */}
                  <div className="relative flex items-center mb-4 sm:mb-5">
                    <h2 className="text-xl sm:text-2xl font-bold text-black" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '32px' }}>
                      Discount & Coupon
                    </h2>
                    {/* Navigation Arrows - Top Right (aligned with card edge) */}
                    {discountPagination.pageTotal > 1 && (
                      <div className="absolute right-0 flex items-center gap-2">
                        <button
                          onClick={handlePrevDiscount}
                          disabled={discountPagination.prevPage === null}
                          className={`rounded-full p-1.5 transition-colors ${
                            discountPagination.prevPage === null 
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          aria-label="Previous discount"
                        >
                          <ChevronLeft className={`w-4 h-4 ${discountPagination.prevPage === null ? 'text-gray-400' : 'text-gray-700'}`} />
                        </button>
                        <button
                          onClick={handleNextDiscount}
                          disabled={discountPagination.nextPage === null}
                          className={`rounded-full p-1.5 transition-colors ${
                            discountPagination.nextPage === null 
                              ? 'bg-gray-100 cursor-not-allowed' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                          aria-label="Next discount"
                        >
                          <ChevronRight className={`w-4 h-4 ${discountPagination.nextPage === null ? 'text-gray-400' : 'text-gray-700'}`} />
                        </button>
                      </div>
                    )}
                  </div>

                  {(() => {
                    const discount = discounts[0];
                    const discountText = discount.type === 'percent' 
                      ? `${discount.value}% off` 
                      : `RM ${discount.value} off`;
                    
                    return (
                      <div className="relative">
                        <div className="bg-[#19183b] h-auto sm:h-48 w-full rounded-xl overflow-hidden relative">
                        <div className="absolute inset-0">
                          <Image 
                            alt={discount.description || "Discount"} 
                            className="absolute inset-0 w-full h-full object-cover opacity-20" 
                            src={discount.image}
                            fill
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#19183b]/30 via-[#19183b]/20 to-[#19183b]/10" />

                        <div className="relative z-10 p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-between min-h-[200px] sm:min-h-0">
                          <div className="text-white">
                            <p className="text-base sm:text-lg lg:text-xl leading-relaxed mb-2">
                              {discount.description}
                            </p>
                            <p className="text-base sm:text-lg lg:text-xl leading-relaxed">
                              and enjoy <span className="text-xl sm:text-2xl font-bold text-[#fab12f]">{discountText}</span>
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mt-4">
                            {discount.business_id && discount.service_id ? (
                              <Link href={`/booking?business_id=${discount.business_id}&service_id=${discount.service_id}`} className="w-full sm:w-auto">
                                <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full sm:w-fit">
                                  Book Now
                                </button>
                              </Link>
                            ) : (
                              <button 
                                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full sm:w-fit opacity-50 cursor-not-allowed"
                                disabled
                              >
                                Book Now
                              </button>
                            )}
                            {/* Countdown Timer - Bottom Right */}
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <span className="text-white text-xs font-medium">Offer Ends in</span>
                              <div className="flex items-center gap-1">
                                <div className="bg-white/90 backdrop-blur-sm flex items-center justify-center px-2 py-1 rounded">
                                  <span className="text-black text-xs font-semibold">{countdown.hours}</span>
                                </div>
                                <span className="text-xs text-white font-semibold">:</span>
                                <div className="bg-white/90 backdrop-blur-sm flex items-center justify-center px-2 py-1 rounded">
                                  <span className="text-black text-xs font-semibold">{countdown.minutes}</span>
                                </div>
                                <span className="text-xs text-white font-semibold">:</span>
                                <div className="bg-white/90 backdrop-blur-sm flex items-center justify-center px-2 py-1 rounded">
                                  <span className="text-black text-xs font-semibold">{countdown.seconds}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                        {/* Pill Indicators */}
                        {discountPagination.pageTotal > 1 && (
                          <div className="flex items-center justify-center gap-1.5 mt-4">
                            {Array.from({ length: discountPagination.pageTotal }, (_, index) => {
                              const pageNumber = index + 1;
                              return (
                                <button
                                  key={pageNumber}
                                  onClick={() => handleDiscountDotClick(pageNumber)}
                                  className={`transition-all ${
                                    pageNumber === currentDiscountPage
                                      ? 'w-6 h-2 bg-[#fab12f] rounded-full'
                                      : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                                  }`}
                                  aria-label={`Go to discount ${pageNumber}`}
                                />
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  </div>
                )}

                {/* Online Consultancy Section */}
                {businessData?.is_free_consultancy && businessData?.onine_consultancy && (
                  <div>
                    {/* Header */}
                    <div className="relative flex items-center mb-4 sm:mb-5">
                      <h2 className="text-xl sm:text-2xl font-bold text-black" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '32px' }}>
                        {businessData.onine_consultancy.title || 'Online Consultancy Available'}
                      </h2>
                    </div>

                    {/* Consultancy Card */}
                    <div className="relative">
                          <div className="bg-[#19183b] h-auto sm:h-48 w-full rounded-xl overflow-hidden relative">
                          <div className="absolute inset-0">
                            <Image 
                              alt="Online Consultancy" 
                              className="absolute inset-0 w-full h-full object-cover opacity-20" 
                              src={businessData.onine_consultancy.image || "/figma-assets/yoga-session.png"}
                              fill
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#19183b]/30 via-[#19183b]/20 to-[#19183b]/10" />

                          <div className="relative z-10 p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-between min-h-[200px] sm:min-h-0">
                            <div className="text-white">
                              <p className="text-base sm:text-lg lg:text-xl leading-relaxed">
                                {businessData.onine_consultancy.customer_description || 'Schedule A Free Online Session With Experts Today'}
                              </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mt-4">
                              {businessData && businessId ? (
                                <button 
                                  onClick={() => setIsConsultancyModalOpen(true)}
                                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full sm:w-fit cursor-pointer"
                                >
                                  Book Now
                                </button>
                              ) : (
                                <button 
                                  className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full sm:w-fit opacity-50 cursor-not-allowed"
                                  disabled
                                >
                                  Book Now
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Online Consultancy Booking Modal */}
      <OnlineConsultancyBookingModal
        isOpen={isConsultancyModalOpen}
        onClose={() => setIsConsultancyModalOpen(false)}
        onSuccess={handleConsultancyBookingSuccess}
        businessName={businessData?.business_name}
        businessId={businessId}
      />

      {/* Consultancy Booking Success Modal */}
      <ConsultancyBookingSuccessModal
        isOpen={isConsultancySuccessModalOpen}
        onClose={handleConsultancySuccessClose}
        bookingData={consultancyBookingData}
        businessName={businessData?.business_name}
      />
    </div>
  );
}
