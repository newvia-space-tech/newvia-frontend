'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PostMessageData, UserRole } from '@/types';
import GoogleIcon from '@/components/shared/GoogleIcon';

interface GoogleLoginButtonProps {
  onError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
  role?: UserRole;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onError,
  className = '',
  children,
  role = 'customer',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get return URL from query params
  const returnUrl = searchParams.get('returnUrl');

  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

  if (!GOOGLE_CLIENT_ID) {
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable is required');
  }

  if (!APP_URL) {
    console.error('NEXT_PUBLIC_APP_URL environment variable is required');
  }

  // Listen for messages from popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent<PostMessageData>) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('✅ Google auth success received:', event.data);
        setIsLoading(false);
        
        if (event.data.token && event.data.user) {
          const user = event.data.user;
          const resolvedRole = (user?.role || role || '').toString().toLowerCase();
          
          // Check provider status BEFORE calling login
          if (resolvedRole === 'provider') {
            console.log('🔍 Provider login - checking status:', { 
              isOnboarded: user?.isOnboarded, 
              isReviewed: user?.isReviewed 
            });
            
            // If onboarded but not reviewed, show error and prevent login
            if (user?.isOnboarded === true && user?.isReviewed === false) {
              console.log('⏳ Provider listing under review - preventing login');
              // Don't call login() - don't save to localStorage
              // Show error message
              onError?.('Your listing is under review. We will notify you once it is approved.');
              return;
            }
          }
          
          // If we reach here, login is allowed - save to localStorage
          // console.log('🔐 Calling login with token and user:', event.data.token, user);
          login(event.data.token, user);
          
          // Redirect based on role and status (using router to avoid page refresh)
          setTimeout(() => {
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('user');
            console.log('🔍 localStorage after login:', { storedToken: !!storedToken, storedUser: !!storedUser });
            
            // If there's a return URL, use it (for customers and providers)
            if (returnUrl) {
              console.log('🔙 Redirecting to return URL:', returnUrl);
              router.replace(decodeURIComponent(returnUrl));
              return;
            }
            
            // Provider routing logic (only if no return URL)
            if (resolvedRole === 'provider') {
              // If not onboarded, redirect to onboarding flow
              if (user?.isOnboarded === false) {
                console.log('📝 Redirecting to provider onboarding');
                router.replace('/provider-onboarding');
              }
              // If onboarded and reviewed, redirect to provider management
              else if (user?.isOnboarded === true && user?.isReviewed === true) {
                console.log('✅ Redirecting to provider management');
                router.replace('/provider-management/overview');
              }
              // Fallback to onboarding if status is unclear
              else {
                console.log('⚠️ Unclear provider status, redirecting to onboarding');
                router.replace('/provider-onboarding');
              }
            } else {
              // Customer login - redirect to home page
              router.replace('/');
            }
          }, 100);
        }
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.error('❌ Google auth error received:', event.data.error);
        setIsLoading(false);
        
        // Check if error is about wrong role (customer/provider login mismatch)
        const errorMsg = event.data.error || '';
        const isRoleError = errorMsg.toLowerCase().includes('customer') || 
                           errorMsg.toLowerCase().includes('provider');
        
        // Show backend message only for role errors, otherwise show generic message
        const displayMessage = isRoleError ? errorMsg : 'Authentication failed. Please try again.';
        onError?.(displayMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login, onError, router]);

  const handleGoogleLogin = () => {
    console.log('🚀 Google login button clicked');
    console.log('🔧 Environment check:', {
      GOOGLE_CLIENT_ID: !!GOOGLE_CLIENT_ID,
      APP_URL: !!APP_URL,
      NODE_ENV: process.env.NODE_ENV
    });

    if (!GOOGLE_CLIENT_ID || !APP_URL) {
      console.error('❌ Missing environment variables');
      onError?.('Google OAuth not configured');
      return;
    }

    setIsLoading(true);

    // Calculate centered position for popup
    const width = 500;
    const height = 600;
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);

    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,resizable=yes,scrollbars=yes,status=no`;

    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${APP_URL}/auth/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state: role, // Pass role as state parameter
    });

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    // console.log('🔗 Opening OAuth URL:', oauthUrl);

    // Open popup window
    const popup = window.open(oauthUrl, 'google-auth', features);

    if (!popup) {
      console.error('❌ Popup blocked');
      onError?.('Popup blocked. Please allow popups for this site.');
      setIsLoading(false);
      return;
    }

    console.log('✅ Popup opened successfully');

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        console.log('🔄 Popup was closed');
        clearInterval(checkClosed);
        setIsLoading(false);
      }
    }, 1000);

    // Clean up interval after 2 minutes
    setTimeout(() => {
      clearInterval(checkClosed);
      if (!popup.closed) {
        console.log('⏰ Closing popup after timeout');
        popup.close();
        setIsLoading(false);
      }
    }, 120000);
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className={`w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md group disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      type="button"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      <span className="text-gray-700 font-medium">
        {isLoading ? 'Signing in...' : children || 'Continue with Google'}
      </span>
    </button>
  );
};

export default GoogleLoginButton;
