'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import NotificationModal from '@/components/provider/NotificationModal';
import CreateBlogPostModal from '@/components/admin/CreateBlogPostModal';
import EditBlogPostModal from '@/components/admin/EditBlogPostModal';
import DeleteBlogModal from '@/components/admin/DeleteBlogModal';
import { useBlogs } from '@/hooks/blog/useBlogs';
import { useDeleteBlog } from '@/hooks/blog/useDeleteBlog';
import { useCreateBlog } from '@/hooks/blog/useCreateBlog';
import { useUpdateBlog } from '@/hooks/blog/useUpdateBlog';
import { useBlogDetail } from '@/hooks/blog/useBlogDetail';
import { useAuth } from '@/context/AuthContext';
import { BlogDetail } from '@/types';
import { Plus, Clock, Calendar, MoreVertical, ChevronLeft, ChevronRight, Bell, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';

// Helper function to format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BlogsManagementPage() {
  const router = useRouter();
  const { adminToken } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{ id: string; title: string } | null>(null);
  const [blogToEdit, setBlogToEdit] = useState<string | null>(null);
  const bellButtonRef = useRef<HTMLDivElement>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const itemsPerPage = 9; // 3 columns x 3 rows

  const { data: blogsData, isLoading, error } = useBlogs(currentPage, itemsPerPage);
  const deleteBlogMutation = useDeleteBlog(adminToken);
  const createBlogMutation = useCreateBlog(adminToken);
  const updateBlogMutation = useUpdateBlog(adminToken);
  const { data: blogToEditData } = useBlogDetail(blogToEdit);

  const handleCreateBlogPost = async (data: {
    title: string;
    category_id: string;
    content: string;
    coverImage?: File;
  }) => {
    if (!data.coverImage) {
      // TODO: Show validation error
      return;
    }

    try {
      await createBlogMutation.mutateAsync({
        blog_title: data.title,
        content: data.content,
        blog_category_id: data.category_id,
        image: data.coverImage,
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create blog:', error);
      // Error is logged, modal stays open so user can retry
    }
  };

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

  const handleCardClick = (blogId: string) => {
    router.push(`/admin/blogs/${blogId}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId) {
        const dropdownRef = dropdownRefs.current[openDropdownId];
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
          setOpenDropdownId(null);
        }
      }
    };

    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  const handleMenuClick = (e: React.MouseEvent, blogId: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === blogId ? null : blogId);
  };

  const handleEdit = (e: React.MouseEvent, blogId: string) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setBlogToEdit(blogId);
    setIsEditModalOpen(true);
  };

  const handleEditBlogPost = async (data: {
    title: string;
    category_id: string;
    content: string;
    coverImage?: File;
  }) => {
    if (!blogToEdit) {
      return;
    }

    // The EditBlogPostModal handles fetching the existing image if no new image is selected
    if (!data.coverImage) {
      return;
    }

    try {
      await updateBlogMutation.mutateAsync({
        blog_post_id: blogToEdit,
        blog_title: data.title,
        content: data.content,
        blog_category_id: data.category_id,
        image: data.coverImage,
      });
      setIsEditModalOpen(false);
      setBlogToEdit(null);
    } catch (error) {
      console.error('Failed to update blog:', error);
      // Error is logged, modal stays open so user can retry
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setBlogToEdit(null);
  };

  const handleDelete = (e: React.MouseEvent, blogId: string, blogTitle: string) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    setBlogToDelete({ id: blogId, title: blogTitle });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      await deleteBlogMutation.mutateAsync({ blog_post_id: blogToDelete.id });
      setDeleteModalOpen(false);
      setBlogToDelete(null);
    } catch (error) {
      console.error('Failed to delete blog:', error);
      // Error is logged, modal stays open so user can retry or cancel
    }
  };

  const handleCloseDeleteModal = () => {
    if (!deleteBlogMutation.isPending) {
      setDeleteModalOpen(false);
      setBlogToDelete(null);
    }
  };

  const blogs = blogsData?.items || [];
  const totalItems = blogsData?.itemsTotal || 0;
  const totalPages = blogsData?.pageTotal || 1;
  const currentPageNum = blogsData?.curPage || 1;
  const hasNextPage = blogsData?.nextPage !== null;
  const hasPrevPage = blogsData?.prevPage !== null;

  // Generate pagination page numbers
  const getPaginationPages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPageNum <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPageNum >= totalPages - 2) {
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        for (let i = currentPageNum - 1; i <= currentPageNum + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="bg-[#f8f9f8] min-h-screen relative">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="lg:ml-[248px]">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#f8f9f8]">
          <div className="flex items-center justify-between pl-16 sm:pl-6 lg:pl-9 pr-4 sm:pr-6 lg:pr-9 py-3">
            <div className="flex flex-col gap-0.5">
              <h1 
                className="text-xl font-bold text-black"
                style={{ 
                  fontFamily: 'Lato, sans-serif',
                  fontWeight: 700,
                  lineHeight: '28px'
                }}
              >
                Blogs Management
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#6290f2] flex gap-2 items-center justify-center px-3 sm:px-4 py-2 rounded-lg hover:bg-[#6290f2]/90 transition-colors cursor-pointer"
              >
                <Plus size={20} className="text-white" />
                <p 
                  className="hidden sm:block text-white"
                  style={{ 
                    fontFamily: 'Lato, sans-serif',
                    fontWeight: 400,
                    lineHeight: '20px',
                    fontSize: '14px'
                  }}
                >
                  Create Blog Post
                </p>
              </button>
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
        </div>

        {/* Notification Modal */}
        <NotificationModal
          isOpen={isNotificationOpen}
          onClose={handleCloseNotification}
          position={getNotificationPosition()}
        />

        {/* Content Area */}
        <div className="p-4 sm:p-5 lg:p-4">
          {isLoading ? (
            // Loading state
            <div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-start w-full"
            >
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-4 items-start w-full"
                >
                  <div className="relative h-[240px] w-full rounded-xl overflow-hidden bg-gray-200 animate-pulse" />
                  <div className="flex flex-col gap-1.5 items-start w-full">
                    <div className="flex gap-3 items-start w-full">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            // Error state
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Failed to load blogs. Please try again later.
              </p>
            </div>
          ) : blogs.length === 0 ? (
            // Empty state
            <div className="text-center py-8">
              <p className="text-sm text-[#797e84]">
                No blogs found
              </p>
            </div>
          ) : (
            <>
              <div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-start mb-5 w-full"
              >
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    onClick={() => handleCardClick(blog.id)}
                    className="flex flex-col gap-4 items-start w-full cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {/* Blog Card Image */}
                    <div className="relative h-[240px] w-full rounded-xl overflow-hidden">
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
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4 bg-white flex gap-1.5 items-center justify-center px-3 py-1 rounded-full">
                        <p 
                          className="text-black"
                          style={{ 
                            fontFamily: 'Lato, sans-serif',
                            fontWeight: 400,
                            lineHeight: '20px',
                            fontSize: '14px'
                          }}
                        >
                          {blog.blog_category_name || 'Wellness'}
                        </p>
                      </div>
                      {/* Menu Icon */}
                      <div className="absolute top-4 right-4" ref={(el) => { dropdownRefs.current[blog.id] = el; }}>
                        <button
                          onClick={(e) => handleMenuClick(e, blog.id)}
                          className="bg-white flex items-center justify-center p-1 rounded-md hover:bg-gray-50 transition-colors w-8 h-8 cursor-pointer"
                        >
                          <MoreVertical size={16} className="text-black" />
                        </button>
                        {/* Dropdown Menu */}
                        {openDropdownId === blog.id && (
                          <div className="absolute top-10 right-0 bg-white border border-[#e5e7ea] rounded-lg shadow-lg z-[9999] w-[200px]">
                            <button
                              onClick={(e) => handleEdit(e, blog.id)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 first:rounded-t-lg transition-colors cursor-pointer"
                            >
                              <Pencil size={18} className="text-black" />
                              <span
                                className="text-base text-black"
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
                              onClick={(e) => handleDelete(e, blog.id, blog.title)}
                              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 last:rounded-b-lg transition-colors cursor-pointer"
                            >
                              <Trash2 size={18} className="text-[#e43636]" />
                              <span
                                className="text-base text-[#e43636]"
                                style={{
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '24px'
                                }}
                              >
                                Delete
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Blog Card Content */}
                    <div className="flex flex-col gap-1.5 items-start w-full">
                      {/* Read Time and Date */}
                      <div className="flex gap-3 items-start w-full">
                        <div className="flex gap-1.5 items-center">
                          <Clock size={16} className="text-[#797e84]" />
                          <p 
                            className="text-[#797e84]"
                            style={{ 
                              fontFamily: 'Lato, sans-serif',
                              fontWeight: 500,
                              lineHeight: '24px',
                              fontSize: '16px'
                            }}
                          >
                            {blog.minutes_read || 5} min read
                          </p>
                        </div>
                        {blog.published_at && (
                          <div className="flex gap-1.5 items-center">
                            <Calendar size={16} className="text-[#797e84]" />
                            <p 
                              className="text-[#797e84]"
                              style={{ 
                                fontFamily: 'Lato, sans-serif',
                                fontWeight: 500,
                                lineHeight: '24px',
                                fontSize: '16px'
                              }}
                            >
                              {formatDate(blog.published_at)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h3 
                        className="text-black font-semibold"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 600,
                          lineHeight: '28px',
                          fontSize: '18px'
                        }}
                      >
                        {blog.title}
                      </h3>

                      {/* Description */}
                      <p 
                        className="text-[#797e84] line-clamp-2"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '24px',
                          fontSize: '16px'
                        }}
                      >
                        {blog.slug || blog.content?.substring(0, 100) || 'No description available.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 items-center">
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '20px'
                        }}
                      >
                        Showing
                      </p>
                      <p 
                        className="text-sm font-medium text-black text-center"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '20px'
                        }}
                      >
                        {blogsData?.itemsReceived || 0}
                      </p>
                      <p 
                        className="text-sm text-[#797e84]"
                        style={{ 
                          fontFamily: 'Lato, sans-serif',
                          fontWeight: 500,
                          lineHeight: '20px'
                        }}
                      >
                        of {totalItems}
                      </p>
                    </div>
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => hasPrevPage && setCurrentPage(currentPageNum - 1)}
                        disabled={!hasPrevPage}
                        className="border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronLeft size={20} className="text-[#797e84]" />
                      </button>
                      <div className="flex gap-0.5 items-center">
                        {getPaginationPages().map((page, index) => {
                          if (page === '...') {
                            return (
                              <div key={`ellipsis-${index}`} className="w-9 h-9 rounded-lg flex items-center justify-center">
                                <span 
                                  className="text-sm text-[#9ea5ad]"
                                  style={{ 
                                    fontFamily: 'Inter, sans-serif',
                                    fontWeight: 500,
                                    lineHeight: '21px'
                                  }}
                                >
                                  ...
                                </span>
                              </div>
                            );
                          }
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page as number)}
                              className={`w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer ${
                                currentPageNum === page
                                  ? 'bg-[#6290f2] text-white'
                                  : 'text-[#797e84] hover:bg-gray-50'
                              } transition-colors`}
                            >
                              <span 
                                className="text-sm"
                                style={{ 
                                  fontFamily: 'Lato, sans-serif',
                                  fontWeight: 400,
                                  lineHeight: '20px'
                                }}
                              >
                                {page}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => hasNextPage && setCurrentPage(currentPageNum + 1)}
                        disabled={!hasNextPage}
                        className="border border-[#e5e7ea] rounded-lg w-9 h-9 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <ChevronRight size={20} className="text-[#797e84]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Blog Post Modal */}
      <CreateBlogPostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateBlogPost}
      />

      {/* Edit Blog Post Modal */}
      <EditBlogPostModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        blog={blogToEditData || null}
        onSubmit={handleEditBlogPost}
      />

      {/* Delete Blog Modal */}
      <DeleteBlogModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        blogTitle={blogToDelete?.title}
        isLoading={deleteBlogMutation.isPending}
      />
    </div>
  );
}
