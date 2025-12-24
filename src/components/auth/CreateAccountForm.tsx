'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { UserRole, CreateAccountRequest } from '@/types';
import { createAccount } from '@/services/auth/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface CreateAccountFormProps {
  role: UserRole;
}

export default function CreateAccountForm({ role }: CreateAccountFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    referCode: '',
    countryCode: '+60',
    mobileNumber: '',
    phoneValue: '+60', // Full phone value for PhoneInput
    agreedToTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const accountData: CreateAccountRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        referCode: formData.referCode || undefined,
        countryCode: formData.countryCode,
        mobileNumber: formData.mobileNumber,
        role: role,
        agreedToTerms: formData.agreedToTerms,
      };

      const message = await createAccount(accountData);
      
      // On 200 OK, show success message and wait before redirecting
      setSuccessMessage(message);
      
      // Wait 2.5 seconds before navigating to login page
      setTimeout(() => {
        router.push(`/auth/login/${role}`);
      }, 2500);
    } catch (error) {
      console.error('Account creation error:', error);
      
      // Handle different error status codes
      const apiError = error as Error & { status?: number };
      if (apiError.status === 409) {
        // Conflict - user already exists
        setErrorMessage(apiError.message || 'An account with this email or phone number already exists');
      } else if (apiError.status === 400) {
        // Bad request - validation error
        setErrorMessage(apiError.message || 'Please check your input and try again');
      } else {
        // Other errors
        setErrorMessage(apiError.message || 'Account creation failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
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

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 sm:px-16 relative z-10">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Back Button */}
            <Link
              href={`/auth/login/${role}`}
              className="inline-flex items-center justify-center gap-2 px-3 py-3 border border-black/20 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {/* Heading */}
            <div className="space-y-2">
              <h1 className="text-[40px] font-bold text-gray-800 leading-[48px]">
                Create Your Account
              </h1>
              <p className="text-base text-gray-600 mt-4">
                Create your new account by completing these details
              </p>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-800">{successMessage}</p>
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

            {/* Form Fields */}
            <div className="space-y-4">
              {/* First Name and Last Name */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label
                    htmlFor="firstName"
                    className="block text-xs text-gray-700 font-medium"
                  >
                    First name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label
                    htmlFor="lastName"
                    className="block text-xs text-gray-700 font-medium"
                  >
                    Last name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Email and Password */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
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
                  />
                </div>
                <div className="flex-1 space-y-1.5">
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
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label
                  htmlFor="mobileNumber"
                  className="block text-xs text-gray-700 font-medium"
                >
                  Mobile number *
                </label>
                <PhoneInput
                  country="my"
                  value={formData.phoneValue}
                  onChange={(value, country) => {
                    const dialCode = country && 'dialCode' in country ? `+${country.dialCode}` : '+60';
                    const phoneNumber = value.replace(dialCode, '');
                    setFormData({
                      ...formData,
                      phoneValue: value,
                      countryCode: dialCode,
                      mobileNumber: phoneNumber,
                    });
                  }}
                  inputProps={{
                    id: 'mobileNumber',
                    required: true,
                  }}
                />
              </div>

              {/* Refer Code */}
              <div className="space-y-1.5">
                <label
                  htmlFor="referCode"
                  className="block text-xs text-gray-700 font-medium"
                >
                  Refer Code
                </label>
                <input
                  type="text"
                  id="referCode"
                  value={formData.referCode}
                  onChange={(e) =>
                    setFormData({ ...formData, referCode: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="flex gap-2.5 items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreedToTerms}
                  onChange={(e) =>
                    setFormData({ ...formData, agreedToTerms: e.target.checked })
                  }
                  className="mt-0.5 w-4 h-4 border border-gray-200 rounded accent-blue-500"
                  required
                />
                <label
                  htmlFor="terms"
                  className="text-xs text-gray-600"
                >
                  By continuing, you have read and agree to our{' '}
                  <a href="/terms" className="text-gray-800 underline hover:text-gray-900">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-gray-800 underline hover:text-gray-900">
                    Privacy Statement
                  </a>
                </label>
              </div>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 text-white text-base px-6 py-3.5 rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
