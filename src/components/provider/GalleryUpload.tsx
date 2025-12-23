'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';

interface GalleryUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in MB
}

export default function GalleryUpload({ 
  files, 
  onFilesChange, 
  maxFiles = 5, 
  maxSize = 10 
}: GalleryUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (newFiles: FileList | null) => {
    if (newFiles) {
      const validFiles: File[] = [];
      
      Array.from(newFiles).forEach(file => {
        if (file.size <= maxSize * 1024 * 1024 && files.length + validFiles.length < maxFiles) {
          validFiles.push(file);
        }
      });
      
      onFilesChange([...files, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed border-[#e5e7ea] rounded-lg p-6 text-center transition-colors ${
          isDragOver ? 'border-blue-500 bg-blue-50' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="w-9 h-9 text-[#797e84] mx-auto mb-3" />
        <div className="space-y-1">
          <p className="text-base font-medium text-[#797e84]">
            Drag your file(s) or{' '}
            <label className="text-blue-500 cursor-pointer hover:underline">
              browse
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-sm text-[#9ea5ad]">
            Upload {maxFiles} images up to {maxSize}MB
          </p>
        </div>
      </div>

      {/* Uploaded Images Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-5 gap-2">
          {files.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload ${index + 1}`}
                className="w-full h-20 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

