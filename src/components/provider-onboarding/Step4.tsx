'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Store, MapPin, Tag as TagIcon, Pencil, Clock3 } from 'lucide-react';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { transformOnboardingDataToApi, validateOnboardingPayload } from '@/lib/onboarding-transform';
import { submitProviderOnboarding } from '@/services/business/business';
import { useAuth } from '@/context/AuthContext';
import SubmissionSuccessModal from './SubmissionSuccessModal';

export default function Step4() {
  const router = useRouter();
  const { user, authToken, logout } = useAuth();
  const providerData = useOnboardingStore((state) => state.providerData);
  const prevStep = useOnboardingStore((state) => state.prevStep);
  const setStep = useOnboardingStore((state) => state.setStep);
  const resetStore = useOnboardingStore((state) => state.resetStore);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (providerData.step1.gallery && providerData.step1.gallery.length > 0) {
      const previews = providerData.step1.gallery.map((file) => URL.createObjectURL(file));
      setGalleryPreviews(previews);

      // Cleanup function
      return () => {
        previews.forEach((url) => URL.revokeObjectURL(url));
      };
    } else {
      setGalleryPreviews([]);
    }
  }, [providerData.step1.gallery]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
  };

  const formatTime = (time: string) => {
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayName = (key: string) => {
    const days: { [key: string]: string } = {
      Sunday: 'Sunday',
      Monday: 'Monday',
      Tuesday: 'Tuesday',
      Wednesday: 'Wednesday',
      Thursday: 'Thursday',
      Friday: 'Friday',
      Saturday: 'Saturday',
    };
    return days[key] || key;
  };


  const handleEdit = (step: number) => {
    setStep(step);
  };

  const handleBack = () => {
    prevStep();
  };

  const handleSubmit = async () => {
    try {
      // Check if user is authenticated
      if (!user || !authToken) {
        alert('You must be logged in to submit the onboarding form.');
        router.push('/auth/login/provider');
        return;
      }

      setIsSubmitting(true);
      
      // Transform store data to API payload format
      const apiPayload = transformOnboardingDataToApi(providerData, user.id);
      
      // Validate payload before submission
      const validation = validateOnboardingPayload(apiPayload);
      if (!validation.isValid) {
        alert(`Validation error: ${validation.error}`);
        setIsSubmitting(false);
        return;
      }
      
      console.log('API Payload:', JSON.stringify(apiPayload, null, 2));
      
      // Submit to API
      const response = await submitProviderOnboarding(apiPayload, authToken);
      
      console.log('API Response:', response);
      
      // Show success modal
      setIsSuccessModalOpen(true);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      alert(`Submission failed: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleModalClose = async () => {
    setIsSuccessModalOpen(false);
    
    // Log out the current provider user
    console.log('Logging out provider user:', user);
    await logout();
    
    // Reset the onboarding store
    resetStore();
    
    // Navigate to landing page
    router.push('/');
  };

  return (
    <div className="max-w-[980px] mx-auto space-y-4 sm:space-y-5">
      {/* Review & Submit Content */}
      <div className="bg-white rounded-xl p-4 sm:p-5 w-full">
        <h2 className="text-xl font-semibold text-black mb-5" style={{ fontFamily: 'Lato, sans-serif' }}>
          Review & Submit
        </h2>

        {/* Business Info Section */}
        <div className="border border-[#e5e7ea] rounded-lg p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Store className="w-5 h-5 text-black" />
              <h3 className="text-base font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                Business Info
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleEdit(1)}
              className="border border-[#e5e7ea] rounded-lg px-4 py-1.5 flex items-center gap-2 text-base text-[#797e84] hover:bg-gray-50 transition-colors"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              <Pencil className="w-[18px] h-[18px]" />
              Edit
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Business Info Fields */}
            <div className="flex gap-6">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Business Name
                </label>
                <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {providerData.step1.businessName || '-'}
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Business Registration Number
                </label>
                <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {providerData.step1.businessRegistrationNumber || '-'}
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Category
                </label>
                <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {providerData.step1.categoryName || '-'}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                Description
              </label>
              <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                {providerData.step1.shortDescription || '-'}
              </p>
            </div>

            {/* Gallery */}
            {galleryPreviews.length > 0 && (
              <div className="flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Gallery
                </label>
                <div className="flex gap-3">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative w-[120px] h-[120px] rounded-xl overflow-hidden bg-[#e0e2e6]">
                      <img
                        src={preview}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Location & Availability Section */}
        <div className="border border-[#e5e7ea] rounded-lg p-5 mb-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-black" />
              <h3 className="text-base font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                Location & Availability
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleEdit(2)}
              className="border border-[#e5e7ea] rounded-lg px-4 py-1.5 flex items-center gap-2 text-base text-[#797e84] hover:bg-gray-50 transition-colors"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              <Pencil className="w-[18px] h-[18px]" />
              Edit
            </button>
          </div>

          <div className="flex flex-col gap-6">
            {/* Address */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                Address
              </label>
              <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                {providerData.step2.businessAddress || '-'}
              </p>
            </div>

            {/* City, State, Postal Code */}
            <div className="flex gap-5">
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  City
                </label>
                <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {providerData.step2.cityName || '-'}
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  State
                </label>
                <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {providerData.step2.stateName || '-'}
                </p>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Postal Code
                </label>
                <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {providerData.step2.postalCode || '-'}
                </p>
              </div>
            </div>

            {/* Phone, Social Media, Consultancy */}
            <div className="flex gap-5">
              <div className="w-[253px] flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Business Phone Number
                </label>
                <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {providerData.step2.businessPhoneNumber || '-'}
                </p>
              </div>
              <div className="w-[253px] flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Social Media
                </label>
                <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {providerData.step2.socialMedia || '-'}
                </p>
              </div>
              <div className="w-[253px] flex flex-col gap-2">
                <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                  Free Consultancy
                </label>
                <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {providerData.step2.freeOnlineConsultancy ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                Working Hours
              </label>
              <div className="flex flex-col gap-2">
                {providerData.step2.workingHours &&
                  Object.entries(providerData.step2.workingHours).map(([day, hours]) => {
                    if (!hours.isOpen) return null;
                    return (
                      <div
                        key={day}
                        className="flex items-center justify-between w-[308px] rounded-lg"
                      >
                        <p className="text-base text-black w-[100px]" style={{ fontFamily: 'Lato, sans-serif' }}>
                          {getDayName(day)}
                        </p>
                        <p className="text-base text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                          {formatTime(hours.startTime)} to {formatTime(hours.endTime)}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Services & Pricing Section */}
        <div className="border border-[#e5e7ea] rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <TagIcon className="w-5 h-5 text-black" />
              <h3 className="text-base font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                Services & Pricing
              </h3>
            </div>
            <button
              type="button"
              onClick={() => handleEdit(3)}
              className="border border-[#e5e7ea] rounded-lg px-4 py-1.5 flex items-center gap-2 text-base text-[#797e84] hover:bg-gray-50 transition-colors"
              style={{ fontFamily: 'Lato, sans-serif' }}
            >
              <Pencil className="w-[18px] h-[18px]" />
              Edit
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {providerData.step3.services && providerData.step3.services.length > 0 ? (
              providerData.step3.services.map((service, index) => (
                <div key={service.id}>
                  <div className="flex gap-10 items-end">
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex flex-col gap-1">
                        <h4 className="text-base font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                          {service.name}
                        </h4>
                        <p className="text-base text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                          {service.description}
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <Clock3 className="w-[18px] h-[18px] text-[#797e84]" />
                          <span className="text-base text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                            {formatDuration(service.duration)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TagIcon className="w-[18px] h-[18px] text-[#797e84]" />
                          <span className="text-base text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                            RMA {service.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < providerData.step3.services!.length - 1 && (
                    <div className="h-px bg-gray-200 mt-4" />
                  )}
                </div>
              ))
            ) : (
              <p className="text-base text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                No services added
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-end gap-4 w-full">
        <button
          type="button"
          onClick={handleBack}
          className="px-4 py-3 rounded-lg flex items-center gap-2 text-base font-normal border border-[#e5e7ea] text-[#797e84] hover:bg-gray-50 transition-colors min-w-[160px] justify-center"
          style={{ fontFamily: 'Lato, sans-serif' }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-4 py-3 rounded-lg flex items-center gap-2 text-base font-normal transition-colors min-w-[160px] justify-center ${
            isSubmitting
              ? 'bg-[#6290f2] text-white opacity-60 cursor-not-allowed'
              : 'bg-[#6290f2] text-white hover:bg-[#4a7ae8]'
          }`}
          style={{ fontFamily: 'Lato, sans-serif' }}
        >
          {isSubmitting ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              Submit For Review
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Success Modal */}
      <SubmissionSuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={handleModalClose} 
      />
    </div>
  );
}

