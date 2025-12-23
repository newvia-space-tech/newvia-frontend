'use client';

import SearchBar from '../shared/SearchBar';
import HeroVideoSlider from './HeroVideoSlider';

export default function HeroSection() {
  return (
    <div className="relative h-[600px] sm:h-[600px] lg:h-[780px] w-full bg-[#f4f4f4]" style={{ overflow: 'visible' }}>
      {/* Background Video Slider (handles loading, error, and fallback states internally) */}
      <HeroVideoSlider />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[2] pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-[350px] sm:h-[400px] lg:h-[530px] bg-gradient-to-t from-black to-transparent z-[2] pointer-events-none" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 z-[3] pointer-events-none">
        {/* Hero Text */}
        <div className="text-center text-white mb-4 sm:mb-6 lg:mb-8 max-w-4xl w-full">
          <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-medium mb-1 sm:mb-2">
            Discover Wellness Near You
          </h2>
          <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-semibold leading-tight">
            Your path to relaxation, beauty, and balance starts here
          </h1>
        </div>

        {/* Search Bar */}
        <div className="w-full z-10 pointer-events-auto">
          <SearchBar />
        </div>
      </div>
    </div>
  );
}
