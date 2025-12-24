'use client';

import React, { useState } from 'react';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import { Mail, Megaphone, Trash2 } from 'lucide-react';
import DeleteAccountModal from '@/components/provider/DeleteAccountModal';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    marketingCommunications: false
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleToggleNotification = (key: 'emailNotifications' | 'marketingCommunications') => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDeleteAccount = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement delete account functionality
    console.log('Delete account confirmed');
    setIsDeleteModalOpen(false);
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
              Settings
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-9 py-4 sm:py-5">
          <div className="flex flex-col gap-4 w-full">
            {/* Notification Preferences Section */}
            <div className="bg-white rounded-xl p-5">
              <div className="flex flex-col gap-5">
                <h2 
                  className="text-lg font-semibold text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 600,
                    lineHeight: '28px'
                  }}
                >
                  Notification preferences
                </h2>

                <div className="flex flex-col gap-2">
                  {/* Email Notifications */}
                  <div className="flex gap-3 items-center py-1.5">
                    <div className="flex gap-3 items-center flex-1">
                      {/* Icon */}
                      <div className="bg-[#f7fafe] p-2.5 rounded-lg">
                        <Mail size={20} className="text-[#6290f2]" />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex flex-col gap-1">
                        <p 
                          className="text-base font-medium text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            lineHeight: '24px'
                          }}
                        >
                          Email Notifications
                        </p>
                        <p 
                          className="text-base text-black/60"
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
                    
                    {/* Toggle */}
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.emailNotifications}
                          onChange={() => handleToggleNotification('emailNotifications')}
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
                  
                  {/* Divider */}
                  <div className="h-px bg-[#e5e7ea]"></div>
                  
                  {/* Marketing Communications */}
                  <div className="flex gap-3 items-center py-1.5">
                    <div className="flex gap-3 items-center flex-1">
                      {/* Icon */}
                      <div className="bg-[#f7fafe] p-2.5 rounded-lg">
                        <Megaphone size={20} className="text-[#6290f2]" />
                      </div>
                      
                      {/* Text Content */}
                      <div className="flex flex-col gap-1">
                        <p 
                          className="text-base font-medium text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 500,
                            lineHeight: '24px'
                          }}
                        >
                          Marketing Communications
                        </p>
                        <p 
                          className="text-base text-black/60"
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
                    
                    {/* Toggle */}
                    <div className="flex items-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifications.marketingCommunications}
                          onChange={() => handleToggleNotification('marketingCommunications')}
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
            </div>

            {/* Delete Account Section */}
            <div className="bg-white rounded-xl p-5">
              <div className="flex items-end justify-between">
                <div className="flex flex-col gap-1">
                  <h2 
                    className="text-lg font-semibold text-black"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 600,
                      lineHeight: '28px'
                    }}
                  >
                    Delete account
                  </h2>
                  <p 
                    className="text-base text-black/60"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    Are you sure you want to leave Newvia?
                  </p>
                </div>
                
                {/* Delete Button */}
                <button
                  onClick={handleDeleteAccount}
                  className="bg-[#fcebeb] hover:bg-[#fadada] flex gap-2 items-center justify-center px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={20} className="text-[#e43636]" />
                  <span 
                    className="text-sm text-[#e43636]"
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

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
}

