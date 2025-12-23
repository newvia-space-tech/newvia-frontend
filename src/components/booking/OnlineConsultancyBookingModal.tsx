'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Globe, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { createOnlineBooking } from '@/services/booking/booking';

// Common timezone options
const TIMEZONE_OPTIONS = [
  { value: 'Asia/Kuala_Lumpur', label: 'Malaysia (GMT+8)' },
  { value: 'Asia/Singapore', label: 'Singapore (GMT+8)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (GMT+7)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (GMT+7)' },
  { value: 'Asia/Manila', label: 'Manila (GMT+8)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (GMT+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'Asia/Seoul', label: 'Seoul (GMT+9)' },
  { value: 'Asia/Kolkata', label: 'India (GMT+5:30)' },
  { value: 'Asia/Dubai', label: 'Dubai (GMT+4)' },
  { value: 'Europe/London', label: 'London (GMT+0)' },
  { value: 'Europe/Paris', label: 'Paris (GMT+1)' },
  { value: 'America/New_York', label: 'New York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8)' },
  { value: 'Australia/Sydney', label: 'Sydney (GMT+11)' },
];

// Language options
const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ms', label: 'Bahasa Malaysia' }
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Generate time slots from 9 AM to 6 PM in 30-minute intervals
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 18 && minute > 0) break; // Stop at 6:00 PM
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const displayMinute = minute.toString().padStart(2, '0');
      slots.push({
        value: `${hour.toString().padStart(2, '0')}:${displayMinute}`,
        label: `${displayHour}:${displayMinute} ${ampm}`,
      });
    }
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

interface OnlineConsultancyBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bookingData: BookingFormData) => void;
  businessName?: string;
  providerName?: string;
  businessId?: string;
}

export interface BookingFormData {
  meetingDate: string;
  meetingTime: string;
  timezone: string;
  language: string;
  timestamp: number;
  meetLink?: string;
}

export default function OnlineConsultancyBookingModal({
  isOpen,
  onClose,
  onSuccess,
  businessName = 'Expert',
  providerName,
  businessId,
}: OnlineConsultancyBookingModalProps) {
  const { user, authToken } = useAuth();
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timezone, setTimezone] = useState('Asia/Kuala_Lumpur');
  const [language, setLanguage] = useState('en');
  
  // UI state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayDates, setDisplayDates] = useState<Array<{day: string, date: number, fullDate: Date}>>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempSelectedYear, setTempSelectedYear] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<{
    selectedDate?: string;
    selectedTime?: string;
    apiError?: string;
  }>({});
  
  // Refs
  const datePickerRef = useRef<HTMLDivElement>(null);
  const timezoneRef = useRef<HTMLDivElement>(null);
  const languageRef = useRef<HTMLDivElement>(null);

  // Helper to get date string in local timezone
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get current date info (normalized to start of day for proper comparison)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  // Helper function to normalize date to start of day
  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Generate available years (current year + 2 future years = 3 years total)
  const availableYears = Array.from({ length: 3 }, (_, i) => currentYear + i);

  // Get available months based on selected year
  const getAvailableMonths = (year: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (year === currentYear) {
      // For current year, only show months from current month onwards
      return monthNames.slice(currentMonth).map((name, index) => ({
        value: (currentMonth + index).toString(),
        label: name
      }));
    } else {
      // For future years, show all 12 months
      return monthNames.map((name, index) => ({
        value: index.toString(),
        label: name
      }));
    }
  };

  // Initialize with today's date
  useEffect(() => {
    if (isOpen) {
      const todayDate = new Date();
      setCurrentDate(todayDate);
      // Try to detect user's timezone
      try {
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const matchingTimezone = TIMEZONE_OPTIONS.find(tz => tz.value === detectedTimezone);
        if (matchingTimezone) {
          setTimezone(matchingTimezone.value);
        }
      } catch {
        // Use default timezone if detection fails
      }
      // Try to detect user's language preference
      try {
        const browserLang = navigator.language.split('-')[0];
        const matchingLang = LANGUAGE_OPTIONS.find(l => l.value === browserLang);
        if (matchingLang) {
          setLanguage(matchingLang.value);
        }
      } catch {
        // Use default language if detection fails
      }
    }
  }, [isOpen]);

  // Generate display dates (9 days starting from current date)
  const generateDisplayDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 9; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push({
        day: dayNames[date.getDay()],
        date: date.getDate(),
        fullDate: new Date(date)
      });
    }
    return dates;
  };

  // Update display dates when current date changes
  useEffect(() => {
    setDisplayDates(generateDisplayDates(currentDate));
  }, [currentDate]);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);

  const handleDateSelect = (fullDate: Date) => {
    const dateString = getLocalDateString(fullDate);
    setSelectedDate(dateString);
    setErrors(prev => ({ ...prev, selectedDate: undefined }));
  };

  const navigateDates = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
      // Prevent navigating to past dates
      if (normalizeDate(newDate) < today) {
        return;
      }
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleYearMonthSelect = (year: number, month: number) => {
    const newDate = new Date(year, month, 1);
    // Ensure we don't set a date in the past
    if (normalizeDate(newDate) < today) {
      // If the selected month is in the past, set to today
      setCurrentDate(new Date(today));
    } else {
      setCurrentDate(newDate);
    }
    setIsDatePickerOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setTempSelectedYear(year);
    // Don't close the popup, just update the year for month selection
  };

  const handleMonthSelect = (month: number) => {
    const yearToUse = tempSelectedYear ?? currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();
    
    // If selecting current year, ensure we don't go to a past month
    if (yearToUse === currentYear) {
      // Use current month or the selected month, whichever is later
      const safeMonth = Math.max(month, currentMonth);
      handleYearMonthSelect(yearToUse, safeMonth);
    } else {
      // For future years, use the selected month
      handleYearMonthSelect(yearToUse, month);
    }
    setTempSelectedYear(null);
  };

  // Check if previous navigation is disabled
  const canNavigatePrev = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(currentDate.getDate() - 1);
    return normalizeDate(prevDate) >= today;
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timezoneRef.current && !timezoneRef.current.contains(event.target as Node)) {
        setShowTimezoneDropdown(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!selectedDate) {
      newErrors.selectedDate = 'Please select a date';
    }

    if (!selectedTime) {
      newErrors.selectedTime = 'Please select a time';
    }

    if (!user?.id) {
      newErrors.apiError = 'Please log in to continue';
    }

    if (!businessId) {
      newErrors.apiError = 'Business information is missing';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.id || !authToken || !businessId) {
      setErrors(prev => ({ ...prev, apiError: 'Please log in to continue' }));
      return;
    }

    setIsSubmitting(true);
    setErrors(prev => ({ ...prev, apiError: undefined }));

    try {
      // Calculate timestamp from date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const dateObj = new Date(selectedDate);
      dateObj.setHours(hours, minutes, 0, 0);
      const timestamp = dateObj.getTime();

      // Call API
      const response = await createOnlineBooking(
        {
          user_id: user.id,
          business_id: businessId,
          timezone,
          language,
          timestamp,
        },
        authToken
      );

      // Prepare booking data for success callback
      const bookingData: BookingFormData = {
        meetingDate: selectedDate,
        meetingTime: selectedTime,
        timezone,
        language,
        timestamp,
        meetLink: response.payload?.meet_link,
      };

      setIsSubmitting(false);
      
      // Call success callback
      if (onSuccess) {
        onSuccess(bookingData);
      }
    } catch (error) {
      setIsSubmitting(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
      setErrors(prev => ({ ...prev, apiError: errorMessage }));
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedDate('');
    setSelectedTime('');
    setErrors({});
    setIsSubmitting(false);
  };

  // Handle close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Get selected timezone label
  const selectedTimezoneLabel = useMemo(() => {
    return TIMEZONE_OPTIONS.find(tz => tz.value === timezone)?.label || timezone;
  }, [timezone]);

  // Get selected language label
  const selectedLanguageLabel = useMemo(() => {
    return LANGUAGE_OPTIONS.find(l => l.value === language)?.label || language;
  }, [language]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-[640px] max-h-[90vh] overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#e5e7ea] bg-white">
          <div className="flex flex-col gap-0.5">
            <h2
              className="text-lg sm:text-xl font-semibold text-black"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Schedule Free Consultation
            </h2>
            <p className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
              Book a session with {providerName || businessName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-160px)] p-4 sm:p-5">
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Date Selection Section */}
            <div className="flex flex-col gap-3">
              <label
                className="text-base text-black"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Select Date *
              </label>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-3">
                  <div className="relative" ref={datePickerRef}>
                    <button
                      onClick={() => {
                        setIsDatePickerOpen(!isDatePickerOpen);
                        if (!isDatePickerOpen) {
                          setTempSelectedYear(null);
                        }
                      }}
                      className="flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="font-['Lato',_sans-serif] text-black text-base leading-6">{formatMonthYear(currentDate)}</span>
                      <div className="w-4 h-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>
                    
                    {/* Year/Month Picker Popup */}
                    {isDatePickerOpen && (
                      <div className="absolute top-full left-0 mt-2 bg-white border border-[#e5e7ea] rounded-lg shadow-lg z-20 p-3 sm:p-4 w-[280px] sm:w-[320px]">
                        <div className="space-y-4">
                          {/* Year Selector */}
                          <div>
                            <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                              Year
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {availableYears.map((year) => {
                                const isSelected = (tempSelectedYear ?? currentDate.getFullYear()) === year;
                                return (
                                  <button
                                    key={year}
                                    onClick={() => handleYearSelect(year)}
                                    className={`px-2 py-2 text-sm rounded-lg border transition-colors text-center ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-[#e5e7ea] hover:border-gray-300 text-black'
                                    }`}
                                    style={{ fontFamily: 'Lato, sans-serif' }}
                                  >
                                    {year}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Month Selector */}
                          <div>
                            <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                              Month
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {getAvailableMonths(tempSelectedYear ?? currentDate.getFullYear()).map((month) => {
                                const monthIndex = parseInt(month.value);
                                const yearToCheck = tempSelectedYear ?? currentDate.getFullYear();
                                const isSelected = currentDate.getFullYear() === yearToCheck && currentDate.getMonth() === monthIndex;
                                return (
                                  <button
                                    key={month.value}
                                    onClick={() => handleMonthSelect(monthIndex)}
                                    className={`px-2 py-2 text-xs rounded-lg border transition-colors text-center truncate ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-[#e5e7ea] hover:border-gray-300 text-black'
                                    }`}
                                    style={{ fontFamily: 'Lato, sans-serif' }}
                                    title={month.label}
                                  >
                                    {month.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => navigateDates('prev')}
                      disabled={!canNavigatePrev()}
                      className={`p-1 rounded transition-colors ${
                        canNavigatePrev() 
                          ? 'hover:bg-gray-100' 
                          : 'opacity-30 cursor-not-allowed'
                      }`}
                    >
                      <div className="w-4 h-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </button>
                    <button 
                      onClick={() => navigateDates('next')}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <div className="w-4 h-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Week Days */}
                <div className="flex gap-2 sm:gap-4 mb-4 overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
                  {displayDates.map((dateItem, index) => {
                    const dateString = getLocalDateString(dateItem.fullDate);
                    const isSelected = selectedDate === dateString;
                    return (
                      <div key={`${dateItem.day}-${dateItem.date}-${index}`} className="flex-1 min-w-[60px] sm:min-w-0">
                        <button
                          onClick={() => handleDateSelect(dateItem.fullDate)}
                          className={`w-full border border-solid box-border flex flex-col gap-1 items-center justify-center p-2 sm:p-3 rounded text-xs sm:text-sm transition-colors ${
                            isSelected
                              ? 'bg-black border-black'
                              : 'border-[#e5e7ea] hover:border-gray-300'
                          }`}
                        >
                          <p className={`font-['Lato',_sans-serif] text-xs sm:text-sm leading-5 ${
                            isSelected ? 'text-white' : 'text-black'
                          }`}>
                            {dateItem.day}
                          </p>
                          <p className={`font-['Lato',_sans-serif] text-xs sm:text-sm leading-5 font-medium ${
                            isSelected ? 'text-white' : 'text-[#797e84]'
                          }`}>
                            {dateItem.date}
                          </p>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              {errors.selectedDate && (
                <p className="text-sm text-red-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {errors.selectedDate}
                </p>
              )}
            </div>

            {/* Time Selection Section */}
            <div className="flex flex-col gap-3">
              <label
                className="text-base text-black"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                Select Time *
              </label>

              {/* Time Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTime === slot.value;
                  return (
                    <button
                      key={slot.value}
                      onClick={() => {
                        setSelectedTime(slot.value);
                        setErrors(prev => ({ ...prev, selectedTime: undefined }));
                      }}
                      className={`py-2.5 px-2 rounded-lg border text-sm transition-colors ${
                        isSelected
                          ? 'bg-black border-black text-white'
                          : 'border-[#e5e7ea] hover:border-gray-300 text-[#797e84] bg-white'
                      }`}
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
              {errors.selectedTime && (
                <p className="text-sm text-red-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {errors.selectedTime}
                </p>
              )}
            </div>

            {/* Timezone and Language Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Timezone Selector */}
              <div className="flex flex-col gap-2" ref={timezoneRef}>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <label
                    className="text-sm text-black"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    Timezone
                  </label>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                    className="w-full border border-[#e5e7ea] rounded-lg px-4 py-3 flex items-center justify-between text-left hover:border-gray-300 transition-colors"
                  >
                    <span
                      className="text-sm text-black truncate"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      {selectedTimezoneLabel}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showTimezoneDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showTimezoneDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-[#e5e7ea] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {TIMEZONE_OPTIONS.map((tz) => (
                        <button
                          key={tz.value}
                          onClick={() => {
                            setTimezone(tz.value);
                            setShowTimezoneDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                            timezone === tz.value ? 'bg-blue-50 text-blue-700' : 'text-black'
                          }`}
                          style={{ fontFamily: 'Lato, sans-serif' }}
                        >
                          {tz.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex flex-col gap-2" ref={languageRef}>
                <label
                  className="text-sm text-black"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  Language
                </label>
                <div className="relative">
                  <button
                    onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                    className="w-full border border-[#e5e7ea] rounded-lg px-4 py-3 flex items-center justify-between text-left hover:border-gray-300 transition-colors"
                  >
                    <span
                      className="text-sm text-black"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      {selectedLanguageLabel}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showLanguageDropdown && (
                    <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-[#e5e7ea] rounded-lg shadow-lg z-10">
                      {LANGUAGE_OPTIONS.map((lang) => (
                        <button
                          key={lang.value}
                          onClick={() => {
                            setLanguage(lang.value);
                            setShowLanguageDropdown(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                            language === lang.value ? 'bg-blue-50 text-blue-700' : 'text-black'
                          }`}
                          style={{ fontFamily: 'Lato, sans-serif' }}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-4 border-t border-[#e5e7ea] bg-white">
          {errors.apiError && (
            <p className="text-sm text-red-500 mb-3 text-center" style={{ fontFamily: 'Lato, sans-serif' }}>
              {errors.apiError}
            </p>
          )}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-[#6290f2] text-white opacity-50 cursor-not-allowed'
                : 'bg-[#6290f2] text-white hover:bg-blue-600'
            }`}
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Scheduling...
              </>
            ) : (
              'Schedule Meeting'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

