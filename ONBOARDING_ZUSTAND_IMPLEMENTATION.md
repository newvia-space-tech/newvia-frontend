# Provider Onboarding Zustand Implementation Guide

This document explains the Zustand state management integration for the provider onboarding flow.

## Overview

The provider onboarding flow has been refactored to use Zustand for centralized state management, eliminating prop drilling and enabling data persistence across page refreshes.

## Installation

First, install Zustand:

```bash
npm install zustand
```

## Architecture

### 1. **Type Definitions** (`src/types/onboarding.ts`)

All TypeScript types for the onboarding flow:
- `Service`: Individual service details
- `WorkingHours`: Business working hours structure
- `Step1Data`, `Step2Data`, `Step3Data`: Step-specific data types
- `ProviderData`: Complete provider data combining all steps
- `OnboardingStore`: Zustand store interface

### 2. **Zustand Store** (`src/stores/useOnboardingStore.ts`)

Central state management with:
- **State**: `currentStep` and `providerData` (step1, step2, step3)
- **Navigation Actions**: `nextStep()`, `prevStep()`, `setStep(step)`
- **Data Actions**: `updateStep1Data()`, `updateStep2Data()`, `updateStep3Data()`
- **Reset**: `resetStore()` to clear state after submission
- **Persistence**: localStorage using Zustand's persist middleware

#### Key Features:
- ✅ Automatic localStorage persistence
- ✅ Files excluded from persistence (can't serialize File objects)
- ✅ Immutable state updates
- ✅ Optimized selector hooks

### 3. **Component Integration**

#### **Step1 Component** (Business Information)
```typescript
import { useOnboardingStore } from '@/stores/useOnboardingStore';

export default function Step1() {
  const step1Data = useOnboardingStore((state) => state.providerData.step1);
  const updateStep1Data = useOnboardingStore((state) => state.updateStep1Data);
  const nextStep = useOnboardingStore((state) => state.nextStep);

  // Update a field
  const handleInputChange = (field: string, value: string) => {
    updateStep1Data({ [field]: value });
  };

  // Navigate to next step
  const handleSubmit = () => {
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    // JSX using step1Data
  );
}
```

#### **Step2 Component** (Location & Availability)
```typescript
export default function Step2() {
  const step2Data = useOnboardingStore((state) => state.providerData.step2);
  const updateStep2Data = useOnboardingStore((state) => state.updateStep2Data);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const prevStep = useOnboardingStore((state) => state.prevStep);

  // Update working hours (nested object)
  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    updateStep2Data({
      workingHours: {
        ...step2Data.workingHours,
        [day]: {
          ...step2Data.workingHours[day],
          [field]: value,
        },
      },
    });
  };
}
```

#### **Step3 Component** (Services & Pricing)
```typescript
export default function Step3() {
  const step3Data = useOnboardingStore((state) => state.providerData.step3);
  const updateStep3Data = useOnboardingStore((state) => state.updateStep3Data);

  // Add service to array
  const handleAddNewService = (service: Service) => {
    updateStep3Data({
      services: [...step3Data.services, service]
    });
  };

  // Edit service in array
  const handleEditService = (service: Service) => {
    updateStep3Data({
      services: step3Data.services.map(s => 
        s.id === service.id ? service : s
      )
    });
  };

  // Delete service from array
  const handleDeleteService = (id: string) => {
    updateStep3Data({
      services: step3Data.services.filter(s => s.id !== id)
    });
  };
}
```

#### **Step4 Component** (Review & Submit)
```typescript
export default function Step4() {
  const providerData = useOnboardingStore((state) => state.providerData);
  const setStep = useOnboardingStore((state) => state.setStep);
  const resetStore = useOnboardingStore((state) => state.resetStore);

  // Jump to specific step for editing (available from step 4)
  const handleEdit = (step: number) => {
    setStep(step);
  };

  // Final submission
  const handleSubmit = async () => {
    try {
      // API call to submit data
      const response = await submitOnboarding(providerData);
      
      if (response.success) {
        // Clear store after successful submission
        resetStore();
        // Navigate to success page
        router.push('/provider/dashboard');
      }
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };
}
```

#### **Page Component** (`provider-onboarding/page.tsx`)
```typescript
export default function ProviderOnboardingPage() {
  const currentStep = useOnboardingStore((state) => state.currentStep);

  // No more prop drilling! Steps manage their own state
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1 />;
      case 2: return <Step2 />;
      case 3: return <Step3 />;
      case 4: return <Step4 />;
      default: return <Step1 />;
    }
  };

  return (
    <div>
      <Stepper currentStep={currentStep} steps={steps} />
      {renderStepContent()}
    </div>
  );
}
```

## Usage Patterns

### ✅ **DO: Use Partial Updates**
```typescript
// Good - only update what changed
updateStep1Data({ businessName: 'New Name' });
```

### ❌ **DON'T: Replace Entire Objects**
```typescript
// Bad - overwrites other fields
updateStep1Data({ 
  businessName: 'New Name'
  // Missing: category, businessRegistrationNumber, etc.
});
```

### ✅ **DO: Preserve Nested State**
```typescript
// Good - preserves existing working hours
updateStep2Data({
  workingHours: {
    ...step2Data.workingHours,
    Monday: { ...step2Data.workingHours.Monday, isOpen: true }
  }
});
```

### ✅ **DO: Use Selector Hooks for Performance**
```typescript
// Optimized - only re-renders when step1Data changes
const step1Data = useOnboardingStore((state) => state.providerData.step1);

// Alternative: Use pre-defined selector hooks
import { useStep1Data } from '@/stores/useOnboardingStore';
const step1Data = useStep1Data();
```

## Data Persistence

### What's Persisted:
- ✅ Current step number
- ✅ All form field values (text, numbers, booleans)
- ✅ Working hours configuration
- ✅ Services array

### What's NOT Persisted:
- ❌ File uploads (gallery images)
  - Files are reset to empty array on page reload
  - Reason: File objects cannot be serialized to JSON

### Manual Persistence Control:
```typescript
// Clear persisted data manually
localStorage.removeItem('provider-onboarding-storage');

// Or use resetStore()
const resetStore = useOnboardingStore((state) => state.resetStore);
resetStore();
```

## Navigation Flow

### Linear Navigation (Steps 1-3):
```typescript
nextStep();  // Move forward
prevStep();  // Move backward
```

### Jump Navigation (Step 4+):
```typescript
setStep(1);  // Jump to step 1 for editing
setStep(2);  // Jump to step 2 for editing
setStep(3);  // Jump to step 3 for editing
```

**Note**: Jump navigation is typically only enabled from the Review (Step 4) via Edit buttons.

## Form Validation

Validation remains local to each step component:

```typescript
const [errors, setErrors] = useState<FormErrors>({});

const validateForm = (): boolean => {
  const newErrors: FormErrors = {};
  
  if (!step1Data.businessName.trim()) {
    newErrors.businessName = 'Business name is required';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = () => {
  if (validateForm()) {
    nextStep();
  }
};
```

## Testing Persistence

1. **Fill out Step 1** and continue
2. **Fill out Step 2** and continue
3. **Refresh the browser** (F5 or Ctrl+R)
4. **Verify**: You should be on Step 3 with all previous data intact
5. **Note**: Gallery images will be cleared due to File serialization limitation

## Debugging

Access store state in browser console:

```javascript
// View current state
useOnboardingStore.getState()

// View persisted state
JSON.parse(localStorage.getItem('provider-onboarding-storage'))

// Manually update state
useOnboardingStore.setState({ currentStep: 2 })

// Subscribe to changes
useOnboardingStore.subscribe(console.log)
```

## Migration Notes

### Before (Props Drilling):
```typescript
<Step1 onContinue={(data) => {
  setStepData(prev => ({ ...prev, ...data }));
  setCurrentStep(2);
}} />
```

### After (Zustand):
```typescript
<Step1 />  // No props needed!
```

### Benefits:
- ✅ No prop drilling
- ✅ Data persists across refreshes
- ✅ Centralized state logic
- ✅ Easier to test and maintain
- ✅ Better TypeScript support
- ✅ Free jump navigation from step 4

## Files Created/Modified

### New Files:
- `src/types/onboarding.ts` - Type definitions
- `src/stores/useOnboardingStore.ts` - Zustand store

### Modified Files:
- `src/components/provider-onboarding/Step1.tsx`
- `src/components/provider-onboarding/Step2.tsx`
- `src/components/provider-onboarding/Step3.tsx`
- `src/components/provider-onboarding/Step4.tsx`
- `src/app/(protected)/(provider)/provider-onboarding/page.tsx`

## Next Steps

1. Install Zustand: `npm install zustand`
2. Test the onboarding flow
3. Implement API submission in Step4's `handleSubmit`
4. Add error handling for failed submissions
5. Consider adding loading states during navigation
6. Optionally add analytics tracking for step completions

## API Submission Example

```typescript
// In Step4 component
const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    
    // Transform data for API
    const formData = new FormData();
    
    // Add step1 data
    formData.append('businessName', providerData.step1.businessName);
    formData.append('category', providerData.step1.category);
    
    // Add gallery files
    providerData.step1.gallery.forEach((file, index) => {
      formData.append(`gallery_${index}`, file);
    });
    
    // Add step2 data
    formData.append('businessAddress', providerData.step2.businessAddress);
    formData.append('workingHours', JSON.stringify(providerData.step2.workingHours));
    
    // Add step3 data
    formData.append('services', JSON.stringify(providerData.step3.services));
    
    const response = await fetch('/api/provider/onboarding', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) throw new Error('Submission failed');
    
    // Success! Clear store
    resetStore();
    router.push('/provider/dashboard?onboarding=success');
    
  } catch (error) {
    console.error('Submission error:', error);
    setSubmitError('Failed to submit onboarding. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Support

For questions or issues with the Zustand implementation, refer to:
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- Project workspace rules in `.cursor/rules/project-rules.mdc`

