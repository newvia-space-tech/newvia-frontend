/**
 * Provider Onboarding Store
 * Central Zustand store for managing the entire provider onboarding flow
 * with data persistence via localStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  OnboardingStore,
  ProviderData,
  Step1Data,
  Step2Data,
  Step3Data,
  WorkingHours,
} from '@/types/onboarding';

// Initial state values
const initialStep1Data: Step1Data = {
  businessName: '',
  categoryId: '',
  categoryName: '',
  businessRegistrationNumber: '',
  shortDescription: '',
  gallery: [],
};

const initialWorkingHours: WorkingHours = {
  Monday: { isOpen: true, startTime: '9:00', endTime: '18:00' },
  Tuesday: { isOpen: true, startTime: '9:00', endTime: '18:00' },
  Wednesday: { isOpen: true, startTime: '9:00', endTime: '18:00' },
  Thursday: { isOpen: true, startTime: '9:00', endTime: '18:00' },
  Friday: { isOpen: true, startTime: '9:00', endTime: '18:00' },
  Saturday: { isOpen: true, startTime: '9:00', endTime: '18:00' },
  Sunday: { isOpen: false, startTime: '9:00', endTime: '18:00' },
};

const initialStep2Data: Step2Data = {
  businessAddress: '',
  cityId: '',
  cityName: '',
  stateId: '',
  stateName: '',
  postalCode: '',
  businessPhoneNumber: '',
  socialMedia: '',
  freeOnlineConsultancy: true,
  workingHours: initialWorkingHours,
};

const initialStep3Data: Step3Data = {
  services: [],
};

const initialProviderData: ProviderData = {
  step1: initialStep1Data,
  step2: initialStep2Data,
  step3: initialStep3Data,
};

// Custom storage for handling File objects
// Files cannot be persisted to localStorage, so we'll exclude them from persistence
const customStorage = {
  getItem: (name: string) => {
    const str = localStorage.getItem(name);
    if (!str) return null;
    const data = JSON.parse(str);
    // Ensure gallery is an empty array after rehydration (Files can't be persisted)
    if (data.state?.providerData?.step1) {
      data.state.providerData.step1.gallery = [];
    }
    return JSON.stringify(data);
  },
  setItem: (name: string, value: string) => {
    const data = JSON.parse(value);
    // Create a copy without File objects for localStorage
    const stateToSave = {
      ...data,
      state: {
        ...data.state,
        providerData: {
          ...data.state.providerData,
          step1: {
            ...data.state.providerData.step1,
            gallery: [], // Don't persist File objects
          },
        },
      },
    };
    localStorage.setItem(name, JSON.stringify(stateToSave));
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
  },
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      // Initial State
      currentStep: 1,
      providerData: initialProviderData,

      // Navigation Actions
      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1),
        })),

      setStep: (step: number) =>
        set(() => ({
          currentStep: Math.min(Math.max(step, 1), 4),
        })),

      // Data Update Actions
      updateStep1Data: (data: Partial<Step1Data>) =>
        set((state) => ({
          providerData: {
            ...state.providerData,
            step1: {
              ...state.providerData.step1,
              ...data,
            },
          },
        })),

      updateStep2Data: (data: Partial<Step2Data>) =>
        set((state) => ({
          providerData: {
            ...state.providerData,
            step2: {
              ...state.providerData.step2,
              ...data,
            },
          },
        })),

      updateStep3Data: (data: Partial<Step3Data>) =>
        set((state) => ({
          providerData: {
            ...state.providerData,
            step3: {
              ...state.providerData.step3,
              ...data,
            },
          },
        })),

      // Reset Action
      resetStore: () =>
        set(() => ({
          currentStep: 1,
          providerData: initialProviderData,
        })),
    }),
    {
      name: 'provider-onboarding-storage',
      storage: createJSONStorage(() => customStorage),
      // Optionally specify which parts of the state to persist
      partialize: (state) => ({
        currentStep: state.currentStep,
        providerData: state.providerData,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useCurrentStep = () => useOnboardingStore((state) => state.currentStep);
export const useStep1Data = () => useOnboardingStore((state) => state.providerData.step1);
export const useStep2Data = () => useOnboardingStore((state) => state.providerData.step2);
export const useStep3Data = () => useOnboardingStore((state) => state.providerData.step3);
export const useProviderData = () => useOnboardingStore((state) => state.providerData);

