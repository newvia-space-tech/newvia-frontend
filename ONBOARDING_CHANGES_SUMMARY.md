# Provider Onboarding - API Integration Changes Summary

## Overview

Updated the provider onboarding system to match the exact API payload format required by the backend. The data now flows from the UI forms through the Zustand store and transforms into the correct API format before submission.

---

## Changes Made

### 1. **Updated Type Definitions** (`src/types/onboarding.ts`)

#### Changed Store Types:
- ✅ `category` → `categoryId` (now stores UUID instead of name)
- ✅ `city` → `cityId` (now stores UUID instead of name)
- ✅ `state` → `stateId` (now stores UUID instead of name)

#### Added API Types:
- ✅ `ApiWorkingHours` - Array format with day numbers and timestamps
- ✅ `ApiService` - Service format without UI-only `id` field
- ✅ `ApiOnboardingPayload` - Complete API payload structure

**Key Changes:**
```typescript
// BEFORE
interface Step1Data {
  category: string;  // Just a string value
}

// AFTER
interface Step1Data {
  categoryId: string;  // UUID for category
}
```

---

### 2. **Updated Zustand Store** (`src/stores/useOnboardingStore.ts`)

#### Initial State Changes:
- ✅ Changed `category` → `categoryId`
- ✅ Changed `city` → `cityId`
- ✅ Changed `state` → `stateId`

**Impact:**
- Store now maintains IDs instead of display names
- Maintains backward compatibility with existing persistence logic
- Gallery files still excluded from localStorage (can't serialize File objects)

---

### 3. **Created Transformation Utility** (`src/lib/onboarding-transform.ts`)

New utility functions for data transformation and validation:

#### `transformOnboardingDataToApi(providerData, userId)`
Transforms store data into API payload format:
- ✅ Converts camelCase → snake_case field names
- ✅ Transforms working hours object → array with timestamps
- ✅ Removes UI-only fields (service.id)
- ✅ Adds user_id from auth context

#### `validateOnboardingPayload(payload)`
Validates API payload before submission:
- ✅ Checks all required fields are present
- ✅ Validates working hours array (at least 1 entry)
- ✅ Validates services array (at least 1 entry)
- ✅ Validates individual service fields

**Key Transformations:**
```typescript
// Working Hours: Object → Array with epoch timestamps
{
  Monday: { isOpen: true, startTime: "10:00", endTime: "18:00" }
}
↓
[
  { day: 1, start_time: 1735725600000, end_time: 1735754400000 }
]
// Timestamps use 2025-01-01 as reference date:
// 10:00 → 1735725600000 (2025-01-01T10:00:00.000Z)
// 18:00 → 1735754400000 (2025-01-01T18:00:00.000Z)

// Services: Remove UI-only id field
{ id: "temp-1", name: "Service", duration: 45, price: 75, description: "..." }
↓
{ name: "Service", duration: 45, price: 75, description: "..." }
```

---

### 4. **Updated Step1 Component** (`src/components/provider-onboarding/Step1.tsx`)

#### Field Changes:
- ✅ Updated form validation to use `categoryId`
- ✅ Updated input binding: `step1Data.category` → `step1Data.categoryId`
- ✅ Updated error handling for `categoryId`

#### Affected Code:
```typescript
// Form validation
if (!step1Data.categoryId) {
  newErrors.categoryId = 'Please select a category';
}

// Form input
<FormSelect
  value={step1Data.categoryId}
  onChange={(value) => handleInputChange('categoryId', value)}
  error={errors.categoryId}
/>
```

---

### 5. **Updated Step2 Component** (`src/components/provider-onboarding/Step2.tsx`)

#### Field Changes:
- ✅ Updated `city` → `cityId` throughout
- ✅ Updated `state` → `stateId` throughout
- ✅ Updated form validation
- ✅ Updated input bindings
- ✅ Updated error handling

#### Affected Code:
```typescript
// Form validation
if (!step2Data.cityId) {
  newErrors.cityId = 'Please select a city';
}
if (!step2Data.stateId) {
  newErrors.stateId = 'Please select a state';
}

// Form inputs
<FormSelect
  value={step2Data.cityId}
  onChange={(value) => handleInputChange('cityId', value)}
  error={errors.cityId}
/>
```

---

### 6. **Updated Step4 Component** (`src/components/provider-onboarding/Step4.tsx`)

#### Major Changes:

**1. Added Transformation Import:**
```typescript
import { transformOnboardingDataToApi, validateOnboardingPayload } from '@/lib/onboarding-transform';
```

**2. Implemented Proper Submit Handler:**
```typescript
const handleSubmit = async () => {
  // Get user ID from auth
  const userId = 'temporary-user-id'; // TODO: Replace with actual auth
  
  // Transform data
  const apiPayload = transformOnboardingDataToApi(providerData, userId);
  
  // Validate
  const validation = validateOnboardingPayload(apiPayload);
  if (!validation.isValid) {
    alert(`Validation error: ${validation.error}`);
    return;
  }
  
  // Log for testing
  console.log('API Payload:', JSON.stringify(apiPayload, null, 2));
  
  // TODO: Add actual API call
};
```

**3. Updated Display Fields:**
- ✅ `providerData.step1.category` → `providerData.step1.categoryId`
- ✅ `providerData.step2.city` → `providerData.step2.cityId`
- ✅ `providerData.step2.state` → `providerData.step2.stateId`

**Note:** Currently displays UUIDs. Future enhancement needed to fetch and display human-readable names.

---

## Data Flow Summary

```
┌─────────────────┐
│  User Input     │
│  (Form Fields)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Zustand Store   │
│ (UI Format)     │
│ - categoryId    │
│ - cityId        │
│ - stateId       │
│ - workingHours  │
│ - services      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Transform       │
│ Function        │
│ - Field names   │
│ - Working hours │
│ - Services      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validation      │
│ Function        │
│ - Required      │
│ - Arrays        │
│ - Values        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ API Payload     │
│ (Backend Format)│
│ - snake_case    │
│ - timestamps    │
│ - user_id       │
└─────────────────┘
```

---

## Example Transformation

### Store Data (Before):
```typescript
{
  step1: {
    businessName: "Jagdale Enterprise",
    categoryId: "b12e0e3d-a831-4df4-ae77-cf754b596e56",
    businessRegistrationNumber: "ABC1234PQR",
    shortDescription: "Yoga business"
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
      Monday: { isOpen: true, startTime: "10:00", endTime: "18:00" }
    }
  },
  step3: {
    services: [
      { id: "temp-1", name: "Best Yoga", duration: 45, price: 75, description: "..." }
    ]
  }
}
```

### API Payload (After):
```json
{
  "business_name": "Jagdale Enterprise",
  "business_category_id": "b12e0e3d-a831-4df4-ae77-cf754b596e56",
  "business_registration_number": "ABC1234PQR",
  "description": "Yoga business",
  "business_address": "X-420, Great Malasyian Road",
  "city_id": "6309a89f-b6c7-4e73-a595-265d380d73a9",
  "state_id": "a4044edb-960c-4688-b4a5-bfa542283011",
  "postal_code": "123456",
  "phone_number": "1234567891",
  "social_media_url": "www.google.com",
  "free_online_consultancy": false,
  "working_hours": [
    { "day": 1, "start_time": 1735725600000, "end_time": 1735754400000 }
  ],
  "services": [
    { "name": "Best Yoga", "duration": 45, "price": 75, "description": "..." }
  ],
  "user_id": "9d022fac-5331-48ca-9020-ea7613bd0181"
}
```

---

## Testing

### How to Test:

1. **Fill out the onboarding form:**
   - Go to `/provider-onboarding`
   - Complete all 4 steps

2. **Submit the form:**
   - Click "Submit For Review" on Step 4
   - Check browser console for output

3. **Verify the output:**
   - Look for `API Payload:` in console
   - Verify all field names are in snake_case
   - Verify working_hours is an array with timestamps
   - Verify services don't have `id` field
   - Verify all IDs (category, city, state) are preserved

### Expected Console Output:
```json
API Payload: {
  "business_name": "...",
  "business_category_id": "...",
  "working_hours": [...],
  "services": [...],
  "user_id": "..."
}
```

---

## TODOs / Next Steps

### 1. **Auth Integration**
```typescript
// In Step4.tsx, replace:
const userId = 'temporary-user-id';

// With:
import { useAuth } from '@/context/AuthContext';
const { user } = useAuth();
const userId = user?.id;
```

### 2. **API Service Implementation**
Create `src/services/business/business.ts`:
```typescript
export const submitProviderOnboarding = async (payload: ApiOnboardingPayload) => {
  return await apiRequest('/api/provider/onboarding', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
```

### 3. **Step4 Display Enhancement**
Fetch category/city/state names by ID:
```typescript
// Instead of displaying UUID
{providerData.step2.cityId}

// Display the name
{getCityNameById(providerData.step2.cityId)}
```

### 4. **Form Components Enhancement**
Update FormSelect components to:
- Accept API data (array of {id, name} objects)
- Display names in dropdown
- Store IDs in the form

Example:
```typescript
<FormSelect
  options={cities.map(c => ({ value: c.id, label: c.name }))}
  value={step2Data.cityId}
  onChange={(value) => handleInputChange('cityId', value)}
/>
```

### 5. **Error Handling**
Add proper error messages and loading states in Step4:
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);
const [error, setError] = useState<string | null>(null);

// In handleSubmit:
setIsSubmitting(true);
try {
  // API call
} catch (error) {
  setError('Failed to submit. Please try again.');
} finally {
  setIsSubmitting(false);
}
```

---

## Files Modified

- ✅ `src/types/onboarding.ts` - Added API types, updated store types
- ✅ `src/lib/onboarding-transform.ts` - **NEW** - Transformation & validation
- ✅ `src/stores/useOnboardingStore.ts` - Updated field names
- ✅ `src/components/provider-onboarding/Step1.tsx` - Updated to use categoryId
- ✅ `src/components/provider-onboarding/Step2.tsx` - Updated to use cityId/stateId
- ✅ `src/components/provider-onboarding/Step4.tsx` - Added transformation & submission

## Documentation Created

- ✅ `ONBOARDING_API_INTEGRATION.md` - Comprehensive API integration guide
- ✅ `ONBOARDING_CHANGES_SUMMARY.md` - This file

---

## Breaking Changes

⚠️ **LocalStorage Data:**
If users had partially filled forms before this update, their data may be incompatible due to field name changes (`category` → `categoryId`, etc.).

**Solution:** The store will initialize with empty values for missing fields, so users will just need to re-enter those specific fields.

---

## Validation Rules

The transformation validates:

1. **Required Fields:** business name, category ID, registration number, description, address, city ID, state ID, postal code, phone number, user ID
2. **Working Hours:** At least 1 day must be open
3. **Services:** At least 1 service must be added
4. **Service Fields:** Each service must have name, valid duration (>0), and valid price (≥0)

---

## Status

✅ **Complete** - Ready for API integration
- All data transformations implemented
- All validations in place
- All components updated
- Documentation complete

**Next:** Integrate with actual backend API endpoint.

