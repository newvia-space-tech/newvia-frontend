'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, ChevronDown } from 'lucide-react';
import FormInput from '@/components/provider/FormInput';
import FormSelect from '@/components/provider/FormSelect';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useStates } from '@/hooks/city/useStates';
import { useCitiesByState } from '@/hooks/city/useCitiesByState';
import { getAllCities } from '@/services/city/city';
import { useQuery } from '@tanstack/react-query';

interface FormErrors {
  businessAddress?: string;
  cityId?: string;
  stateId?: string;
  postalCode?: string;
  businessPhoneNumber?: string;
}

export default function Step2() {
  const step2Data = useOnboardingStore((state) => state.providerData.step2);
  const updateStep2Data = useOnboardingStore((state) => state.updateStep2Data);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const prevStep = useOnboardingStore((state) => state.prevStep);

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch states from API
  const { data: statesData, isLoading: statesLoading, error: statesError } = useStates();

  // Fetch all cities (for when no state is selected)
  const { data: allCitiesData, isLoading: allCitiesLoading } = useQuery({
    queryKey: ['allCities'],
    queryFn: async () => {
      const response = await getAllCities(1, 1000); // Get all cities
      return response.items;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch cities by selected state
  const { data: citiesByStateData, isLoading: citiesByStateLoading } = useCitiesByState(step2Data.stateId || null);

  // Determine which cities to show: if state is selected, show cities by state, otherwise show all cities
  const cities = step2Data.stateId ? citiesByStateData : allCitiesData;

  // Transform states data to dropdown format
  const states = statesData?.map(state => ({
    value: state.id,
    label: state.name
  })) ?? [];

  // Transform cities data to dropdown format
  const citiesOptions = cities?.map(city => ({
    value: city.id,
    label: city.name
  })) ?? [];

  // Reset city selection when state changes
  useEffect(() => {
    if (step2Data.stateId && step2Data.cityId) {
      // Check if the current city belongs to the selected state
      const cityBelongsToState = citiesByStateData?.some(city => city.id === step2Data.cityId);
      if (!cityBelongsToState) {
        updateStep2Data({ cityId: '' });
      }
    }
  }, [step2Data.stateId, citiesByStateData]);

  const timeOptions = [
    '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Business Address validation
    if (!step2Data.businessAddress.trim()) {
      newErrors.businessAddress = 'Business address is required';
    } else if (step2Data.businessAddress.trim().length < 10) {
      newErrors.businessAddress = 'Address must be at least 10 characters';
    } else if (step2Data.businessAddress.trim().length > 200) {
      newErrors.businessAddress = 'Address must not exceed 200 characters';
    }

    // State validation (must be selected first)
    if (!step2Data.stateId) {
      newErrors.stateId = 'Please select a state';
    }

    // City validation (requires state to be selected first)
    if (!step2Data.stateId) {
      newErrors.cityId = 'Please select a state first';
    } else if (!step2Data.cityId) {
      newErrors.cityId = 'Please select a city';
    }

    // Postal Code validation (Malaysian format: 5 digits)
    if (!step2Data.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{5}$/.test(step2Data.postalCode.trim())) {
      newErrors.postalCode = 'Postal code must be exactly 5 digits';
    }

    // Business Phone Number validation (optional but if provided, validate)
    if (step2Data.businessPhoneNumber.trim()) {
      // Malaysian phone format: 10-11 digits, optionally with country code
      if (!/^(\+?6?0)?[0-9]{9,11}$/.test(step2Data.businessPhoneNumber.trim().replace(/[\s-]/g, ''))) {
        newErrors.businessPhoneNumber = 'Please enter a valid phone number (10-11 digits)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: keyof FormErrors, value: string): string | undefined => {
    switch (field) {
      case 'businessAddress':
        if (!value.trim()) return 'Business address is required';
        if (value.trim().length < 10) return 'Address must be at least 10 characters';
        if (value.trim().length > 200) return 'Address must not exceed 200 characters';
        break;
      case 'postalCode':
        if (!value.trim()) return 'Postal code is required';
        if (!/^\d{5}$/.test(value.trim())) return 'Postal code must be exactly 5 digits';
        break;
      case 'businessPhoneNumber':
        if (value.trim() && !/^(\+?6?0)?[0-9]{9,11}$/.test(value.trim().replace(/[\s-]/g, ''))) {
          return 'Please enter a valid phone number (10-11 digits)';
        }
        break;
    }
    return undefined;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    // Special handling for state change - reset city when state changes and store state name
    if (field === 'stateId' && typeof value === 'string') {
      const selectedState = states.find(state => state.value === value);
      updateStep2Data({ 
        stateId: value,
        stateName: selectedState?.label || '',
        cityId: '',
        cityName: ''
      });
      // Clear both state and city errors
      setErrors(prev => ({ ...prev, stateId: undefined, cityId: undefined }));
      return;
    }
    
    // Special handling for city change - store city name along with ID
    if (field === 'cityId' && typeof value === 'string') {
      const selectedCity = citiesOptions.find(city => city.value === value);
      updateStep2Data({ 
        cityId: value,
        cityName: selectedCity?.label || ''
      });
      // Clear error
      if (errors.cityId) {
        setErrors(prev => ({ ...prev, cityId: undefined }));
      }
      return;
    }
    
    updateStep2Data({ [field]: value });
    // Clear error when user starts typing
    if (typeof value === 'string' && errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    const value = step2Data[field as keyof typeof step2Data] as string;
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    updateStep2Data({
      workingHours: {
        ...step2Data.workingHours,
        [day]: {
          ...step2Data.workingHours[day],
          [field]: value,
        },
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      nextStep();
    }
  };

  const handleBack = () => {
    prevStep();
  };

  const isFormValid = 
    step2Data.businessAddress.trim().length >= 10 &&
    step2Data.businessAddress.trim().length <= 200 &&
    step2Data.stateId && // State must be selected first
    step2Data.cityId && // City requires state
    /^\d{5}$/.test(step2Data.postalCode.trim()) &&
    (!step2Data.businessPhoneNumber.trim() || /^(\+?6?0)?[0-9]{9,11}$/.test(step2Data.businessPhoneNumber.trim().replace(/[\s-]/g, ''))) &&
    !statesLoading && // Ensure data is loaded
    !citiesByStateLoading &&
    !allCitiesLoading;

  return (
    <div className="max-w-[980px] mx-auto space-y-5">
      {/* Business Location */}
      <div className="bg-white rounded-xl p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-5">Business Location</h3>
        
        <div className="space-y-6">
          {/* Business Address */}
          <FormInput
            label="Business Address"
            value={step2Data.businessAddress}
            onChange={(value) => handleInputChange('businessAddress', value)}
            onBlur={() => handleBlur('businessAddress')}
            placeholder="Enter your full address"
            required
            error={errors.businessAddress}
            maxLength={200}
          />

          {/* State, City, Postal Code */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <FormSelect
              label="State"
              options={states}
              value={step2Data.stateId}
              onChange={(value) => handleInputChange('stateId', value)}
              placeholder={statesLoading ? "Loading..." : "Select"}
              required
              error={errors.stateId || (statesError ? "Failed to load states" : undefined)}
              className="flex-1"
            />
            <FormSelect
              label="City"
              options={citiesOptions}
              value={step2Data.cityId}
              onChange={(value) => handleInputChange('cityId', value)}
              placeholder={
                !step2Data.stateId 
                  ? "Select state first" 
                  : (step2Data.stateId && citiesByStateLoading) 
                  ? "Loading..." 
                  : allCitiesLoading 
                  ? "Loading..." 
                  : "Select"
              }
              required
              error={
                !step2Data.stateId 
                  ? "Please select a state first" 
                  : errors.cityId
              }
              className="flex-1"
            />
            <FormInput
              label="Postal Code"
              type="text"
              value={step2Data.postalCode}
              onChange={(value) => {
                // Only allow digits
                const numericValue = value.replace(/\D/g, '');
                handleInputChange('postalCode', numericValue);
              }}
              onBlur={() => handleBlur('postalCode')}
              placeholder="12345"
              required
              error={errors.postalCode}
              className="flex-1"
              maxLength={5}
              pattern="[0-9]{5}"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl p-4 sm:p-5">
        <h3 className="text-xl font-semibold text-black mb-5">Contact Information</h3>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <FormInput
            label="Business Phone Number"
            type="tel"
            value={step2Data.businessPhoneNumber}
            onChange={(value) => handleInputChange('businessPhoneNumber', value)}
            onBlur={() => handleBlur('businessPhoneNumber')}
            placeholder="0123456789"
            error={errors.businessPhoneNumber}
            className="flex-1"
            maxLength={15}
          />
          <FormInput
            label="Social Media"
            value={step2Data.socialMedia}
            onChange={(value) => handleInputChange('socialMedia', value)}
            placeholder="Enter"
            className="flex-1"
          />
        </div>
      </div>

      {/* Free Online Consultancy */}
      <div className="bg-white rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-black">Free Online Consultancy Available</h3>
            <p className="text-sm text-[#797e84]">Offer customers a free initial consultation online</p>
          </div>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => handleInputChange('freeOnlineConsultancy', !step2Data.freeOnlineConsultancy)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                step2Data.freeOnlineConsultancy ? 'bg-[#6290f2]' : 'bg-[#e5e7ea]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  step2Data.freeOnlineConsultancy ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-xl p-4 sm:p-5">
        <h3 className="text-xl font-semibold text-black mb-5">Working Hours</h3>
        
        <div className="space-y-4">
          {Object.entries(step2Data.workingHours).map(([day, hours]) => (
            <div key={day} className="flex items-center gap-3">
              <div className="w-[100px] text-base text-black">{day}</div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5">
                {/* Toggle */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleWorkingHoursChange(day, 'isOpen', !hours.isOpen)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      hours.isOpen ? 'bg-[#6290f2]' : 'bg-[#e5e7ea]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        hours.isOpen ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-[#797e84]">{hours.isOpen ? 'Open' : 'Close'}</span>
                </div>

                {/* Time Selectors */}
                {hours.isOpen && (
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <select
                        value={hours.startTime}
                        onChange={(e) => handleWorkingHoursChange(day, 'startTime', e.target.value)}
                        className="w-[100px] px-4 py-2.5 border border-[#e5e7ea] rounded-lg text-base text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                    
                    <span className="text-sm text-[#797e84]">to</span>
                    
                    <div className="relative">
                      <select
                        value={hours.endTime}
                        onChange={(e) => handleWorkingHoursChange(day, 'endTime', e.target.value)}
                        className="w-[100px] px-4 py-2.5 border border-[#e5e7ea] rounded-lg text-base text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-4 pt-3">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-3 rounded-lg flex items-center gap-2 text-base font-normal border border-[#e5e7ea] text-[#797e84] hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          type="button"
          disabled={!isFormValid}
          onClick={handleSubmit}
          className={`px-4 py-3 rounded-lg flex items-center gap-2 text-base font-normal transition-colors ${
            isFormValid
              ? 'bg-[#6290f2] text-white hover:bg-[#4a7ae8]'
              : 'bg-[#6290f2] text-white opacity-40 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
