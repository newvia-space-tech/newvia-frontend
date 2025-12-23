'use client';

import React, { useState, useMemo } from 'react';
import { Mail, Megaphone, Trash } from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';
import CustomerAccountSidebar from '@/components/customer-account/CustomerAccountSidebar';
import DeleteAccountModal from '@/components/account/DeleteAccountModal';
import { useAuth } from '@/context/AuthContext';
import { useCustomerSettings } from '@/hooks/customer/useCustomerSettings';

interface NotificationSettings {
  emailNotifications: boolean;
  marketingCommunications: boolean;
}

export default function SettingsPage() {
  const { user, authToken } = useAuth();
  const updateSettingsMutation = useCustomerSettings(authToken);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Original values (from API or defaults)
  const [originalSettings, setOriginalSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    marketingCommunications: false
  });

  // Current values (user can toggle)
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    marketingCommunications: false
  });

  // Check if settings have changed
  const hasChanges = useMemo(() => {
    return (
      notifications.emailNotifications !== originalSettings.emailNotifications ||
      notifications.marketingCommunications !== originalSettings.marketingCommunications
    );
  }, [notifications, originalSettings]);

  const toggleNotification = (key: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    if (!user?.id || !authToken) {
      return;
    }

    try {
      await updateSettingsMutation.mutateAsync({
        user_id: user.id,
        email: notifications.emailNotifications,
        marketting: notifications.marketingCommunications, // Note: API uses "marketting" (typo)
      });
      
      // Update original settings to match current after successful save
      setOriginalSettings({ ...notifications });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // Handle account deletion logic here
    console.log('Account deletion confirmed');
    setIsDeleteModalOpen(false);
    // TODO: Implement actual delete account API call
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <UnifiedHeader showSearchBar={false} />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <CustomerAccountSidebar activeSection="settings" />
        
        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="flex flex-col gap-4 sm:gap-5 items-start w-full">
            <h2 
              className="text-xl sm:text-2xl font-semibold text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif', 
                fontWeight: 600, 
                lineHeight: '32px' 
              }}
            >
              Settings
            </h2>
            
            {/* Notification preferences section */}
            <div className="border border-[#e5e7ea] rounded-xl p-4 sm:p-5 w-full">
              <div className="flex flex-col gap-4">
                <h3 
                  className="text-base sm:text-lg font-semibold text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 600, 
                    lineHeight: '28px' 
                  }}
                >
                  Notification preferences
                </h3>
                
                <div className="bg-white rounded-xl">
                  {/* Email Notifications */}
                  <div className="flex flex-col sm:flex-row gap-3 py-1.5">
                    <div className="flex gap-2 sm:gap-3 grow items-center">
                      <div className="bg-[#f7fafe] flex gap-2.5 items-center p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#6290f2]" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <p 
                          className="text-sm sm:text-base font-medium text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif', 
                            fontWeight: 500, 
                            lineHeight: '24px' 
                          }}
                        >
                          Email Notifications
                        </p>
                        <p 
                          className="text-[#797e84] text-xs sm:text-base"
                          style={{ 
                            fontFamily: 'Lato, sans-serif', 
                            fontWeight: 400, 
                            lineHeight: '24px' 
                          }}
                        >
                          Receive booking confirmations and updates via email
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={() => toggleNotification('emailNotifications')}
                          className="sr-only peer"
                        />
                        <div className={`relative w-9 h-6 rounded-full transition-colors ${
                          notifications.emailNotifications ? 'bg-[#6290f2]' : 'bg-[#e5e7ea]'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            notifications.emailNotifications ? 'translate-x-[18px]' : 'translate-x-0'
                          }`}></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  <div className="h-px bg-[#e5e7ea] my-2"></div>
                  
                  {/* Marketing Communications */}
                  <div className="flex flex-col sm:flex-row gap-3 py-1.5">
                    <div className="flex gap-2 sm:gap-3 grow items-center">
                      <div className="bg-[#f7fafe] flex gap-2.5 items-center p-2 sm:p-2.5 rounded-lg flex-shrink-0">
                        <Megaphone className="w-4 h-4 sm:w-5 sm:h-5 text-[#6290f2]" />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 flex-1">
                        <p 
                          className="text-sm sm:text-base font-medium text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif', 
                            fontWeight: 500, 
                            lineHeight: '24px' 
                          }}
                        >
                          Marketing Communications
                        </p>
                        <p 
                          className="text-[#797e84] text-xs sm:text-base"
                          style={{ 
                            fontFamily: 'Lato, sans-serif', 
                            fontWeight: 400, 
                            lineHeight: '24px' 
                          }}
                        >
                          Receive offers and promotions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.marketingCommunications}
                          onChange={() => toggleNotification('marketingCommunications')}
                          className="sr-only peer"
                        />
                        <div className={`relative w-9 h-6 rounded-full transition-colors ${
                          notifications.marketingCommunications ? 'bg-[#6290f2]' : 'bg-[#e5e7ea]'
                        }`}>
                          <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                            notifications.marketingCommunications ? 'translate-x-[18px]' : 'translate-x-0'
                          }`}></div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Save Button - Only show when there are changes */}
              {hasChanges && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSave}
                    disabled={updateSettingsMutation.isPending}
                    className="bg-[#6290f2] flex gap-2 items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-[#5280e2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateSettingsMutation.isPending && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span 
                      className="text-white text-xs sm:text-sm font-medium"
                      style={{ 
                        fontFamily: 'Lato, sans-serif', 
                        fontWeight: 500, 
                        lineHeight: '20px' 
                      }}
                    >
                      {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Delete account section */}
            <div className="border border-[#e5e7ea] rounded-xl p-4 sm:p-5 w-full flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex flex-col gap-1">
                <p 
                  className="text-base sm:text-lg font-semibold text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 600, 
                    lineHeight: '28px' 
                  }}
                >
                  Delete account
                </p>
                <p 
                  className="text-[#797e84] text-sm sm:text-base"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 400, 
                    lineHeight: '24px' 
                  }}
                >
                  Are you sure you want to leave Newvia?
                </p>
              </div>
              <button
                onClick={handleDeleteAccount}
                className="bg-[#fcebeb] flex gap-2 items-center justify-center px-4 py-2 rounded-lg hover:bg-[#fce0e0] transition-colors self-start sm:self-auto"
              >
                <Trash className="w-4 h-4 sm:w-5 sm:h-5 text-[#e43636]" />
                <span 
                  className="text-[#e43636] text-xs sm:text-sm"
                  style={{ 
                    fontFamily: 'Lato, sans-serif', 
                    fontWeight: 400, 
                    lineHeight: '20px' 
                  }}
                >
                  Delete my account
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

