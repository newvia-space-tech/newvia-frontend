'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';

interface DaySchedule {
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

interface WorkingHoursData {
  [key: string]: DaySchedule;
}

interface EditWorkingHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: WorkingHoursData) => void;
  initialData?: WorkingHoursData;
  isLoading?: boolean;
}

// Helper function to convert time string (HH:MM) to Unix timestamp in milliseconds
// Uses a fixed reference date (January 1, 2025) in local timezone to generate epoch timestamps
// The specific date doesn't matter as backend extracts time component
// Uses local timezone to preserve the user's selected time (e.g., 09:00 local stays as 09:00)
export const timeStringToTimestamp = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  // Create date in local timezone (not UTC) to preserve the selected time
  const date = new Date(2025, 0, 1, 0, 0, 0, 0); // January 1, 2025, 00:00:00 local time
  date.setHours(hours, minutes, 0, 0); // Use setHours (local) instead of setUTCHours
  return date.getTime();
};

// Maps day keys to day numbers (0-6, where 0 is Sunday)
const DAY_KEY_TO_NUMBER: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

// Convert working hours data from modal format to API format
// Modal format: { [dayKey]: { isOpen, startTime, endTime } }
// API format: Array of { day, start_time, end_time, is_open }
export const convertWorkingHoursToApiFormat = (
  workingHours: WorkingHoursData
): Array<{ day: number; start_time: number; end_time: number; is_open: boolean }> => {
  return Object.entries(workingHours).map(([dayKey, schedule]) => ({
    day: DAY_KEY_TO_NUMBER[dayKey] ?? 0,
    start_time: timeStringToTimestamp(schedule.startTime),
    end_time: timeStringToTimestamp(schedule.endTime),
    is_open: schedule.isOpen,
  })).sort((a, b) => a.day - b.day); // Sort by day number for consistency
};

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

// Generate time options (30-minute intervals)
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
      times.push({ value: time24, label: time12, display: time24 });
    }
  }
  return times;
};

const timeOptions = generateTimeOptions();

// Parse time string like "09:00 AM to 10:00 PM" or "9:00 AM to 10:00 PM"
const parseTimeString = (timeStr: string): { startTime: string; endTime: string } | null => {
  if (!timeStr || timeStr.trim() === '') return null;
  
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*to\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return null;
  
  const convertTo24Hour = (hour: number, minute: number, ampm: string): string => {
    let h24 = parseInt(hour.toString());
    if (ampm.toUpperCase() === 'PM' && h24 !== 12) h24 += 12;
    if (ampm.toUpperCase() === 'AM' && h24 === 12) h24 = 0;
    return `${h24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };
  
  const startHour = parseInt(match[1]);
  const startMin = parseInt(match[2]);
  const startAmpm = match[3];
  const endHour = parseInt(match[4]);
  const endMin = parseInt(match[5]);
  const endAmpm = match[6];
  
  return {
    startTime: convertTo24Hour(startHour, startMin, startAmpm),
    endTime: convertTo24Hour(endHour, endMin, endAmpm)
  };
};

// Format 24-hour time to 12-hour format
const formatTime = (time24: string): string => {
  const [hour, minute] = time24.split(':').map(Number);
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
};

// Helper function to compare two time strings (HH:MM format)
// Returns: -1 if time1 < time2, 0 if equal, 1 if time1 > time2
const compareTimes = (time1: string, time2: string): number => {
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  
  const totalMinutes1 = hours1 * 60 + minutes1;
  const totalMinutes2 = hours2 * 60 + minutes2;
  
  if (totalMinutes1 < totalMinutes2) return -1;
  if (totalMinutes1 > totalMinutes2) return 1;
  return 0;
};

export default function EditWorkingHoursModal({ 
  isOpen, 
  onClose, 
  onSave,
  initialData,
  isLoading = false
}: EditWorkingHoursModalProps) {
  const [workingHours, setWorkingHours] = useState<WorkingHoursData>(() => {
    const defaultData: WorkingHoursData = {};
    daysOfWeek.forEach(day => {
      defaultData[day.key] = {
        isOpen: true,
        startTime: '09:00',
        endTime: '18:00'
      };
    });
    return defaultData;
  });

  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: 'start' | 'end' | null }>({});
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [validationErrors, setValidationErrors] = useState<{ [day: string]: string }>({});

  // Initialize form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      // Always ensure all 7 days are present, merging initialData with defaults
      const defaultData: WorkingHoursData = {};
      daysOfWeek.forEach(day => {
        // Use initialData if available, otherwise use defaults
        defaultData[day.key] = initialData?.[day.key] || {
          isOpen: true,
          startTime: '09:00',
          endTime: '18:00'
        };
      });
      setWorkingHours(defaultData);
      setOpenDropdowns({});
    }
  }, [isOpen, initialData]);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow || 'auto';
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside all dropdown containers
      let clickedInsideDropdown = false;
      Object.values(dropdownRefs.current).forEach(ref => {
        if (ref && ref.contains(target)) {
          clickedInsideDropdown = true;
        }
      });

      if (!clickedInsideDropdown && Object.keys(openDropdowns).length > 0) {
        setOpenDropdowns({});
      }
    };

    if (isOpen && Object.keys(openDropdowns).length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdowns, isOpen]);

  const handleToggle = (day: string) => {
    setWorkingHours(prev => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          isOpen: !prev[day].isOpen
        }
      };
      
      // Clear validation error when toggling off, or validate when toggling on
      if (!updated[day].isOpen) {
        // Day is now closed, clear validation error
        setValidationErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[day];
          return newErrors;
        });
      } else {
        // Day is now open, validate times
        const { startTime, endTime } = updated[day];
        if (compareTimes(startTime, endTime) >= 0) {
          setValidationErrors(prevErrors => ({
            ...prevErrors,
            [day]: 'Start time must be before end time'
          }));
        } else {
          setValidationErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[day];
            return newErrors;
          });
        }
      }
      
      return updated;
    });
  };

  const handleTimeChange = (day: string, type: 'start' | 'end', time: string, event?: React.MouseEvent) => {
    // Prevent event propagation to avoid closing dropdown prematurely
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // Close dropdown first
    setOpenDropdowns(prev => {
      const newState = { ...prev };
      delete newState[`${day}-${type}`];
      return newState;
    });
    
    // Update working hours state - use functional update to ensure we get latest state
    setWorkingHours(prev => {
      const currentDay = prev[day];
      const updated = {
        ...prev,
        [day]: {
          ...currentDay,
          [type === 'start' ? 'startTime' : 'endTime']: time
        }
      };
      
      // Validate: start time must be less than end time
      const startTime = type === 'start' ? time : updated[day].startTime;
      const endTime = type === 'end' ? time : updated[day].endTime;
      
      // Only validate if the day is open
      if (updated[day].isOpen) {
        if (compareTimes(startTime, endTime) >= 0) {
          // Start time is not less than end time
          setValidationErrors(prevErrors => ({
            ...prevErrors,
            [day]: 'Start time must be before end time'
          }));
        } else {
          // Validation passed, clear error
          setValidationErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            delete newErrors[day];
            return newErrors;
          });
        }
      } else {
        // Day is closed, clear any validation errors
        setValidationErrors(prevErrors => {
          const newErrors = { ...prevErrors };
          delete newErrors[day];
          return newErrors;
        });
      }
      
      return updated;
    });
  };

  const toggleTimeDropdown = (day: string, type: 'start' | 'end', event?: React.MouseEvent) => {
    // Prevent event propagation
    if (event) {
      event.stopPropagation();
    }
    
    const key = `${day}-${type}`;
    setOpenDropdowns(prev => {
      const newState: { [key: string]: 'start' | 'end' | null } = {};
      if (prev[key] === type) {
        // Close if already open
        return {};
      } else {
        // Open this dropdown and close others
        newState[key] = type;
        return newState;
      }
    });
  };

  const handleSave = () => {
    if (isLoading) return; // Prevent multiple saves
    
    // Validate all days before saving
    const errors: { [day: string]: string } = {};
    Object.entries(workingHours).forEach(([day, schedule]) => {
      if (schedule.isOpen && compareTimes(schedule.startTime, schedule.endTime) >= 0) {
        errors[day] = 'Start time must be before end time';
      }
    });
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return; // Don't save if there are validation errors
    }
    
    // Clear any existing errors
    setValidationErrors({});
    onSave(workingHours);
    // Don't close here - let the parent handle closing on success
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl w-[600px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200">
          <h2 
            className="text-xl font-semibold text-black"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 600,
              lineHeight: '28px'
            }}
          >
            Working Hours
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-5 space-y-4">
          {daysOfWeek.map((day) => {
            const schedule = workingHours[day.key];
            const isOpen = schedule?.isOpen ?? true;
            const startTime = schedule?.startTime ?? '09:00';
            const endTime = schedule?.endTime ?? '18:00';
            const startDropdownKey = `${day.key}-start`;
            const endDropdownKey = `${day.key}-end`;

            const errorMessage = validationErrors[day.key];
            const hasError = !!errorMessage;

            return (
              <div key={day.key} className="flex flex-col gap-1">
                <div className="flex gap-3 items-center min-h-[44px]">
                  {/* Day Label */}
                  <p 
                    className="text-base text-black w-[100px]"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    {day.label}
                  </p>

                  {/* Toggle and Time Controls */}
                  <div className="flex gap-5 items-center flex-1">
                  {/* Toggle Switch */}
                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => handleToggle(day.key)}
                      className={`relative inline-flex h-6 w-9 items-center rounded-full transition-colors ${
                        isOpen ? 'bg-[#6290f2]' : 'bg-[#e5e7ea]'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isOpen ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <p 
                      className="text-sm text-[#797e84] whitespace-nowrap"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      {isOpen ? 'Open' : 'Close'}
                    </p>
                  </div>

                  {/* Time Selectors (only show if open) */}
                  {isOpen && (
                    <div className="flex gap-4 items-center">
                      {/* Start Time */}
                      <div 
                        className="relative"
                        ref={(el) => {
                          dropdownRefs.current[startDropdownKey] = el;
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => toggleTimeDropdown(day.key, 'start', e)}
                          className={`w-[100px] px-4 py-2.5 border rounded-lg text-base text-black flex items-center justify-between transition-colors ${
                            hasError 
                              ? 'border-red-500 hover:border-red-600' 
                              : 'border-[#e5e7ea] hover:border-[#6290f2]'
                          }`}
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px'
                          }}
                        >
                          <span>{startTime}</span>
                          <ChevronDown className="w-5 h-5" />
                        </button>
                        {openDropdowns[startDropdownKey] === 'start' && (
                          <div 
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7ea] rounded-lg shadow-lg z-[9999] max-h-[200px] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {timeOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={(e) => handleTimeChange(day.key, 'start', option.value, e)}
                                className="w-full px-4 py-2 text-left text-base text-black hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                {option.display}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* "to" separator */}
                      <p 
                        className="text-sm text-[#797e84] whitespace-nowrap"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 400,
                          lineHeight: '20px'
                        }}
                      >
                        to
                      </p>

                      {/* End Time */}
                      <div 
                        className="relative"
                        ref={(el) => {
                          dropdownRefs.current[endDropdownKey] = el;
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => toggleTimeDropdown(day.key, 'end', e)}
                          className={`w-[100px] px-4 py-2.5 border rounded-lg text-base text-black flex items-center justify-between transition-colors ${
                            hasError 
                              ? 'border-red-500 hover:border-red-600' 
                              : 'border-[#e5e7ea] hover:border-[#6290f2]'
                          }`}
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px'
                          }}
                        >
                          <span>{endTime}</span>
                          <ChevronDown className="w-5 h-5" />
                        </button>
                        {openDropdowns[endDropdownKey] === 'end' && (
                          <div 
                            className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7ea] rounded-lg shadow-lg z-[9999] max-h-[200px] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {timeOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={(e) => handleTimeChange(day.key, 'end', option.value, e)}
                                className="w-full px-4 py-2 text-left text-base text-black hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                {option.display}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                </div>
                {/* Error Message */}
                {hasError && (
                  <div className="ml-[108px] mt-1">
                    <p 
                      className="text-sm text-red-600"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px'
                      }}
                    >
                      {errorMessage}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-4 px-5 pb-5">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[#6290f2] hover:bg-[#5280e2] disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg text-base font-normal transition-colors min-w-[160px]"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 400,
              lineHeight: '24px'
            }}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}


