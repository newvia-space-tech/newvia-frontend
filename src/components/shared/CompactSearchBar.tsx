'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import SearchDropdown from './SearchDropdown';
import LocationDropdown from './LocationDropdown';

// Image assets
const searchIcon = '/figma-assets/magnifying-glass.svg';
const locationIcon = '/figma-assets/map-pin.svg';
const searchButtonIcon = '/figma-assets/magnifying-glass.svg';

interface CompactSearchBarProps {
  prefilledQuery?: string;
  prefilledLocation?: string;
  prefilledCategoryId?: string;
  prefilledCityId?: string;
}

export default function CompactSearchBar({ 
  prefilledQuery = '', 
  prefilledLocation = '',
  prefilledCategoryId,
  prefilledCityId
}: CompactSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(prefilledQuery);
  const [location, setLocation] = useState(prefilledLocation);
  const [categoryId, setCategoryId] = useState<string | null>(prefilledCategoryId || null);
  const [cityId, setCityId] = useState<string | null>(prefilledCityId || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Update state when props change
  useEffect(() => {
    setSearchQuery(prefilledQuery);
    setLocation(prefilledLocation);
    setCategoryId(prefilledCategoryId || null);
    setCityId(prefilledCityId || null);
  }, [prefilledQuery, prefilledLocation, prefilledCategoryId, prefilledCityId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOnSearchInput = searchInputRef.current?.contains(target);
      const clickedOnLocationInput = locationInputRef.current?.contains(target);
      const clickedOnSearchDropdown = dropdownRef.current?.querySelector('[data-dropdown-content]')?.contains(target);
      const clickedOnLocationDropdown = locationDropdownRef.current?.querySelector('[data-dropdown-content]')?.contains(target);
      
      if (!clickedOnSearchInput && !clickedOnSearchDropdown) {
        setIsDropdownOpen(false);
      }
      
      if (!clickedOnLocationInput && !clickedOnLocationDropdown) {
        setIsLocationDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isLocationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen, isLocationDropdownOpen]);

  const navigateToServices = (newCategoryId?: string | null, newCityId?: string | null, newQuery?: string, newLocation?: string) => {
    // Navigate to listing page with search parameters
    const searchParams = new URLSearchParams();
    const queryToUse = newQuery !== undefined ? newQuery : searchQuery;
    const locationToUse = newLocation !== undefined ? newLocation : location;
    const categoryIdToUse = newCategoryId !== undefined ? newCategoryId : categoryId;
    const cityIdToUse = newCityId !== undefined ? newCityId : cityId;
    
    if (queryToUse.trim()) {
      searchParams.set('q', queryToUse.trim());
    }
    if (locationToUse.trim()) {
      searchParams.set('location', locationToUse.trim());
    }
    if (categoryIdToUse) {
      searchParams.set('category_id', categoryIdToUse);
    }
    if (cityIdToUse) {
      searchParams.set('city_id', cityIdToUse);
    }
    
    const queryString = searchParams.toString();
    const url = queryString ? `/services?${queryString}` : '/services';
    
    router.push(url);
  };

  const handleSearch = () => {
    navigateToServices();
  };

  const handleCategorySelect = (category: { name: string; id: string }) => {
    setSearchQuery(category.name);
    setCategoryId(category.id);
    setIsDropdownOpen(false);
    // Automatically navigate when category is selected
    navigateToServices(category.id, cityId, category.name, location);
  };

  const handleLocationSelect = (locationData: { name: string; address: string; id: string }) => {
    setLocation(locationData.name);
    setCityId(locationData.id);
    setIsLocationDropdownOpen(false);
    // Automatically navigate when location is selected
    navigateToServices(categoryId, locationData.id, searchQuery, locationData.name);
  };

  const handleSearchInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleLocationInputFocus = () => {
    setIsLocationDropdownOpen(true);
  };

  return (
    <div className="w-full">
      {/* Compact Search Form */}
      <div className="bg-white rounded-full border border-gray-200 p-0.5 sm:p-1 flex items-center gap-0.5 sm:gap-2 w-full relative">
        {/* Search Input with Dropdown */}
        <div className="flex-1 relative z-20 min-w-0" ref={dropdownRef}>
          <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 py-1 sm:py-2 rounded-full">
            <Image
              src={searchIcon}
              alt="Search"
              width={16}
              height={16}
              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 brightness-0 opacity-40"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchInputFocus}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-xs sm:text-sm text-[#797e84] placeholder:text-[#797e84] outline-none min-w-0"
            />
          </div>
          
          {/* Search Dropdown */}
          <SearchDropdown
            isOpen={isDropdownOpen}
            onClose={() => setIsDropdownOpen(false)}
            onSelectCategory={handleCategorySelect}
          />
        </div>

        {/* Divider */}
        <div className="w-px h-4 sm:h-6 bg-gray-200 flex-shrink-0" />

        {/* Location Input with Dropdown */}
        <div className="flex-1 relative z-20 min-w-0" ref={locationDropdownRef}>
          <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-3 py-1 sm:py-2 rounded-full">
            <Image
              src={locationIcon}
              alt="Location"
              width={16}
              height={16}
              className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
            />
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Where?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={handleLocationInputFocus}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-xs sm:text-sm text-[#797e84] placeholder:text-[#797e84] outline-none min-w-0"
            />
          </div>
          
          {/* Location Dropdown */}
          <LocationDropdown
            isOpen={isLocationDropdownOpen}
            onClose={() => setIsLocationDropdownOpen(false)}
            onSelectLocation={handleLocationSelect}
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="bg-[#6290f2] px-1.5 py-1 sm:px-4 sm:py-2 rounded-full flex items-center justify-center gap-1 text-white text-xs sm:text-sm font-medium hover:bg-[#4a7ae8] transition-colors flex-shrink-0"
        >
          <Image
            src={searchButtonIcon}
            alt="Search"
            width={16}
            height={16}
            className="w-3 h-3 sm:w-4 sm:h-4"
          />
        </button>
      </div>
    </div>
  );
}
