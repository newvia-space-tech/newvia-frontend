'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, Clock3, Tag as TagIcon, Pencil, Trash } from 'lucide-react';
import AddServiceModal from './AddServiceModal';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import type { Service } from '@/types/onboarding';

export default function Step3() {
  const step3Data = useOnboardingStore((state) => state.providerData.step3);
  const updateStep3Data = useOnboardingStore((state) => state.updateStep3Data);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const prevStep = useOnboardingStore((state) => state.prevStep);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleAddService = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleAddNewService = (service: Service) => {
    if (editingService) {
      updateStep3Data({
        services: step3Data.services.map(s => s.id === editingService.id ? service : s)
      });
    } else {
      updateStep3Data({
        services: [...step3Data.services, service]
      });
    }
    setEditingService(null);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = (id: string) => {
    updateStep3Data({
      services: step3Data.services.filter(s => s.id !== id)
    });
  };

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  const handleBack = () => {
    prevStep();
  };

  return (
    <>
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAdd={handleAddNewService}
        editingService={editingService}
      />
      <div className="max-w-[980px] mx-auto space-y-4 sm:space-y-5">
        {/* Services & Pricing Content */}
        <div className="bg-white rounded-xl p-4 sm:p-5 w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
              Services & Pricing
            </h3>
            {step3Data.services.length > 0 && (
              <button
                type="button"
                onClick={handleAddService}
                className="bg-black text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-base font-medium hover:bg-gray-800 transition-colors"
                style={{ fontFamily: 'Lato, sans-serif' }}
              >
                <Plus className="w-5 h-5" />
                Add Service
              </button>
            )}
          </div>

          {/* Services List */}
          <div className="flex flex-col gap-6">
            {step3Data.services.map((service, index) => (
              <div key={service.id}>
                <div className="flex gap-10 items-end">
                  {/* Service Details */}
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

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditService(service)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(service.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Trash className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                {/* Divider - only show between items */}
                {index < step3Data.services.length - 1 && (
                  <div className="h-px bg-gray-200 mt-6" />
                )}
              </div>
            ))}

            {/* Empty State */}
            {step3Data.services.length === 0 && (
              <div className="border border-[#e5e7ea] rounded-lg p-4 flex flex-col gap-5 items-center justify-center">
                <div className="flex flex-col gap-1 items-center text-center">
                  <h4 className="text-base font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
                    No services added yet
                  </h4>
                  <p className="text-sm text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif' }}>
                    Add your services to let customers know what you offer and book appointments.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="bg-black text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-base font-medium hover:bg-gray-800 transition-colors"
                  style={{ fontFamily: 'Lato, sans-serif' }}
                >
                  <Plus className="w-5 h-5" />
                  Add Service
                </button>
              </div>
            )}
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
            disabled={step3Data.services.length === 0}
            onClick={handleSubmit}
            className={`px-4 py-3 rounded-lg flex items-center gap-2 text-base font-normal transition-colors min-w-[160px] justify-center ${
              step3Data.services.length > 0
                ? 'bg-[#6290f2] text-white hover:bg-[#4a7ae8]'
                : 'bg-[#6290f2] text-white opacity-40 cursor-not-allowed'
            }`}
            style={{ fontFamily: 'Lato, sans-serif' }}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
}
