'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import FormInput from '@/components/provider/FormInput';
import FormSelect from '@/components/provider/FormSelect';
import GalleryUpload from '@/components/provider/GalleryUpload';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useCategories } from '@/hooks/service/useCategories';

interface FormErrors {
  businessName?: string;
  categoryId?: string;
  businessRegistrationNumber?: string;
  shortDescription?: string;
}

export default function Step1() {
  const step1Data = useOnboardingStore((state) => state.providerData.step1);
  const updateStep1Data = useOnboardingStore((state) => state.updateStep1Data);
  const nextStep = useOnboardingStore((state) => state.nextStep);

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch categories from API
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useCategories();

  // Transform categories data to dropdown format
  const categories = categoriesData?.map(category => ({
    value: category.id,
    label: category.name
  })) ?? [];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Business Name validation
    if (!step1Data.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    } else if (step1Data.businessName.trim().length < 3) {
      newErrors.businessName = 'Business name must be at least 3 characters';
    } else if (step1Data.businessName.trim().length > 100) {
      newErrors.businessName = 'Business name must not exceed 100 characters';
    } else if (!/^[a-zA-Z0-9\s&'-]+$/.test(step1Data.businessName.trim())) {
      newErrors.businessName = 'Business name contains invalid characters';
    }

    // Category validation
    if (!step1Data.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    // Business Registration Number validation
    if (!step1Data.businessRegistrationNumber.trim()) {
      newErrors.businessRegistrationNumber = 'Business registration number is required';
    } else if (step1Data.businessRegistrationNumber.trim().length < 5) {
      newErrors.businessRegistrationNumber = 'Registration number must be at least 5 characters';
    } else if (step1Data.businessRegistrationNumber.trim().length > 50) {
      newErrors.businessRegistrationNumber = 'Registration number must not exceed 50 characters';
    } else if (!/^[a-zA-Z0-9-]+$/.test(step1Data.businessRegistrationNumber.trim())) {
      newErrors.businessRegistrationNumber = 'Registration number can only contain letters, numbers, and hyphens';
    }

    // Short Description validation (optional but if provided, validate)
    if (step1Data.shortDescription.trim().length > 0 && step1Data.shortDescription.trim().length < 20) {
      newErrors.shortDescription = 'Description must be at least 20 characters if provided';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: keyof FormErrors, value: string): string | undefined => {
    switch (field) {
      case 'businessName':
        if (!value.trim()) return 'Business name is required';
        if (value.trim().length < 3) return 'Business name must be at least 3 characters';
        if (value.trim().length > 100) return 'Business name must not exceed 100 characters';
        if (!/^[a-zA-Z0-9\s&'-]+$/.test(value.trim())) return 'Business name contains invalid characters';
        break;
      case 'businessRegistrationNumber':
        if (!value.trim()) return 'Business registration number is required';
        if (value.trim().length < 5) return 'Registration number must be at least 5 characters';
        if (value.trim().length > 50) return 'Registration number must not exceed 50 characters';
        if (!/^[a-zA-Z0-9-]+$/.test(value.trim())) return 'Registration number can only contain letters, numbers, and hyphens';
        break;
      case 'shortDescription':
        if (value.trim().length > 0 && value.trim().length < 20) return 'Description must be at least 20 characters if provided';
        break;
    }
    return undefined;
  };

  const handleInputChange = (field: string, value: string) => {
    // Special handling for category selection - store both ID and name
    if (field === 'categoryId' && value) {
      const selectedCategory = categories.find(cat => cat.value === value);
      updateStep1Data({ 
        categoryId: value,
        categoryName: selectedCategory?.label || ''
      });
      // Clear error
      if (errors.categoryId) {
        setErrors(prev => ({ ...prev, categoryId: undefined }));
      }
      return;
    }
    
    updateStep1Data({ [field]: value });
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof FormErrors) => {
    const value = step1Data[field as keyof typeof step1Data] as string;
    const error = validateField(field, value);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleGalleryChange = (files: File[]) => {
    updateStep1Data({ gallery: files });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      nextStep();
    }
  };

  const isFormValid = 
    step1Data.businessName.trim().length >= 3 &&
    step1Data.businessName.trim().length <= 100 &&
    /^[a-zA-Z0-9\s&'-]+$/.test(step1Data.businessName.trim()) &&
    step1Data.categoryId &&
    step1Data.businessRegistrationNumber.trim().length >= 5 &&
    step1Data.businessRegistrationNumber.trim().length <= 50 &&
    /^[a-zA-Z0-9-]+$/.test(step1Data.businessRegistrationNumber.trim()) &&
    (step1Data.shortDescription.trim().length === 0 || step1Data.shortDescription.trim().length >= 20);

  return (
    <div className="max-w-[980px] mx-auto space-y-4 sm:space-y-5">
      {/* Business Information Form */}
      <div className="bg-white rounded-xl p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-5">Business Information</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Business Name and Category */}
          <div className="flex flex-col sm:flex-row gap-4">
            <FormInput
              label="Business Name"
              value={step1Data.businessName}
              onChange={(value) => handleInputChange('businessName', value)}
              onBlur={() => handleBlur('businessName')}
              placeholder="Enter"
              required
              error={errors.businessName}
              className="flex-1"
              maxLength={100}
            />
            <FormSelect
              label="Category"
              options={categories}
              value={step1Data.categoryId}
              onChange={(value) => handleInputChange('categoryId', value)}
              placeholder={categoriesLoading ? "Loading..." : "Select"}
              required
              error={errors.categoryId || (categoriesError ? "Failed to load categories" : undefined)}
              className="flex-1"
            />
          </div>

          {/* Business Registration Number */}
          <FormInput
            label="Business Registration Number"
            value={step1Data.businessRegistrationNumber}
            onChange={(value) => handleInputChange('businessRegistrationNumber', value)}
            onBlur={() => handleBlur('businessRegistrationNumber')}
            placeholder="Enter"
            required
            error={errors.businessRegistrationNumber}
            maxLength={50}
          />

          {/* Short Description */}
          <div className="space-y-2">
            <label className="block text-sm text-black">
              Short Description
            </label>
            <textarea
              value={step1Data.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              onBlur={() => handleBlur('shortDescription')}
              placeholder="Describe your business in a few sentences (minimum 20 characters if provided)"
              rows={4}
              maxLength={600}
              className={`w-full px-4 py-2.5 border rounded-lg text-base text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.shortDescription ? 'border-red-500' : 'border-[#e5e7ea]'
              }`}
            />
            {errors.shortDescription && (
              <p className="text-sm text-red-500">{errors.shortDescription}</p>
            )}
            <div className="flex justify-between text-xs text-[#797e84]">
              <span>This will help customers understand what you offer</span>
              <span>{step1Data.shortDescription.length}/600</span>
            </div>
          </div>
        </form>
      </div>

      {/* Gallery Upload */}
      <div className="bg-white rounded-xl p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-semibold text-black mb-4 sm:mb-5">Gallery</h3>
        <GalleryUpload
          files={step1Data.gallery}
          onFilesChange={handleGalleryChange}
          maxFiles={5}
          maxSize={10}
        />
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-2 sm:pt-3">
        <button
          type="button"
          disabled={!isFormValid}
          onClick={handleSubmit}
          className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center gap-2 text-sm sm:text-base font-normal transition-colors ${
            isFormValid
              ? 'bg-[#6290f2] text-white hover:bg-[#4a7ae8]'
              : 'bg-[#6290f2] text-white opacity-40 cursor-not-allowed'
          }`}
        >
          Continue
          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}
