'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { BookingData, BusinessDetail, Service } from '@/types';
import { getBusinessDetail, getBusinessImages } from '@/services/business/business';
import { getServiceListing } from '@/services/service/service';
import { useNextAvailability } from '@/hooks/booking/useNextAvailability';
import { useBookingDiscount } from '@/hooks/booking/useBookingDiscount';
import { useAuth } from '@/context/AuthContext';
import { createCheckoutSession } from '@/services/booking/booking';
import { ArrowLeft, User, Mail, Phone, CheckCircle, ShieldCheck } from 'lucide-react';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper function to format timestamp to time string
const formatTimeFromTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, authToken } = useAuth();
  const businessId = searchParams.get('business_id') || '';
  const serviceId = searchParams.get('service_id') || '';
  
  // Loading state for checkout
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [sessionExpiredError, setSessionExpiredError] = useState(false);

  // Helper to get date string in local timezone (not UTC)
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Initialize selectedDate with today's date
  const getTodayDateString = () => {
    const today = new Date();
    return getLocalDateString(today);
  };

  // Save booking data to localStorage
  const saveBookingData = (step: 'date-time' | 'user-details', date: string, time: number | null, details: { firstName: string; lastName: string; email: string; phoneNumber: string }) => {
    if (typeof window === 'undefined' || !businessId || !serviceId) return;
    
    try {
      const data = {
        businessId,
        serviceId,
        step,
        selectedDate: date,
        selectedTime: time,
        userDetails: details,
      };
      localStorage.setItem('booking_data', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving booking data:', error);
    }
  };

  // Clear persisted booking data
  const clearBookingData = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('booking_data');
  };

  // Initialize state
  const [currentStep, setCurrentStep] = useState<'date-time' | 'user-details'>('date-time');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayDates, setDisplayDates] = useState<Array<{day: string, date: number, fullDate: Date}>>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [tempSelectedYear, setTempSelectedYear] = useState<number | null>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // User details form state
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  // Field-level error state
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
  }>({});

  // Restore booking data from localStorage on mount if available
  // This allows retry flow to pre-fill the form
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Check if we have booking_data in localStorage
    const storedBookingData = localStorage.getItem('booking_data');
    
    if (storedBookingData) {
      try {
        const bookingData = JSON.parse(storedBookingData);
        
        // Only restore if business_id and service_id match current URL params
        if (bookingData.businessId === businessId && bookingData.serviceId === serviceId) {
          // Restore form state from booking_data
          if (bookingData.selectedDate) {
            setSelectedDate(bookingData.selectedDate);
            // Set currentDate to match selectedDate for calendar display
            const date = new Date(bookingData.selectedDate);
            setCurrentDate(date);
          }
          
          if (bookingData.selectedTime) {
            setSelectedTime(bookingData.selectedTime);
          }
          
          if (bookingData.userDetails) {
            setUserDetails(bookingData.userDetails);
          }
          
          if (bookingData.step) {
            setCurrentStep(bookingData.step);
          }
        } else {
          // Business/service mismatch - clear the old booking_data
          clearBookingData();
          // Reset to initial state
          setCurrentStep('date-time');
          setSelectedDate(getTodayDateString());
          setSelectedTime(null);
          setCurrentDate(new Date());
          setUserDetails({
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
          });
        }
      } catch (error) {
        console.error('Failed to parse booking_data:', error);
        // Invalid booking_data - clear it and reset
        clearBookingData();
        setCurrentStep('date-time');
        setSelectedDate(getTodayDateString());
        setSelectedTime(null);
        setCurrentDate(new Date());
        setUserDetails({
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
        });
      }
    } else {
      // No booking_data - start fresh
      setCurrentStep('date-time');
      setSelectedDate(getTodayDateString());
      setSelectedTime(null);
      setCurrentDate(new Date());
      setUserDetails({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
      });
    }
    
    setFieldErrors({});
  }, [businessId, serviceId]);

  // Check for session expired error in URL params
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'session_expired') {
      setSessionExpiredError(true);
      // Clear the error param from URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('error');
      window.history.replaceState({}, '', newUrl.toString());
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setSessionExpiredError(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Note: We do NOT clear booking_data on unmount
  // It should only be cleared when:
  // 1. User navigates to landing page (/)
  // 2. User navigates to unrelated route (not starting with /booking)
  // 3. Booking payment is successful
  // This allows retry flow to work properly

  // Business and service data
  const [businessData, setBusinessData] = useState<BusinessDetail | null>(null);
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [businessImage, setBusinessImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch business and service data
  useEffect(() => {
    const fetchData = async () => {
      if (!businessId || !serviceId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch business detail and images in parallel
        const [businessResponse, imagesResponse] = await Promise.all([
          getBusinessDetail(businessId),
          getBusinessImages(businessId)
        ]);

        setBusinessData(businessResponse.payload);

        // Get thumbnail image or first image from new structure
        const businessImages = imagesResponse.payload && !imagesResponse.payload.is_deleted 
          ? imagesResponse.payload.business_images 
          : [];
        const thumbnailImage = businessImages.find(img => img.is_thumbnail && img.image && img.image.trim() !== '');
        if (thumbnailImage) {
          setBusinessImage(thumbnailImage.image);
        } else {
          const firstValidImage = businessImages.find(img => img.image && img.image.trim() !== '');
          if (firstValidImage) {
            setBusinessImage(firstValidImage.image);
          } else {
            setBusinessImage(null);
          }
        }

        // Fetch service listing and find the specific service
        const servicesResponse = await getServiceListing(businessId, 'asc', 1, 100);
        const service = servicesResponse.payload.items.find(s => s.id === serviceId);
        
        if (service) {
          setServiceData(service);
        } else {
          setError('Service not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [businessId, serviceId]);

  // Fetch booking discount
  const { data: discountData, isLoading: isLoadingDiscount } = useBookingDiscount({
    businessId,
    userId: user?.id || '',
    serviceId,
    enabled: !!businessId && !!user?.id && !!serviceId && !!authToken,
  });

  // Calculate pricing
  const servicePrice = serviceData?.price || 0;
  const originalPrice = serviceData?.hide_price || 0;
  // Use gross_amount from API if available, otherwise fall back to originalPrice
  const grossAmount = discountData?.gross_amount ?? originalPrice;
  // Use total_discount from API if available, otherwise calculate from service price
  const totalDiscount = discountData?.total_discount ?? (originalPrice > servicePrice ? originalPrice - servicePrice : 0);
  const hasDiscount = totalDiscount > 0;
  // Use amount_paid_by_customer from API if available, otherwise use servicePrice
  const total = discountData?.amount_paid_by_customer ?? servicePrice;

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

  const handleDateSelect = (fullDate: Date) => {
    const dateString = getLocalDateString(fullDate);
    setSelectedDate(dateString);
    // Clear checkout error when date changes (as time slots will change)
    setCheckoutError(null);
    saveBookingData(currentStep, dateString, selectedTime, userDetails);
  };

  const handleTimeSelect = (timestamp: number) => {
    // Don't change the selectedDate - user has already selected a date
    // The timestamp is for the selected date, so we just update the time
    setSelectedTime(timestamp);
    // Clear checkout error when time slot changes
    setCheckoutError(null);
    saveBookingData(currentStep, selectedDate, timestamp, userDetails);
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

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }
    
    // Move to user details step
    setCurrentStep('user-details');
    saveBookingData('user-details', selectedDate, selectedTime, userDetails);
  };

  const handleBackToDateSelection = () => {
    setCurrentStep('date-time');
    saveBookingData('date-time', selectedDate, selectedTime, userDetails);
  };

  const handleUserDetailsChange = (field: string, value: string) => {
    const updatedDetails = {
      ...userDetails,
      [field]: value
    };
    setUserDetails(updatedDetails);
    // Clear field error when user starts typing
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof fieldErrors];
        return newErrors;
      });
    }
    saveBookingData(currentStep, selectedDate, selectedTime, updatedDetails);
  };

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email address is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePhoneNumber = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return 'Phone number is required';
    }
    // Remove spaces, dashes, and plus signs for validation
    const cleanedPhone = phone.trim().replace(/[\s\-+]/g, '');
    // Malaysian phone number format: 10-11 digits (with or without country code)
    if (!/^(\+?6?0)?[0-9]{9,11}$/.test(cleanedPhone)) {
      return 'Please enter a valid phone number (10-11 digits)';
    }
    return undefined;
  };

  const handleSubmitBooking = async () => {
    // Validate required fields and set field-level errors
    const newErrors: typeof fieldErrors = {};

    if (!userDetails.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!userDetails.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    const emailError = validateEmail(userDetails.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const phoneError = validatePhoneNumber(userDetails.phoneNumber);
    if (phoneError) {
      newErrors.phoneNumber = phoneError;
    }

    // Set errors and return if validation fails
    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    // Clear field errors if validation passes
    setFieldErrors({});

    if (!user?.id || !authToken) {
      alert('Please log in to continue');
      router.push('/auth/login/customer');
      return;
    }

    if (!selectedTime) {
      alert('Please select a time slot');
      return;
    }

    // Generate new UUID for idempotency_key
    const idempotencyKey = crypto.randomUUID();

    // Get currency from service data or use default
    const currency = (serviceData && 'currency' in serviceData ? (serviceData as Service & { currency?: string }).currency : undefined) || 'myr';

    // Get success and cancel URLs
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const successUrl = `${baseUrl}/booking/success`;
    const cancelUrl = `${baseUrl}/booking/cancel`;

    // Convert selected date and time to timestamp
    const selectedDateObj = new Date(selectedDate);
    const selectedTimeObj = new Date(selectedTime);
    // Combine date and time
    const bookingTimestamp = new Date(
      selectedDateObj.getFullYear(),
      selectedDateObj.getMonth(),
      selectedDateObj.getDate(),
      selectedTimeObj.getHours(),
      selectedTimeObj.getMinutes()
    ).getTime();

    setIsCreatingCheckout(true);
    setCheckoutError(null);

    try {
      const response = await createCheckoutSession(
        {
          user_id: user.id,
          business_id: businessId,
          service_id: serviceId,
          first_name: userDetails.firstName,
          last_name: userDetails.lastName,
          email_id: userDetails.email,
          phone_number: userDetails.phoneNumber,
          success_url: successUrl,
          cancel_url: cancelUrl,
          service_time_slot: bookingTimestamp,
          currency: currency.toLowerCase(),
          idempotency_key: idempotencyKey,
        },
        authToken
      );

      // Store payment_id and idempotency_key in localStorage
      localStorage.setItem('payment_id', response.payload.payment_id);
      localStorage.setItem('idempotency_key', idempotencyKey);

      // DO NOT clear booking_data here - it needs to be preserved for retry flow
      // booking_data will be cleared only when:
      // 1. Payment is successful (in success page)
      // 2. User navigates away from booking flow (route guard)
      // 3. User navigates to landing page

      // Redirect to Stripe checkout URL in the same tab
      window.location.href = response.payload.url;
    } catch (error) {
      setIsCreatingCheckout(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
      setCheckoutError(errorMessage);
      console.error('Checkout session creation failed:', error);
    }
  };

  // Get the date to use for availability API (use selectedDate)
  const dateForAvailability = useMemo(() => {
    const date = new Date(selectedDate);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }, [selectedDate]);

  // Fetch next availability
  const { data: availabilityData, isLoading: isLoadingAvailability } = useNextAvailability({
    date: dateForAvailability,
    businessId,
    serviceId,
    enabled: !!businessId && !!serviceId,
  });

  // Get available time slots from API response
  const availableTimeSlots = useMemo(() => {
    if (!availabilityData) return [];
    // Ensure availabilityData is an array before calling filter
    if (!Array.isArray(availabilityData)) return [];
    return availabilityData
      .filter((slot) => slot.is_available)
      .map((slot) => ({
        timestamp: slot.time,
        displayTime: formatTimeFromTimestamp(slot.time),
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [availabilityData]);

  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} hr${hours > 1 ? 's' : ''}${mins > 0 ? `, ${mins} min${mins > 1 ? 's' : ''}` : ''}`;
    }
    return `${mins} min${mins > 1 ? 's' : ''}`;
  };

  // Format address
  const formatAddress = (): string => {
    if (!businessData) return '';
    const parts = [
      businessData.address_line_1,
      businessData.address_line_2,
      businessData.postal_code
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="min-h-screen bg-[#f8f9f8]">
      <UnifiedHeader showSearchBar={false} />
      
      {/* Session Expired Error Banner */}
      {sessionExpiredError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 sm:mx-6 lg:mx-8 mt-4 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700" style={{ fontFamily: 'Lato, sans-serif' }}>
                Session expired. Please start a new booking.
              </p>
            </div>
            <button
              onClick={() => setSessionExpiredError(false)}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Left Column - Date & Time Selection or User Details */}
            <div className="flex-1">
              {currentStep === 'date-time' ? (
                <>
                  <div className="mb-4">
                    <h1 className="text-xl sm:text-2xl font-semibold text-black mb-2">
                      Select Date & Time
                    </h1>
                    <p className="text-base sm:text-lg text-[#797e84]">
                      When would you like your appointment? Choose your preferred appointment slot
                    </p>
                  </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
                {/* Calendar Section */}
                <div className="mb-6">
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

                {/* Divider */}
                <div className="border-t border-gray-200 mb-6"></div>

                {/* Time Slots Section */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base text-black">Available Time</span>
                  </div>
                  
                  {isLoadingAvailability ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#6290f2]"></div>
                    </div>
                  ) : availableTimeSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#797e84] text-sm">
                        No available times for this date
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile: Fixed 6 rows × 2 columns with horizontal scroll */}
                      <div className="overflow-x-auto scrollbar-hide pb-4 md:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
                        <div 
                          className="grid gap-4"
                          style={{
                            gridTemplateRows: 'repeat(6, minmax(0, 1fr))',
                            gridAutoFlow: 'column',
                            gridAutoColumns: 'minmax(140px, calc(50vw - 2.5rem))',
                            width: 'max-content'
                          }}
                        >
                          {availableTimeSlots.map((slot) => {
                            const isSelected = selectedTime === slot.timestamp;
                            return (
                              <button
                                key={slot.timestamp}
                                onClick={() => handleTimeSelect(slot.timestamp)}
                                className={`p-3 rounded border text-sm transition-colors whitespace-nowrap ${
                                  isSelected
                                    ? 'bg-black border-black text-white'
                                    : 'border-[#e5e7ea] hover:border-gray-300 text-[#797e84]'
                                }`}
                              >
                                {slot.displayTime}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {/* Desktop: Original responsive grid */}
                      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {availableTimeSlots.map((slot) => {
                          const isSelected = selectedTime === slot.timestamp;
                          return (
                            <button
                              key={slot.timestamp}
                              onClick={() => handleTimeSelect(slot.timestamp)}
                              className={`p-3 rounded border text-sm transition-colors ${
                                isSelected
                                  ? 'bg-black border-black text-white'
                                  : 'border-[#e5e7ea] hover:border-gray-300 text-[#797e84]'
                              }`}
                            >
                              {slot.displayTime}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
                </>
              ) : (
                <>
                  {/* Back Button */}
                  <button
                    onClick={handleBackToDateSelection}
                    className="border border-[rgba(0,0,0,0.2)] rounded-lg p-3 mb-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-black" />
                  </button>

                  {/* Enter Your Information Section */}
                  <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                      <h2 
                        className="text-lg sm:text-xl font-semibold text-black"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '28px' }}
                      >
                        Enter Your Information
                      </h2>
                      
                      <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm">
                        <div className="flex flex-col gap-5">
                          {/* First Name and Last Name Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            {/* First Name */}
                            <div className="flex flex-col gap-2">
                              <label 
                                className="text-sm text-black"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}
                              >
                                First Name *
                              </label>
                              <div className={`border rounded-lg relative ${
                                fieldErrors.firstName ? 'border-red-500' : 'border-[#e5e7ea]'
                              }`}>
                                <div className="flex items-center gap-2 px-3.5 sm:px-4 py-3">
                                  <User className="w-5 h-5 text-[#797e84] flex-shrink-0" />
                                  <input
                                    type="text"
                                    value={userDetails.firstName}
                                    onChange={(e) => handleUserDetailsChange('firstName', e.target.value)}
                                    placeholder="Enter"
                                    className="flex-1 outline-none text-base text-black placeholder:text-[#797e84]"
                                    style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                                  />
                                </div>
                              </div>
                              {fieldErrors.firstName && (
                                <p className="text-sm text-red-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                                  {fieldErrors.firstName}
                                </p>
                              )}
                            </div>

                            {/* Last Name */}
                            <div className="flex flex-col gap-2">
                              <label 
                                className="text-sm text-black"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}
                              >
                                Last Name *
                              </label>
                              <div className={`border rounded-lg relative ${
                                fieldErrors.lastName ? 'border-red-500' : 'border-[#e5e7ea]'
                              }`}>
                                <div className="flex items-center gap-2 px-3.5 sm:px-4 py-3">
                                  <User className="w-5 h-5 text-[#797e84] flex-shrink-0" />
                                  <input
                                    type="text"
                                    value={userDetails.lastName}
                                    onChange={(e) => handleUserDetailsChange('lastName', e.target.value)}
                                    placeholder="Enter"
                                    className="flex-1 outline-none text-base text-black placeholder:text-[#797e84]"
                                    style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                                  />
                                </div>
                              </div>
                              {fieldErrors.lastName && (
                                <p className="text-sm text-red-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                                  {fieldErrors.lastName}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Email and Phone Number Row */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            {/* Email */}
                            <div className="flex flex-col gap-2">
                              <label 
                                className="text-sm text-black"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}
                              >
                                Email address *
                              </label>
                              <div className={`border rounded-lg relative ${
                                fieldErrors.email ? 'border-red-500' : 'border-[#e5e7ea]'
                              }`}>
                                <div className="flex items-center gap-2 px-3.5 sm:px-4 py-3">
                                  <Mail className="w-5 h-5 text-[#797e84] flex-shrink-0" />
                                  <input
                                    type="email"
                                    value={userDetails.email}
                                    onChange={(e) => handleUserDetailsChange('email', e.target.value)}
                                    placeholder="gmail.com"
                                    className="flex-1 outline-none text-base text-black placeholder:text-[#797e84]"
                                    style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                                  />
                                </div>
                              </div>
                              {fieldErrors.email && (
                                <p className="text-sm text-red-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                                  {fieldErrors.email}
                                </p>
                              )}
                            </div>

                            {/* Phone Number */}
                            <div className="flex flex-col gap-2">
                              <label 
                                className="text-sm text-black"
                                style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}
                              >
                                Phone Number *
                              </label>
                              <div className={`border rounded-lg relative ${
                                fieldErrors.phoneNumber ? 'border-red-500' : 'border-[#e5e7ea]'
                              }`}>
                                <div className="flex items-center gap-2 px-3.5 sm:px-4 py-3">
                                  <Phone className="w-5 h-5 text-[#797e84] flex-shrink-0" />
                                  <input
                                    type="tel"
                                    value={userDetails.phoneNumber}
                                    onChange={(e) => handleUserDetailsChange('phoneNumber', e.target.value)}
                                    placeholder="Enter"
                                    className="flex-1 outline-none text-base text-black placeholder:text-[#797e84]"
                                    style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}
                                  />
                                </div>
                              </div>
                              {fieldErrors.phoneNumber && (
                                <p className="text-sm text-red-500" style={{ fontFamily: 'Lato, sans-serif' }}>
                                  {fieldErrors.phoneNumber}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Section */}
                    <div className="flex flex-col gap-4">
                      <h2 
                        className="text-lg sm:text-xl font-semibold text-black"
                        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '28px' }}
                      >
                        Payment method
                      </h2>
                      
                      <div className="flex flex-col gap-2">
                        {/* Payment Methods Card */}
                        <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Payment Method Logos */}
                            <div className="flex items-center gap-2">
                              <div className="relative w-12 h-8 sm:w-16 sm:h-10 flex-shrink-0">
                                <Image
                                  src="/figma-assets/Visa_Inc.-Logo.wine.svg"
                                  alt="Visa"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div className="relative w-12 h-8 sm:w-16 sm:h-10 flex-shrink-0">
                                <Image
                                  src="/figma-assets/Mastercard-Logo.wine.svg"
                                  alt="Mastercard"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div className="relative w-12 h-8 sm:w-16 sm:h-10 flex-shrink-0">
                                <Image
                                  src="/figma-assets/google-pay-new-48.svg"
                                  alt="Google Pay"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div className="relative w-12 h-8 sm:w-16 sm:h-10 flex-shrink-0">
                                <Image
                                  src="/figma-assets/apple-pay-logo.svg"
                                  alt="Apple Pay"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <div className="relative w-12 h-8 sm:w-16 sm:h-10 flex-shrink-0">
                                <Image
                                  src="/figma-assets/fpx.svg"
                                  alt="FPX"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          </div>
                          <CheckCircle className="w-6 h-6 text-[#1fc16b] flex-shrink-0" />
                        </div>

                        {/* Secure Payment Text */}
                        <div className="flex items-center justify-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-[#797e84]" />
                          <p 
                            className="text-sm text-[rgba(0,0,0,0.5)]"
                            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '20px' }}
                          >
                            Secure Payment
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:w-[450px]">
              <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm lg:sticky lg:top-24">
                <h2 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-5">Booking Summary</h2>
                
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6290f2]"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-10">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                ) : !businessData || !serviceData ? (
                  <div className="text-center py-10">
                    <p className="text-[#797e84] text-sm">No booking data available</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Business Info */}
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {businessImage ? (
                          <Image
                            src={businessImage}
                            alt={businessData.business_name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-1 text-gray-400">
                              <svg 
                                className="w-8 h-8" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={1.5} 
                                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                />
                              </svg>
                              <span className="text-[8px] font-medium">No Image</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-black mb-1" style={{ fontFamily: 'Lato, sans-serif' }}>
                          {businessData.business_name}
                        </h3>
                        <p className="text-[#797e84] text-xs sm:text-sm mb-2 truncate" style={{ fontFamily: 'Lato, sans-serif' }}>
                          {formatAddress()}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                            {businessData.review_average.toFixed(1)}
                          </span>
                          <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                            ({businessData.review_count})
                          </span>
                        </div>
                      </div>
                    </div>

                      {/* Service Details */}
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm sm:text-base text-black font-medium" style={{ fontFamily: 'Lato, sans-serif' }}>
                              {serviceData.name}
                            </div>
                            <div className="text-xs sm:text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                              {formatDuration(serviceData.duration_minutes)}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {hasDiscount && (
                              <span className="text-[#9ea5ad] text-xs sm:text-sm line-through" style={{ fontFamily: 'Lato, sans-serif' }}>
                                RM {grossAmount.toFixed(2)}
                              </span>
                            )}
                            <span className="text-sm sm:text-base font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                              RM {servicePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>

                      {/* Divider */}
                      <div className="border-t border-gray-200"></div>

                      {/* Pricing Breakdown */}
                      {hasDiscount && (
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>Discount</span>
                            <span className="text-[#1fc16b] font-semibold" style={{ fontFamily: 'Lato, sans-serif' }}>
                              -RM {totalDiscount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-between text-base">
                        <span className="font-medium" style={{ fontFamily: 'Lato, sans-serif' }}>Total</span>
                        <span className="font-semibold" style={{ fontFamily: 'Lato, sans-serif' }}>
                          RM {total.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Continue/Confirm Button */}
                    {currentStep === 'date-time' ? (
                      <button
                        onClick={handleContinue}
                        disabled={!selectedDate || !selectedTime}
                        className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          selectedDate && selectedTime
                            ? 'bg-[#6290f2] text-white hover:bg-blue-600'
                            : 'bg-[#6290f2] text-white opacity-30 cursor-not-allowed'
                        }`}
                        style={{ fontFamily: 'Lato, sans-serif' }}
                      >
                        Continue
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleSubmitBooking}
                          disabled={isCreatingCheckout}
                          className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                            isCreatingCheckout
                              ? 'bg-[#6290f2] text-white opacity-50 cursor-not-allowed'
                              : 'bg-[#6290f2] text-white hover:bg-blue-600'
                          }`}
                          style={{ fontFamily: 'Lato, sans-serif' }}
                        >
                          {isCreatingCheckout ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Processing...
                            </span>
                          ) : (
                            'Confirm Booking'
                          )}
                        </button>
                        {checkoutError && (
                          <p className="text-red-500 text-sm text-center" style={{ fontFamily: 'Lato, sans-serif' }}>
                            {checkoutError}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
