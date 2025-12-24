'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import { Store, Pencil, MapPin, Calendar, Video, Tag, Clock, Plus, Trash2, AlertCircle, CreditCard, Image as ImageIcon } from 'lucide-react';
import AddServiceModal from '@/components/provider-onboarding/AddServiceModal';
import EditBusinessInfoModal from '@/components/provider/EditBusinessInfoModal';
import EditLocationModal from '@/components/provider/EditLocationModal';
import EditWorkingHoursModal from '@/components/provider/EditWorkingHoursModal';
import EditGalleryModal from '@/components/provider/EditGalleryModal';
import DeleteServiceModal from '@/components/provider/DeleteServiceModal';
import FormInput from '@/components/provider/FormInput';
import FormSelect from '@/components/provider/FormSelect';
import { useAuth } from '@/context/AuthContext';
import { useBusinessInfo } from '@/hooks/business/useBusinessInfo';
import { useBusinessImages } from '@/hooks/business/useBusinessImages';
import { useCategories } from '@/hooks/service/useCategories';
import { useServices } from '@/hooks/service/useServices';
import { useLocationAvailability } from '@/hooks/business/useLocationAvailability';
import { useBusinessHoursProtected } from '@/hooks/business/useBusinessHoursProtected';
import { useAccountDetails } from '@/hooks/business/useAccountDetails';
import { useStates } from '@/hooks/city/useStates';
import { editService, addService, deleteService, DeleteServiceRequest } from '@/services/service/service';
import { editWorkingHours, addAccountDetails, AddAccountDetailsRequest } from '@/services/business/business';
import { convertWorkingHoursToApiFormat } from '@/components/provider/EditWorkingHoursModal';
import type { Service, EditServiceRequest, AddServiceRequest } from '@/types';

type TabType = 'business-info' | 'location-availability' | 'services-pricing' | 'gallery' | 'payment-account';

const tabs = [
  { id: 'business-info' as TabType, label: 'Business Info' },
  { id: 'location-availability' as TabType, label: 'Location & Availability' },
  { id: 'services-pricing' as TabType, label: 'Services & Pricing' },
  { id: 'gallery' as TabType, label: 'Gallery' },
  { id: 'payment-account' as TabType, label: 'Payment Account' }
];

// Account name options for payment account
const accountNameOptions = [
  { value: 'savings', label: 'Savings' },
  { value: 'current', label: 'Current' },
  { value: 'business', label: 'Business' },
  { value: 'checking', label: 'Checking' }
];

// Helper function to get category name by ID
const getCategoryNameById = (categoryId: string, categories: Array<{ id: string; name: string }>): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category?.name || 'Not specified';
};

// Helper function to convert Unix timestamp to HH:MM format
const timestampToTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Helper function to convert day number to day key
const dayNumberToKey = (dayNumber: number): string => {
  // API: 1 = Monday, 2 = Tuesday, ..., 6 = Saturday, 0 = Sunday
  const dayMap: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
  };
  return dayMap[dayNumber] || '';
};

const getCityLabel = (cityValue: string) => {
  const cityMap: Record<string, string> = {
    'kuala-lumpur': 'Kuala Lumpur',
    'petaling-jaya': 'Petaling Jaya',
    'shah-alam': 'Shah Alam',
    'klang': 'Klang',
    'subang-jaya': 'Subang Jaya',
    'cheras': 'Cheras',
    'ampang': 'Ampang',
    'springfield': 'Springfield',
    'other': 'Other'
  };
  return cityMap[cityValue] || cityValue;
};

const getStateLabel = (stateValue: string) => {
  const stateMap: Record<string, string> = {
    'selangor': 'Selangor',
    'kuala-lumpur': 'Kuala Lumpur',
    'penang': 'Penang',
    'johor': 'Johor',
    'perak': 'Perak',
    'kedah': 'Kedah',
    'kelantan': 'Kelantan',
    'terengganu': 'Terengganu',
    'pahang': 'Pahang',
    'negeri-sembilan': 'Negeri Sembilan',
    'melaka': 'Melaka',
    'sabah': 'Sabah',
    'sarawak': 'Sarawak',
    'illinois': 'Illinois',
    'new-york': 'New York',
    'other': 'Other'
  };
  return stateMap[stateValue] || stateValue;
};

// Helper function to format time from 24-hour to 12-hour format
const formatTimeDisplay = (time24: string): string => {
  const [hour, minute] = time24.split(':').map(Number);
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

// Helper function to format working hours for display
const formatWorkingHoursDisplay = (schedule: { isOpen: boolean; startTime: string; endTime: string }): string => {
  if (!schedule.isOpen) return 'Closed';
  return `${formatTimeDisplay(schedule.startTime)} to ${formatTimeDisplay(schedule.endTime)}`;
};

// Initial working hours data
const initialWorkingHoursData: Record<string, { isOpen: boolean; startTime: string; endTime: string }> = {
  monday: { isOpen: true, startTime: '09:00', endTime: '22:00' },
  tuesday: { isOpen: true, startTime: '09:00', endTime: '22:00' },
  wednesday: { isOpen: true, startTime: '09:00', endTime: '22:00' },
  thursday: { isOpen: true, startTime: '09:00', endTime: '22:00' },
  friday: { isOpen: true, startTime: '09:00', endTime: '22:00' },
  saturday: { isOpen: true, startTime: '09:00', endTime: '22:00' },
  sunday: { isOpen: true, startTime: '09:00', endTime: '22:00' }
};

const daysDisplayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayKeyMap: Record<string, string> = {
  'Sunday': 'sunday',
  'Monday': 'monday',
  'Tuesday': 'tuesday',
  'Wednesday': 'wednesday',
  'Thursday': 'thursday',
  'Friday': 'friday',
  'Saturday': 'saturday'
};

// Helper function to format duration from minutes to display format
const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
};

// Helper function to format price
const formatPrice = (price: number): string => {
  return `RM ${price.toFixed(2)}`;
};

export default function ListingPage() {
  const { user, authToken } = useAuth();
  const businessId = user?.businessId || '';
  const userId = user?.id || '';
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get tab from URL or default to 'business-info'
  const getTabFromUrl = (): TabType => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabs.some(tab => tab.id === tabParam)) {
      return tabParam as TabType;
    }
    return 'business-info';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getTabFromUrl);

  // Fetch business info from API - only when business-info tab is active
  const { data: businessInfoData, isLoading, error, refetch } = useBusinessInfo(
    businessId, 
    userId, 
    activeTab === 'business-info'
  );
  
  // Fetch categories to map category ID to name - always enabled (used in modals)
  const { data: categories = [] } = useCategories();

  // Fetch states for location modal - always enabled (used in modals)
  const { data: states = [] } = useStates();

  // Fetch location availability - only when location-availability tab is active
  const { 
    data: locationAvailabilityData, 
    isLoading: isLoadingLocation, 
    error: locationError,
    refetch: refetchLocation 
  } = useLocationAvailability(businessId, userId, activeTab === 'location-availability');

  // Fetch business hours - only when location-availability tab is active
  const { 
    data: businessHoursData, 
    isLoading: isLoadingHours, 
    error: hoursError,
    refetch: refetchHours 
  } = useBusinessHoursProtected(businessId, activeTab === 'location-availability');

  // Fetch services - only when services-pricing tab is active
  const { 
    data: servicesData = [], 
    isLoading: isLoadingServices, 
    error: servicesError,
    refetch: refetchServices 
  } = useServices(businessId, userId, activeTab === 'services-pricing');

  // Fetch business images - only when gallery tab is active
  const { 
    data: businessImagesData, 
    isLoading: isLoadingImages, 
    error: imagesError 
  } = useBusinessImages(businessId, activeTab === 'gallery');

  // Fetch account details - only when payment-account tab is active
  const { 
    data: accountDetailsData, 
    isLoading: isLoadingAccountDetails, 
    error: accountDetailsError,
    refetch: refetchAccountDetails 
  } = useAccountDetails(businessId, userId, activeTab === 'payment-account');

  // Sync tab state with URL when URL changes (browser back/forward navigation)
  useEffect(() => {
    const tabFromUrl = getTabFromUrl();
    setActiveTab(tabFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', tab);
    router.replace(`?${params.toString()}`, { scroll: false });
  };
  const [isEditing, setIsEditing] = useState(false);
  const [isOnlineConsultancyEnabled, setIsOnlineConsultancyEnabled] = useState(true);
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDeleteServiceModalOpen, setIsDeleteServiceModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isEditBusinessInfoModalOpen, setIsEditBusinessInfoModalOpen] = useState(false);
  const [isEditGalleryModalOpen, setIsEditGalleryModalOpen] = useState(false);
  const [businessData, setBusinessData] = useState({
    businessName: '',
    categoryId: '', // Category ID from API
    categoryName: '', // Category name mapped from ID
    phoneNumber: '',
    socialMedia: '',
    registrationNumber: '',
    description: ''
  });
  const [locationData, setLocationData] = useState({
    address: '',
    cityId: '',
    cityName: '', // For display
    stateId: '',
    stateName: '', // For display
    postalCode: ''
  });
  const [isEditLocationModalOpen, setIsEditLocationModalOpen] = useState(false);
  const [workingHoursData, setWorkingHoursData] = useState<Record<string, { isOpen: boolean; startTime: string; endTime: string }>>({});
  const [isEditWorkingHoursModalOpen, setIsEditWorkingHoursModalOpen] = useState(false);
  const [paymentAccountData, setPaymentAccountData] = useState({
    accountName: '',
    accountNumber: '',
    bankName: ''
  });
  const [accountDetailsErrors, setAccountDetailsErrors] = useState<{
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
  }>({});

  // Update business data when API data is fetched
  useEffect(() => {
    if (businessInfoData?.payload && categories.length > 0) {
      const payload = businessInfoData.payload;
      const categoryId = payload.business_category_id || '';
      const categoryName = getCategoryNameById(categoryId, categories);
      
      setBusinessData({
        businessName: payload.business_name || '',
        categoryId: categoryId,
        categoryName: categoryName,
        phoneNumber: payload.phone_number || '',
        socialMedia: payload.social_media_url || '',
        registrationNumber: payload.business_registration_number || '',
        description: payload.description || ''
      });
    }
  }, [businessInfoData, categories]);

  // Update location data when API data is fetched
  useEffect(() => {
    if (locationAvailabilityData?.payload) {
      const payload = locationAvailabilityData.payload;
      setLocationData({
        address: payload.address_line_1 || '',
        cityId: payload.cities_id || '',
        cityName: payload.city_name || '', // For display
        stateId: payload.state_id || '',
        stateName: payload.state_name || '', // For display
        postalCode: payload.postal_code || ''
      });
      setIsOnlineConsultancyEnabled(payload.is_free_consultancy || false);
    }
  }, [locationAvailabilityData]);

  // Update working hours data when API data is fetched
  useEffect(() => {
    if (businessHoursData?.payload?.business_hours) {
      const hours = businessHoursData.payload.business_hours;
      const formattedHours: Record<string, { isOpen: boolean; startTime: string; endTime: string }> = {};
      
      hours.forEach((hour: { day: number; is_open: boolean; start_time: number; end_time: number }) => {
        const dayKey = dayNumberToKey(hour.day);
        if (dayKey) {
          formattedHours[dayKey] = {
            isOpen: hour.is_open,
            startTime: timestampToTime(hour.start_time),
            endTime: timestampToTime(hour.end_time)
          };
        }
      });
      
      setWorkingHoursData(formattedHours);
    }
  }, [businessHoursData]);

  // Update payment account data when API data is fetched
  useEffect(() => {
    if (accountDetailsData?.payload) {
      const payload = accountDetailsData.payload;
      setPaymentAccountData({
        accountName: payload.account_name || '',
        accountNumber: payload.account_number || '',
        bankName: payload.bank_name || ''
      });
    }
  }, [accountDetailsData]);

  const handleEdit = () => {
    setIsEditBusinessInfoModalOpen(true);
  };

  const handleLocationEdit = () => {
    setIsEditLocationModalOpen(true);
  };

  const handleWorkingHoursEdit = () => {
    setIsEditWorkingHoursModalOpen(true);
  };

  // Mutation for editing working hours
  const editWorkingHoursMutation = useMutation({
    mutationFn: (payload: { business_id: string; user_id: string; working_hours: Array<{ day: number; is_open: boolean; start_time: number; end_time: number }> }) => {
      if (!authToken) {
        throw new Error('Authentication token not available');
      }
      console.log('Calling editWorkingHours API with payload:', payload);
      return editWorkingHours(payload, authToken);
    },
    onSuccess: (response) => {
      console.log('Working hours updated successfully:', response);
      // Close the modal
      setIsEditWorkingHoursModalOpen(false);
      // Refetch working hours to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ['business-hours', businessId] });
      refetchHours();
    },
    onError: (error: Error) => {
      console.error('Failed to update working hours:', error);
      alert(`Failed to update working hours: ${error.message}`);
    },
  });

  const handleSaveWorkingHours = async (data: Record<string, { isOpen: boolean; startTime: string; endTime: string }>) => {
    // Ensure all 7 days are present in the data
    const allDaysData: Record<string, { isOpen: boolean; startTime: string; endTime: string }> = {};
    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    dayKeys.forEach(dayKey => {
      // Use provided data if available, otherwise use defaults
      allDaysData[dayKey] = data[dayKey] || {
        isOpen: true,
        startTime: '09:00',
        endTime: '18:00'
      };
    });
    
    // Convert working hours data to API format (all 7 days)
    const workingHoursApiFormat = convertWorkingHoursToApiFormat(allDaysData);
    
    // Prepare payload with all days (as required by API)
    const payload = {
      business_id: businessId,
      user_id: userId,
      working_hours: workingHoursApiFormat
    };
    
    // Debug: Log the payload being sent
    console.log('Sending working hours payload:', JSON.stringify(payload, null, 2));
    console.log('Working hours array:', workingHoursApiFormat);
    
    // Call the mutation
    editWorkingHoursMutation.mutate(payload);
    
    // Update local state immediately for better UX
    setWorkingHoursData(allDaysData);
  };

  const handleAddService = () => {
    setEditingService(null);
    setIsAddServiceModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsAddServiceModalOpen(true);
  };

  // Mutation for adding service
  const addServiceMutation = useMutation({
    mutationFn: (payload: AddServiceRequest) => {
      if (!authToken) {
        throw new Error('Authentication token not available');
      }
      return addService(payload, authToken);
    },
    onSuccess: () => {
      // Refetch services to get the updated list
      queryClient.invalidateQueries({ queryKey: ['services', businessId, userId] });
      setIsAddServiceModalOpen(false);
      setEditingService(null);
    },
    onError: (error: Error) => {
      console.error('Failed to add service:', error);
      // Error will be handled by the UI (you could add toast notification here)
      alert(`Failed to add service: ${error.message}`);
    },
  });

  // Mutation for editing service
  const editServiceMutation = useMutation({
    mutationFn: (payload: EditServiceRequest) => {
      if (!authToken) {
        throw new Error('Authentication token not available');
      }
      return editService(payload, authToken);
    },
    onSuccess: (response) => {
      // Update the services query cache with the updated service from response
      queryClient.setQueryData<Service[]>(['services', businessId, userId], (oldData) => {
        if (!oldData) return oldData;
        // Replace the edited service with the updated one from the API response
        return oldData.map(service => 
          service.id === response.payload.id ? response.payload : service
        );
      });
      // Also invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['services', businessId, userId] });
      setIsAddServiceModalOpen(false);
      setEditingService(null);
    },
    onError: (error: Error) => {
      console.error('Failed to update service:', error);
      // Error will be handled by the UI (you could add toast notification here)
      alert(`Failed to update service: ${error.message}`);
    },
  });

  // Mutation for deleting service
  const deleteServiceMutation = useMutation({
    mutationFn: (payload: DeleteServiceRequest) => {
      if (!authToken) {
        throw new Error('Authentication token not available');
      }
      return deleteService(payload, authToken);
    },
    onSuccess: () => {
      // Refetch services to get the updated list
      queryClient.invalidateQueries({ queryKey: ['services', businessId, userId] });
      setIsDeleteServiceModalOpen(false);
      setServiceToDelete(null);
      refetchServices();
    },
    onError: (error: Error) => {
      console.error('Failed to delete service:', error);
      alert(`Failed to delete service: ${error.message}`);
    },
  });

  const handleDeleteService = (serviceId: string) => {
    const service = servicesData.find(s => s.id === serviceId);
    if (service) {
      setServiceToDelete(service);
      setIsDeleteServiceModalOpen(true);
    }
  };

  const handleConfirmDeleteService = () => {
    if (serviceToDelete && businessId && userId) {
      const payload: DeleteServiceRequest = {
        user_id: userId,
        service_id: serviceToDelete.id,
        business_id: businessId,
      };
      deleteServiceMutation.mutate(payload);
    }
  };

  // Check if all account fields are empty
  const areAccountFieldsEmpty = () => {
    const payload = accountDetailsData?.payload;
    if (!payload) return true;
    return (
      (!payload.account_name || payload.account_name.trim() === '') &&
      (!payload.account_number || payload.account_number.trim() === '') &&
      (!payload.bank_name || payload.bank_name.trim() === '')
    );
  };

  const isAccountDetailsEditable = areAccountFieldsEmpty();

  // Validation function for account details
  const validateAccountDetails = (): boolean => {
    const errors: { accountName?: string; accountNumber?: string; bankName?: string } = {};
    
    if (!paymentAccountData.accountName.trim()) {
      errors.accountName = 'Account name is required';
    }
    
    if (!paymentAccountData.accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (!/^\d+$/.test(paymentAccountData.accountNumber.trim())) {
      errors.accountNumber = 'Account number must contain only numbers';
    } else if (paymentAccountData.accountNumber.trim().length < 8) {
      errors.accountNumber = 'Account number must be at least 8 digits';
    }
    
    if (!paymentAccountData.bankName.trim()) {
      errors.bankName = 'Bank name is required';
    } else if (paymentAccountData.bankName.trim().length < 2) {
      errors.bankName = 'Bank name must be at least 2 characters';
    }
    
    setAccountDetailsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate individual field
  const validateField = (fieldName: 'accountName' | 'accountNumber' | 'bankName', value: string) => {
    const errors = { ...accountDetailsErrors };
    
    if (fieldName === 'accountName') {
      if (!value.trim()) {
        errors.accountName = 'Account name is required';
      } else {
        delete errors.accountName;
      }
    } else if (fieldName === 'accountNumber') {
      if (!value.trim()) {
        errors.accountNumber = 'Account number is required';
      } else if (!/^\d+$/.test(value.trim())) {
        errors.accountNumber = 'Account number must contain only numbers';
      } else if (value.trim().length < 8) {
        errors.accountNumber = 'Account number must be at least 8 digits';
      } else {
        delete errors.accountNumber;
      }
    } else if (fieldName === 'bankName') {
      if (!value.trim()) {
        errors.bankName = 'Bank name is required';
      } else if (value.trim().length < 2) {
        errors.bankName = 'Bank name must be at least 2 characters';
      } else {
        delete errors.bankName;
      }
    }
    
    setAccountDetailsErrors(errors);
  };

  // Mutation for adding account details
  const addAccountDetailsMutation = useMutation({
    mutationFn: (payload: AddAccountDetailsRequest) => {
      if (!authToken) {
        throw new Error('Authentication token not available');
      }
      return addAccountDetails(payload, authToken);
    },
    onSuccess: () => {
      // Refetch account details to get the updated data
      queryClient.invalidateQueries({ queryKey: ['accountDetails', businessId, userId] });
      refetchAccountDetails();
      setAccountDetailsErrors({});
    },
    onError: (error: Error) => {
      console.error('Failed to add account details:', error);
      alert(`Failed to save account details: ${error.message}`);
    },
  });

  const handleSaveAccountDetails = () => {
    if (!validateAccountDetails()) {
      return;
    }

    if (!businessId || !userId) {
      alert('Business ID or User ID is missing');
      return;
    }

    const payload: AddAccountDetailsRequest = {
      user_id: userId,
      business_id: businessId,
      account_name: paymentAccountData.accountName.trim(),
      account_number: paymentAccountData.accountNumber.trim(),
      bank_name: paymentAccountData.bankName.trim(),
    };

    addAccountDetailsMutation.mutate(payload);
  };

  const handleServiceSave = (service: { id: string; name: string; description: string; price: number; duration: number }) => {
    if (editingService) {
      // Edit existing service
      const payload: EditServiceRequest = {
        business_id: businessId,
        user_id: userId,
        service_id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
      };
      editServiceMutation.mutate(payload);
    } else {
      // Add new service
      const payload: AddServiceRequest = {
        business_id: businessId,
        user_id: userId,
        name: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
      };
      addServiceMutation.mutate(payload);
    }
  };

  return (
    <div className="bg-[#f8f9f8] min-h-screen relative">
      {/* Sidebar */}
      <ProviderSidebar />

      {/* Main Content */}
      <div className="lg:ml-[248px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f8f9f8]">
          <div className="flex items-center pl-16 sm:pl-6 lg:pl-9 pr-4 sm:pr-6 lg:pr-9 py-3">
            <h1 
              className="text-lg sm:text-xl font-bold text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 700,
                lineHeight: '28px'
              }}
            >
              Listing Management
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 lg:p-4">
          {/* Tab Navigation */}
          <div className="flex items-end border-b border-[#e5e7ea] mb-4 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 sm:px-4 py-2 sm:py-3 transition-colors relative min-h-[36px] flex-shrink-0 whitespace-nowrap text-[13px] sm:text-[14px] cursor-pointer ${
                    isActive
                      ? 'text-black'
                      : 'text-[#797e84] hover:text-black'
                  }`}
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: isActive ? 500 : 400,
                    lineHeight: '20px'
                  }}
                >
                  {tab.label}
                  {isActive && (
                    <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'business-info' && (
              <div className="bg-white rounded-lg p-4 sm:p-5">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                  <div className="flex gap-1.5 items-center">
                    <Store size={20} className="text-black" />
                    <h2 
                      className="text-base font-semibold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 600,
                        lineHeight: '24px'
                      }}
                    >
                      Business Info
                    </h2>
                  </div>
                  <button
                    onClick={handleEdit}
                    disabled={isLoading || !!error}
                    className="flex gap-2 items-center px-4 py-1.5 border border-[#e5e7ea] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Pencil size={18} className="text-black" />
                    <span 
                      className="text-base text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      Edit
                    </span>
                  </button>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#e5e7ea] border-t-[#6290f2] rounded-full animate-spin"></div>
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Loading business information...
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3 max-w-md">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                        <AlertCircle size={24} className="text-red-500" />
                      </div>
                      <p 
                        className="text-sm text-red-600 text-center"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '20px'
                        }}
                      >
                        {error instanceof Error ? error.message : 'Failed to load business information'}
                      </p>
                      <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-[#6290f2] text-white rounded-lg hover:bg-[#5580e0] transition-colors cursor-pointer"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px'
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Business Info Fields */}
                {!isLoading && !error && (
                <div className="flex flex-col gap-4 sm:gap-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="flex flex-col gap-2">
                      <label 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Business Name
                      </label>
                      <div 
                        className="text-base text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {businessData.businessName}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Category
                      </label>
                      <div 
                        className="text-base text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {businessData.categoryName || 'Not specified'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Business Phone Number
                      </label>
                      <div 
                        className="text-base text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {businessData.phoneNumber}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Social Media
                      </label>
                      <div 
                        className="text-base text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {businessData.socialMedia}
                      </div>
                    </div>
                  </div>

                  {/* Business Registration Number */}
                  <div className="flex flex-col gap-2">
                    <label 
                      className="text-sm text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      Business Registration Number
                    </label>
                    <div 
                      className="text-base text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      {businessData.registrationNumber}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="flex flex-col gap-2">
                    <label 
                      className="text-sm text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      Description
                    </label>
                    <div 
                      className="text-base text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      {businessData.description}
                    </div>
                  </div>
                </div>
                )}

                {/* Edit Business Info Modal */}
                <EditBusinessInfoModal
                  isOpen={isEditBusinessInfoModalOpen}
                  onClose={() => setIsEditBusinessInfoModalOpen(false)}
                  businessId={businessId}
                  userId={userId}
                  categories={categories}
                  initialData={{
                    businessName: businessData.businessName,
                    categoryId: businessData.categoryId,
                    businessRegistrationNumber: businessData.registrationNumber,
                    description: businessData.description,
                    phoneNumber: businessData.phoneNumber,
                    socialMedia: businessData.socialMedia
                  }}
                />
              </div>
            )}

            {activeTab === 'location-availability' && (
              <div className="flex flex-col gap-4">
                {/* Location Section */}
                <div className="bg-white rounded-lg p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                    <div className="flex gap-1.5 items-center">
                      <MapPin size={20} className="text-black" />
                      <h2 
                        className="text-base font-semibold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '24px'
                        }}
                      >
                        Location
                      </h2>
                    </div>
                    <button
                      onClick={handleLocationEdit}
                      disabled={isLoadingLocation || !!locationError}
                      className="flex gap-2 items-center px-4 py-1.5 border border-[#e5e7ea] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Pencil size={18} className="text-black" />
                      <span 
                        className="text-base text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        Edit
                      </span>
                    </button>
                  </div>

                  {/* Loading State */}
                  {isLoadingLocation && (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#e5e7ea] border-t-[#6290f2] rounded-full animate-spin"></div>
                        <p 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          Loading location information...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {locationError && !isLoadingLocation && (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3 max-w-md">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                          <AlertCircle size={24} className="text-red-500" />
                        </div>
                        <p 
                          className="text-sm text-red-600 text-center"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            lineHeight: '20px'
                          }}
                        >
                          {locationError instanceof Error ? locationError.message : 'Failed to load location information'}
                        </p>
                        <button
                          onClick={() => refetchLocation()}
                          className="px-4 py-2 bg-[#6290f2] text-white rounded-lg hover:bg-[#5580e0] transition-colors cursor-pointer"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px'
                          }}
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Location Data */}
                  {!isLoadingLocation && !locationError && (
                  <div className="flex flex-col gap-6">
                    {/* Address */}
                    <div className="flex flex-col gap-2">
                      <label 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Address
                      </label>
                      <div 
                        className="text-base text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {locationData.address}
                      </div>
                    </div>

                    {/* City, State, Postal Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                      <div className="flex flex-col gap-2">
                        <label 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          City
                        </label>
                        <div 
                          className="text-base text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px'
                          }}
                        >
                          {locationData.cityName || 'Not specified'}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          State
                        </label>
                        <div 
                          className="text-base text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px'
                          }}
                        >
                          {locationData.stateName || 'Not specified'}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          Postal Code
                        </label>
                        <div 
                          className="text-base text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px'
                          }}
                        >
                          {locationData.postalCode}
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Edit Location Modal */}
                  <EditLocationModal
                    isOpen={isEditLocationModalOpen}
                    onClose={() => setIsEditLocationModalOpen(false)}
                    businessId={businessId}
                    userId={userId}
                    states={states}
                    initialData={{
                      address: locationData.address,
                      cityId: locationData.cityId,
                      stateId: locationData.stateId,
                      postalCode: locationData.postalCode
                    }}
                  />
                </div>

                {/* Working Hours Section */}
                <div className="bg-white rounded-lg p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                    <div className="flex gap-1.5 items-center">
                      <Calendar size={20} className="text-black" />
                      <h2 
                        className="text-base font-semibold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '24px'
                        }}
                      >
                        Working Hours
                      </h2>
                    </div>
                    <button
                      onClick={handleWorkingHoursEdit}
                      disabled={isLoadingHours || !!hoursError}
                      className="flex gap-2 items-center px-4 py-1.5 border border-[#e5e7ea] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <Pencil size={18} className="text-black" />
                      <span 
                        className="text-base text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        Edit
                      </span>
                    </button>
                  </div>

                  {/* Loading State */}
                  {isLoadingHours && (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-[#e5e7ea] border-t-[#6290f2] rounded-full animate-spin"></div>
                        <p 
                          className="text-sm text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px'
                          }}
                        >
                          Loading working hours...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {hoursError && !isLoadingHours && (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex flex-col items-center gap-3 max-w-md">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                          <AlertCircle size={24} className="text-red-500" />
                        </div>
                        <p 
                          className="text-sm text-red-600 text-center"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            lineHeight: '20px'
                          }}
                        >
                          {hoursError instanceof Error ? hoursError.message : 'Failed to load working hours'}
                        </p>
                        <button
                          onClick={() => refetchHours()}
                          className="px-4 py-2 bg-[#6290f2] text-white rounded-lg hover:bg-[#5580e0] transition-colors cursor-pointer"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px'
                          }}
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Working Hours Data */}
                  {!isLoadingHours && !hoursError && (
                  <div className="flex flex-col gap-0">
            <label
              className="text-sm text-[#797e84] mb-4"
              style={{
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '20px'
              }}
            >
              Working Hours
            </label>
            <div className="flex flex-col gap-0">
              {daysDisplayOrder.map((day, index) => {
                const dayKey = dayKeyMap[day];
                const schedule = workingHoursData[dayKey] || { isOpen: false, startTime: '09:00', endTime: '18:00' };
                const displayTime = formatWorkingHoursDisplay(schedule);
                
                // Skip if no data available yet
                if (Object.keys(workingHoursData).length === 0) {
                  return null;
                }
                
                return (
                  <div key={day}>
                    <div className="flex items-center justify-between py-3">
                      <p
                        className="text-base text-black w-[100px]"
                        style={{
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {day}
                      </p>
                      <p
                        className="text-base text-[#797e84]"
                        style={{
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '24px'
                        }}
                      >
                        {displayTime}
                      </p>
                    </div>
                    {index < daysDisplayOrder.length - 1 && (
                      <div className="h-px bg-gray-200" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          )}

          {/* Edit Working Hours Modal */}
          <EditWorkingHoursModal
            isOpen={isEditWorkingHoursModalOpen}
            onClose={() => setIsEditWorkingHoursModalOpen(false)}
            onSave={handleSaveWorkingHours}
            initialData={workingHoursData}
            isLoading={editWorkingHoursMutation.isPending}
          />
        </div>

                {/* Online Consultancy Toggle */}
                <div className="bg-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-1.5 items-center">
                      <Video size={20} className="text-black" />
                      <h3 
                        className="text-base font-semibold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '24px'
                        }}
                      >
                        Free Online Consultancy Available
                      </h3>
                    </div>
                    <p 
                      className="text-base text-[#797e84]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      Offer customers a free initial consultation online
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOnlineConsultancyEnabled(!isOnlineConsultancyEnabled)}
                    className={`relative inline-flex h-6 w-9 items-center rounded-full transition-colors cursor-pointer ${
                      isOnlineConsultancyEnabled ? 'bg-[#6290f2]' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isOnlineConsultancyEnabled ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'services-pricing' && (
              <div className="bg-white rounded-lg p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                  <div className="flex gap-1.5 items-center">
                    <Tag size={20} className="text-black" />
                    <h2 
                      className="text-base font-semibold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 600,
                        lineHeight: '24px'
                      }}
                    >
                      Services & Pricing
                    </h2>
                  </div>
                  <button
                    onClick={handleAddService}
                    className="flex gap-2 items-center px-4 py-1.5 border border-[#e5e7ea] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <Plus size={18} className="text-black" />
                    <span 
                      className="text-base text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px'
                      }}
                    >
                      Add Service
                    </span>
                  </button>
                </div>

                {/* Loading State */}
                {isLoadingServices && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#e5e7ea] border-t-[#6290f2] rounded-full animate-spin"></div>
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Loading services...
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {servicesError && !isLoadingServices && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3 max-w-md">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                        <AlertCircle size={24} className="text-red-500" />
                      </div>
                      <p 
                        className="text-sm text-red-600 text-center"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '20px'
                        }}
                      >
                        {servicesError instanceof Error ? servicesError.message : 'Failed to load services'}
                      </p>
                      <button
                        onClick={() => refetchServices()}
                        className="px-4 py-2 bg-[#6290f2] text-white rounded-lg hover:bg-[#5580e0] transition-colors cursor-pointer"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px'
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Services List */}
                {!isLoadingServices && !servicesError && (
                  <div className="flex flex-col gap-5">
                    {servicesData.length === 0 ? (
                      <div className="flex items-center justify-center py-12">
                        <p 
                          className="text-base text-[#797e84]"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px'
                          }}
                        >
                          No services found. Add your first service to get started.
                        </p>
                      </div>
                    ) : (
                      servicesData.map((service, index) => (
                    <div key={service.id}>
                      <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 items-start pb-4 sm:pb-5">
                        <div className="flex-1 flex flex-col gap-3">
                          <div className="flex flex-col gap-1">
                            <h3 
                              className="text-base font-semibold text-black"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 600,
                                lineHeight: '24px'
                              }}
                            >
                              {service.name}
                            </h3>
                            {service.description && (
                              <p 
                                className="text-base text-[#797e84]"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                {service.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2 items-center">
                              <Clock size={18} className="text-[#797e84]" />
                              <p 
                                className="text-base text-[#797e84]"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                {formatDuration(service.duration_minutes)}
                              </p>
                            </div>
                            <div className="flex gap-2 items-center">
                              <Tag size={18} className="text-[#797e84]" />
                              <p 
                                className="text-base text-[#797e84]"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                {formatPrice(service.price)}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => handleEditService(service)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            title="Edit service"
                          >
                            <Pencil size={20} className="text-black" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            title="Delete service"
                          >
                            <Trash2 size={20} className="text-black" />
                          </button>
                        </div>
                      </div>
                      {index < servicesData.length - 1 && (
                        <div className="h-px bg-gray-200" />
                      )}
                    </div>
                    ))
                    )}
                  </div>
                )}

                {/* Add Service Modal */}
                <AddServiceModal
                  isOpen={isAddServiceModalOpen}
                  onClose={() => {
                    if (!editServiceMutation.isPending && !addServiceMutation.isPending) {
                      setIsAddServiceModalOpen(false);
                      setEditingService(null);
                    }
                  }}
                  onAdd={handleServiceSave}
                  editingService={editingService ? {
                    id: editingService.id,
                    name: editingService.name,
                    description: editingService.description || '',
                    price: editingService.price,
                    duration: editingService.duration_minutes
                  } : null}
                  isLoading={editServiceMutation.isPending || addServiceMutation.isPending}
                />

                {/* Delete Service Modal */}
                <DeleteServiceModal
                  isOpen={isDeleteServiceModalOpen}
                  onClose={() => {
                    if (!deleteServiceMutation.isPending) {
                      setIsDeleteServiceModalOpen(false);
                      setServiceToDelete(null);
                    }
                  }}
                  onConfirm={handleConfirmDeleteService}
                  serviceName={serviceToDelete?.name}
                  isLoading={deleteServiceMutation.isPending}
                />
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="bg-white rounded-lg p-4 sm:p-5 lg:p-5">
                <div className="flex flex-col gap-4">
                  {/* Gallery Header */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex gap-1.5 items-center">
                      <ImageIcon className="w-5 h-5 text-black" />
                      <h2 
                        className="text-base font-semibold text-black"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '24px'
                        }}
                      >
                        Gallery
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsEditGalleryModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-1.5 border border-[#e5e7ea] rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '24px',
                        fontSize: '16px'
                      }}
                    >
                      <Pencil className="w-[18px] h-[18px] text-black" />
                      <span className="text-black">Edit</span>
                    </button>
                  </div>

                  {/* Gallery Images Grid */}
                  {isLoadingImages ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-[#797e84]">Loading images...</p>
                    </div>
                  ) : imagesError ? (
                    <div className="flex items-center justify-center py-12">
                      <p className="text-red-500">Failed to load images</p>
                    </div>
                  ) : (() => {
                    const images = businessImagesData?.payload && !businessImagesData.payload.is_deleted
                      ? businessImagesData.payload.business_images.filter(img => img.image && img.image.trim() !== '')
                      : [];

                    if (images.length === 0) {
                      return (
                        <div className="flex items-center justify-center py-12">
                          <p className="text-[#797e84]">No images available</p>
                        </div>
                      );
                    }

                    return (
                      <div 
                        className="flex flex-wrap gap-4"
                      >
                        {images.map((imageItem, index) => (
                          <div
                            key={index}
                            className="relative flex-shrink-0 w-[200px] h-[160px] rounded-xl overflow-hidden bg-[#e0e2e6]"
                          >
                            <img
                              src={imageItem.image}
                              alt={`Gallery image ${index + 1}`}
                              className="w-full h-full object-cover rounded-xl"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {activeTab === 'payment-account' && (
              <div className="bg-white rounded-lg p-4 sm:p-5">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                  <div className="flex gap-1.5 items-center">
                    <CreditCard size={20} className="text-black" />
                    <h2 
                      className="text-base font-semibold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 600,
                        lineHeight: '24px'
                      }}
                    >
                      Payment Account
                    </h2>
                  </div>
                </div>

                {/* Loading State */}
                {isLoadingAccountDetails && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#e5e7ea] border-t-[#6290f2] rounded-full animate-spin"></div>
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        Loading account details...
                      </p>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {accountDetailsError && !isLoadingAccountDetails && (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-3 max-w-md">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50">
                        <AlertCircle size={24} className="text-red-500" />
                      </div>
                      <p 
                        className="text-sm text-red-600 text-center"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '20px'
                        }}
                      >
                        {accountDetailsError instanceof Error ? accountDetailsError.message : 'Failed to load account details'}
                      </p>
                      <button
                        onClick={() => refetchAccountDetails()}
                        className="px-4 py-2 bg-[#6290f2] text-white rounded-lg hover:bg-[#5580e0] transition-colors cursor-pointer"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          fontSize: '14px'
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}

                {/* Payment Account Form */}
                {!isLoadingAccountDetails && !accountDetailsError && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormInput
                        label="Account Name"
                        type="text"
                        value={paymentAccountData.accountName}
                        onChange={(value) => {
                          setPaymentAccountData(prev => ({ ...prev, accountName: value }));
                          // Clear error when user starts typing
                          if (accountDetailsErrors.accountName) {
                            setAccountDetailsErrors(prev => ({ ...prev, accountName: undefined }));
                          }
                        }}
                        onBlur={() => {
                          if (isAccountDetailsEditable) {
                            validateField('accountName', paymentAccountData.accountName);
                          }
                        }}
                        placeholder="Enter"
                        required
                        className="flex-1"
                        disabled={!isAccountDetailsEditable}
                        readOnly={!isAccountDetailsEditable}
                        error={accountDetailsErrors.accountName}
                      />
                      <FormInput
                        label="Account Number"
                        type="text"
                        value={paymentAccountData.accountNumber}
                        onChange={(value) => {
                          // Only allow numbers
                          const numericValue = value.replace(/\D/g, '');
                          setPaymentAccountData(prev => ({ ...prev, accountNumber: numericValue }));
                          // Clear error when user starts typing
                          if (accountDetailsErrors.accountNumber) {
                            setAccountDetailsErrors(prev => ({ ...prev, accountNumber: undefined }));
                          }
                        }}
                        onBlur={() => {
                          if (isAccountDetailsEditable) {
                            validateField('accountNumber', paymentAccountData.accountNumber);
                          }
                        }}
                        placeholder="Enter"
                        required
                        className="flex-1"
                        disabled={!isAccountDetailsEditable}
                        readOnly={!isAccountDetailsEditable}
                        error={accountDetailsErrors.accountNumber}
                      />
                      <FormInput
                        label="Bank Name"
                        type="text"
                        value={paymentAccountData.bankName}
                        onChange={(value) => {
                          setPaymentAccountData(prev => ({ ...prev, bankName: value }));
                          // Clear error when user starts typing
                          if (accountDetailsErrors.bankName) {
                            setAccountDetailsErrors(prev => ({ ...prev, bankName: undefined }));
                          }
                        }}
                        onBlur={() => {
                          if (isAccountDetailsEditable) {
                            validateField('bankName', paymentAccountData.bankName);
                          }
                        }}
                        placeholder="Enter"
                        required
                        className="flex-1"
                        disabled={!isAccountDetailsEditable}
                        readOnly={!isAccountDetailsEditable}
                        error={accountDetailsErrors.bankName}
                      />
                    </div>

                    {/* Save Button - Only show when fields are editable */}
                    {isAccountDetailsEditable && (
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={handleSaveAccountDetails}
                          disabled={addAccountDetailsMutation.isPending}
                          className="px-6 py-2.5 bg-[#6290f2] text-white rounded-lg hover:bg-[#5580e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            fontSize: '14px',
                            lineHeight: '20px'
                          }}
                        >
                          {addAccountDetailsMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Gallery Modal */}
      <EditGalleryModal
        isOpen={isEditGalleryModalOpen}
        onClose={() => setIsEditGalleryModalOpen(false)}
        currentImages={
          businessImagesData?.payload && !businessImagesData.payload.is_deleted
            ? businessImagesData.payload.business_images.filter(img => img.image && img.image.trim() !== '')
            : []
        }
        businessId={businessId}
        userId={userId}
      />
    </div>
  );
}

