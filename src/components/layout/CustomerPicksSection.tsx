'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getPriorityListing } from '@/services/business/business';
import { useCategories } from '@/hooks/service/useCategories';
import type { PriorityListing } from '@/types';

// Image assets
const forwardArrowIcon = '/figma-assets/forward-arrow.svg';
const sealCheckIcon = '/figma-assets/seal-check.svg';

interface CustomerPicksSectionProps {
  categoryId?: string;
}

export default function CustomerPicksSection({ categoryId }: CustomerPicksSectionProps) {
  const [businesses, setBusinesses] = useState<PriorityListing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const perPage = 5;
  const { data: categories } = useCategories();

  // Get category name from categoryId
  const categoryName = categories?.find(cat => cat.id === categoryId)?.name || 'Services';

  // Helper function to check if addons contains verify_badge or all
  const hasVerifyBadge = (addons: string): boolean => {
    if (!addons) return false;
    return addons.includes('verify_badge') || addons.includes('{all}') || addons.includes('all');
  };

  // Track previous categoryId to detect changes
  const prevCategoryIdRef = useRef<string | undefined>(categoryId);

  // Fetch businesses when categoryId or currentPage changes
  useEffect(() => {
    // Check if category changed
    const categoryChanged = prevCategoryIdRef.current !== categoryId;

    // If category changed, reset to page 1
    if (categoryChanged) {
      setCurrentPage(1);
      setBusinesses([]);
      setError(null);
      setHasNextPage(false);
      prevCategoryIdRef.current = categoryId;
    }

    // Always fetch, but use page 1 if category changed
    const pageToFetch = categoryChanged ? 1 : currentPage;

    const fetchBusinesses = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getPriorityListing(categoryId, pageToFetch, perPage);
        if (response.status && response.payload) {
          // Extract items from the paginated payload
          setBusinesses(response.payload.items || []);
          // Use nextPage from API to determine if there are more pages
          setHasNextPage(response.payload.nextPage !== null);
          // Update currentPage state if we fetched a different page
          if (categoryChanged && currentPage !== 1) {
            setCurrentPage(1);
          }
        } else {
          setBusinesses([]);
          setHasNextPage(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load businesses');
        setBusinesses([]);
        setHasNextPage(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [categoryId, currentPage, perPage]);

  const handlePrevious = () => {
    if (currentPage > 1 && !loading) {
      setCurrentPage(prev => prev - 1);
      scrollToStart();
    }
  };

  const handleNext = () => {
    if (hasNextPage && !loading) {
      setCurrentPage(prev => prev + 1);
      scrollToStart();
    }
  };

  const scrollToStart = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  // Handle horizontal swipe
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let startX = 0;
    let scrollLeft = 0;
    let isDown = false;

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
    };

    const handleMouseUp = () => {
      isDown = false;
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
    };

    const handleTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);

    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);


  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 xl:px-20" style={{ backgroundColor: '#F8F9F8' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5">
                  <Image
                    alt="Forward arrow icon"
                    className="w-full h-full"
                    src={forwardArrowIcon}
                    width={20}
                    height={20}
                  />
                </div>
                <span className="text-[#797e84] text-xs sm:text-sm font-medium tracking-wider uppercase">
                  CUSTOMER PICKS
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-medium text-black">
                {categoryName}
              </h2>
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-1.5 sm:gap-2">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 1 || loading}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNext}
                disabled={!hasNextPage || loading}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
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
          {!loading && !error && businesses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No businesses found for this category.
            </div>
          )}

          {/* Businesses Carousel */}
          {businesses.length > 0 && (
            <div
              ref={scrollContainerRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {businesses.map((business) => (
                <Link
                  key={business.business_id}
                  href={`/services/${business.business_id}`}
                  className="flex-shrink-0 w-60 sm:w-65 h-56 sm:h-64 bg-white rounded-xl hover:shadow-lg transition-shadow cursor-pointer group border border-gray-100 relative overflow-hidden"
                >
                  {/* Full Image Background */}
                  <div className="absolute inset-0">
                    {business.image ? (
                      <Image
                        alt={business.business_name}
                        src={business.image}
                        fill
                        className="object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-xl flex items-center justify-center">
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

                    {/* Gradient Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-xl" />
                  </div>

                  {/* Verified Badge - Only show if addons contains verify_badge */}
                  {hasVerifyBadge(business.addons) && (
                    <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
                      <div className="bg-blue-500 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full flex items-center gap-1">
                        <Image
                          src={sealCheckIcon}
                          alt="Verified"
                          width={12}
                          height={12}
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                        />
                        Verified
                      </div>
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1.5 sm:mb-2 group-hover:text-gray-200 transition-colors">
                      {business.business_name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs sm:text-sm font-medium text-white">{business.avg_rating}</span>
                      <div className="flex items-center">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-xs sm:text-sm text-gray-200">{business.total_reviews} reviews</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
