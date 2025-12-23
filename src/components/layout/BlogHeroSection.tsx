'use client';

import BlogHeroVideoSlider from './BlogHeroVideoSlider';

export default function BlogHeroSection() {
  return (
    <div className="relative h-[500px] sm:h-[600px] lg:h-[780px] w-full overflow-hidden bg-[#f4f4f4]">
      {/* Video Slider Background */}
      <BlogHeroVideoSlider />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-[2]" />
      <div className="absolute bottom-0 left-0 right-0 h-[300px] sm:h-[400px] lg:h-[530px] bg-gradient-to-t from-black to-transparent z-[2]" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 z-[3]">
        {/* Hero Text */}
        <div className="text-center text-white mb-6 sm:mb-8 max-w-4xl">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-medium mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
            Our Blogs
          </h2>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold leading-tight" style={{ fontFamily: 'Lato, sans-serif' }}>
            Trends, Treatments & Tips for a Healthier You
          </h1>
        </div>
      </div>
    </div>
  );
}
