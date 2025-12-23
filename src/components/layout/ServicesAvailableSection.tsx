'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect, useRef } from 'react';
import SortByPopup, { SortOption } from '@/components/shared/SortByPopup';
import { getBusinessListing } from '@/services/business/business';
import { getServiceListing } from '@/services/service/service';
import type { Service } from '@/types';

// Image assets - reusing existing ones
const sealCheckIcon = '/figma-assets/seal-check.svg';
const clockIcon = '/figma-assets/clock.svg';
const calendarIcon = '/figma-assets/calendar.svg';

interface ServicesAvailableSectionProps {
  cityId?: string;
  categoryId?: string;
  searchQuery: string;
  location: string;
}

interface ServiceData {
  id: string;
  name: string;
  duration: string;
  nextAvailable: string;
  originalPrice?: string;
  currentPrice: string;
  discount: boolean;
}

interface SalonData {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviews: number;
  image: string | null;
  badge: string;
  badgeColor: string;
  badgeTextColor: string;
  onlineConsultancy: boolean;
  bookedTimes?: number;
  services: ServiceData[];
  servicesPage: number; // Current page of services loaded
  hasMoreServices: boolean; // Whether there are more services to load
}

// Helper function to check if addons contains verify_badge
const hasVerifyBadge = (addons: string | undefined): boolean => {
  if (!addons) return false;
  return addons.includes('video_call') || addons.includes('{all}') ;
};

// Helper function to format duration from minutes
const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}min`;
  }
};

// Helper function to format next available timestamp
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

// Helper function to format price
const formatPrice = (price: number): string => {
  return `RM ${price.toFixed(2)}`;
};

export default function ServicesAvailableSection({ searchQuery, location, cityId, categoryId }: ServicesAvailableSectionProps) {
  const [currentSort, setCurrentSort] = useState<SortOption | null>(null);
  const [businesses, setBusinesses] = useState<SalonData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMoreServices, setLoadingMoreServices] = useState<{ [key: string]: boolean }>({});
  const scrollContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const previousSortRef = useRef<SortOption | null>(null);

  // Helper function to map business data
  const mapBusinessData = (business: {
    business_id: string;
    business_name: string;
    address_line_1?: string;
    address_line_2?: string;
    postal_code?: string;
    avg_rating?: string | number;
    total_reviews?: number;
    thumbnail_image?: string;
    tags?: string | null;
    addons?: string;
    bookings_count?: number;
  }): SalonData => {
    // Determine badge based on tags first, then fallback to verify badge and bookings
    let badge = '';
    let badgeColor = '';
    let badgeTextColor = '';
    
    // First check if tags exists and is not null
    if (business.tags && business.tags.trim() !== '') {
      const tag = business.tags.toLowerCase().trim();
      
      // Map tags to badges
      if (tag === 'mbt' || tag === 'most_booked_today' || tag === 'most booked today') {
        badge = 'Most Booked Today';
        badgeColor = 'bg-red-500';
        badgeTextColor = 'text-white';
      } else if (tag === 'trending') {
        badge = 'Trending';
        badgeColor = 'bg-yellow-400';
        badgeTextColor = 'text-black';
      } else if (tag === 'verified') {
        badge = 'Verified';
        badgeColor = 'bg-blue-500';
        badgeTextColor = 'text-white';
      } else {
        // Use the tag as-is with default styling
        badge = business.tags;
        badgeColor = 'bg-gray-100';
        badgeTextColor = 'text-black';
      }
    } else {
      // Fallback to existing logic if tags is null or empty
      if (hasVerifyBadge(business.addons)) {
        badge = 'Verified';
        badgeColor = 'bg-blue-500';
        badgeTextColor = 'text-white';
      } else if (business.bookings_count !== undefined && business.bookings_count >= 30) {
        badge = `Booked ${business.bookings_count} Times`;
        badgeColor = 'bg-green-100';
        badgeTextColor = 'text-black';
      } else if (business.bookings_count !== undefined && business.bookings_count >= 20) {
        badge = 'Most Booked Today';
        badgeColor = 'bg-red-500';
        badgeTextColor = 'text-white';
      } else if (business.bookings_count !== undefined && business.bookings_count >= 10) {
        badge = 'Trending';
        badgeColor = 'bg-yellow-400';
        badgeTextColor = 'text-black';
      }
    }

    // Build address string
    const addressParts = [
      business.address_line_1,
      business.address_line_2,
      business.postal_code
    ].filter(Boolean);
    const address = addressParts.join(', ');

    return {
      id: business.business_id,
      name: business.business_name,
      address: address,
      rating: business.avg_rating !== undefined ? parseFloat(String(business.avg_rating)) || 0 : 0,
      reviews: business.total_reviews || 0,
      image: (business.thumbnail_image && business.thumbnail_image.trim() !== '') ? business.thumbnail_image : null,
      badge: badge,
      badgeColor: badgeColor,
      badgeTextColor: badgeTextColor,
      onlineConsultancy: business.addons?.includes('video_call') || business.addons?.includes('{all}') || business.addons?.includes('all') || false,
      bookedTimes: business.bookings_count !== undefined && business.bookings_count > 0 ? business.bookings_count : undefined,
      services: [], // Will be loaded separately
      servicesPage: 1,
      hasMoreServices: false
    };
  };

  // Helper function to fetch services for businesses
  const fetchServicesForBusinesses = async (businessList: SalonData[], priceSort: string = 'desc') => {
    businessList.forEach(async (salon) => {
      try {
        const servicesResponse = await getServiceListing(salon.id, priceSort, 1, 3);
        if (servicesResponse.status && servicesResponse.payload?.items) {
          const mappedServices: ServiceData[] = servicesResponse.payload.items.map((service: Service) => {
            const hasDiscount = service.hide_price > service.price;
            return {
              id: service.id,
              name: service.name,
              duration: formatDuration(service.duration_minutes),
              nextAvailable: formatNextAvailable(service.next_available),
              originalPrice: hasDiscount ? formatPrice(service.hide_price) : undefined,
              currentPrice: formatPrice(service.price),
              discount: hasDiscount
            };
          });
          
          // Update the specific salon's services
          setBusinesses(prev => prev.map(s => 
            s.id === salon.id 
              ? { 
                  ...s, 
                  services: mappedServices,
                  servicesPage: 1,
                  hasMoreServices: servicesResponse.payload.nextPage !== null
                }
              : s
          ));
        }
      } catch (err) {
        // On error, keep empty services array
        console.error(`Failed to fetch services for business ${salon.id}:`, err);
      }
    });
  };

  // Function to load more services for a specific business
  const loadMoreServices = async (businessId: string) => {
    const business = businesses.find(b => b.id === businessId);
    if (!business || !business.hasMoreServices || loadingMoreServices[businessId]) return;

    setLoadingMoreServices(prev => ({ ...prev, [businessId]: true }));

    try {
      const priceSort = currentSort === 'price-low-high' ? 'asc' : 'desc';
      const nextPage = business.servicesPage + 1;
      const servicesResponse = await getServiceListing(businessId, priceSort, nextPage, 3);
      
      if (servicesResponse.status && servicesResponse.payload?.items) {
        const mappedServices: ServiceData[] = servicesResponse.payload.items.map((service: Service) => {
          const hasDiscount = service.hide_price > service.price;
          return {
            id: service.id,
            name: service.name,
            duration: formatDuration(service.duration_minutes),
            nextAvailable: formatNextAvailable(service.next_available),
            originalPrice: hasDiscount ? formatPrice(service.hide_price) : undefined,
            currentPrice: formatPrice(service.price),
            discount: hasDiscount
          };
        });
        
        setBusinesses(prev => prev.map(b => 
          b.id === businessId 
            ? { 
                ...b, 
                services: [...b.services, ...mappedServices],
                servicesPage: nextPage,
                hasMoreServices: servicesResponse.payload.nextPage !== null
              }
            : b
        ));
      }
    } catch (error) {
      console.error(`Error loading more services for business ${businessId}:`, error);
    } finally {
      setLoadingMoreServices(prev => ({ ...prev, [businessId]: false }));
    }
  };

  // Fetch businesses when cityId or categoryId changes
  useEffect(() => {
    // Reset sort tracking when location/category changes
    previousSortRef.current = null;
    setCurrentSort(null); // Reset sort selection

    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getBusinessListing(cityId, categoryId, false);
        if (response.status && response.payload) {
          // Map API response to SalonData structure
          const mappedBusinesses: SalonData[] = response.payload.map(mapBusinessData);
          setBusinesses(mappedBusinesses);
          
          // Fetch services for each business with default sort (desc)
          fetchServicesForBusinesses(mappedBusinesses, 'desc');
        } else {
          setBusinesses([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load businesses');
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [cityId, categoryId]);

  // Re-fetch businesses when sort changes (for highest-review or switching away from it)
  useEffect(() => {
    if (currentSort === null) {
      return;
    }

    const previousSort = previousSortRef.current;
    const isHighestReviewSort = currentSort === 'highest-review';
    const wasHighestReviewSort = previousSort === 'highest-review';
    const isPriceSort = currentSort === 'price-low-high' || currentSort === 'price-high-low';
    
    // Only refetch businesses if:
    // 1. Switching TO highest-review (need API with highest_review=true)
    // 2. Switching FROM highest-review to a non-price sort (need to reload original data)
    const shouldRefetch = (isHighestReviewSort && !wasHighestReviewSort) || 
                          (wasHighestReviewSort && !isHighestReviewSort && !isPriceSort);

    if (!shouldRefetch) {
      // Update ref and return
      previousSortRef.current = currentSort;
      return;
    }

    const fetchBusinessesWithSort = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getBusinessListing(cityId, categoryId, isHighestReviewSort);
        if (response.status && response.payload) {
          // Map API response to SalonData structure
          const mappedBusinesses: SalonData[] = response.payload.map(mapBusinessData);
          setBusinesses(mappedBusinesses);
          
          // Fetch services for each business with default desc sort
          fetchServicesForBusinesses(mappedBusinesses, 'desc');
        } else {
          setBusinesses([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load businesses');
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessesWithSort();
    previousSortRef.current = currentSort;
  }, [currentSort, cityId, categoryId]);

  // Re-fetch services when price sorting changes
  useEffect(() => {
    // Only refetch if we have businesses and the sort is price-related
    if (businesses.length === 0 || (currentSort !== 'price-low-high' && currentSort !== 'price-high-low')) {
      return;
    }

    const fetchServicesWithSort = async () => {
      // Map sort option to API parameter
      const priceSort = currentSort === 'price-low-high' ? 'asc' : 'desc';

      // Fetch services for each business with the selected price sort
      businesses.forEach(async (salon) => {
        try {
          const servicesResponse = await getServiceListing(salon.id, priceSort, 1, 3);
          if (servicesResponse.status && servicesResponse.payload?.items) {
            const mappedServices: ServiceData[] = servicesResponse.payload.items.map((service: Service) => {
              const hasDiscount = service.hide_price > service.price;
              return {
                id: service.id,
                name: service.name,
                duration: formatDuration(service.duration_minutes),
                nextAvailable: formatNextAvailable(service.next_available),
                originalPrice: hasDiscount ? formatPrice(service.hide_price) : undefined,
                currentPrice: formatPrice(service.price),
                discount: hasDiscount
              };
            });
            
            // Update the specific salon's services
            setBusinesses(prev => prev.map(s => 
              s.id === salon.id 
                ? { 
                    ...s, 
                    services: mappedServices,
                    servicesPage: 1,
                    hasMoreServices: servicesResponse.payload.nextPage !== null
                  }
                : s
            ));
          }
        } catch (err) {
          console.error(`Failed to fetch services for business ${salon.id}:`, err);
        }
      });
    };

    fetchServicesWithSort();
    previousSortRef.current = currentSort;
  }, [currentSort]);

  // Handle horizontal swipe and arrow key navigation for service grids
  useEffect(() => {
    const containers = Object.values(scrollContainerRefs.current).filter(Boolean) as HTMLDivElement[];
    
    if (containers.length === 0) return;

    const setupSwipe = (container: HTMLDivElement) => {
      let startX = 0;
      let scrollLeft = 0;
      let isDown = false;

      const handleMouseDown = (e: MouseEvent) => {
        isDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        container.style.cursor = 'grabbing';
        container.focus(); // Focus container for keyboard navigation
      };

      const handleMouseLeave = () => {
        isDown = false;
        container.style.cursor = 'grab';
      };

      const handleMouseUp = () => {
        isDown = false;
        container.style.cursor = 'grab';
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
      };

      // Touch events for mobile
      const handleTouchStart = (e: TouchEvent) => {
        startX = e.touches[0].pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        container.focus(); // Focus container for keyboard navigation
      };

      const handleTouchMove = (e: TouchEvent) => {
        const x = e.touches[0].pageX - container.offsetLeft;
        const walk = (x - startX) * 2;
        container.scrollLeft = scrollLeft - walk;
      };

      // Arrow key navigation
      const handleKeyDown = (e: KeyboardEvent) => {
        if (document.activeElement !== container && !container.contains(document.activeElement)) {
          return; // Only handle if container or its children are focused
        }

        const scrollAmount = 400; // Scroll amount in pixels
        
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      };

      container.style.cursor = 'grab';
      container.setAttribute('tabIndex', '0'); // Make container focusable
      container.addEventListener('mousedown', handleMouseDown);
      container.addEventListener('mouseleave', handleMouseLeave);
      container.addEventListener('mouseup', handleMouseUp);
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);
      container.addEventListener('keydown', handleKeyDown);

      return () => {
        container.removeEventListener('mousedown', handleMouseDown);
        container.removeEventListener('mouseleave', handleMouseLeave);
        container.removeEventListener('mouseup', handleMouseUp);
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('keydown', handleKeyDown);
      };
    };

    const cleanupFunctions = containers.map(setupSwipe);

    return () => {
      cleanupFunctions.forEach(cleanup => cleanup());
    };
  }, [businesses]);

  // Sorting/filtering logic - only for verified filter (price and highest-review are handled by API)
  const sortedServices = useMemo(() => {
    const servicesCopy = [...businesses];
    
    // If no sort is selected, return businesses in original order
    if (!currentSort) {
      return servicesCopy;
    }
    
    switch (currentSort) {
      case 'verified':
        // Filter to show only verified businesses
        return servicesCopy.filter((business) => business.badge === 'Verified');
      
      case 'highest-review':
        // Highest review sorting is handled by API, just return businesses in original order
        return servicesCopy;
      
      case 'price-high-low':
      case 'price-low-high':
        // Price sorting is handled by API, just return businesses in original order
        return servicesCopy;
      
      default:
        return servicesCopy; // Keep original order as fallback
    }
  }, [currentSort, businesses]);

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 xl:px-20 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-black">
              {loading ? 'Loading...' : `${sortedServices.length} Services Available`}
            </h2>
            <SortByPopup 
              currentSort={currentSort} 
              onSortChange={setCurrentSort} 
            />
          </div>

          {/* Loading State */}
          {loading && businesses.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && businesses.length === 0 && (
            <div className="text-center py-12 text-red-600">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && sortedServices.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {currentSort === 'verified' 
                ? 'No verified services found.' 
                : 'No services found.'}
            </div>
          )}

          {/* Services List */}
          {sortedServices.length > 0 && (
          <div className="flex flex-col gap-4 sm:gap-6 mt-4 sm:mt-6">
            {sortedServices.map((salon, index) => (
              <div key={salon.id} className="flex flex-col gap-3 sm:gap-4">
                {/* Salon Card */}
                <Link href={`/services/${salon.id}?q=${searchQuery}&location=${location}&category_id=${categoryId}&city_id=${cityId}`} className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-stretch rounded-xl relative">
                  {/* Salon Image */}
                  <div className="relative w-full lg:w-64 h-48 sm:h-55 rounded-xl flex-shrink-0 overflow-hidden">
                    {salon.image ? (
                      <>
                        <Image
                          src={salon.image}
                          alt={salon.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Rating */}
                        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 flex items-center gap-1.5 sm:gap-2">
                          <span className="text-white font-medium text-sm sm:text-base">{salon.rating}</span>
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-gray-300 text-xs sm:text-sm">({salon.reviews})</span>
                        </div>
                      </>
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

                  {/* Badge - positioned relative to salon card - Only show if badge exists */}
                  {salon.badge && (
                  <div className="absolute -top-1 -left-1 sm:-top-1.5 sm:-left-1.5 z-10">
                    <div className={`${salon.badgeColor} ${salon.badgeTextColor} px-1 py-0.5 sm:px-1 sm:py-1 text-[10px] sm:text-xs font-lato shadow-md relative text-black-500`} style={{ borderRadius: '6px 6px 6px 0' }}>
                      {salon.badge}
                      {/* Folded corner effect using SVG */}
                      <div className="absolute -bottom-0.5 sm:-bottom-1 -left-0.25">
                        <svg 
                          width="8" 
                          height="5" 
                          viewBox="0 0 8 5" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-1.5 h-0.5 sm:w-2 sm:h-1"
                        >
                          <path 
                            d="M0 0H8V5L0 0Z" 
                            fill={salon.badgeColor === 'bg-yellow-400' ? '#d97706' : 
                                  salon.badgeColor === 'bg-red-500' ? '#dc2626' : 
                                  salon.badgeColor === 'bg-blue-500' ? '#2563eb' : 
                                  salon.badgeColor === 'bg-green-100' ? '#059669' : '#dc2626'}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Salon Info */}
                  <div className="flex-1 flex flex-col gap-3 sm:gap-4 justify-between">
                    {/* Salon Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg sm:text-xl font-bold text-black">{salon.name}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">{salon.address}</p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {salon.onlineConsultancy && (
                            <div className="bg-green-100 text-green-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs">
                              Online Consultancy Available
                            </div>
                          )}
                          {salon.bookedTimes && (
                            <div className="bg-green-100 text-green-600 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs">
                              Booked {salon.bookedTimes} Times
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const container = scrollContainerRefs.current[salon.id];
                            if (container) {
                              container.scrollBy({ left: -400, behavior: 'smooth' });
                            }
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const container = scrollContainerRefs.current[salon.id];
                            if (container) {
                              container.scrollBy({ left: 400, behavior: 'smooth' });
                            }
                          }}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Services Grid */}
                    <div 
                      ref={(el) => {
                        if (el) scrollContainerRefs.current[salon.id] = el;
                      }}
                      className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
                      style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none',
                        maxWidth: 'calc(400px * 2 + 16px + 200px)' // Show 2 full cards + half of third card on desktop
                      }}
                    >
                      {salon.services.map((service, serviceIndex) => (
                        <div key={serviceIndex} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow flex-shrink-0" style={{ minWidth: '280px', maxWidth: '450px' }}>
                          <div className="flex justify-between items-start gap-3 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm sm:text-base text-black mb-1.5 sm:mb-2 truncate" title={service.name}>{service.name}</h4>
                              
                              {/* Service Details */}
                              <div className="flex flex-col gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-gray-600 text-xs sm:text-sm">{service.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-gray-600 text-xs sm:text-sm whitespace-nowrap">Next available: {service.nextAvailable}</span>
                                </div>
                              </div>
                            </div>

                            {/* Price and Book Button */}
                            <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                              <div className="flex items-center gap-1 sm:gap-2">
                                {service.discount && service.originalPrice && (
                                  <span className="text-gray-400 text-[10px] sm:text-xs line-through">{service.originalPrice}</span>
                                )}
                                <span className="text-red-500 font-medium text-sm sm:text-base">{service.currentPrice}</span>
                              </div>
                              <Link href={`/booking?business_id=${salon.id}&service_id=${service.id}`}>
                                <button className="bg-blue-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium hover:bg-blue-600 transition-colors cursor-pointer">
                                  Book Now
                                </button>
                              </Link>
                              <span className="text-gray-400 text-[10px] sm:text-xs">Free cancellation</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Load More Button */}
                      {salon.hasMoreServices && (
                        <div className="flex-shrink-0 flex items-center justify-center" style={{ minWidth: '120px' }}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              loadMoreServices(salon.id);
                            }}
                            disabled={loadingMoreServices[salon.id]}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 sm:gap-2"
                          >
                            {loadingMoreServices[salon.id] ? (
                              <>
                                <svg className="animate-spin h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Loading...
                              </>
                            ) : (
                              <>
                                Load More
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Divider */}
                {index < sortedServices.length - 1 && (
                  <div className="w-full h-px bg-gray-200 mt-3 sm:mt-4 border-t border-gray-200"></div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
