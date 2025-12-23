'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import type { State, City, EditBusinessLocationRequest } from '@/types';
import { editBusinessLocation } from '@/services/business/business';
import { useCitiesByState } from '@/hooks/city/useCitiesByState';

interface LocationData {
  address: string;
  cityId: string;
  stateId: string;
  postalCode: string;
}

interface EditLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  userId: string;
  states?: State[];
  initialData?: LocationData;
}

export default function EditLocationModal({ 
  isOpen, 
  onClose,
  businessId,
  userId,
  states = [],
  initialData 
}: EditLocationModalProps) {
  const { authToken } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<LocationData>({
    address: '',
    cityId: '',
    stateId: '',
    postalCode: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LocationData, string>>>({});

  // Fetch cities when state is selected
  const { data: cities = [] } = useCitiesByState(formData.stateId || null);

  // Convert states to options format
  const stateOptions = useMemo(() => {
    return states.map(state => ({
      value: state.id,
      label: state.name
    }));
  }, [states]);

  // Convert cities to options format
  const cityOptions = useMemo(() => {
    return cities.map(city => ({
      value: city.id,
      label: city.name
    }));
  }, [cities]);

  // Mutation for updating location
  const updateMutation = useMutation({
    mutationFn: (payload: EditBusinessLocationRequest) => {
      if (!authToken) {
        throw new Error('Authentication token not available');
      }
      return editBusinessLocation(payload, authToken);
    },
    onSuccess: () => {
      // Invalidate and refetch the location availability query
      queryClient.invalidateQueries({ queryKey: ['locationAvailability', businessId, userId] });
      onClose();
    },
    onError: (error: Error) => {
      console.error('Failed to update location:', error);
      // Error will be displayed in the UI
    },
  });

  // Initialize form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          address: '',
          cityId: '',
          stateId: '',
          postalCode: ''
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

  const handleInputChange = (field: keyof LocationData, value: string) => {
    setFormData(prev => {
      const updated = {
        ...prev,
        [field]: value
      };
      // Reset city when state changes
      if (field === 'stateId') {
        updated.cityId = '';
      }
      return updated;
    });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LocationData, string>> = {};

    if (!formData.address.trim()) {
      newErrors.address = 'Business address is required';
    }

    if (!formData.cityId) {
      newErrors.cityId = 'City is required';
    }

    if (!formData.stateId) {
      newErrors.stateId = 'State is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    // Build the entire payload as requested - send all fields even if only one changed
    const payload: EditBusinessLocationRequest = {
      user_id: userId,
      business_id: businessId,
      business_address: formData.address,
      city_id: formData.cityId,
      state_id: formData.stateId,
      postal_code: formData.postalCode
    };

    // Call the mutation
    updateMutation.mutate(payload);
  };

  if (!isOpen) return null;

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
            Edit Location
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
          {/* Business Address */}
          <div>
            <FormInput
              label="Business Address *"
              value={formData.address}
              onChange={(value) => handleInputChange('address', value)}
              placeholder="Enter your full address"
              error={errors.address}
            />
          </div>

          {/* City, State, Postal Code */}
          <div className="grid grid-cols-3 gap-6">
            <div>
              <FormSelect
                label="State *"
                value={formData.stateId}
                onChange={(value) => handleInputChange('stateId', value)}
                options={stateOptions}
                placeholder="Select"
                error={errors.stateId}
              />
            </div>
            <div>
              <FormSelect
                label="City *"
                value={formData.cityId}
                onChange={(value) => handleInputChange('cityId', value)}
                options={cityOptions}
                placeholder={formData.stateId ? "Select" : "Select state first"}
                error={errors.cityId}
                disabled={!formData.stateId}
              />
            </div>
            <div>
              <FormInput
                label="Postal Code *"
                value={formData.postalCode}
                onChange={(value) => handleInputChange('postalCode', value)}
                placeholder="Enter"
                error={errors.postalCode}
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
              {updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to update location'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


