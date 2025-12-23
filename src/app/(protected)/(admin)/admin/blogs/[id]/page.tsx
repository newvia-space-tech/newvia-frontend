'use client';

import React, { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { use } from 'react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import EditBlogPostModal from '@/components/admin/EditBlogPostModal';
import DeleteBlogModal from '@/components/admin/DeleteBlogModal';
import { useBlogDetail } from '@/hooks/blog/useBlogDetail';
import { useDeleteBlog } from '@/hooks/blog/useDeleteBlog';
import { useUpdateBlog } from '@/hooks/blog/useUpdateBlog';
import { useAuth } from '@/context/AuthContext';
import { Bell, Clock, Calendar, Pencil, Trash2, ArrowLeft } from 'lucide-react';

// Helper function to format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

interface BlogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { adminToken } = useAuth();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const bellButtonRef = useRef<HTMLDivElement>(null);

  const { data: blog, isLoading, error } = useBlogDetail(id);
  const deleteBlogMutation = useDeleteBlog(adminToken);
  const updateBlogMutation = useUpdateBlog(adminToken);

  const handleBellClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleCloseNotification = () => {
    setIsNotificationOpen(false);
  };

  const getNotificationPosition = () => {
    if (bellButtonRef.current) {
      const rect = bellButtonRef.current.getBoundingClientRect();
      return {
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      };
    }
    return { top: 80, right: 36 };
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleEditBlogPost = async (data: {
    title: string;
    category_id: string;
    content: string;
    coverImage?: File;
  }) => {
    // The EditBlogPostModal handles fetching the existing image if no new image is selected
    if (!data.coverImage) {
      return;
    }

    try {
      await updateBlogMutation.mutateAsync({
        blog_post_id: id,
        blog_title: data.title,
        content: data.content,
        blog_category_id: data.category_id,
        image: data.coverImage,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update blog:', error);
      // Error is logged, modal stays open so user can retry
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBlogMutation.mutateAsync({ blog_post_id: id });
      setDeleteModalOpen(false);
      // After successful deletion, navigate back to blogs list
      router.push('/admin/blogs');
    } catch (error) {
      console.error('Failed to delete blog:', error);
      // Error is logged, modal stays open so user can retry or cancel
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteBlogMutation.isPending) {
      setDeleteModalOpen(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/blogs');
  };

  if (isLoading) {
    return (
      <div className="bg-[#f8f9f8] min-h-screen relative">
        <AdminSidebar />
        <div className="lg:ml-[248px]">
          <div className="p-4 sm:p-5 lg:p-4">
            <div className="bg-white rounded-xl p-5 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-full mb-2" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="bg-[#f8f9f8] min-h-screen relative">
        <AdminSidebar />
        <div className="lg:ml-[248px]">
          <div className="p-4 sm:p-5 lg:p-4">
            <div className="bg-white rounded-xl p-5">
              <p className="text-red-600 mb-4">
                {error instanceof Error ? error.message : 'Failed to load blog'}
              </p>
              <button
                onClick={handleBack}
                className="text-[#6290f2] hover:underline"
              >
                Back to Blogs
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9f8] min-h-screen relative">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="lg:ml-[248px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f8f9f8]">
          <div className="flex items-center justify-between pl-16 sm:pl-6 lg:pl-9 pr-4 sm:pr-6 lg:pr-9 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="bg-white rounded-lg p-2 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft size={20} className="text-black" />
              </button>
              <div className="flex flex-col gap-0.5">
                <h1 
                  className="text-xl font-bold text-black"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 700,
                    lineHeight: '28px'
                  }}
                >
                  Blog Detail
                </h1>
              </div>
            </div>
            {/* <div 
              ref={bellButtonRef}
              className="bg-white rounded-lg p-2 cursor-pointer hover:bg-gray-50 transition-colors relative"
              onClick={handleBellClick}
            >
              <Bell size={20} className="text-black" />
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            </div> */}
          </div>
        </div>

        {/* Notification Modal */}
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={handleCloseNotification}
          position={getNotificationPosition()}
        />

        {/* Edit Blog Post Modal */}
        <EditBlogPostModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          blog={blog || null}
          onSubmit={handleEditBlogPost}
        />

        {/* Delete Blog Modal */}
        <DeleteBlogModal
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          blogTitle={blog?.title}
          isLoading={deleteBlogMutation.isPending}
        />

        {/* Content Area */}
        <div className="p-4 sm:p-5 lg:p-4">
          <div className="bg-white rounded-xl p-4 sm:p-5 flex flex-col lg:flex-row gap-6 lg:gap-10 items-start max-w-[1200px]">
            {/* Right Column - Image and Actions (shown first on mobile) */}
            <div className="flex flex-col gap-4 sm:gap-5 shrink-0 w-full lg:w-[300px] order-1 lg:order-2">
              {/* Featured Image */}
              <div className="flex flex-col gap-3">
                <div className="relative w-full lg:w-[300px] h-[250px] sm:h-[300px] rounded-xl overflow-hidden bg-[#e0e2e6]">
                  {blog.blog_image ? (
                    <Image
                      src={blog.blog_image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <svg 
                          className="w-12 h-12" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={1.5} 
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                          />
                        </svg>
                        <span className="text-xs font-medium">No Image Available</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 sm:gap-5 items-center">
                  <div className="flex gap-1.5 items-center">
                    <Clock size={16} className="text-[#797e84]" />
                    <p
                      className="text-sm sm:text-base text-[#797e84]"
                      style={{
                        fontFamily: 'Lato, sans-serif',
                        fontWeight: 500,
                        lineHeight: '24px'
                      }}
                    >
                      {blog.minutes_read || 5} min read
                    </p>
                  </div>
                  {blog.published_at && (
                    <div className="flex gap-1.5 items-center">
                      <Calendar size={16} className="text-[#797e84]" />
                      <p
                        className="text-sm sm:text-base text-[#797e84]"
                        style={{
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '24px'
                        }}
                      >
                        {formatDate(blog.published_at)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 items-center justify-start sm:justify-end w-full lg:w-auto">
                <button
                  onClick={handleEdit}
                  className="bg-[#f8f9f8] flex gap-2 items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-gray-100 transition-colors flex-1 sm:flex-initial"
                >
                  <Pencil size={18} className="text-black" />
                  <span
                    className="text-sm sm:text-base text-black"
                    style={{
                      fontFamily: 'Lato, sans-serif',
                      fontWeight: 400,
                      lineHeight: '24px'
                    }}
                  >
                    Edit
                  </span>
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-[#fcebeb] flex items-center justify-center p-2.5 sm:p-3 rounded-lg hover:bg-red-50 transition-colors w-11 h-11 sm:w-12 sm:h-12 shrink-0"
                >
                  <Trash2 size={18} className="sm:w-5 sm:h-5 text-[#e43636]" />
                </button>
              </div>
            </div>

            {/* Left Column - Blog Content (shown second on mobile) */}
            <div className="flex-1 flex flex-col gap-6 sm:gap-8 w-full lg:w-auto order-2 lg:order-1">
              {/* Title */}
              <div className="flex flex-col gap-2">
                <h2
                  className="text-base sm:text-lg font-semibold text-black"
                  style={{
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 600,
                    lineHeight: '28px'
                  }}
                >
                  {blog.title}
                </h2>
              </div>

              {/* Blog Content */}
              <article className="blog-content prose prose-lg max-w-none">
                <ReactMarkdown>{blog.content || ''}</ReactMarkdown>
              </article>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
