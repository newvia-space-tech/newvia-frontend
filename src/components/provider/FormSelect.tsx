'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export default function FormSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select',
  required = false,
  error,
  className = '',
  disabled = false
}: FormSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(option => option.value === value);

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

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm text-black">
        {label} {required && '*'}
      </label>
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-2.5 border rounded-lg text-base text-left flex items-center justify-between ${
            error ? 'border-red-500' : 'border-[#e5e7ea]'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
        >
          <span className={selectedOption ? 'text-black' : 'text-[#797e84]'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="w-5 h-5" />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7ea] rounded-lg shadow-lg z-10">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-black hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

