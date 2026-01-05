'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useSwipeable } from 'react-swipeable';
import { useHeroVideos } from '@/hooks/landing/useHeroVideos';

interface HeroVideoSliderProps {
  onVideosReady?: (count: number) => void;
}

export default function HeroVideoSlider({ onVideosReady }: HeroVideoSliderProps) {
  const { data: videos = [], isLoading, error } = useHeroVideos();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedVideos, setLoadedVideos] = useState<Set<number>>(new Set());
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set());
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter active videos
  const activeVideos = videos.filter((video) => video.is_active);

  // Determine what to show
  const hasApiError = !!error;
  const hasVideos = activeVideos.length > 0;
  const shouldShowFallback = hasApiError || (!isLoading && !hasVideos) || (hasVideos && videoErrors.size === activeVideos.length);
  const shouldShowSkeleton = isLoading && !hasApiError && !hasInitialLoad;
  const shouldShowVideos = !isLoading && !hasApiError && hasVideos && !shouldShowFallback;

  // Notify parent about video count once loading is complete
  useEffect(() => {
    if (!isLoading) {
      onVideosReady?.(shouldShowFallback ? 0 : activeVideos.length);
    }
  }, [isLoading, shouldShowFallback, activeVideos.length, onVideosReady]);

  // Mark initial load complete when videos are ready
  useEffect(() => {
    if (shouldShowVideos && !hasInitialLoad) {
      setHasInitialLoad(true);
    }
  }, [shouldShowVideos, hasInitialLoad]);

  // Reset current index when videos change
  useEffect(() => {
    if (activeVideos.length > 0 && currentIndex >= activeVideos.length) {
      setCurrentIndex(0);
    }
  }, [activeVideos.length, currentIndex]);

  // Preload adjacent videos (current, next, previous)
  useEffect(() => {
    if (activeVideos.length === 0) return;
    
    const adjacentIndices = [
      currentIndex,
      (currentIndex + 1) % activeVideos.length,
      (currentIndex - 1 + activeVideos.length) % activeVideos.length,
    ];
    
    videoRefs.current.forEach((video, index) => {
      if (video && adjacentIndices.includes(index) && !videoErrors.has(index)) {
        if (video.readyState < 3) {
          video.load();
        }
      }
    });
  }, [activeVideos.length, currentIndex, videoErrors]);

  // Handle video loaded event
  const handleVideoLoaded = useCallback((index: number) => {
    setLoadedVideos((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  }, []);

  // Handle video error event
  const handleVideoError = useCallback((index: number, e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error(`Error loading video ${index}:`, e);
    setVideoErrors((prev) => {
      const newSet = new Set(prev);
      newSet.add(index);
      return newSet;
    });
  }, []);

  // Execute transition after next video is loaded
  const executeTransition = useCallback((targetIndex: number) => {
    if (isTransitioning || targetIndex === currentIndex) return;
    
    const targetVideo = videoRefs.current[targetIndex];
    const isTargetLoaded = loadedVideos.has(targetIndex);
    const hasTargetError = videoErrors.has(targetIndex);
    
    // If target has error, skip to the next one
    if (hasTargetError) {
      const nextSafe = (targetIndex + 1) % activeVideos.length;
      if (nextSafe !== currentIndex) {
        executeTransition(nextSafe);
      }
      return;
    }
    
    // If target is not loaded yet, wait for it
    if (!isTargetLoaded || !targetVideo || targetVideo.readyState < 3) {
      setNextIndex(targetIndex);
      return;
    }
    
    // Start crossfade transition
    setIsTransitioning(true);
    setNextIndex(targetIndex);
    
    // Play target video
    targetVideo.currentTime = 0;
    targetVideo.play().catch((error) => {
      console.error(`Error playing video ${targetIndex}:`, error);
    });
    
    // Complete transition after crossfade duration
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentIndex(targetIndex);
      setNextIndex(null);
      setIsTransitioning(false);
      
      // Pause previous video
      const prevVideo = videoRefs.current[currentIndex];
      if (prevVideo) {
        prevVideo.pause();
      }
    }, 800); // Match crossfade duration (800ms)
  }, [isTransitioning, currentIndex, loadedVideos, videoErrors, activeVideos.length]);

  // When nextIndex video becomes ready, execute transition
  useEffect(() => {
    if (nextIndex !== null && loadedVideos.has(nextIndex) && !isTransitioning) {
      executeTransition(nextIndex);
    }
  }, [nextIndex, loadedVideos, isTransitioning, executeTransition]);

  // Navigation functions
  const goToNext = useCallback(() => {
    if (activeVideos.length <= 1 || isTransitioning) return;
    const target = (currentIndex + 1) % activeVideos.length;
    executeTransition(target);
  }, [activeVideos.length, currentIndex, isTransitioning, executeTransition]);

  const goToPrevious = useCallback(() => {
    if (activeVideos.length <= 1 || isTransitioning) return;
    const target = (currentIndex - 1 + activeVideos.length) % activeVideos.length;
    executeTransition(target);
  }, [activeVideos.length, currentIndex, isTransitioning, executeTransition]);

  const goToIndex = useCallback((index: number) => {
    if (index === currentIndex || isTransitioning) return;
    executeTransition(index);
  }, [currentIndex, isTransitioning, executeTransition]);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: goToNext,
    onSwipedRight: goToPrevious,
    trackMouse: true,
    trackTouch: true,
    preventScrollOnSwipe: true,
  });

  // Arrow key navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // Manage video playback for current video
  useEffect(() => {
    if (activeVideos.length === 0 || isTransitioning) return;
    
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo && !videoErrors.has(currentIndex)) {
      currentVideo.play().catch((error) => {
        console.error(`Error playing video ${currentIndex}:`, error);
      });
    }
  }, [currentIndex, activeVideos.length, isTransitioning, videoErrors]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Skeleton State - Only on initial load
  if (shouldShowSkeleton) {
    return (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 z-[1]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    );
  }

  // Fallback Image State - Only shown on error or no videos
  if (shouldShowFallback) {
    return (
      <div className="absolute inset-0 w-full h-full z-[1] transition-opacity duration-500 opacity-100">
        <Image
          src="/figma-assets/hero-background.svg"
          alt="Wellness background"
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  // Video State - Render all videos with crossfade control
  if (!shouldShowVideos) return null;

  return (
    <>
      {/* Fixed Container - Never remounts during transitions */}
      <div
        {...handlers}
        className="absolute inset-0 w-full h-full overflow-hidden z-[1]"
        style={{ touchAction: 'pan-x pan-y' }}
      >
        {activeVideos.map((video, index) => {
          const isCurrent = index === currentIndex;
          const isNext = index === nextIndex;
          const isVisible = isCurrent || isNext;
          const hasError = videoErrors.has(index);
          
          // Skip rendering videos with errors
          if (hasError) return null;
          
          // Calculate opacity for crossfade effect
          let opacity: number;
          let zIndex: number;
          
          if (isTransitioning) {
            if (isNext) {
              // Fading in
              opacity = 1;
              zIndex = 2;
            } else if (isCurrent) {
              // Fading out
              opacity = 0;
              zIndex = 1;
            } else {
              // Hidden
              opacity = 0;
              zIndex = 0;
            }
          } else {
            if (isCurrent) {
              // Fully visible
              opacity = 1;
              zIndex = 2;
            } else {
              // Hidden
              opacity = 0;
              zIndex = 0;
            }
          }
          
          return (
            <video
              key={video.id}
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              src={video.asset_url}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[800ms] ease-in-out"
              style={{
                opacity,
                zIndex,
                willChange: isVisible ? 'opacity' : 'auto',
                pointerEvents: isVisible ? 'auto' : 'none',
              }}
              muted
              playsInline
              preload="auto"
              loop={true}
              onLoadedData={() => handleVideoLoaded(index)}
              onCanPlay={() => handleVideoLoaded(index)}
              onError={(e) => handleVideoError(index, e)}
            />
          );
        })}
      </div>

      {/* Navigation Arrows - Only show if more than 1 video, hidden on mobile */}
      {activeVideos.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={goToPrevious}
            disabled={isTransitioning}
            className="hidden md:block absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-[10] bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 sm:p-3.5 transition-all duration-200 group shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous video - Press Left Arrow key"
            title="Previous video (← key)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            disabled={isTransitioning}
            className="hidden md:block absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-[10] bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 sm:p-3.5 transition-all duration-200 group shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next video - Press Right Arrow key"
            title="Next video (→ key)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10] flex gap-2">
            {activeVideos.map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                disabled={isTransitioning || index === currentIndex}
                className={`transition-all duration-300 disabled:cursor-not-allowed ${
                  index === currentIndex 
                    ? 'bg-white w-8 h-2' 
                    : 'bg-white/50 hover:bg-white/75 w-2 h-2'
                } rounded-full`}
                aria-label={`Go to video ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

