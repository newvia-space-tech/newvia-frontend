'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Pencil, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import EditProfileModal from '@/components/account/EditProfileModal';
import { useProviderProfile } from '@/hooks/profile/useProviderProfile';

export default function ProfilePage() {
  const { user, loading: authLoading, authToken } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch provider profile
  const { data: profileData, isLoading: profileLoading, error: profileError, refetch } = useProviderProfile(user?.id || '');

  const profile = profileData?.payload;
  const loading = authLoading || profileLoading;

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
  };

  // Format phone number if available
  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return 'Not provided';
    return phone;
  };

  // Format date of birth if available
  const formatDateOfBirth = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'Not provided';
    try {
      return new Date(dateOfBirth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateOfBirth;
    }
  };

  // Format gender if available
  const formatGender = (gender?: string) => {
    if (!gender) return 'Not provided';
    return gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
  };

  // Get display name (prefer API profile data, fallback to auth user data)
  const getDisplayName = () => {
    if (profile) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.name) {
      return user.name;
    }
    return 'User';
  };

  // Get profile photo (prefer API profile data, fallback to auth user data)
  const getProfilePhoto = () => {
    return profile?.profile_photo || user?.avatar;
  };

  // Get email (prefer API profile data, fallback to auth user data)
  const getEmail = () => {
    return profile?.email_id || user?.email || 'Not provided';
  };

  // Get phone (prefer API profile data, fallback to auth user data)
  const getPhone = () => {
    return profile?.phone_number || user?.phone;
  };

  // Get date of birth (prefer API profile data, fallback to auth user data)
  const getDateOfBirth = () => {
    return profile?.dob || user?.dateOfBirth;
  };

  // Get gender (prefer API profile data, fallback to auth user data)
  const getGender = () => {
    return profile?.gender || user?.gender;
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
              Profile Information
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-9 py-4 sm:py-5">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          ) : profileError ? (
            <div className="flex items-center justify-center h-full">
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
                  {profileError instanceof Error ? profileError.message : 'Failed to load profile'}
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
          ) : (
            <div className="flex flex-col gap-4 items-start w-full">
              
              <div className="border border-[#e5e7ea] rounded-xl p-5 w-full bg-white">
                {/* User Avatar and Name Section */}
                <div className="flex gap-3 items-center mb-5">
                  <div className="w-20 h-20 flex-shrink-0">
                    {getProfilePhoto() ? (
                      <Image
                        src={getProfilePhoto()!}
                        alt="User Avatar"
                        width={80}
                        height={80}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={40} className="text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-start">
                    <h3 
                      className="text-2xl font-bold text-black"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 700, 
                        lineHeight: '32px' 
                      }}
                    >
                      {getDisplayName()}
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={handleEditClick}
                        className="border border-[#e5e7ea] flex gap-2 items-center px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="w-4.5 h-4.5">
                          <Pencil 
                            size={18}
                            className="w-full h-full text-[#797e84]"
                          />
                        </div>
                        <span 
                          className="text-[#797e84] text-base"
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
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-[#e5e7ea] mb-5"></div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
                  <div className="flex flex-col gap-1.5">
                    <label 
                      className="text-[#797e84] text-sm"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 400, 
                        lineHeight: '20px' 
                      }}
                    >
                      Full Name
                    </label>
                    <p 
                      className="text-black text-base font-medium"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 500, 
                        lineHeight: '24px' 
                      }}
                    >
                      {getDisplayName()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label 
                      className="text-[#797e84] text-sm"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 400, 
                        lineHeight: '20px' 
                      }}
                    >
                      Email
                    </label>
                    <p 
                      className="text-black text-base font-medium"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 500, 
                        lineHeight: '24px' 
                      }}
                    >
                      {getEmail()}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label 
                      className="text-[#797e84] text-sm"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 400, 
                        lineHeight: '20px' 
                      }}
                    >
                      Phone Number
                    </label>
                    <p 
                      className="text-black text-base font-medium"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 500, 
                        lineHeight: '24px' 
                      }}
                    >
                      {formatPhoneNumber(getPhone())}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label 
                      className="text-[#797e84] text-sm"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 400, 
                        lineHeight: '20px' 
                      }}
                    >
                      Date of Birth
                    </label>
                    <p 
                      className="text-black text-base font-medium"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 500, 
                        lineHeight: '24px' 
                      }}
                    >
                      {formatDateOfBirth(getDateOfBirth())}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label 
                      className="text-[#797e84] text-sm"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 400, 
                        lineHeight: '20px' 
                      }}
                    >
                      Gender
                    </label>
                    <p 
                      className="text-black text-base font-medium"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 500, 
                        lineHeight: '24px' 
                      }}
                    >
                      {formatGender(getGender())}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseModal}
        profile={profile}
        userRole="provider"
      />
    </div>
  );
}

