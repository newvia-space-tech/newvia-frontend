'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, Upload, ChevronDown } from 'lucide-react';
import { useBlogCategories } from '@/hooks/blog/useBlogCategories';
import { useAuth } from '@/context/AuthContext';
import { BlogDetail } from '@/types';

interface EditBlogPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  blog: BlogDetail | null;
  onSubmit?: (data: {
    title: string;
    category_id: string;
    content: string;
    coverImage?: File;
  }) => void;
}

export default function EditBlogPostModal({
  isOpen,
  onClose,
  blog,
  onSubmit
}: EditBlogPostModalProps) {
  const { adminToken } = useAuth();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const { data: categories = [], isLoading: isLoadingCategories } = useBlogCategories(adminToken);
  
  // Get selected category name for display
  const selectedCategoryName = categories.find(cat => cat.id === categoryId)?.name || '';

  // Initialize form with blog data when modal opens or blog changes
  useEffect(() => {
    if (isOpen && blog) {
      setTitle(blog.title || '');
      setCategoryId(blog.blog_category_id || '');
      setContent(blog.content || '');
      setCoverImage(null);
      setImagePreview(blog.blog_image || null);
    }
  }, [isOpen, blog]);

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

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };

    if (isCategoryOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTitle('');
      setCategoryId('');
      setContent('');
      setCoverImage(null);
      setImagePreview(null);
    }
  }, [isOpen]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    // Reset to original image if available
    setImagePreview(blog?.blog_image || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !categoryId || !content.trim()) {
      // TODO: Show validation error
      return;
    }

    let imageToSubmit: File | undefined = coverImage || undefined;

    // If no new image is selected, we need to fetch the existing image and convert it to a File
    if (!coverImage && blog?.blog_image) {
      try {
        const response = await fetch(blog.blog_image);
        const blob = await response.blob();
        const fileName = blog.blog_image.split('/').pop() || 'blog-image.jpg';
        imageToSubmit = new File([blob], fileName, { type: blob.type });
      } catch (error) {
        console.error('Failed to fetch existing image:', error);
        // TODO: Show error to user
        return;
      }
    }

    if (onSubmit && imageToSubmit) {
      onSubmit({
        title,
        category_id: categoryId,
        content,
        coverImage: imageToSubmit
      });
    }

    // Close modal after submission
    onClose();
  };

  if (!isOpen || !blog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 backdrop-blur-[2px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 pt-5 px-5 border-b border-[#e5e7ea] rounded-t-xl">
          <h2 
            className="text-xl font-semibold text-black"
            style={{ 
              fontFamily: 'Lato, sans-serif',
              fontWeight: 600,
              lineHeight: '28px'
            }}
          >
            Edit Blog Post
          </h2>
          <button
            onClick={onClose}
            className="bg-white p-2 hover:bg-gray-50 rounded-md transition-colors"
          >
            <X size={20} className="text-[#797e84]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 items-start p-5 overflow-y-auto flex-1">
          {/* Cover Image Upload */}
          <div className="flex flex-col gap-2 items-start w-full">
            <p 
              className="text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '20px',
                fontSize: '14px'
              }}
            >
              Cover Image
            </p>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border border-[#e5e7ea] flex flex-col gap-3 items-center justify-center p-6 rounded-lg w-full cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden group">
                  <img
                    src={imagePreview}
                    alt="Blog cover"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex flex-col gap-2 items-center">
                      <Upload size={24} className="text-white" />
                      <p 
                        className="text-white text-sm"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                        }}
                      >
                        Click to replace image
                      </p>
                    </div>
                  </div>
                  {coverImage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded hover:bg-black/70 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <Upload size={36} className="text-[#797e84]" />
                  <div className="flex flex-col gap-1 items-center w-full">
                    <div className="flex gap-1 items-center justify-center">
                      <p 
                        className="text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '24px',
                          fontSize: '16px'
                        }}
                      >
                        Drag your file(s) or
                      </p>
                      <p 
                        className="text-[#797e84] underline"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '24px',
                          fontSize: '16px'
                        }}
                      >
                        browse
                      </p>
                    </div>
                    <p 
                      className="text-[#9ea5ad]"
                      style={{ 
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 400,
                        lineHeight: '20px',
                        fontSize: '14px'
                      }}
                    >
                      Images up to 10MB
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Blog Title and Category */}
          <div className="flex gap-4 items-center w-full">
            {/* Blog Title */}
            <div className="flex-1 flex flex-col gap-2 items-start">
              <p 
                className="text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px',
                  fontSize: '14px'
                }}
              >
                Blog Title *
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter"
                className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 w-full outline-none focus:border-[#6290f2] transition-colors"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '24px',
                  fontSize: '16px',
                  color: title ? '#000000' : '#797e84'
                }}
              />
            </div>

            {/* Category */}
            <div className="flex-1 flex flex-col gap-2 items-start relative" ref={categoryDropdownRef}>
              <p 
                className="text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 400,
                  lineHeight: '20px',
                  fontSize: '14px'
                }}
              >
                Category *
              </p>
              <div className="relative w-full">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 w-full flex items-center justify-between hover:border-[#6290f2] transition-colors"
                >
                  <p 
                    className="text-left"
                    style={{ 
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px',
                      fontSize: '16px',
                      color: categoryId ? '#000000' : '#797e84'
                    }}
                  >
                    {isLoadingCategories ? 'Loading...' : selectedCategoryName || 'Select'}
                  </p>
                  <ChevronDown 
                    size={20} 
                    className={`text-[#797e84] transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e7ea] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {isLoadingCategories ? (
                      <div className="px-4 py-2 text-center text-[#797e84]">
                        Loading categories...
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="px-4 py-2 text-center text-[#797e84]">
                        No categories available
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setCategoryId(cat.id);
                            setIsCategoryOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '24px',
                            fontSize: '16px',
                            color: categoryId === cat.id ? '#6290f2' : '#000000'
                          }}
                        >
                          {cat.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Textarea */}
          <div className="flex flex-col gap-2 items-start w-full">
            <p 
              className="text-black"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '20px',
                fontSize: '14px'
              }}
            >
              Content *
            </p>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog post content here...."
              rows={8}
              className="border border-[#e5e7ea] rounded-lg px-4 py-2.5 w-full outline-none focus:border-[#6290f2] transition-colors resize-none"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px',
                fontSize: '16px',
                color: content ? '#000000' : '#797e84',
                minHeight: '200px'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 items-center justify-end p-5 border-t border-[#e5e7ea] rounded-b-xl">
          <button
            onClick={onClose}
            className="bg-white border border-[#e5e7ea] flex items-center justify-center px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors min-h-[40px]"
            style={{ width: '120px' }}
          >
            <p 
              className="text-[#797e84]"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px',
                fontSize: '16px'
              }}
            >
              Cancel
            </p>
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !categoryId || !content.trim()}
            className="bg-[#6290f2] flex items-center justify-center px-4 py-3 rounded-lg hover:bg-[#6290f2]/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[40px]"
            style={{ width: '160px' }}
          >
            <p 
              className="text-white"
              style={{ 
                fontFamily: 'Lato, sans-serif',
                fontWeight: 400,
                lineHeight: '24px',
                fontSize: '16px'
              }}
            >
              Save Changes
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

