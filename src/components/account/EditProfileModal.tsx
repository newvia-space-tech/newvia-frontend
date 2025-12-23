'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { CustomerProfile, ProviderProfile, User } from '@/types';
import { 
  updateCustomerProfile, 
  UpdateCustomerProfileRequest,
  updateProviderProfile,
  UpdateProviderProfileRequest
} from '@/services/profile/profile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: CustomerProfile | ProviderProfile;
  userRole?: 'customer' | 'provider';
}

export default function EditProfileModal({ isOpen, onClose, profile, userRole }: EditProfileModalProps) {
  const { user, authToken, updateUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Determine role: use prop if provided, otherwise infer from user.role
  const role = userRole || (user?.role?.toLowerCase().includes('provider') ? 'provider' : 'customer');
  const isProvider = role === 'provider';
  
  // Helper function to convert date from DD-MM-YYYY to YYYY-MM-DD for date input
  const convertDateForInput = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';
    // Check if date is in DD-MM-YYYY format (provider format)
    const ddmmyyyyMatch = dateStr.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddmmyyyyMatch) {
      const [, day, month, year] = ddmmyyyyMatch;
      return `${year}-${month}-${day}`;
    }
    // If already in YYYY-MM-DD format, return as is
    return dateStr;
  };

  // Calculate initial form data with profile data (preferred) or fallback to user data
  const initialFormData = useMemo(() => {
    if (profile) {
      return {
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        email: profile.email_id || '',
        phone: profile.phone_number || '',
        dateOfBirth: convertDateForInput(profile.dob),
        gender: profile.gender || ''
      };
    }
    return {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      gender: user?.gender || ''
    };
  }, [profile, user]);

  const [formData, setFormData] = useState(initialFormData);

  // Update form data when profile, user, or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData);
    }
  }, [initialFormData, isOpen]);

  // Mutation for updating profile
  const updateMutation = useMutation({
    mutationFn: (updates: UpdateCustomerProfileRequest | UpdateProviderProfileRequest) => {
      if (!user?.id || !authToken) {
        throw new Error('User ID or auth token not available');
      }
      if (isProvider) {
        return updateProviderProfile(user.id, updates as UpdateProviderProfileRequest, authToken);
      } else {
        return updateCustomerProfile(user.id, updates as UpdateCustomerProfileRequest, authToken);
      }
    },
    onSuccess: () => {
      // Update user data in localStorage and context
      if (user) {
        const updatedUserData: Partial<User> = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
        };
        
        // Only update email for providers (customers can't change email)
        if (isProvider) {
          updatedUserData.email = formData.email;
        }
        
        updateUser(updatedUserData);
      }
      
      // Invalidate and refetch the profile query based on role
      if (isProvider) {
        queryClient.invalidateQueries({ queryKey: ['providerProfile', user?.id] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['customerProfile', user?.id] });
      }
      onClose();
    },
    onError: (error: Error) => {
      console.error('Failed to update profile:', error);
      // You could add a toast notification here
    },
  });

  // Disable background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save the current overflow value
      const originalOverflow = document.body.style.overflow || 'auto';
      // Disable scrolling
      document.body.style.overflow = 'hidden';
      
      // Cleanup: restore scrolling when modal closes or component unmounts
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      // Ensure scrolling is restored when modal is closed
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!profile || !user?.id) {
      console.error('Profile or user ID not available');
      return;
    }

    // Helper function to normalize values for comparison (handle null, undefined, empty string)
    const normalizeValue = (value: string | null | undefined): string => {
      return value ?? '';
    };

    if (isProvider) {
      // Provider API requires all fields including user_id and email_id
      // Convert date from YYYY-MM-DD to DD-MM-YYYY format for provider API
      let formattedDob = formData.dateOfBirth;
      if (formData.dateOfBirth) {
        const dateParts = formData.dateOfBirth.split('-');
        if (dateParts.length === 3) {
          // Convert from YYYY-MM-DD to DD-MM-YYYY
          formattedDob = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        }
      }
      
      const updates: UpdateProviderProfileRequest = {
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email_id: formData.email,
        phone_number: formData.phone,
        dob: formattedDob,
        gender: formData.gender,
      };
      updateMutation.mutate(updates);
    } else {
      // Customer API only needs changed fields
      const updates: UpdateCustomerProfileRequest = {};

      // Compare each field and add to updates if changed
      const currentFirstName = normalizeValue(formData.firstName);
      const originalFirstName = normalizeValue(profile.first_name);
      if (currentFirstName !== originalFirstName) {
        updates.first_name = formData.firstName;
      }

      const currentLastName = normalizeValue(formData.lastName);
      const originalLastName = normalizeValue(profile.last_name);
      if (currentLastName !== originalLastName) {
        updates.last_name = formData.lastName;
      }

      const currentPhone = normalizeValue(formData.phone);
      const originalPhone = normalizeValue(profile.phone_number);
      if (currentPhone !== originalPhone) {
        updates.phone_number = formData.phone;
      }

      const currentDob = normalizeValue(formData.dateOfBirth);
      const originalDob = normalizeValue(profile.dob);
      if (currentDob !== originalDob) {
        updates.dob = formData.dateOfBirth;
      }

      const currentGender = normalizeValue(formData.gender);
      const originalGender = normalizeValue(profile.gender);
      if (currentGender !== originalGender) {
        updates.gender = formData.gender;
      }

      // Only make API call if there are changes
      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }

      // Call the mutation
      updateMutation.mutate(updates);
    }
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
      <div className="relative bg-white rounded-xl w-[500px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
            Edit Profile
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
          {/* First Name and Last Name */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                First name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-base font-medium text-black focus:outline-none focus:border-blue-500"
                style={{ fontFamily: 'Lato, sans-serif' }}
                placeholder="Enter first name"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                Last name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-base font-medium text-black focus:outline-none focus:border-blue-500"
                style={{ fontFamily: 'Lato, sans-serif' }}
                placeholder="Enter last name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              Email {isProvider && '*'}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-base bg-gray-100 cursor-not-allowed text-gray-500 focus:outline-none"
              style={{ fontFamily: 'Lato, sans-serif' }}
              placeholder="Enter email"
              disabled={true}
              readOnly={true}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-base text-black focus:outline-none focus:border-blue-500"
              style={{ fontFamily: 'Lato, sans-serif' }}
              placeholder="Enter phone number"
            />
          </div>

          {/* Date of Birth and Gender */}
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-base text-gray-500 focus:outline-none focus:border-blue-500"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                />
                <Calendar className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3.5 py-3 border border-gray-200 rounded-lg text-base text-gray-500 focus:outline-none focus:border-blue-500 appearance-none"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg text-base font-normal transition-colors"
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          {updateMutation.isError && (
            <p className="mt-2 text-sm text-red-600 text-center" style={{ fontFamily: 'Lato, sans-serif' }}>
              {updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to update profile'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
