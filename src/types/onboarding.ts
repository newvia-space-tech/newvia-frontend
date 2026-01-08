/**
 * Provider Onboarding Types
 * Comprehensive type definitions for the provider onboarding flow
 */

// UI Form Types (used in store and components)
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

export interface WorkingHours {
  [key: string]: {
    isOpen: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface Step1Data {
  businessName: string;
  categoryId: string; // UUID for category
  categoryName: string; // Name of selected category
  businessRegistrationNumber: string;
  shortDescription: string;
  gallery: File[];
}

export interface Step2Data {
  businessAddress: string;
  cityId: string; // UUID for city
  cityName: string; // Name of selected city
  stateId: string; // UUID for state
  stateName: string; // Name of selected state
  postalCode: string;
  businessPhoneNumber: string;
  socialMedia: string;
  freeOnlineConsultancy: boolean;
  workingHours: WorkingHours;
}

export interface Step3Data {
  services: Service[];
}

export interface ProviderData {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
}

export interface OnboardingStore {
  // State
  currentStep: number;
  providerData: ProviderData;
  
  // Navigation Actions
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  
  // Data Update Actions
  updateStep1Data: (data: Partial<Step1Data>) => void;
  updateStep2Data: (data: Partial<Step2Data>) => void;
  updateStep3Data: (data: Partial<Step3Data>) => void;
  
  // Reset Action
  resetStore: () => void;
}

// API Submission Types (matches backend API format exactly)
export interface ApiWorkingHours {
  day: number; // 0-6 (Sunday-Saturday)
  start_time: number; // Unix timestamp in milliseconds
  end_time: number; // Unix timestamp in milliseconds
  is_open: boolean; // Whether the business is open on this day
}

export interface ApiService {
  name: string;
  duration: number;
  price: number;
  description: string;
}

export interface ApiOnboardingPayload {
  business_name: string;
  business_category_id: string;
  business_registration_number: string;
  description: string;
  business_address: string;
  city_id: string;
  state_id: string;
  postal_code: string;
  phone_number: string;
  social_media_url: string;
  free_online_consultancy: boolean;
  working_hours: ApiWorkingHours[];
  services: ApiService[];
  user_id: string;
  images: string[]; // Array of uploaded image URLs
  timezone: string; // User's timezone (e.g., "Asia/Kolkata")
}

