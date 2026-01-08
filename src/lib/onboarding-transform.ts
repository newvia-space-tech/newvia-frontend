/**
 * Utility functions to transform onboarding data from store format to API format
 */

import type { ProviderData, ApiOnboardingPayload, ApiWorkingHours, ApiService } from '@/types/onboarding';

/**
 * Maps day names to day numbers (0-6, where 0 is Sunday)
 */
const DAY_NAME_TO_NUMBER: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

/**
 * Converts time string (HH:MM) to Unix timestamp in milliseconds
 * Uses a fixed reference date (January 1, 2025) in local timezone to generate epoch timestamps
 * The backend extracts the time component from these timestamps
 * Uses local timezone to preserve the user's selected time (e.g., 09:00 local stays as 09:00)
 */
function timeStringToTimestamp(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  // Create date in local timezone (not UTC) to preserve the selected time
  const date = new Date(2025, 0, 1, 0, 0, 0, 0); // January 1, 2025, 00:00:00 local time
  date.setHours(hours, minutes, 0, 0); // Use setHours (local) instead of setUTCHours
  return date.getTime();
}

/**
 * Transforms working hours from store format to API format
 * Store format: { [dayName]: { isOpen, startTime, endTime } }
 * API format: Array of { day, start_time, end_time, is_open }
 * Note: All days are included in the payload, even if they're closed
 */
function transformWorkingHours(workingHours: ProviderData['step2']['workingHours']): ApiWorkingHours[] {
  const apiWorkingHours: ApiWorkingHours[] = [];

  for (const [dayName, hours] of Object.entries(workingHours)) {
    apiWorkingHours.push({
      day: DAY_NAME_TO_NUMBER[dayName],
      start_time: timeStringToTimestamp(hours.startTime),
      end_time: timeStringToTimestamp(hours.endTime),
      is_open: hours.isOpen,
    });
  }

  // Sort by day number for consistency
  return apiWorkingHours.sort((a, b) => a.day - b.day);
}

/**
 * Transforms services from store format to API format
 * Removes the `id` field which is only used for UI
 */
function transformServices(services: ProviderData['step3']['services']): ApiService[] {
  return services.map(({ name, duration, price, description }) => ({
    name,
    duration,
    price,
    description,
  }));
}

/**
 * Main transformation function: Converts store data to API payload
 * @param providerData - Data from Zustand store
 * @param userId - Current user's ID (from auth context)
 * @param imageUrls - Array of uploaded image URLs (from uploadImages API)
 * @returns API-ready payload
 */
export function transformOnboardingDataToApi(
  providerData: ProviderData,
  userId: string,
  imageUrls: string[] = []
): ApiOnboardingPayload {
  const { step1, step2, step3 } = providerData;

  // Get user's timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    business_name: step1.businessName,
    business_category_id: step1.categoryId,
    business_registration_number: step1.businessRegistrationNumber,
    description: step1.shortDescription,
    business_address: step2.businessAddress,
    city_id: step2.cityId,
    state_id: step2.stateId,
    postal_code: step2.postalCode,
    phone_number: step2.businessPhoneNumber,
    social_media_url: step2.socialMedia,
    free_online_consultancy: step2.freeOnlineConsultancy,
    working_hours: transformWorkingHours(step2.workingHours),
    services: transformServices(step3.services),
    user_id: userId,
    images: imageUrls,
    timezone,
  };
}

/**
 * Validates that all required fields are present before submission
 * @param payload - API payload to validate
 * @returns Object with isValid flag and error message if invalid
 */
export function validateOnboardingPayload(payload: ApiOnboardingPayload): {
  isValid: boolean;
  error?: string;
} {
  // Check required fields
  if (!payload.business_name?.trim()) {
    return { isValid: false, error: 'Business name is required' };
  }
  if (!payload.business_category_id) {
    return { isValid: false, error: 'Business category is required' };
  }
  if (!payload.business_registration_number?.trim()) {
    return { isValid: false, error: 'Business registration number is required' };
  }
  // Description is optional - no validation required
  if (!payload.business_address?.trim()) {
    return { isValid: false, error: 'Business address is required' };
  }
  if (!payload.city_id) {
    return { isValid: false, error: 'City is required' };
  }
  if (!payload.state_id) {
    return { isValid: false, error: 'State is required' };
  }
  if (!payload.postal_code?.trim()) {
    return { isValid: false, error: 'Postal code is required' };
  }
  if (!payload.phone_number?.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }
  if (!payload.user_id) {
    return { isValid: false, error: 'User ID is required' };
  }

  // Check working hours
  if (!payload.working_hours || payload.working_hours.length === 0) {
    return { isValid: false, error: 'Working hours are required' };
  }

  // Ensure at least one day is open
  const hasOpenDay = payload.working_hours.some(day => day.is_open);
  if (!hasOpenDay) {
    return { isValid: false, error: 'At least one working day must be open' };
  }

  // Check services
  if (!payload.services || payload.services.length === 0) {
    return { isValid: false, error: 'At least one service is required' };
  }

  // Validate services
  for (const service of payload.services) {
    if (!service.name?.trim()) {
      return { isValid: false, error: 'All services must have a name' };
    }
    if (!service.duration || service.duration <= 0) {
      return { isValid: false, error: 'All services must have a valid duration' };
    }
    if (service.price === undefined || service.price < 0) {
      return { isValid: false, error: 'All services must have a valid price' };
    }
  }

  return { isValid: true };
}

