# Provider Onboarding API Integration

## Overview

This document explains how the provider onboarding data is structured, validated, and transformed for API submission.

## Data Flow

```
User Input (Forms) 
  ↓
Zustand Store (UI-friendly format)
  ↓
Transformation Layer
  ↓
API Payload (Backend format)
  ↓
Backend API
```

## Store Data Structure (UI Format)

The Zustand store maintains data in a UI-friendly format:

```typescript
{
  step1: {
    businessName: string,
    categoryId: string,          // UUID
    businessRegistrationNumber: string,
    shortDescription: string,
    gallery: File[]
  },
  step2: {
    businessAddress: string,
    cityId: string,               // UUID
    stateId: string,              // UUID
    postalCode: string,
    businessPhoneNumber: string,
    socialMedia: string,
    freeOnlineConsultancy: boolean,
    workingHours: {
      Monday: { isOpen: boolean, startTime: "9:00", endTime: "18:00" },
      Tuesday: { ... },
      // ... other days
    }
  },
  step3: {
    services: [
      {
        id: string,               // UI-only, not sent to API
        name: string,
        description: string,
        price: number,
        duration: number
      }
    ]
  }
}
```

## API Payload Structure (Backend Format)

The API expects data in this exact format:

```typescript
{
  business_name: string,
  business_category_id: string,
  business_registration_number: string,
  description: string,
  business_address: string,
  city_id: string,
  state_id: string,
  postal_code: string,
  phone_number: string,
  social_media_url: string,
  free_online_consultancy: boolean,
  working_hours: [
    {
      day: number,              // 0-6 (Sunday-Saturday)
      start_time: number,       // Unix timestamp in milliseconds
      end_time: number          // Unix timestamp in milliseconds
    }
  ],
  services: [
    {
      name: string,
      duration: number,
      price: number,
      description: string
    }
  ],
  user_id: string
}
```

## Transformation Example

### Input (Store Data)

```typescript
{
  step1: {
    businessName: "Jagdale Enterprise",
    categoryId: "b12e0e3d-a831-4df4-ae77-cf754b596e56",
    businessRegistrationNumber: "ABC1234PQR",
    shortDescription: "Yoga business",
    gallery: [/* File objects */]
  },
  step2: {
    businessAddress: "X-420, Great Malasyian Road",
    cityId: "6309a89f-b6c7-4e73-a595-265d380d73a9",
    stateId: "a4044edb-960c-4688-b4a5-bfa542283011",
    postalCode: "123456",
    businessPhoneNumber: "1234567891",
    socialMedia: "www.google.com",
    freeOnlineConsultancy: false,
    workingHours: {
      Monday: { isOpen: true, startTime: "10:00", endTime: "18:00" },
      Tuesday: { isOpen: true, startTime: "10:00", endTime: "18:00" },
      Wednesday: { isOpen: true, startTime: "10:00", endTime: "18:00" },
      Thursday: { isOpen: true, startTime: "10:00", endTime: "18:00" },
      Friday: { isOpen: true, startTime: "10:00", endTime: "18:00" },
      Saturday: { isOpen: true, startTime: "10:00", endTime: "18:00" },
      Sunday: { isOpen: true, startTime: "10:00", endTime: "18:00" }
    }
  },
  step3: {
    services: [
      {
        id: "temp-1",
        name: "Best Yoga Service",
        duration: 45,
        price: 75,
        description: "Our best Yoga service in the world"
      },
      {
        id: "temp-2",
        name: "Good Yoga Service",
        duration: 30,
        price: 45,
        description: "Good Yoga Service!!"
      }
    ]
  }
}
```

### Output (API Payload)

```typescript
{
  business_name: "Jagdale Enterprise",
  business_category_id: "b12e0e3d-a831-4df4-ae77-cf754b596e56",
  business_registration_number: "ABC1234PQR",
  description: "Yoga business",
  business_address: "X-420, Great Malasyian Road",
  city_id: "6309a89f-b6c7-4e73-a595-265d380d73a9",
  state_id: "a4044edb-960c-4688-b4a5-bfa542283011",
  postal_code: "123456",
  phone_number: "1234567891",
  social_media_url: "www.google.com",
  free_online_consultancy: false,
  working_hours: [
    { day: 1, start_time: 1763352000000, end_time: 1763388000000 },  // Monday
    { day: 2, start_time: 1763352000000, end_time: 1763388000000 },  // Tuesday
    { day: 3, start_time: 1763352000000, end_time: 1763388000000 },  // Wednesday
    { day: 4, start_time: 1763352000000, end_time: 1763388000000 },  // Thursday
    { day: 5, start_time: 1763352000000, end_time: 1763388000000 },  // Friday
    { day: 6, start_time: 1763352000000, end_time: 1763388000000 },  // Saturday
    { day: 0, start_time: 1763352000000, end_time: 1763388000000 }   // Sunday
  ],
  services: [
    {
      name: "Best Yoga Service",
      duration: 45,
      price: 75,
      description: "Our best Yoga service in the world"
    },
    {
      name: "Good Yoga Service",
      duration: 30,
      price: 45,
      description: "Good Yoga Service!!"
    }
  ],
  user_id: "9d022fac-5331-48ca-9020-ea7613bd0181"
}
```

## Key Transformations

### 1. Field Name Mapping

| Store Field | API Field |
|------------|-----------|
| `businessName` | `business_name` |
| `categoryId` | `business_category_id` |
| `businessRegistrationNumber` | `business_registration_number` |
| `shortDescription` | `description` |
| `businessAddress` | `business_address` |
| `cityId` | `city_id` |
| `stateId` | `state_id` |
| `postalCode` | `postal_code` |
| `businessPhoneNumber` | `phone_number` |
| `socialMedia` | `social_media_url` |
| `freeOnlineConsultancy` | `free_online_consultancy` |

### 2. Working Hours Transformation

**Store Format:**
```typescript
{
  Monday: { isOpen: true, startTime: "10:00", endTime: "18:00" },
  Tuesday: { isOpen: true, startTime: "10:00", endTime: "18:00" }
}
```

**API Format:**
```typescript
[
  { day: 1, start_time: 1735725600000, end_time: 1735754400000 },
  { day: 2, start_time: 1735725600000, end_time: 1735754400000 }
]
```

**Transformations:**
- Day names → Day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
- Time strings ("10:00") → Unix epoch timestamps in milliseconds (using 2025-01-01 as reference date)
- Object with day keys → Array of day objects
- Only days with `isOpen: true` are included

**Timestamp Details:**
- Reference date: January 1, 2025 (UTC)
- Example: "10:00" → 1735725600000 (2025-01-01T10:00:00.000Z)
- Example: "18:00" → 1735754400000 (2025-01-01T18:00:00.000Z)
- The backend extracts the time component (hours:minutes) from these epoch timestamps

### 3. Services Transformation

**Store Format:**
```typescript
{
  id: "temp-1",        // UI-only field
  name: "Service Name",
  duration: 45,
  price: 75,
  description: "Description"
}
```

**API Format:**
```typescript
{
  name: "Service Name",
  duration: 45,
  price: 75,
  description: "Description"
}
```

**Transformation:**
- The `id` field is removed (only used for UI/React key management)
- All other fields remain the same

### 4. User ID Addition

The `user_id` is added at submission time from the authentication context:

```typescript
const userId = getUserIdFromAuthContext(); // From AuthContext
const apiPayload = transformOnboardingDataToApi(providerData, userId);
```

## Usage in Code

### 1. Import the transformation function

```typescript
import { transformOnboardingDataToApi, validateOnboardingPayload } from '@/lib/onboarding-transform';
```

### 2. Get data from store

```typescript
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const providerData = useOnboardingStore((state) => state.providerData);
```

### 3. Transform and validate

```typescript
// Get user ID from auth context
const userId = 'your-user-id'; // Replace with actual user ID

// Transform data
const apiPayload = transformOnboardingDataToApi(providerData, userId);

// Validate before submission
const validation = validateOnboardingPayload(apiPayload);
if (!validation.isValid) {
  console.error('Validation error:', validation.error);
  return;
}
```

### 4. Submit to API

```typescript
const response = await fetch('/api/provider/onboarding', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(apiPayload),
});

if (response.ok) {
  // Success - reset store and navigate
  resetStore();
} else {
  // Handle error
  console.error('Submission failed');
}
```

## Validation Rules

The `validateOnboardingPayload` function checks:

### Required Fields
- ✅ `business_name` (non-empty string)
- ✅ `business_category_id` (UUID)
- ✅ `business_registration_number` (non-empty string)
- ✅ `description` (non-empty string)
- ✅ `business_address` (non-empty string)
- ✅ `city_id` (UUID)
- ✅ `state_id` (UUID)
- ✅ `postal_code` (non-empty string)
- ✅ `phone_number` (non-empty string)
- ✅ `user_id` (UUID)

### Optional Fields
- `social_media_url`
- `free_online_consultancy` (defaults to false)

### Array Fields
- ✅ `working_hours` (at least 1 entry)
- ✅ `services` (at least 1 entry)

### Service Validation
Each service must have:
- ✅ `name` (non-empty string)
- ✅ `duration` (> 0)
- ✅ `price` (>= 0)

## File References

| File | Purpose |
|------|---------|
| `src/types/onboarding.ts` | Type definitions for store and API |
| `src/lib/onboarding-transform.ts` | Transformation and validation logic |
| `src/stores/useOnboardingStore.ts` | Zustand store implementation |
| `src/components/provider-onboarding/Step1.tsx` | Business info form |
| `src/components/provider-onboarding/Step2.tsx` | Location & availability form |
| `src/components/provider-onboarding/Step3.tsx` | Services form |
| `src/components/provider-onboarding/Step4.tsx` | Review & submit |

## Testing the Transformation

To test the transformation in the browser console:

```javascript
// In Step4, click "Submit For Review"
// Check the console for the output:
// "API Payload: { ... }"

// The payload will match the exact format expected by the backend
```

## Implementation Status

✅ **API Service Implemented:**
   - Created `submitProviderOnboarding` function in `src/services/business/business.ts`
   - Endpoint: `provider/add-provider` (POST with authentication)
   
✅ **Auth Context Integration:**
   - Using `useAuth()` hook to get `user_id` and `authToken`
   - Automatic redirect to login if not authenticated
   
✅ **Loading States:**
   - Spinner animation during submission
   - Submit button disabled while loading
   - "Submitting..." text feedback
   
✅ **Error Handling:**
   - API errors displayed to user via alerts
   - Proper error message extraction from responses
   - Console logging for debugging
   
✅ **Success Flow:**
   - Success modal displayed on successful submission
   - Automatic logout of provider user
   - Store reset to clear form data
   - Navigation to landing page
   
✅ **Enhanced Display in Step4:**
   - Category/city/state names stored alongside IDs in Zustand store
   - Human-readable labels displayed instead of UUIDs
   - Names automatically captured during form filling

