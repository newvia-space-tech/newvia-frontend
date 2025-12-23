'use client';

import Image from 'next/image';
import { useCategories } from '@/hooks/service/useCategories';

// Icon mapping for categories
const hairIcon = '/figma-assets/scissor.svg';
const nailsIcon = '/figma-assets/sparkle.svg';
const massageIcon = '/figma-assets/hand-soap.svg';
const skinIcon = '/figma-assets/smiley-wink.svg';
const yogaIcon = '/figma-assets/PersonSimpleTaiChi.svg';
const buildingIcon = '/figma-assets/building-office.svg';

function pickIconFor(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('hair')) return hairIcon;
  if (lower.includes('nail')) return nailsIcon;
  if (lower.includes('massage') || lower.includes('relax')) return massageIcon;
  if (lower.includes('skin') || lower.includes('facial')) return skinIcon;
  if (lower.includes('yoga') || lower.includes('meditation')) return yogaIcon;
  if (lower.includes('wellness') || lower.includes('resort')) return buildingIcon;
  return buildingIcon;
}

interface SearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: { name: string; id: string }) => void;
}

export default function SearchDropdown({ isOpen, onClose, onSelectCategory }: SearchDropdownProps) {
  const { data: categories, isLoading, error } = useCategories();

  const handleCategorySelect = (category: { id: string; name: string }) => {
    onSelectCategory(category);
    onClose();
  };

  if (!isOpen) return null;

  // Filter only active categories and map to display format
  const displayCategories = (categories ?? [])
    .filter((category) => category.is_active)
    .map((category) => ({
      id: category.id,
      name: category.name,
      icon: pickIconFor(category.name),
    }));

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div className="absolute top-full left-0 w-[150%] max-w-[calc(100vw-2rem)] sm:w-full sm:max-w-none z-[9999] mt-1 sm:mt-2" data-dropdown-content>
        <div className="bg-white rounded-lg sm:rounded-xl shadow-[0px_12px_32px_0px_rgba(0,0,0,0.25)] p-2 sm:p-3 border border-gray-200 sm:border-2 sm:border-gray-300 backdrop-blur-sm max-h-[240px] sm:max-h-[280px] overflow-y-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
          {error && (
            <div className="text-xs sm:text-sm text-red-600 p-1.5 sm:p-2" role="alert">
              {(error as Error).message}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex flex-col gap-2 sm:gap-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex items-center gap-2 sm:gap-3 p-0 rounded-lg sm:rounded-xl w-full"
                >
                  <div className="bg-gray-200 flex items-center justify-center p-2 sm:p-2.5 rounded w-[32px] h-[32px] sm:w-[36px] sm:h-[36px] animate-pulse" />
                  <div className="flex-1">
                    <div className="h-5 sm:h-6 w-24 sm:w-32 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:gap-3">
              {displayCategories.length === 0 ? (
                <div className="text-xs sm:text-sm text-gray-500 p-1.5 sm:p-2">No categories available</div>
              ) : (
                displayCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect({ id: category.id, name: category.name })}
                    className="flex items-center gap-2 sm:gap-3 p-1 sm:p-0 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors w-full text-left"
                  >
                    {/* Icon container */}
                    <div className="bg-[#f8f9f8] flex items-center justify-center p-2 sm:p-2.5 rounded flex-shrink-0">
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={20}
                        height={20}
                        className="w-4 h-4 sm:w-5 sm:h-5"
                      />
                    </div>
                    
                    {/* Category name */}
                    <div className="flex-1 min-w-0">
                      <p className="text-black text-sm sm:text-base font-medium leading-5 sm:leading-6 truncate">
                        {category.name}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
