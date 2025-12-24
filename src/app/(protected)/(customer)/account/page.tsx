'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Pencil, LogOut, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';
import CustomerAccountSidebar from '@/components/customer-account/CustomerAccountSidebar';
import EditProfileModal from '@/components/account/EditProfileModal';
import { getCustomerProfile } from '@/services/profile/profile';

export default function AccountPage() {
  const { user, logout, loading: authLoading, authToken } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch customer profile
  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['customerProfile', user?.id],
    queryFn: () => {
      if (!user?.id || !authToken) {
        throw new Error('User ID or auth token not available');
      }
      return getCustomerProfile(user.id, authToken);
    },
    enabled: !!user?.id && !!authToken && !authLoading,
  });

  const profile = profileData?.payload;
  const loading = authLoading || profileLoading;

  const handleLogout = () => {
    logout();
  };

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <UnifiedHeader showSearchBar={false} />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <CustomerAccountSidebar activeSection="profile" />
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 items-start w-full">
            <h2 
              className="text-xl sm:text-2xl font-semibold text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif', 
                fontWeight: 600, 
                lineHeight: '32px' 
              }}
            >
              Profile Information
            </h2>
            
            {profileError ? (
              <div className="border border-red-200 rounded-xl p-5 w-full bg-red-50">
                <p className="text-red-600">Failed to load profile. Please try again later.</p>
              </div>
            ) : (
              <div className="border border-[#e5e7ea] rounded-xl p-4 sm:p-5 w-full">
                {/* User Avatar and Name Section */}
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0">
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
                    className="text-xl sm:text-2xl font-bold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif', 
                      fontWeight: 700, 
                      lineHeight: '32px' 
                    }}
                  >
                    {getDisplayName()}
                  </h3>
                  <div className="flex flex-wrap gap-2">
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
                    {/* <button 
                      onClick={handleLogout}
                      className="border border-red-200 flex gap-2 items-center px-4 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <div className="w-4.5 h-4.5">
                        <LogOut 
                          size={18}
                          className="w-full h-full text-red-600"
                        />
                      </div>
                      <span 
                        className="text-red-600 text-base"
                        style={{ 
                          fontFamily: 'Lato, sans-serif', 
                          fontWeight: 400, 
                          lineHeight: '24px' 
                        }}
                      >
                        Logout
                      </span>
                    </button> */}
                  </div>
                </div>
                </div>

              {/* Divider */}
              <div className="w-full h-px bg-[#e5e7ea] mb-5"></div>

              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 w-full">
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
            )}
          </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
      
      {/* Edit Profile Modal */}
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={handleCloseModal}
        profile={profile}
      />
    </div>
  );
}
