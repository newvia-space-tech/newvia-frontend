'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTrustedPartners } from '@/hooks/landing/useTrustedPartners';

// Image assets
const forwardArrowIcon = '/figma-assets/forward-arrow.svg';
const sealCheckIcon = '/figma-assets/seal-check.svg';

export default function TrustedPartnersSection() {
  const { data: partners, isLoading, error } = useTrustedPartners();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      // Scroll by approximately one card width (w-65 = 260px) + gap (24px) = 284px
      carouselRef.current.scrollBy({ left: -284, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      // Scroll by approximately one card width (w-65 = 260px) + gap (24px) = 284px
      carouselRef.current.scrollBy({ left: 284, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full py-16 px-4 sm:px-8 lg:px-16 xl:px-20" style={{ backgroundColor: '#F8F9F8' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5">
                    <Image 
                      alt="Forward arrow icon" 
                      className="w-full h-full" 
                      src={forwardArrowIcon} 
                      width={20}
                      height={20}
                    />
                  </div>
                  <span className="text-[#797e84] text-sm font-medium tracking-wider uppercase">
                    VERIFIED
                  </span>
                </div>
                <h2 className="text-2xl lg:text-3xl font-medium text-black">
                  Trusted Wellness Partners
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

            {/* Partners Carousel */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading partners...</p>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <p className="text-red-500">Failed to load partners. Please try again later.</p>
              </div>
            )}

            {partners && partners.length > 0 && (
              <div ref={carouselRef} className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {partners.map((partner) => {
                  const rating = parseFloat(partner.avg_rating) || 0;
                  const hasImage = partner.thumbnail_image && partner.thumbnail_image.trim() !== '';

                  return (
                    <Link
                      key={partner.business_id}
                      href={`/services/${partner.business_id}`}
                      className="flex-shrink-0 w-65 h-64 bg-white rounded-xl hover:shadow-lg transition-shadow cursor-pointer group border border-gray-100 relative overflow-hidden"
                    >
                      {/* Full Image Background */}
                      <div className="absolute inset-0">
                        {hasImage ? (
                          <Image
                            alt={partner.business_name}
                            src={partner.thumbnail_image as string}
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
                      
                      {/* Verified Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <div className="bg-blue-500 text-white px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1">
                          <Image 
                            src={sealCheckIcon}
                            alt="Verified"
                            width={12}
                            height={12}
                            className="w-3 h-3"
                          />
                          Verified
                        </div>
                      </div>
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gray-200 transition-colors">
                          {partner.business_name}
                        </h3>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{rating.toFixed(1)}</span>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-200">
                            {partner.total_reviews} {partner.total_reviews === 1 ? 'review' : 'reviews'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {partners && partners.length === 0 && !isLoading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">No partners available at the moment.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
