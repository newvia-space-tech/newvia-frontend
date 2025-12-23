'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SearchFormData } from '@/types';
import SearchDropdown from './SearchDropdown';
import LocationDropdown from './LocationDropdown';

// Image assets
const searchIcon = '/figma-assets/magnifying-glass.svg';
const locationIcon = '/figma-assets/map-pin.svg';
const searchButtonIcon = '/figma-assets/magnifying-glass.svg';
const dividerLine = '/figma-assets/divider-line.svg';
const shieldIcon = '/figma-assets/shield-check.svg';
const checkIcon = '/figma-assets/seal-check.svg';
const idIcon = '/figma-assets/identification-card.svg';

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [cityId, setCityId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

  const handleSearch = () => {
    // Navigate to listing page with search parameters
    const searchParams = new URLSearchParams();
    if (searchQuery.trim()) {
      searchParams.set('q', searchQuery.trim());
    }
    if (location.trim()) {
      searchParams.set('location', location.trim());
    }
    if (categoryId) {
      searchParams.set('category_id', categoryId);
    }
    if (cityId) {
      searchParams.set('city_id', cityId);
    }
    
    const queryString = searchParams.toString();
    const url = queryString ? `/services?${queryString}` : '/services';
    
    router.push(url);
  };

  const handleCategorySelect = (category: { name: string; id: string }) => {
    setSearchQuery(category.name);
    setCategoryId(category.id);
    setIsDropdownOpen(false);
  };

  const handleSearchInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleLocationSelect = (locationData: { name: string; address: string; id: string }) => {
    setLocation(locationData.name);
    setCityId(locationData.id);
    setIsLocationDropdownOpen(false);
  };

  const handleLocationInputFocus = () => {
    setIsLocationDropdownOpen(true);
  };

  const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    setIsLocationDropdownOpen(true);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4">
      {/* Search Form */}
      <div className="bg-white rounded-2xl sm:rounded-[30px] lg:rounded-[60px] p-1.5 sm:p-2 lg:p-3 flex flex-row items-center gap-1.5 sm:gap-2 w-full">
        {/* Search Input with Dropdown */}
        <div className="flex-1 relative z-20 min-w-0" ref={dropdownRef}>
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-full">
            <Image
              src={searchIcon}
              alt="Search"
              width={20}
              height={20}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0 brightness-0 opacity-40"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for spa, hair..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onFocus={handleSearchInputFocus}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-xs sm:text-sm lg:text-base text-[#797e84] placeholder:text-[#797e84] outline-none min-w-0"
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
        <div className="w-px h-6 sm:h-8 lg:h-9 flex items-center justify-center flex-shrink-0">
          <div className="w-full h-full border-l border-gray-300" />
        </div>

        {/* Location Input with Dropdown */}
        <div className="flex-1 relative z-20 min-w-0" ref={locationDropdownRef}>
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-2.5 rounded-full">
            <Image
              src={locationIcon}
              alt="Location"
              width={20}
              height={20}
              className="w-3 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0"
            />
            <input
              ref={locationInputRef}
              type="text"
              placeholder="Where?"
              value={location}
              onChange={handleLocationInputChange}
              onFocus={handleLocationInputFocus}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 text-xs sm:text-sm lg:text-base text-[#797e84] placeholder:text-[#797e84] outline-none min-w-0"
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
          className="bg-[#6290f2] px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 rounded-full flex items-center justify-center gap-1 sm:gap-2 text-white text-xs sm:text-sm lg:text-base font-normal hover:bg-[#4a7ae8] transition-colors flex-shrink-0"
        >
          <span className="hidden lg:inline cursor-pointer">Find Wellness</span>
          <span className="lg:hidden cursor-pointer">Search</span>
          <Image
            src={searchButtonIcon}
            alt="Search"
            width={20}
            height={20}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 cursor-pointer"
          />
        </button>
      </div>


      {/* Trust Indicators */}
      <div className="flex flex-row gap-2 sm:gap-4 lg:gap-6 xl:gap-8 items-center justify-center px-2 sm:px-4 lg:px-15 py-0 mt-3 sm:mt-4 lg:mt-5 flex-wrap">
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 whitespace-nowrap">
          <Image
            src={shieldIcon}
            alt="Secure Payment"
            width={20}
            height={20}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0"
          />
          <span className="text-white text-xs sm:text-sm lg:text-base font-medium">Secure Payment</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 whitespace-nowrap">
          <Image
            src={checkIcon}
            alt="Verified Partners"
            width={20}
            height={20}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0"
          />
          <span className="text-white text-xs sm:text-sm lg:text-base font-medium">Verified Partners</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 whitespace-nowrap">
          <Image
            src={idIcon}
            alt="Instant Booking ID"
            width={20}
            height={20}
            className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 flex-shrink-0"
          />
          <span className="text-white text-xs sm:text-sm lg:text-base font-medium">Instant Booking ID</span>
        </div>
      </div>
    </div>
  );
}
