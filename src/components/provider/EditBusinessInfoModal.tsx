'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import type { Category, EditBusinessInfoRequest } from '@/types';
import { editBusinessInfo } from '@/services/business/business';

interface BusinessInfo {
  businessName: string;
  categoryId: string;
  businessRegistrationNumber: string;
  description: string;
  phoneNumber: string;
  socialMedia: string;
}

interface EditBusinessInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  userId: string;
  categories?: Category[];
  initialData?: BusinessInfo;
}

export default function EditBusinessInfoModal({ 
  isOpen, 
  onClose,
  businessId,
  userId,
  categories = [],
  initialData 
}: EditBusinessInfoModalProps) {
  const { authToken } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<BusinessInfo>({
    businessName: '',
    categoryId: '',
    businessRegistrationNumber: '',
    description: '',
    phoneNumber: '',
    socialMedia: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BusinessInfo, string>>>({});

  // Mutation for updating business info
  const updateMutation = useMutation({
    mutationFn: (payload: EditBusinessInfoRequest) => {
      if (!authToken) {
        throw new Error('Authentication token not available');
      }
      return editBusinessInfo(payload, authToken);
    },
    onSuccess: () => {
      // Invalidate and refetch the business info query
      queryClient.invalidateQueries({ queryKey: ['businessInfo', businessId, userId] });
      onClose();
    },
    onError: (error: Error) => {
      console.error('Failed to update business info:', error);
      // Error will be displayed in the UI
    },
  });

  // Convert categories to options format for FormSelect
  const categoryOptions = useMemo(() => {
    return categories.map(category => ({
      value: category.id,
      label: category.name
    }));
  }, [categories]);

  // Initialize form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          businessName: '',
          categoryId: '',
          businessRegistrationNumber: '',
          description: '',
          phoneNumber: '',
          socialMedia: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow || 'auto';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof BusinessInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BusinessInfo, string>> = {};

    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.businessRegistrationNumber.trim()) {
      newErrors.businessRegistrationNumber = 'Business registration number is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 600) {
      newErrors.description = 'Description must be 600 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Build the entire payload as requested - send all fields even if only one changed
    const payload: EditBusinessInfoRequest = {
      business_id: businessId,
      user_id: userId,
      business_category_id: formData.categoryId,
      business_name: formData.businessName,
      business_registration_number: formData.businessRegistrationNumber,
      description: formData.description,
      phone_number: formData.phoneNumber,
      social_media_url: formData.socialMedia
    };

    // Call the mutation
    updateMutation.mutate(payload);
  };

  if (!isOpen) return null;

  const descriptionLength = formData.description.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200">
          <h2 
            className="text-xl font-semibold text-black"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 600,
              lineHeight: '28px'
            }}
          >
            Edit Business Info
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-5 space-y-6">
          {/* Business Name and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Business Name *"
                value={formData.businessName}
                onChange={(value) => handleInputChange('businessName', value)}
                placeholder="Enter"
                error={errors.businessName}
              />
            </div>
            <div>
              <FormSelect
                label="Category *"
                value={formData.categoryId}
                onChange={(value) => handleInputChange('categoryId', value)}
                options={categoryOptions}
                placeholder="Select"
                error={errors.categoryId}
              />
            </div>
          </div>

          {/* Business Registration Number */}
          <div>
            <FormInput
              label="Business Registration Number *"
              value={formData.businessRegistrationNumber}
              onChange={(value) => handleInputChange('businessRegistrationNumber', value)}
              placeholder="Enter"
              error={errors.businessRegistrationNumber}
            />
          </div>

          {/* Description */}
          <div>
            <label 
              className="block text-sm text-black mb-2"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '20px'
              }}
            >
              Short Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your business in a few sentences"
              rows={4}
              className={`w-full px-4 py-2.5 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-[#6290f2] focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-[#e5e7ea]'
              }`}
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px',
                color: formData.description ? '#000000' : '#797e84',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />
            <div className="flex items-center justify-between mt-1">
              <p 
                className="text-xs text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '16px'
                }}
              >
                This will help customers understand what you offer
              </p>
              <p 
                className={`text-xs ${
                  descriptionLength > 600 ? 'text-red-500' : 'text-[#797e84]'
                }`}
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  lineHeight: '16px'
                }}
              >
                {descriptionLength}/600
              </p>
            </div>
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Phone Number and Social Media */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormInput
                label="Business Phone Number"
                value={formData.phoneNumber}
                onChange={(value) => handleInputChange('phoneNumber', value)}
                placeholder="Enter"
              />
            </div>
            <div>
              <FormInput
                label="Social Media"
                value={formData.socialMedia}
                onChange={(value) => handleInputChange('socialMedia', value)}
                placeholder="Enter"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-end gap-2 px-5 pb-5">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="bg-[#6290f2] hover:bg-[#5280e2] disabled:bg-[#9bb5f5] disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-base font-normal transition-colors min-w-[160px]"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 400,
              lineHeight: '24px'
            }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          {updateMutation.isError && (
            <p 
              className="text-sm text-red-600 text-right"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '20px'
              }}
            >
              {updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to update business info'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

