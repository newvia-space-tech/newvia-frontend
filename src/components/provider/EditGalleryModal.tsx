'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { uploadImages, editBusinessImages } from '@/services/business/business';
import type { BusinessImageItem } from '@/types';

interface EditGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImages: BusinessImageItem[];
  businessId: string;
  userId: string;
}

interface ImageState {
  url: string;
  isThumbnail: boolean;
  isNew: boolean; // true if this is a new file (not yet uploaded)
  file?: File; // File object for new images
}

export default function EditGalleryModal({
  isOpen,
  onClose,
  currentImages,
  businessId,
  userId
}: EditGalleryModalProps) {
  const { authToken } = useAuth();
  const queryClient = useQueryClient();
  
  const [images, setImages] = useState<ImageState[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Initialize images when modal opens
  useEffect(() => {
    if (isOpen) {
      // Convert current images to ImageState format
      const initialImages: ImageState[] = currentImages.map((img, index) => ({
        url: img.image,
        isThumbnail: img.is_thumbnail || index === 0, // First image is thumbnail by default
        isNew: false
      }));
      setImages(initialImages);
      setError(null); // Clear any previous errors
    }
  }, [isOpen, currentImages]);

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

  // Check if there are changes (new images added or images deleted)
  const hasChanges = () => {
    const newImagesCount = images.filter(img => img.isNew).length;
    const originalCount = currentImages.length;
    const currentCount = images.length;
    
    // Changes if: new images added, images deleted, or images reordered
    return newImagesCount > 0 || currentCount !== originalCount;
  };

  // Handle drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFiles = (files: File[]) => {
    // Filter only image files
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Check file size (10MB limit)
    const validFiles = imageFiles.filter(file => file.size <= 10 * 1024 * 1024);
    
    if (validFiles.length !== imageFiles.length) {
      setError('Some files exceed 10MB limit and were not added');
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }

    // Add new images with preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        setImages(prev => [...prev, { 
          url: previewUrl, 
          isThumbnail: prev.length === 0, // First image is thumbnail
          isNew: true,
          file: file
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    // If we deleted the thumbnail, make the first remaining image the thumbnail
    if (images[index]?.isThumbnail && images.length > 1) {
      const newImages = images.filter((_, i) => i !== index);
      if (newImages.length > 0) {
        setImages(newImages.map((img, i) => ({ ...img, isThumbnail: i === 0 })));
        return;
      }
    }
    // Close viewer if viewing deleted image
    if (viewerOpen && viewerIndex === index) {
      if (index >= images.length - 1 && index > 0) {
        setViewerIndex(index - 1);
      } else if (images.length === 1) {
        setViewerOpen(false);
      }
    }
  };

  const handleImageClick = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const handleViewerClose = () => {
    setViewerOpen(false);
  };

  const handlePreviousImage = () => {
    setViewerIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = () => {
    setViewerIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Keyboard navigation for image viewer
  useEffect(() => {
    if (!viewerOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setViewerOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setViewerIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        setViewerIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerOpen, images.length]);

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => {
      if (!authToken) {
        throw new Error('Authentication token not available');
      }
      return uploadImages(files, userId, authToken);
    },
    onError: (error: Error) => {
      console.error('Failed to upload images:', error);
      setError(error.message || 'Failed to upload images');
    },
  });

  // Edit business images mutation
  const editImagesMutation = useMutation({
    mutationFn: (imageUrls: string[]) => {
      if (!authToken) {
        throw new Error('Authentication token not available');
      }
      
      // Set first image as thumbnail
      const businessImages: BusinessImageItem[] = imageUrls.map((url, index) => ({
        image: url,
        is_thumbnail: index === 0
      }));

      return editBusinessImages(
        {
          business_id: businessId,
          user_id: userId,
          business_images: businessImages
        },
        authToken
      );
    },
    onSuccess: () => {
      // Invalidate and refetch the business images query
      queryClient.invalidateQueries({ queryKey: ['businessImages', businessId] });
      setError(null); // Clear any errors on success
      onClose();
    },
    onError: (error: Error) => {
      console.error('Failed to update business images:', error);
      setError(error.message || 'Failed to update business images');
    },
  });

  const handleSave = async () => {
    if (!hasChanges()) {
      onClose();
      return;
    }

    try {
      // Separate new images (File objects) from existing images (URLs)
      const newImageFiles = images.filter(img => img.isNew && img.file).map(img => img.file!);
      const existingImageUrls = images.filter(img => !img.isNew).map(img => img.url);

      let allImageUrls = [...existingImageUrls];

      // Step 1: Upload new images if any
      if (newImageFiles.length > 0) {
        const uploadResponse = await uploadMutation.mutateAsync(newImageFiles);
        if (uploadResponse.payload && Array.isArray(uploadResponse.payload)) {
          // Merge existing URLs with newly uploaded URLs
          allImageUrls = [...existingImageUrls, ...uploadResponse.payload];
        }
      }

      // Step 2: Update business images with all URLs (existing + new)
      await editImagesMutation.mutateAsync(allImageUrls);
    } catch (error) {
      // Error handling is done in mutation onError
      console.error('Error saving images:', error);
    }
  };

  const isLoading = uploadMutation.isPending || editImagesMutation.isPending;

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
      <div className="relative bg-white rounded-xl w-[90vw] max-w-[800px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 
            className="text-xl font-semibold text-black"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 600,
              lineHeight: '28px'
            }}
          >
            Gallery
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                  <X className="w-3 h-3 text-white" />
                </div>
                <p 
                  className="text-red-800 flex-1"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    fontSize: '14px',
                    lineHeight: '20px'
                  }}
                >
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 p-1 hover:bg-red-100 rounded transition-colors"
                aria-label="Dismiss error"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          )}

          {/* Upload Area */}
          <div
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              border border-[#e5e7ea] rounded-lg p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
              ${isDragging ? 'bg-gray-50 border-[#6290f2]' : 'hover:bg-gray-50'}
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <div className="w-9 h-9 flex items-center justify-center">
              <Upload className="w-9 h-9 text-[#797e84]" />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div 
                className="flex gap-1 items-center text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                <span>Drag your file(s) or</span>
                <span className="text-[#6290f2]">browse</span>
              </div>
              <p 
                className="text-[#9ea5ad] text-center"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                Images up to 10MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isLoading}
            />
          </div>

          {/* Existing Images Grid */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-5">
              {images.map((imageItem, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-[150px] h-[160px] rounded-xl bg-[#e0e2e6] group p-3 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleImageClick(index)}
                >
                  <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
                    <div className="absolute bg-[#e0e2e6] inset-0 rounded-xl" />
                    <img
                      src={imageItem.url}
                      alt={`Gallery image ${index + 1}`}
                      className="absolute w-full h-full object-cover rounded-xl"
                      style={{ objectPosition: '50% 50%' }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                  {/* Thumbnail Badge */}
                  {imageItem.isThumbnail && (
                    <div className="absolute top-2 left-2 bg-[#6290f2] text-white text-xs px-2 py-1 rounded z-[40] pointer-events-none">
                      Thumbnail
                    </div>
                  )}
                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImage(index);
                    }}
                    className="absolute bg-[#797e84] w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#6b7076] transition-colors z-[50] pointer-events-auto"
                    style={{ right: '-14px', top: '-14px' }}
                    disabled={isLoading}
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {images.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p 
                className="text-[#797e84]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                No images yet. Upload some images to get started.
              </p>
            </div>
          )}

          {/* Save Button - Show when there are changes */}
          {hasChanges() && (
            <div className="flex justify-end pt-2 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2.5 bg-[#6290f2] text-white rounded-lg hover:bg-[#5580e0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {viewerOpen && images.length > 0 && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90">
          {/* Close Button */}
          <button
            onClick={handleViewerClose}
            className="absolute top-4 right-4 z-[70] p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Previous Button */}
          {images.length > 1 && (
            <button
              onClick={handlePreviousImage}
              className="absolute left-4 z-[70] p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Next Button */}
          {images.length > 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 z-[70] p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          {/* Image Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[70] bg-black/50 px-4 py-2 rounded-full">
              <span 
                className="text-white"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                {viewerIndex + 1} / {images.length}
              </span>
            </div>
          )}

          {/* Main Image */}
          <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center p-4">
            <img
              src={images[viewerIndex]?.url}
              alt={`Gallery image ${viewerIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>

          {/* Thumbnail Indicator */}
          {images[viewerIndex]?.isThumbnail && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[70] bg-[#6290f2] text-white text-sm px-3 py-1.5 rounded">
              <span 
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 500,
                  fontSize: '12px',
                  lineHeight: '16px'
                }}
              >
                Thumbnail
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
