'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminLogin } from '@/services/auth/auth';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { adminLogin: authAdminLogin, isAdminAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAdminAuthenticated) {
      router.replace('/admin/overview');
    }
  }, [isAdminAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const response = await adminLogin({
        email_id: email,
        password: password,
      });

      // Store admin token
      authAdminLogin(response.token);

      // Show success state
      setIsLoading(false);
      setIsSuccess(true);

      // Wait 1.5 seconds to show success, then redirect
      setTimeout(() => {
        router.replace('/admin/overview');
      }, 1500);
    } catch (error) {
      console.error('Admin login error:', error);
      
      // Handle different error status codes
      const apiError = error as Error & { status?: number };
      if (apiError.status === 400) {
        // Invalid credentials
        setErrorMessage(apiError.message || 'Invalid credentials. Please check your email and password.');
      } else {
        // Other errors
        setErrorMessage(apiError.message || 'Login failed. Please try again.');
      }
      setIsLoading(false);
      setIsSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#425f4d] relative flex items-center justify-center p-6">
      <div className="bg-white rounded-xl p-6 w-full max-w-[503px] shadow-lg">
        {/* Logo */}
        <div className="flex flex-col items-start gap-6 mb-6">
          <div className="h-[60px] w-[60px] relative">
            <Image
              src="/figma-assets/logo.svg"
              alt="NewVia Logo"
              width={60}
              height={60}
              className="w-full h-full"
              priority
            />
          </div>

          {/* Title and Subtitle */}
          <div className="flex flex-col gap-2 w-full">
            <h1 
              className="text-[32px] font-bold text-black leading-[40px]"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              New Via for admin
            </h1>
            <p 
              className="text-base text-[rgba(0,0,0,0.6)] leading-[24px]"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Login to access the admin portal
            </p>
          </div>
        </div>

        {/* Success Message */}
        {isSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-green-800">Login successful! Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label 
              className="text-sm text-black leading-[20px]"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Email address
            </label>
            <div className="border border-[#e5e7ea] rounded-lg">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gmail.com"
                className="w-full px-[14px] py-3 rounded-lg text-base text-[#9ea5ad] focus:outline-none focus:ring-2 focus:ring-[#6290f2] focus:border-transparent"
                style={{ fontFamily: 'Lato, sans-serif' }}
                required
                disabled={isLoading || isSuccess}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label 
              className="text-sm text-black leading-[20px]"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              Password
            </label>
            <div className="border border-[#e5e7ea] rounded-lg relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-[14px] py-3 pr-10 rounded-lg text-base text-[#9ea5ad] focus:outline-none focus:ring-2 focus:ring-[#6290f2] focus:border-transparent"
                style={{ fontFamily: 'Lato, sans-serif' }}
                required
                disabled={isLoading || isSuccess}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#9ea5ad] hover:text-black transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className={`bg-[#6290f2] text-white rounded-lg px-4 py-3 min-h-[40px] text-base font-normal transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed ${
              isLoading || isSuccess ? 'opacity-40' : ''
            }`}
            style={{ 
              fontFamily: 'Lato, sans-serif',
              lineHeight: '24px'
            }}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                Logging in...
              </>
            ) : isSuccess ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2" />
                Redirecting...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

