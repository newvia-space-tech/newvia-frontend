'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllCities } from '@/services/city/city';
import type { City } from '@/types';

interface LocationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: { name: string; address: string; id: string }) => void;
}

export default function LocationDropdown({ isOpen, onClose, onSelectLocation }: LocationDropdownProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const currentPageRef = useRef(1);
  const hasMoreRef = useRef(true);

  const perPage = 4;

  // Fetch cities from API
  const fetchCities = useCallback(async (page: number, append: boolean = false) => {
    if (isLoadingRef.current) return;
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      setError(null);
      
      const response = await getAllCities(page, perPage);
      
      if (append) {
        setCities(prev => [...prev, ...response.items]);
      } else {
        setCities(response.items);
      }
      
      const hasNextPage = response.nextPage !== null;
      setHasMore(hasNextPage);
      hasMoreRef.current = hasNextPage;
      setCurrentPage(page);
      currentPageRef.current = page;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cities');
      console.error('Error fetching cities:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [perPage]);

  // Reset state when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setCities([]);
      setCurrentPage(1);
      setHasMore(true);
      setError(null);
      currentPageRef.current = 1;
      hasMoreRef.current = true;
      isLoadingRef.current = false;
    }
  }, [isOpen]);

  // Initial fetch when dropdown opens
  useEffect(() => {
    if (isOpen && cities.length === 0) {
      fetchCities(1, false);
    }
  }, [isOpen, cities.length, fetchCities]);

  // Handle scroll for infinite loading
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isOpen) return;

    const handleScroll = () => {
      if (!hasMoreRef.current || isLoadingRef.current) {
        return;
      }
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const threshold = 100; // Load more when 100px from bottom
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // Debug logging
      console.log('Scroll event:', {
        scrollTop,
        scrollHeight,
        clientHeight,
        distanceFromBottom,
        hasMore: hasMoreRef.current,
        isLoading: isLoadingRef.current,
        currentPage: currentPageRef.current,
        citiesCount: cities.length
      });

      if (distanceFromBottom < threshold && scrollHeight > clientHeight) {
        console.log('Loading more cities, page:', currentPageRef.current + 1);
        fetchCities(currentPageRef.current + 1, true);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check if we need to load more to enable scrolling
    let checkTimeout: NodeJS.Timeout | null = null;
    const checkIfNeedsMore = () => {
      if (!hasMoreRef.current || isLoadingRef.current) return;
      
      const { scrollHeight, clientHeight } = container;
      // If content doesn't fill the container and we have more pages, load more
      if (scrollHeight <= clientHeight + 10 && cities.length > 0) {
        console.log('Content fits, loading more to enable scrolling. Current:', cities.length, 'cities');
        fetchCities(currentPageRef.current + 1, true);
      }
    };

    // Check after DOM updates (debounced)
    const scheduleCheck = () => {
      if (checkTimeout) clearTimeout(checkTimeout);
      checkTimeout = setTimeout(checkIfNeedsMore, 300);
    };

    // Initial check
    scheduleCheck();
    
    // Also check when cities change (using a separate effect would be better, but this works)
    const observer = new MutationObserver(() => {
      scheduleCheck();
    });
    observer.observe(container, { childList: true, subtree: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (checkTimeout) clearTimeout(checkTimeout);
      observer.disconnect();
    };
  }, [isOpen, fetchCities, cities.length]);

  const handleLocationSelect = (city: City) => {
    onSelectLocation({ name: city.name, address: '', id: city.id });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute top-full left-0 w-[150%] max-w-[calc(100vw-2rem)] sm:w-full sm:max-w-none z-[9999] mt-1 sm:mt-2" data-dropdown-content>
        <div 
          ref={scrollContainerRef}
          className="location-dropdown-scroll bg-white rounded-lg sm:rounded-xl shadow-[0px_12px_32px_0px_rgba(0,0,0,0.25)] p-2 sm:p-3 border border-gray-200 sm:border-2 sm:border-gray-300 backdrop-blur-sm overflow-y-auto max-h-[240px] sm:max-h-[280px]" 
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            minHeight: '100px'
          }}
        >
          <div className="flex flex-col gap-2 sm:gap-3">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleLocationSelect(city)}
                className="flex items-center gap-2 sm:gap-3 p-1 sm:p-0 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
              >
                {/* Icon container */}
                <div className="bg-[#f8f9f8] flex items-center justify-center p-2 sm:p-2.5 rounded overflow-hidden flex-shrink-0">
                  {failedImages.has(city.id) ? (
                    <Image
                      src="/figma-assets/map-pin.svg"
                      alt={city.name}
                      width={20}
                      height={20}
                      className="w-4 h-4 sm:w-5 sm:h-5"
                    />
                  ) : (
                    <Image
                      src={city.image_url}
                      alt={city.name}
                      width={20}
                      height={20}
                      className="w-4 h-4 sm:w-5 sm:h-5 object-cover"
                      onError={() => {
                        setFailedImages(prev => new Set(prev).add(city.id));
                      }}
                    />
                  )}
                </div>
                
                {/* Location details */}
                <div className="flex-1 min-w-0">
                  <p className="text-black text-sm sm:text-base font-semibold leading-5 sm:leading-6 truncate">
                    {city.name}
                  </p>
                </div>
              </button>
            ))}
            
            {loading && (
              <div className="flex items-center justify-center py-2">
                <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-gray-600"></div>
              </div>
            )}
            
            {error && (
              <div className="text-red-600 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3">
                {error}
              </div>
            )}
            
            {!hasMore && cities.length > 0 && (
              <div className="text-gray-500 text-xs sm:text-sm py-1.5 sm:py-2 text-center">
                No more cities
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
