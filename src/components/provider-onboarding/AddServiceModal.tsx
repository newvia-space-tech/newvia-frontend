'use client';

import React, { useState, useEffect } from 'react';
import { X, Info } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (service: Service) => void;
  editingService?: Service | null;
  isLoading?: boolean;
}

export default function AddServiceModal({ isOpen, onClose, onAdd, editingService, isLoading = false }: AddServiceModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    duration: '0',
    price: '0',
    description: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    price: '',
    duration: '',
    description: '',
  });

  // Initialize form when editing
  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        duration: editingService.duration.toString(),
        price: editingService.price.toString(),
        description: editingService.description,
      });
    } else {
      setFormData({
        name: '',
        duration: '0',
        price: '0',
        description: '',
      });
    }
    setErrors({ name: '', price: '', duration: '', description: '' });
  }, [editingService, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent submission if already loading
    if (isLoading) {
      return;
    }
    
    const newErrors = {
      name: '',
      price: '',
      duration: '',
      description: '',
    };

    // Service name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Service name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Service name must not exceed 100 characters';
    }

    // Price validation
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price)) {
      newErrors.price = 'Price is required';
    } else if (price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (price > 100000) {
      newErrors.price = 'Price must not exceed 100,000';
    }

    // Duration validation
    const duration = parseInt(formData.duration);
    if (!formData.duration || isNaN(duration)) {
      newErrors.duration = 'Duration is required';
    } else if (duration < 15) {
      newErrors.duration = 'Duration must be at least 15 minutes';
    } else if (duration > 480) {
      newErrors.duration = 'Duration must not exceed 8 hours (480 minutes)';
    }

    // Description validation (optional but if provided, validate)
    if (formData.description.trim() && formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters if provided';
    }

    setErrors(newErrors);

    if (!newErrors.name && !newErrors.price && !newErrors.duration && !newErrors.description) {
      onAdd({
        id: editingService?.id || Date.now().toString(),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      });
      
      // Only reset form and close if adding new service (not editing)
      // When editing, the parent component will handle closing after mutation succeeds
      if (!editingService) {
        // Reset form
        setFormData({
          name: '',
          duration: '0',
          price: '0',
          description: '',
        });
        setErrors({ name: '', price: '', duration: '', description: '' });
        onClose();
      }
    }
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
      <div className="relative bg-white rounded-xl w-[500px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-xl font-semibold text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <div className="px-5 pb-5 space-y-6" style={{ gap: '24px' }}>
          {/* Service Name */}
          <div>
            <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              Service Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              maxLength={100}
              className={`w-full px-3.5 py-3 border rounded-lg text-base focus:outline-none ${
                errors.name ? 'border-red-500' : 'border-[#e5e7ea] focus:border-blue-500'
              }`}
              style={{ fontFamily: 'Lato, sans-serif' }}
              placeholder="e.g., Haircut & Styling"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Duration and Price */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 480)) {
                    handleInputChange('duration', value);
                  }
                }}
                className={`w-full px-3.5 py-3 border rounded-lg text-base text-black focus:outline-none ${
                  errors.duration ? 'border-red-500' : 'border-[#e5e7ea] focus:border-blue-500'
                }`}
                style={{ fontFamily: 'Lato, sans-serif' }}
                min="15"
                max="480"
                step="15"
                placeholder="30"
              />
              {errors.duration && (
                <p className="text-sm text-red-500 mt-1">{errors.duration}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                Price (RM) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 100000)) {
                      handleInputChange('price', value);
                    }
                  }}
                  className={`w-full px-3.5 py-3 border rounded-lg text-base focus:outline-none ${
                    errors.price ? 'border-red-500' : 'border-[#e5e7ea] focus:border-blue-500'
                  }`}
                  style={{ fontFamily: 'Lato, sans-serif' }}
                  min="0.01"
                  max="100000"
                  step="0.01"
                  placeholder="50.00"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-500 mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Info Message */}
          {!editingService && (
            <div className="flex gap-1.5 items-center justify-center">
              <Info className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <p className="text-sm text-black/50" style={{ fontFamily: 'Lato, sans-serif' }}>
                Pricing and duration can&apos;t be edited later. Delete and re-add to change.
              </p>
            </div>
          )}

          {/* Short Description */}
          <div>
            <label className="block text-sm text-black mb-2" style={{ fontFamily: 'Lato, sans-serif' }}>
              Short Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              maxLength={500}
              className={`w-full px-3.5 py-3 border rounded-lg text-base text-black focus:outline-none resize-none h-[100px] ${
                errors.description ? 'border-red-500' : 'border-[#e5e7ea] focus:border-blue-500'
              }`}
              style={{ fontFamily: 'Lato, sans-serif' }}
              placeholder="Describe your service in a few sentences (minimum 10 characters if provided)"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
            <div className="flex justify-between">
              <p className="text-xs text-[#9ea5ad] font-medium" style={{ fontFamily: 'Lato, sans-serif' }}>
                This will help customers understand what you offer
              </p>
              <span className="text-xs text-[#9ea5ad]">{formData.description.length}/500</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 pb-5">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-[#6290f2] hover:bg-[#4a7ae8] disabled:bg-[#9bb5f5] disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg text-base font-normal transition-colors min-h-[40px]"
            style={{ fontFamily: 'Lato, sans-serif', width: '160px' }}
          >
            {isLoading ? 'Saving...' : (editingService ? 'Save Changes' : 'Add Service')}
          </button>
        </div>
      </div>
    </div>
  );
}
