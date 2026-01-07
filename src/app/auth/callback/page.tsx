'use client';

import { useEffect, useState } from 'react';
import GoogleIcon from '@/components/shared/GoogleIcon';
import { googleAuthCallback } from '@/services/auth/auth';
import { PostMessageData, UserRole } from '@/types';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Add immediate console log outside useEffect
  console.log('🚀 AuthCallbackPage component rendered');

  useEffect(() => {
    console.log('🔄 useEffect triggered');
    
    const handleAuthCallback = async () => {
      try {
        console.log('🔍 Callback page loaded');
        console.log('🔍 Current URL:', window.location.href);
        
        // Extract code and role from URL using URLSearchParams
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        const state = url.searchParams.get('state') as UserRole; // Extract role from state parameter
        
        console.log('🔍 Extracted code:', code);
        console.log('🔍 Extracted error:', error);
        console.log('🔍 Extracted role:', state);
        console.log('🔍 All URL params:', Object.fromEntries(url.searchParams.entries()));

        // Handle OAuth error (user cancelled, etc.)
        if (error) {
          const errorDescription = url.searchParams.get('error_description') || 'Authentication was cancelled';
          console.log('❌ OAuth error:', error, errorDescription);
          setStatus('error');
          setErrorMessage(errorDescription);
          
          // Close popup after a short delay
          setTimeout(() => {
            window.close();
          }, 2000);
          return;
        }

        // Handle missing code
        if (!code) {
          console.log('❌ No authorization code found');
          console.log('🔍 Available params:', Object.keys(Object.fromEntries(url.searchParams.entries())));
          setStatus('error');
          setErrorMessage('No authorization code received from Google');
          return;
        }

        // Handle missing role
        if (!state || !['customer', 'provider'].includes(state)) {
          console.log('❌ Invalid or missing role:', state);
          setStatus('error');
          setErrorMessage('Invalid role selection');
          return;
        }

        console.log('✅ Google OAuth Code:', code);
        console.log('✅ User Role:', state);
        
        // Call backend with code and role (narrow type)
        const role = state as 'customer' | 'provider';
        const authResponse = await googleAuthCallback(code, role);
        console.log('✅ Auth response:', authResponse);
        
        // Send success message to parent window (don't store in popup localStorage)
        if (window.opener) {
          const messageData: PostMessageData = {
            type: 'GOOGLE_AUTH_SUCCESS',
            token: authResponse.authToken,
            user: authResponse.user,
          };
          window.opener.postMessage(messageData, window.location.origin);
        }
        
        setStatus('success');
        
        // Close popup immediately after sending message
        setTimeout(() => {
          window.close();
        }, 10000);

      } catch (error) {
        console.error('Auth callback error:', error);
        
        // Extract the backend error message if available
        const backendMessage = error instanceof Error ? error.message : '';
        
        // Use backend message if available, otherwise use generic message
        const errorMessage = backendMessage || 'Authentication failed. Please try again.';
        
        setStatus('error');
        setErrorMessage(errorMessage);

        // Send error to parent window
        if (window.opener) {
          const messageData: PostMessageData = {
            type: 'GOOGLE_AUTH_ERROR',
            error: errorMessage,
          };
          window.opener.postMessage(messageData, window.location.origin);
        }

        // Close popup after a short delay
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen bg-white relative">
      {/* Google logo - top left */}
      <div className="absolute top-6 left-6">
        <div className="h-8 w-8 flex items-center justify-center">
          <GoogleIcon className="w-8 h-8" />
        </div>
      </div>

      {/* Centered loader and text */}
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-gray-200 border-t-[#4285F4] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 text-base">Signing you in with Google…</p>
          {status === 'error' && (
            <p className="text-sm text-red-600 mt-2">Authentication failed</p>
          )}
        </div>
      </div>
    </div>
  );
}
