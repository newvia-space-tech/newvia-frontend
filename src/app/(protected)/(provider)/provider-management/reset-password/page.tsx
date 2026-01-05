'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ProviderSidebar from '@/components/provider/ProviderSidebar';
import { useAuth } from '@/context/AuthContext';
import { updatePassword } from '@/services/auth/auth';

export default function ResetPasswordPage() {
  const { authToken } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!newPassword.trim()) {
      setErrorMessage('Please enter a new password');
      return;
    }

    if (!authToken) {
      setErrorMessage('Authentication required. Please log in again.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword({ new_password: newPassword }, authToken);
      setSuccessMessage('Password updated successfully!');
      setNewPassword('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to update password. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
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
              Reset Password
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-9 py-4 sm:py-5">
          <div className="flex flex-col gap-4 w-full max-w-2xl">
            {/* Reset Password Form */}
            <div className="bg-white rounded-xl p-5">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* New Password Field */}
                <div className="flex flex-col gap-2">
                  <label 
                    className="text-sm text-black leading-[20px]"
                    style={{ fontFamily: 'Lato, sans-serif' }}
                  >
                    New Password
                  </label>
                  <div className="border border-[#e5e7ea] rounded-lg relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      className="w-full px-[14px] py-3 pr-10 rounded-lg text-base text-black focus:outline-none focus:ring-2 focus:ring-[#6290f2] focus:border-transparent"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#9ea5ad] hover:text-black transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p 
                      className="text-red-600 text-sm"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      {errorMessage}
                    </p>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p 
                      className="text-green-600 text-sm"
                      style={{ fontFamily: 'Lato, sans-serif' }}
                    >
                      {successMessage}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading || !newPassword.trim()}
                    className="bg-[#6290f2] flex gap-2 items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg hover:bg-[#5280e2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isLoading && (
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
                      {isLoading ? 'Updating...' : 'Update Password'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

