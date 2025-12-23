'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useCategories } from '@/hooks/service/useCategories';

// Image assets
const forwardArrowIcon = '/figma-assets/forward-arrow.svg'; // Forward arrow for "DISCOVER" label
const buildingIcon = '/figma-assets/building-office.svg'; // Building icon for wellness resorts

// Placeholder icons for other categories (to be filled manually)
const hairIcon = '/figma-assets/scissor.svg';
const nailsIcon = '/figma-assets/sparkle.svg';
const massageIcon = '/figma-assets/hand-soap.svg';
const skinIcon = '/figma-assets/smiley-wink.svg';
const yogaIcon = '/figma-assets/PersonSimpleTaiChi.svg';

interface UiCategory {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  iconAlt: string;
}

function pickIconFor(name: string): { icon: string; alt: string } {
  const lower = name.toLowerCase();
  if (lower.includes('hair')) return { icon: hairIcon, alt: 'Hair styling scissors icon' };
  if (lower.includes('nail')) return { icon: nailsIcon, alt: 'Nails and beauty star icon' };
  if (lower.includes('massage') || lower.includes('relax')) return { icon: massageIcon, alt: 'Massage and relaxation bottle icon' };
  if (lower.includes('skin') || lower.includes('facial')) return { icon: skinIcon, alt: 'Skin and facials smiley face icon' };
  if (lower.includes('yoga') || lower.includes('meditation')) return { icon: yogaIcon, alt: 'Yoga and meditation pose icon' };
  if (lower.includes('wellness') || lower.includes('resort')) return { icon: buildingIcon, alt: 'Wellness resorts building icon' };
  return { icon: buildingIcon, alt: `${name} icon` };
}

function splitName(name: string): { main: string; rest: string } {
  const parts = name.split(' ');
  if (parts.length <= 1) return { main: name, rest: '' };
  return { main: parts[0], rest: parts.slice(1).join(' ') };
}

export default function DiscoverCategoriesSection() {
  const { data, isLoading, error } = useCategories();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  
  const items: UiCategory[] = (data ?? []).map((c) => {
    const { icon, alt } = pickIconFor(c.name);
    const { main, rest } = splitName(c.name);
    return { id: c.id, name: main, subtitle: rest, icon, iconAlt: alt };
  });

  const handleTouchStart = (categoryId: string) => {
    setActiveCategoryId(categoryId);
  };

  const handleTouchEnd = () => {
    // Delay to allow visual feedback
    setTimeout(() => {
      setActiveCategoryId(null);
    }, 150);
  };
  return (
    <div className="bg-white w-full py-16 px-4 sm:px-8 lg:px-16 xl:px-20">
      <div className="max-w-7xl mx-auto flex flex-col gap-10">
        {/* Header Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5">
              <Image 
                alt="Discover icon" 
                className="w-full h-full" 
                src={forwardArrowIcon} 
                width={20}
                height={20}
              />
            </div>
            <span className="text-[#797e84] text-sm font-medium tracking-wider uppercase">
              Discover
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-medium text-black">
            Our Categories
          </h2>
        </div>

        {/* Categories Grid */}
        {error && (
          <div className="text-sm text-red-600" role="alert">{(error as Error).message}</div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`s-${i}`}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-300 cursor-pointer group min-h-[140px] hover:bg-gradient-to-b hover:from-[#EEE8A9] hover:to-[#DDE5CF]"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-8 group-hover:scale-105 transition-all duration-300 bg-gradient-to-b from-[#EEE8A9] to-[#DDE5CF] group-hover:bg-white group-hover:from-white group-hover:to-white"
                >
                  <div className="w-6 h-6 bg-gray-200 rounded" />
                </div>
                <div className="text-left">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                </div>
              </div>
            ))
          ) : (
            items.map((category: UiCategory) => {
              const isActive = activeCategoryId === category.id;
              return (
                <div
                  key={category.id}
                  onTouchStart={() => handleTouchStart(category.id)}
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchEnd}
                  className={`bg-white border border-gray-200 rounded-xl p-6 transition-all duration-300 cursor-pointer group min-h-[140px] ${
                    isActive 
                      ? 'shadow-md bg-gradient-to-b from-[#EEE8A9] to-[#DDE5CF]' 
                      : 'hover:shadow-md hover:bg-gradient-to-b hover:from-[#EEE8A9] hover:to-[#DDE5CF]'
                  }`}
                >
                  <div 
                    className={`w-12 h-12 rounded-lg flex items-center justify-center mb-8 transition-all duration-300 bg-gradient-to-b from-[#EEE8A9] to-[#DDE5CF] ${
                      isActive
                        ? 'scale-105 bg-white from-white to-white'
                        : 'group-hover:scale-105 group-hover:bg-white group-hover:from-white group-hover:to-white'
                    }`}
                  >
                    <Image
                      alt={category.iconAlt}
                      src={category.icon}
                      width={24}
                      height={24}
                      className="w-6 h-6"
                    />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-medium text-black leading-tight">
                      {category.name}
                    </h3>
                    {category.subtitle && (
                      <p className={`text-lg leading-tight ${
                        isActive 
                          ? 'text-black' 
                          : 'text-gray-600 group-hover:text-black'
                      }`}>
                        {category.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
