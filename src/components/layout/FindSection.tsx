'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { useTodayTopPicks } from '@/hooks/landing/useTodayTopPicks';

// Image assets
const forwardArrowIcon = '/figma-assets/forward-arrow.svg';

export default function FindSection() {
  const { data: topPicksData, isLoading, error } = useTodayTopPicks();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Transform API data to component format
  const topPicks = topPicksData?.map((pick) => {
    // Build address string
    const addressParts = [
      pick.address_line_1,
      pick.address_line_2,
      pick.postal_code
    ].filter(Boolean);
    const address = addressParts.join(', ');

    // Determine badge based on tags
    const isMostBooked = pick.tags === 'mbt';
    const badge = isMostBooked ? 'Most Booked Today' : 'Trending';
    const badgeColor = isMostBooked ? 'bg-red-500' : 'bg-yellow-400';
    const badgeTextColor = isMostBooked ? 'text-white' : 'text-black';

    // Use thumbnail_image if available, otherwise null
    const image = (pick.thumbnail_image && pick.thumbnail_image.trim() !== '') ? pick.thumbnail_image : null;

    return {
      id: pick.business_id,
      title: pick.business_name,
      rating: parseFloat(pick.avg_rating) || 0,
      reviews: pick.total_ratings || 0,
      address,
      image,
      badge,
      badgeColor,
      badgeTextColor
    };
  }) || [];

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white w-full py-16 px-4 sm:px-8 lg:px-16 xl:px-20">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5">
                  <Image 
                    alt="Find icon" 
                    className="w-full h-full" 
                    src={forwardArrowIcon} 
                    width={20}
                    height={20}
                  />
                </div>
                <span className="text-[#797e84] text-sm font-medium tracking-wider uppercase">
                  FIND
                </span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-medium text-black">
                Today&apos;s Top Picks For You
              </h2>
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-xl animate-pulse">
                <div className="h-48 w-full bg-gray-200 rounded-xl" />
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state (but still render with empty data)
  if (error) {
    console.error('Error fetching today\'s top picks:', error);
  }

  // Don't render if no data
  if (!topPicks || topPicks.length === 0) {
    return null;
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-white w-full py-16 px-4 sm:px-8 lg:px-16 xl:px-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5">
                <Image 
                  alt="Find icon" 
                  className="w-full h-full" 
                  src={forwardArrowIcon} 
                  width={20}
                  height={20}
                />
              </div>
              <span className="text-[#797e84] text-sm font-medium tracking-wider uppercase">
                FIND
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-medium text-black">
              Today&apos;s Top Picks For You
            </h2>
          </div>
          
          {/* Navigation Arrows */}
          <div className="flex gap-2">
            <button 
              onClick={scrollLeft}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={scrollRight}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cards Horizontal Scroll */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pt-4 pb-4 px-2 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {topPicks.map((pick, index) => (
            <Link
              key={`${pick.id}-${index}`}
              href={`/services/${pick.id}`}
              className="flex-shrink-0 w-72 sm:w-80 bg-white rounded-xl hover:shadow-lg transition-shadow cursor-pointer group relative"
            >
              {/* Image Container */}
              <div className="relative h-48 w-full">
                {pick.image ? (
                  <Image
                    alt={pick.title}
                    src={pick.image as string}
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
                
                {/* Badge */}
                <div className="absolute -top-1.5 -left-1.5">
                  <div className={`${pick.badgeColor} ${pick.badgeTextColor} px-1 py-1 text-xs font-lato shadow-md relative text-black-500 `} style={{ borderRadius: '6px 6px 6px 0' }}>
                    {pick.badge}
                    {/* Folded corner effect using SVG */}
                    <div className="absolute -bottom-1 -left-0.25">
                      <svg 
                        width="8" 
                        height="5" 
                        viewBox="0 0 8 5" 
                        fill="none" 
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-2 h-1"
                      >
                        <path 
                          d="M0 0H8V5L0 0Z" 
                          fill={pick.badgeColor === 'bg-yellow-400' ? '#d97706' : '#dc2626'}
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-black mb-2 group-hover:text-gray-700 transition-colors">
                  {pick.title}
                </h3>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-black">{pick.rating}</span>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-500">{pick.reviews}</span>
                </div>
                
                {/* Address */}
                <p className="text-sm text-gray-500 leading-relaxed">
                  {pick.address}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
