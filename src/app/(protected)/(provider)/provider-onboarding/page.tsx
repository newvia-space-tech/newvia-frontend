'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { X } from 'lucide-react';
import Stepper from '@/components/provider/Stepper';
import Step1 from '@/components/provider-onboarding/Step1';
import Step2 from '@/components/provider-onboarding/Step2';
import Step3 from '@/components/provider-onboarding/Step3';
import Step4 from '@/components/provider-onboarding/Step4';
import ExitConfirmationModal from '@/components/provider-onboarding/ExitConfirmationModal';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useAuth } from '@/context/AuthContext';

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const setStep = useOnboardingStore((state) => state.setStep);
  const resetStore = useOnboardingStore((state) => state.resetStore);
  const { logout } = useAuth();
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const hasInitialized = useRef(false);
  const isHandlingPopState = useRef(false);

  // Initialize URL on mount if needed
  useEffect(() => {
    if (!hasInitialized.current) {
      const stepFromUrl = searchParams.get('step');
      if (!stepFromUrl) {
        // Set initial step in URL if not present
        router.replace(`?step=${currentStep}`, { scroll: false });
      } else {
        // Sync store to URL on initial load
        const urlStep = parseInt(stepFromUrl, 10);
        if (urlStep >= 1 && urlStep <= 4 && urlStep !== currentStep) {
          setStep(urlStep);
        }
      }
      
      // Push a dummy history state to create a boundary for back button handling
      // This ensures that when user presses back from step 1, we can intercept it
      window.history.pushState({ onboardingBoundary: true }, '', window.location.href);
      
      hasInitialized.current = true;
    }
  }, [searchParams, currentStep, setStep, router]); // Dependencies included, but ref prevents re-runs

  // Handle browser back/forward button navigation
  useEffect(() => {
    if (!hasInitialized.current) return;

    const handlePopState = () => {
      isHandlingPopState.current = true;
      
      // Get the current URL step from the actual URL
      const url = new URL(window.location.href);
      const stepParam = url.searchParams.get('step');
      const urlStep = stepParam ? parseInt(stepParam, 10) : null;
      
      // If no step in URL or trying to leave, show exit modal
      if (!urlStep || urlStep < 1) {
        // User is trying to leave the onboarding flow
        setIsExitModalOpen(true);
        // Push the state back to prevent actual navigation away
        window.history.pushState(null, '', `?step=1`);
        setStep(1);
      } else if (urlStep >= 1 && urlStep <= 4) {
        // Valid step navigation - sync the store
        setStep(urlStep);
      }
      
      setTimeout(() => {
        isHandlingPopState.current = false;
      }, 100);
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [setStep]);

  // Handle URL changes (browser back/forward) - sync store to URL
  useEffect(() => {
    if (!hasInitialized.current || isHandlingPopState.current) return;
    
    const stepFromUrl = searchParams.get('step');
    if (stepFromUrl) {
      const urlStep = parseInt(stepFromUrl, 10);
      // Only sync if URL step is valid and differs from store
      if (urlStep >= 1 && urlStep <= 4 && urlStep !== currentStep) {
        setStep(urlStep);
      }
    }
  }, [searchParams, currentStep, setStep]);

  // Update URL when step changes in store (user navigation)
  useEffect(() => {
    if (!hasInitialized.current || isHandlingPopState.current) return;
    
    const stepFromUrl = searchParams.get('step');
    const urlStep = stepFromUrl ? parseInt(stepFromUrl, 10) : null;
    
    // Only update URL if it doesn't match current step
    if (urlStep !== currentStep) {
      router.push(`?step=${currentStep}`, { scroll: false });
    }
  }, [currentStep, router]);

  const steps = [
    { number: 1, title: 'Business Information', subtitle: 'Step 1' },
    { number: 2, title: 'Location & Availability', subtitle: 'Step 2' },
    { number: 3, title: 'Services & Pricing', subtitle: 'Step 3' },
    { number: 4, title: 'Review & Submit', subtitle: 'Step 4' },
  ];

  const handleExitClick = () => {
    setIsExitModalOpen(true);
  };

  const handleExitConfirm = () => {
    // Reset the onboarding store
    resetStore();
    // Clear onboarding data from localStorage
    localStorage.removeItem('provider-onboarding-storage');
    // Logout the user
    logout();
    // Modal will close automatically via logout redirect
  };

  const handleExitCancel = () => {
    setIsExitModalOpen(false);
    // Ensure we stay on the current step
    if (currentStep === 1) {
      window.history.pushState(null, '', `?step=1`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1 />;
      case 2:
        return <Step2 />;
      case 3:
        return <Step3 />;
      case 4:
        return <Step4 />;
      default:
        return <Step1 />;
    }
  };

  return (
    <div className="h-screen bg-[#f8f9f8] flex flex-col lg:flex-row overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-[40px] py-4 sm:py-5 lg:py-[20px]">
          <div className="h-[50px] sm:h-[56px] lg:h-[62px] w-[50px] sm:w-[56px] lg:w-[60px] flex items-center pointer-events-auto">
            <Image
              src="/figma-assets/header-logo.svg"
              alt="NewVia Logo"
              width={60}
              height={60}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <button 
            onClick={handleExitClick}
            className="border border-black/20 rounded-lg p-2 sm:p-2.5 lg:p-3 hover:bg-gray-50 transition-colors pointer-events-auto"
          >
            <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 lg:w-5 lg:h-5 text-black" />
          </button>
        </div>
      </div>

      {/* Left Sidebar - Stepper (Fixed, full height, non-scrollable - 25%) */}
      <div className="hidden lg:flex w-[25%] h-full flex-shrink-0">
        <Stepper currentStep={currentStep} steps={steps} />
      </div>

      {/* Mobile Stepper - Horizontal at top */}
      <div className="lg:hidden w-full bg-[#425f4d] pt-[80px] pb-4 px-4">
        <Stepper currentStep={currentStep} steps={steps} />
      </div>

      {/* Right Content (Scrollable - 75%) */}
      <div className="w-full lg:w-[75%] px-4 sm:px-6 lg:px-[40px] pt-[80px] sm:pt-[90px] lg:pt-[100px] pb-8 sm:pb-10 lg:pb-[60px] overflow-y-auto">
        {renderStepContent()}
      </div>

      {/* Exit Confirmation Modal */}
      <ExitConfirmationModal
        isOpen={isExitModalOpen}
        onClose={handleExitCancel}
        onConfirm={handleExitConfirm}
      />
    </div>
  );
}

export default function ProviderOnboardingPage() {
  return (
    <Suspense fallback={<div className="h-screen bg-[#f8f9f8] flex items-center justify-center">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

