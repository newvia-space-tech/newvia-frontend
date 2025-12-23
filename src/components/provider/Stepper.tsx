'use client';

import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';

interface StepperProps {
  currentStep: number;
  steps: {
    number: number;
    title: string;
    subtitle: string;
  }[];
}

export default function Stepper({ currentStep, steps }: StepperProps) {
  const mobileContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Auto-scroll to current step on mobile when step changes
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (mobileContainerRef.current && stepRefs.current.length > 0) {
        const currentStepIndex = currentStep - 1;
        const currentStepElement = stepRefs.current[currentStepIndex];
        
        if (currentStepElement && mobileContainerRef.current) {
          const container = mobileContainerRef.current;
          const stepLeft = currentStepElement.offsetLeft;
          const stepWidth = currentStepElement.offsetWidth;
          const containerWidth = container.offsetWidth;
          
          // Calculate the position to center the current step
          // For step 1, we want to show it at the start (or slightly offset)
          // For later steps, center them in the view
          let targetScroll: number;
          
          if (currentStep === 1) {
            // For step 1, scroll to the beginning (or slightly offset to show step 2 partially)
            targetScroll = 0;
          } else {
            // For other steps, center them in the view
            targetScroll = stepLeft - (containerWidth / 2) + (stepWidth / 2);
          }
          
          // Smooth scroll to the current step
          container.scrollTo({
            left: Math.max(0, targetScroll),
            behavior: 'smooth'
          });
        }
      }
    }, 100); // Small delay to ensure layout is complete
    
    return () => clearTimeout(timer);
  }, [currentStep]);
  return (
    <div className="w-full bg-[#425f4d] px-4 sm:px-6 lg:px-[40px] h-full flex flex-col justify-start pt-6 sm:pt-8 lg:pt-[120px]">
      {/* Desktop Title */}
      <div className="hidden lg:block mb-[32px]">
        <h2 className="text-xl font-bold text-white leading-7">
          Complete the following steps to get your business listed
        </h2>
      </div>
      
      {/* Mobile Title */}
      <div className="lg:hidden mb-4">
        <h2 className="text-sm sm:text-base font-bold text-white leading-5 sm:leading-6">
          Complete the following steps to get your business listed
        </h2>
      </div>
      
      {/* Desktop Vertical Layout */}
      <div className="hidden lg:flex flex-col">
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.number} className="flex items-start gap-3">
              {/* Left side with circle and connector */}
              <div className="flex flex-col items-center">
                {/* Circle */}
                <div className={`w-6 h-6 rounded-xl flex items-center justify-center ${
                  isActive 
                    ? 'bg-white' 
                    : isCompleted 
                      ? 'bg-[#22c55e]' 
                      : 'bg-white/10 border-2 border-white/20'
                }`}>
                  {isCompleted ? (
                    <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  ) : (
                    <span className={`text-xs font-normal ${
                      isActive ? 'text-black' : 'text-white'
                    }`}>
                      {step.number}
                    </span>
                  )}
                </div>
                
                {/* Connector line */}
                {!isLast && (
                  <div className={`w-[2px] h-[60px] mt-3 ${
                    isCompleted ? 'bg-[#22c55e]' : 'bg-[#e5e7ea]'
                  }`} />
                )}
              </div>
              
              {/* Right side with text */}
              <div className="flex flex-col pt-0.5">
                <span className="text-xs text-white/75 font-normal">{step.subtitle}</span>
                <span className="text-sm font-semibold text-white">{step.title}</span>
                {isCompleted && (
                  <span className="text-xs text-[#22c55e] font-medium mt-0.5">Completed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Horizontal Layout */}
      <div 
        ref={mobileContainerRef}
        className="lg:hidden flex flex-row items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {steps.map((step, index) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;
          const isLast = index === steps.length - 1;
          
          return (
            <div 
              key={step.number} 
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              className="flex items-center gap-2 sm:gap-3 flex-shrink-0"
            >
              {/* Circle */}
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isActive 
                  ? 'bg-white' 
                  : isCompleted 
                    ? 'bg-[#22c55e]' 
                    : 'bg-white/10 border-2 border-white/20'
              }`}>
                {isCompleted ? (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" strokeWidth={3} />
                ) : (
                  <span className={`text-[10px] sm:text-xs font-normal ${
                    isActive ? 'text-black' : 'text-white'
                  }`}>
                    {step.number}
                  </span>
                )}
              </div>
              
              {/* Text */}
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] sm:text-xs text-white/75 font-normal whitespace-nowrap">{step.subtitle}</span>
                <span className="text-xs sm:text-sm font-semibold text-white truncate">{step.title}</span>
              </div>
              
              {/* Connector line */}
              {!isLast && (
                <div className={`w-[20px] sm:w-[30px] h-[2px] ${
                  isCompleted ? 'bg-[#22c55e]' : 'bg-[#e5e7ea]'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
