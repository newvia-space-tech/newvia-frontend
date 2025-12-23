'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export type SortOption = 'price-high-low' | 'price-low-high' | 'highest-review' | 'verified';

interface SortByPopupProps {
  currentSort: SortOption | null;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions = [
  { value: 'price-high-low' as SortOption, label: 'Price: High to low' },
  { value: 'price-low-high' as SortOption, label: 'Price: Low to High' },
  { value: 'highest-review' as SortOption, label: 'Highest Review' },
  { value: 'verified' as SortOption, label: 'Verified' },
];

export default function SortByPopup({ currentSort, onSortChange }: SortByPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSortSelect = (sort: SortOption) => {
    onSortChange(sort);
    setIsOpen(false);
  };

  const currentOption = sortOptions.find(option => option.value === currentSort);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Sort By Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        style={{ fontFamily: 'Lato, sans-serif' }}
      >
        <span className="text-xs sm:text-sm text-black">
          {currentSort ? `Sort By: ${currentOption?.label}` : 'Sort By'}
        </span>
        <ChevronDown 
          className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Popup Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          
          {/* Menu */}
          <div className="absolute top-full right-0 sm:left-0 z-50 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[180px] sm:min-w-[200px]">
            <div className="py-1 sm:py-2">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSortSelect(option.value)}
                  className={`w-full text-left px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm hover:bg-gray-50 transition-colors ${
                    currentSort === option.value ? 'bg-gray-50 font-medium' : ''
                  }`}
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
