'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import FirstBookingBanner from '@/components/layout/FirstBookingBanner';
import BlogHeroSection from '@/components/layout/BlogHeroSection';
import Footer from '@/components/layout/Footer';
import { getBlogs, getFeaturedBlogs } from '@/services/blog/blog';
import { Blog } from '@/types';

// Image assets
const clockIcon = '/figma-assets/clock.svg';
const calendarIcon = '/figma-assets/calendar.svg';
const arrowIcon = '/figma-assets/arrow-right.svg';
const forwardArrowIcon = '/figma-assets/forward-arrow.svg';

// Format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

export default function BlogPage() {
  const [featuredBlog, setFeaturedBlog] = useState<Blog | null>(null);
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch featured blogs (only need first one)
        const featuredResponse = await getFeaturedBlogs(1, 10);
        if (featuredResponse.items && featuredResponse.items.length > 0) {
          setFeaturedBlog(featuredResponse.items[0]);
        }
        setFeaturedLoading(false);
        
        // Fetch regular blogs for "More Blogs" section
        const blogsResponse = await getBlogs(1, 20);
        setBlogPosts(blogsResponse.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blogs');
        console.error('Error fetching blogs:', err);
        setFeaturedLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const otherBlogs = blogPosts;

  return (
    <div className="min-h-screen bg-white">
      {/* First Booking Discount Banner */}
      <FirstBookingBanner />
      
      {/* Hero Section with Header */}
      <div className="relative">
        <BlogHeroSection />
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 px-4 sm:px-6 lg:px-10">
          <Header />
        </div>
      </div>

      {/* Featured Blog Section */}
      {featuredLoading ? (
        <div className="py-20 px-4 sm:px-8 lg:px-16 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-15 items-start w-full animate-pulse">
              <div className="relative w-full lg:w-[400px] h-[300px] rounded-xl overflow-hidden flex-shrink-0 bg-gray-200"></div>
              <div className="flex-1 space-y-6 w-full">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>
      ) : featuredBlog ? (
        <Link href={`/blog/${featuredBlog.id}`}>
        <div className="py-20 px-4 sm:px-8 lg:px-16 xl:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-15 items-start w-full">
              {/* Featured Blog Image */}
              <div className="relative w-full lg:w-[400px] h-[300px] rounded-xl overflow-hidden flex-shrink-0">
                {featuredBlog.blog_image ? (
                  <Image
                    src={featuredBlog.blog_image}
                    alt={featuredBlog.title}
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
                <div className="absolute top-4 left-4">
                  <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-black capitalize">
                    {featuredBlog.blog_category_name || 'Wellness'}
                  </span>
                </div>
              </div>

              {/* Featured Blog Content */}
              <div className="flex-1 space-y-6 w-full">
                <div className="flex items-center gap-2">
                  <Image
                    src={forwardArrowIcon}
                    alt="Featured"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium text-gray-600 tracking-wider uppercase">
                    Featured This Month
                  </span>
                </div>
                
                <h3 className="text-2xl md:text-3xl font-medium text-black leading-tight" style={{ fontFamily: 'Lato, sans-serif' }}>
                  {featuredBlog.title}
                </h3>
                
                <div className="space-y-4 text-gray-600" style={{ fontFamily: 'Lato, sans-serif' }}>
                  <p className="text-base leading-relaxed">
                    {featuredBlog.slug || featuredBlog.content?.substring(0, 200) || 'Read more about this featured blog post.'}
                  </p>
                  <p className="text-base leading-relaxed">
                    {featuredBlog.content?.substring(200, 400) || 'We believe that beauty isn\'t about changing who you are, but about enhancing your natural charm. Here\'s why making time for your salon appointments can completely transform the way you look and feel.'}
                  </p>
                </div>
                
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Image
                      src={clockIcon}
                      alt="Read time"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                    <span>{featuredBlog.minutes_read || 5} min read</span>
                  </div>
                  {featuredBlog.published_at && (
                    <div className="flex items-center gap-2">
                      <Image
                        src={calendarIcon}
                        alt="Publish date"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                      <span>{formatDate(featuredBlog.published_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </Link>
      ) : null}

      {/* More Blogs Section */}
      <div className="py-20 px-4 sm:px-8 lg:px-16 xl:px-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <h2 className="text-2xl lg:text-3xl font-medium text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
              More Blogs
            </h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-8 text-gray-500">
              <p>{error}</p>
            </div>
          ) : otherBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherBlogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog/${blog.id}`}
                  className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group block"
                >
                  {/* Image Container */}
                  <div className="relative h-48 w-full">
                    {blog.blog_image ? (
                      <Image
                        src={blog.blog_image}
                        alt={blog.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <div className="absolute top-3 left-3">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-medium rounded-md capitalize">
                        {blog.blog_category_name || 'Wellness'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    {/* Read Time */}
                    <div className="flex items-center gap-1 mb-3">
                      <Image
                        src={clockIcon}
                        alt="Read time"
                        width={16}
                        height={16}
                        className="w-4 h-4 text-gray-400"
                      />
                      <span className="text-sm text-gray-500">{blog.minutes_read || 5} min read</span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-black mb-3 group-hover:text-gray-700 transition-colors line-clamp-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                      {blog.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                      {blog.slug || blog.content?.substring(0, 100) || 'Read more about this blog post.'}
                    </p>
                    
                    {/* Read More Link */}
                    <div className="flex items-center gap-1 text-black font-medium text-sm group-hover:gap-2 transition-all">
                      <span>Read more</span>
                      <Image
                        src={arrowIcon}
                        alt="Arrow"
                        width={16}
                        height={16}
                        className="w-4 h-4"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No blogs available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
