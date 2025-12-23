'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTodayDiscounts } from '@/hooks/discount/useTodayDiscounts';
import { useRef, useState, useEffect } from 'react';
import type { Discount } from '@/types';

// Image assets from Figma
const discountIcon = '/figma-assets/forward-arrow.svg'; // Discount section icon

// Helper function to format countdown timer
function formatCountdown(validTill: number): { hours: string; minutes: string; seconds: string } {
  const now = Date.now();
  const diff = Math.max(0, validTill - now);
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

// Helper function to format discount value
function formatDiscount(discount: Discount): string {
  if (discount.type === 'percent') {
    return `${discount.value}% off`;
  } else {
    return `flat ${discount.value}`;
  }
}

// Helper function to get discount text color
function getDiscountTextColor(discount: Discount): string {
  // You can customize colors based on discount type or value
  return discount.type === 'percent' ? 'text-[#fab12f]' : 'text-[#e43636]';
}

// Helper function to get card background color
function getCardBackgroundColor(discount: Discount, index: number): string {
  // Alternate between colors or use a default
  const colors = ['#19183b', '#eee8a9'];
  return colors[index % colors.length];
}

// Component for individual card countdown
function CardCountdown({ validTill }: { validTill: number }) {
  const [countdown, setCountdown] = useState(formatCountdown(validTill));

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(formatCountdown(validTill));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [validTill]);

  return (
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
  );
}

export default function DiscountsSection() {
  const { data: discounts, isLoading, error } = useTodayDiscounts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // Filter out expired discounts (only show valid ones)
  const validDiscounts = discounts ? discounts.filter(discount => {
    const now = Date.now();
    return discount.valid_till > now;
  }) : [];

  // Group valid discounts into pairs (pages of 2)
  const groupedDiscounts = validDiscounts.length > 0 ? (() => {
    const groups: Discount[][] = [];
    for (let i = 0; i < validDiscounts.length; i += 2) {
      groups.push(validDiscounts.slice(i, i + 2));
    }
    return groups;
  })() : [];

  // Handle scroll events to update currentIndex - update immediately for smooth indicator sync
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !groupedDiscounts.length) return;

    const updateIndex = () => {
      const containerWidth = container.offsetWidth;
      const scrollLeft = container.scrollLeft;
      const newIndex = Math.round(scrollLeft / containerWidth);
      setCurrentIndex(newIndex);
      isScrollingRef.current = false;
      rafIdRef.current = null;
    };

    const handleScroll = () => {
      if (!isScrollingRef.current) {
        isScrollingRef.current = true;
      }

      // Update index immediately using requestAnimationFrame for smooth updates
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          const containerWidth = container.offsetWidth;
          const scrollLeft = container.scrollLeft;
          const newIndex = Math.round(scrollLeft / containerWidth);
          setCurrentIndex(newIndex);
          rafIdRef.current = null;
        });
      }

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Mark scrolling as ended after a brief delay
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    };

    // Use scrollend event if available for final confirmation
    const handleScrollEnd = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      updateIndex();
    };

    if ('onscrollend' in container) {
      container.addEventListener('scrollend', handleScrollEnd);
    }

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if ('onscrollend' in container) {
        container.removeEventListener('scrollend', handleScrollEnd);
      }
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [groupedDiscounts]);

  // Handle dot navigation clicks
  const handleDotClick = (index: number) => {
    if (!scrollContainerRef.current || isScrollingRef.current) return;
    
    const containerWidth = scrollContainerRef.current.offsetWidth;
    const scrollPosition = index * containerWidth;
    
    scrollContainerRef.current.scrollTo({
      left: scrollPosition,
      behavior: 'smooth',
    });
    
    setCurrentIndex(index);
  };

  // Don't render the section at all if there are no valid discounts (after loading)
  if (!isLoading && !error && (!validDiscounts || validDiscounts.length === 0)) {
    return null;
  }

  return (
    <div className="bg-white w-full py-16 px-4 sm:px-8 lg:px-16 xl:px-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 w-full">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5">
                <Image 
                  alt="Discount icon" 
                  className="w-full h-full" 
                  src={discountIcon} 
                  width={20}
                  height={20}
                />
              </div>
              <span className="text-[#797e84] text-sm font-medium tracking-wider uppercase">
                Discounts
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-medium text-black">
              Today&apos;s Limited Offers
            </h2>
          </div>
        </div>

        {/* Discount Cards */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-gray-500">Loading discounts...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <p className="text-red-500">Failed to load discounts. Please try again later.</p>
          </div>
        )}

        {validDiscounts && validDiscounts.length > 0 && (
          <div className="relative">
            {/* Swipeable Cards Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-8 w-full overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {groupedDiscounts.map((group, groupIndex) => {
                const globalIndex = groupIndex * 2;
                return (
                  <div
                    key={`group-${groupIndex}`}
                    className="flex-shrink-0 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 snap-start"
                  >
                    {group.map((discount, cardIndexInGroup) => {
                      const cardIndex = globalIndex + cardIndexInGroup;
                      const bgColor = getCardBackgroundColor(discount, cardIndex);
                      const textColor = bgColor === '#19183b' ? 'text-white' : 'text-black';
                      const discountTextColor = getDiscountTextColor(discount);
                      const descriptionLines = discount.description.split('\n').filter(line => line.trim());

                      return (
                        <div
                          key={discount.id}
                          className="h-60 rounded-xl overflow-hidden relative"
                          style={{ backgroundColor: bgColor }}
                        >
                          <div className="absolute inset-0">
                            <Image 
                              alt={discount.description} 
                              className="absolute inset-0 w-full h-full object-cover opacity-20" 
                              src={discount.image}
                              fill
                            />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r" style={{
                            background: `linear-gradient(to right, ${bgColor}, ${bgColor}CC, transparent)`
                          }} />
                          
                          {/* Countdown Timer - Top Right */}
                          <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
                            <span className="text-white text-xs font-medium"> Offer Ends in</span>
                            <CardCountdown validTill={discount.valid_till} />
                          </div>

                          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                            <div className={textColor}>
                              {descriptionLines.map((line, lineIndex) => (
                                <p key={lineIndex} className="text-lg lg:text-xl leading-relaxed mb-1">
                                  {line}
                                </p>
                              ))}
                              <p className={`text-2xl lg:text-3xl font-bold ${discountTextColor} mt-2`}>
                                {formatDiscount(discount)}
                              </p>
                            </div>
                            {discount.business_id && discount.service_id ? (
                              <Link 
                                href={`/booking?business_id=${discount.business_id}&service_id=${discount.service_id}`}
                                className="w-fit"
                              >
                                <button className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-full">
                                  Book Now
                                </button>
                              </Link>
                            ) : (
                              <button 
                                className="bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors w-fit opacity-50 cursor-not-allowed"
                                disabled
                              >
                                Book Now
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {/* If odd number of discounts, add empty space for the second card slot */}
                    {group.length === 1 && (
                      <div className="hidden lg:block" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Dots Indicator */}
            {groupedDiscounts.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {groupedDiscounts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex ? 'bg-[#e43636] w-6' : 'bg-gray-300 w-2'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
