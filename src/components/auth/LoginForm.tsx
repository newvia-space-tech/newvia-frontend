'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { UserRole } from '@/types';
import { login } from '@/services/auth/auth';

interface LoginFormProps {
  role: UserRole;
}

export default function LoginForm({ role }: LoginFormProps) {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { isAuthenticated, user, login: authLogin } = useAuth();
  const router = useRouter();

  // This effect is kept minimal since GoogleLoginButton handles all routing logic
  // It only handles the case where user is already authenticated (e.g., page refresh)
  useEffect(() => {
    if (isAuthenticated && user) {
      // This shouldn't normally trigger since GoogleLoginButton handles routing
      // But kept as a safeguard for edge cases (e.g., direct navigation to login while authenticated)
      if (user.role === 'provider') {
        // Don't redirect if under review - user shouldn't be authenticated in this state
        if (user.isOnboarded === true && user.isReviewed === false) {
          return;
        }
        // Redirect based on onboarding status
        const target = user.isOnboarded === false ? '/provider-onboarding' : '/provider-management/overview';
        router.replace(target);
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, user, router]);

  const handleAuthError = (error: string) => {
    console.error("Auth Error:", error); // Log internally for debugging
  
    // Show the error message directly (already safe from GoogleLoginButton)
    setErrorMessage(error || "Authentication failed. Please try again.");
  
    // Clear after 7 seconds for longer messages
    setTimeout(() => setErrorMessage(''), 7000);
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setIsSuccess(false);

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
        role: role,
      });

      // Login successful - store auth data
      authLogin(response.authToken, response.user);

      // Show success state
      setIsLoading(false);
      setIsSuccess(true);

      // Wait 1.5 seconds to show success, then redirect
      setTimeout(() => {
        // Handle redirect based on role and user state
        if (role === 'provider') {
          // For providers, check onboarding status
          // Note: API response doesn't include isOnboarded/isReviewed, so we'll redirect to onboarding
          // The onboarding page or provider dashboard will handle validation
          router.replace('/provider-onboarding');
        } else {
          // For customers, redirect to home
          router.replace('/');
        }
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error status codes
      const apiError = error as Error & { status?: number };
      if (apiError.status === 500) {
        // Invalid credentials
        setErrorMessage(apiError.message || 'Invalid credentials. Please check your email and password.');
      } else if (apiError.status === 400) {
        // Bad request - validation error
        setErrorMessage(apiError.message || 'Please check your input and try again');
      } else {
        // Other errors
        setErrorMessage(apiError.message || 'Login failed. Please try again.');
      }
      setIsLoading(false);
      setIsSuccess(false);
    }
  };
  

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Logo - Top Left */}
      <div className="absolute top-8 left-8 z-20">
        <Link href="/">
          <Image
            src="/figma-assets/header-logo.svg"
            alt="NewVia"
            width={100}
            height={80}
            className="w-auto h-12"
            priority
          />
        </Link>
      </div>

      {/* Left Side - Background Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="relative w-full h-full">
          <Image
            src="/figma-assets/hero-background.svg"
            alt=""
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 sm:px-16 relative z-10">
        <div className="w-full max-w-md space-y-8">
          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-gray-800 tracking-tight">
              New Via
            </h1>
            <h2 className="text-4xl font-semibold text-gray-800">
              for {role === 'customer' ? 'customers' : 'providers'}
            </h2>
            <p className="text-gray-600 text-base mt-4 text-sm">
              {role === 'customer' 
                ? 'Create an account or log in to book and manage your appointments.'
                : 'Create an account or log in to manage your services and bookings.'
              }
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-green-800">Login successful! Redirecting...</p>
                </div>
                <div className="ml-3">
                  <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs text-gray-700 font-medium"
              >
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading || isSuccess}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs text-gray-700 font-medium"
              >
                Password *
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading || isSuccess}
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full bg-blue-500 text-white text-base px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : isSuccess ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecting...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="text-sm text-gray-500 font-medium">or</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Google Login Button */}
          <div className="space-y-4">
            <GoogleLoginButton onError={handleAuthError} role={role}>
              Continue with Google
            </GoogleLoginButton>

            {/* Create Account Link */}
            <p className="text-gray-600 text-sm">
              Don&apos;t have an account?{' '}
              <Link 
                href={`/auth/create-account/${role}`} 
                className="text-gray-800 hover:text-gray-900 font-semibold hover:underline"
              >
                Create an Account
              </Link>
            </p>
          </div>

          {/* Terms and Privacy */}
          <p className="text-xs text-gray-500 mt-6">
            By continuing, you agree to our{' '}
            <a href="#" className="text-gray-700 hover:underline font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-gray-700 hover:underline font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
