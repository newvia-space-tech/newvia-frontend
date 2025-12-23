'use client';

import React, { useRef } from 'react';
import Image from 'next/image';

// Social media logos
const instagramLogo = '/figma-assets/instagram-logo.svg';
const facebookLogo = '/figma-assets/facebook-logo.svg';
const linkedinLogo = '/figma-assets/linkedin-logo.svg';
const xLogo = '/figma-assets/x-logo.svg';

// Using available images from figma-assets
const galleryImages = [
  '/figma-assets/yoga-session.png',
  '/figma-assets/massage-therapy.png',
  '/figma-assets/07035a1ad9e67a7586fdad968b657324294b6066.png',
  '/figma-assets/21f8a2e0fadf4a6aac0ab16f5019be42eba741ec.png',
  '/figma-assets/c113193f348b8eda309796632f3a894da7865cec.png',
  '/figma-assets/f25776be432c403db6c054fc830f78ad73f34712.png',
];

export default function SocialMediaSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  // Number of collage sections to create a continuous scrollable collage
  // Each section is ~90vw wide, so 3 sections = ~270vw total width for continuous scrolling
  const NUM_COLLAGE_SECTIONS = 3;

  // Helper function to get image by index (cycles through available images)
  const getImageByIndex = (index: number) => {
    return galleryImages[index % galleryImages.length];
  };

  // Render different collage layouts matching the 3 screenshot layouts
  const renderCollageLayout = (collageIndex: number, baseIndex: number) => {
    const layoutType = collageIndex % 3; // 3 different layout variations matching screenshots
    
    switch (layoutType) {
      case 0:
        // Layout 1 (First screenshot): Left (large top + 2 small bottom), Right (3 stacked)
        return (
          <div className="flex gap-2 h-[500px] sm:h-[600px]">
            <div className="flex flex-col gap-2 flex-1">
              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={getImageByIndex(baseIndex)}
                  alt={`Featured content ${baseIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 40vw"
                />
              </div>
              <div className="flex gap-2 h-[120px] sm:h-[140px]">
                <div className="relative flex-1 rounded-xl overflow-hidden">
                  <Image
                    src={getImageByIndex(baseIndex + 1)}
                    alt={`Featured content ${baseIndex + 2}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 25vw, 20vw"
                  />
                </div>
                <div className="relative flex-1 rounded-xl overflow-hidden">
                  <Image
                    src={getImageByIndex(baseIndex + 2)}
                    alt={`Featured content ${baseIndex + 3}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 25vw, 20vw"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={getImageByIndex(baseIndex + 3)}
                  alt={`Featured content ${baseIndex + 4}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 40vw"
                />
              </div>
              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={getImageByIndex(baseIndex + 4)}
                  alt={`Featured content ${baseIndex + 5}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 40vw"
                />
              </div>
              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={getImageByIndex(baseIndex + 5)}
                  alt={`Featured content ${baseIndex + 6}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 40vw"
                />
              </div>
            </div>
          </div>
        );
      
      case 1:
        // Layout 2 (Second screenshot): Top-left, top-right, bottom spanning full width
        return (
          <div className="flex flex-col gap-2 h-[500px] sm:h-[600px]">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={getImageByIndex(baseIndex)}
                  alt={`Featured content ${baseIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 40vw"
                />
              </div>
              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={getImageByIndex(baseIndex + 1)}
                  alt={`Featured content ${baseIndex + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 40vw"
                />
              </div>
            </div>
            <div className="relative h-[200px] sm:h-[240px] rounded-xl overflow-hidden">
              <Image
                src={getImageByIndex(baseIndex + 2)}
                alt={`Featured content ${baseIndex + 3}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 90vw"
              />
            </div>
          </div>
        );
      
      case 2:
        // Layout 3 (Third screenshot): Large middle image, bottom images
        return (
          <div className="flex flex-col gap-2 h-[500px] sm:h-[600px]">
            <div className="relative flex-1 rounded-xl overflow-hidden">
              <Image
                src={getImageByIndex(baseIndex)}
                alt={`Featured content ${baseIndex + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 90vw, 80vw"
              />
            </div>
            <div className="flex gap-2 h-[120px] sm:h-[140px]">
              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={getImageByIndex(baseIndex + 1)}
                  alt={`Featured content ${baseIndex + 2}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 30vw, 25vw"
                />
              </div>
              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={getImageByIndex(baseIndex + 2)}
                  alt={`Featured content ${baseIndex + 3}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 30vw, 25vw"
                />
              </div>
              <div className="relative flex-1 rounded-xl overflow-hidden">
                <Image
                  src={getImageByIndex(baseIndex + 3)}
                  alt={`Featured content ${baseIndex + 4}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 30vw, 25vw"
                />
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white w-full pt-8 pb-16 px-4 sm:px-8 lg:px-16 xl:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="box-border content-stretch flex flex-col gap-6 sm:gap-8 lg:gap-10 items-start justify-center overflow-clip px-4 sm:px-6 lg:px-15 lg:py-20 py-8 sm:py-12 relative rounded-3 bg-white">
          {/* Header Section */}
          <div className="content-stretch flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 lg:gap-0 relative shrink-0 w-full">
            <div className="content-stretch flex flex-col gap-2 lg:gap-3 items-start relative shrink-0">
              <div className="content-stretch flex gap-1.5 items-center relative shrink-0">
                <div className="relative shrink-0 w-4 h-4 lg:w-5 lg:h-5">
                  <Image 
                    alt="Frame icon" 
                    className="block max-w-none w-full h-full" 
                    src="/figma-assets/forward-arrow.svg"
                    width={20}
                    height={20}
                  />
                </div>
                <p className="font-medium leading-normal not-italic relative shrink-0 text-[#797e84] text-sm lg:text-base text-center lg:text-center lg:text-nowrap tracking-wide uppercase lg:whitespace-pre">
                  get featured
                </p>
              </div>
              <h2 className="font-medium leading-8 lg:leading-10 not-italic relative shrink-0 text-xl lg:text-3xl text-black text-left lg:text-center lg:text-nowrap lg:whitespace-pre">
                Share and tag @newviaofficial to get featured!
              </h2>
            </div>

            {/* Social Media Links */}
            <div className="content-stretch flex flex-col lg:flex-row gap-3 lg:gap-5 lg:items-center relative shrink-0">
              <p className="font-medium leading-6 not-italic relative shrink-0 text-base lg:text-lg text-black lg:text-nowrap lg:whitespace-pre">
                Follow Us:
              </p>
              <div className="content-stretch flex gap-2 lg:gap-3 items-start relative shrink-0">
                {/* Instagram */}
                <a 
                  href="https://instagram.com/newviaofficial" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#f8f9f8] box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-2 relative rounded-[18px] shrink-0 hover:bg-gray-200 transition-colors"
                >
                  <div className="relative shrink-0 w-6 h-6">
                    <Image 
                      alt="Instagram" 
                      className="block max-w-none w-full h-full" 
                      src={instagramLogo}
                      width={24}
                      height={24}
                    />
                  </div>
                </a>

                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/share/16U7bpigNN/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#f8f9f8] box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-2 relative rounded-[18px] shrink-0 hover:bg-gray-200 transition-colors"
                >
                  <div className="relative shrink-0 w-6 h-6">
                    <Image 
                      alt="Facebook" 
                      className="block max-w-none w-full h-full" 
                      src={facebookLogo}
                      width={24}
                      height={24}
                    />
                  </div>
                </a>

                {/* LinkedIn */}
                <a 
                  href="https://www.linkedin.com/company/newvia-global/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#f8f9f8] box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-2 relative rounded-[18px] shrink-0 hover:bg-gray-200 transition-colors"
                >
                  <div className="relative shrink-0 w-6 h-6">
                    <Image 
                      alt="LinkedIn" 
                      className="block max-w-none w-full h-full" 
                      src={linkedinLogo}
                      width={24}
                      height={24}
                    />
                  </div>
                </a>

                {/* X (Twitter) */}
                {/* <a 
                  href="https://twitter.com/newviaofficial" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#f8f9f8] box-border content-stretch flex flex-col gap-2.5 items-center justify-center p-2 relative rounded-[18px] shrink-0 hover:bg-gray-200 transition-colors"
                >
                  <div className="relative shrink-0 w-6 h-6">
                    <Image 
                      alt="X" 
                      className="block max-w-none w-full h-full" 
                      src={xLogo}
                      width={24}
                      height={24}
                    />
                  </div>
                </a> */}
              </div>
            </div>
          </div>

          {/* Mobile: Continuous Horizontal Swipeable Collage Grid */}
          <div className="lg:hidden w-full mt-6 sm:mt-8">
            <div 
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {Array.from({ length: NUM_COLLAGE_SECTIONS }).map((_, collageIndex) => {
                // Calculate image indices for this collage section (cycling through images)
                const baseIndex = collageIndex * 6;
                return (
                  <div 
                    key={collageIndex}
                    className="flex-shrink-0 w-[90vw]"
                  >
                    {/* Collage Grid Layout - Random variations */}
                    {renderCollageLayout(collageIndex, baseIndex)}
            </div>
                  );
                })}
              </div>
          </div>

          {/* Desktop: Bento Grid Layout - Matching Figma Design */}
          <div className="hidden lg:block w-full mt-10">
            <div className="bg-white flex flex-col gap-[20px] h-[800px] items-start overflow-clip relative shrink-0 w-full">
            {/* First Row - 3 images: 392px | grow | 566px */}
              <div className="flex gap-[20px] flex-1 items-start overflow-clip relative shrink-0 w-full">
              <div className="h-full relative rounded-[12px] shrink-0 w-[392px] overflow-hidden">
                <Image 
                  alt="Featured content 1" 
                  className="max-w-none object-center object-cover w-full h-full" 
                  src={galleryImages[0]}
                  fill
                  sizes="392px"
                />
              </div>
                <div className="flex-1 h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden">
                <Image 
                  alt="Featured content 2" 
                  className="max-w-none object-center object-cover w-full h-full" 
                  src={galleryImages[1]}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="h-full relative rounded-[12px] shrink-0 w-[566px] overflow-hidden">
                <Image 
                  alt="Featured content 3" 
                  className="max-w-none object-center object-cover w-full h-full" 
                  src={galleryImages[2]}
                  fill
                  sizes="566px"
                />
              </div>
            </div>

            {/* Second Row - 3 images: grow | 600px | grow */}
              <div className="flex gap-[20px] h-[300px] items-start overflow-clip relative shrink-0 w-full">
                <div className="flex-1 h-[300px] min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden">
                <Image 
                  alt="Featured content 4" 
                  className="max-w-none object-center object-cover w-full h-full" 
                  src={galleryImages[3]}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="h-[300px] relative rounded-[12px] shrink-0 w-[600px] overflow-hidden">
                <Image 
                  alt="Featured content 5" 
                  className="max-w-none object-center object-cover w-full h-full" 
                  src={galleryImages[4]}
                  fill
                  sizes="600px"
                />
              </div>
                <div className="flex-1 h-[300px] min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden">
                <Image 
                  alt="Featured content 6" 
                  className="max-w-none object-center object-cover w-full h-full" 
                  src={galleryImages[5]}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </div>

              {/* Third Row - 2 images: 781px | grow */}
              <div className="flex gap-[20px] flex-1 items-start overflow-clip relative shrink-0 w-full">
              <div className="h-full relative rounded-[12px] shrink-0 w-[781px] overflow-hidden">
                <Image 
                  alt="Featured content 7" 
                  className="max-w-none object-center object-cover w-full h-full" 
                  src={galleryImages[0]}
                  fill
                  sizes="781px"
                />
              </div>
                <div className="flex-1 h-full min-h-px min-w-px relative rounded-[12px] shrink-0 overflow-hidden">
                <Image 
                  alt="Featured content 8" 
                  className="max-w-none object-center object-cover w-full h-full" 
                  src={galleryImages[1]}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
