'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBlogs } from '@/services/blog/blog';
import { Blog } from '@/types';

// Image assets
const forwardArrowIcon = '/figma-assets/forward-arrow.svg';

export default function BlogsSection() {
  const [blogPosts, setBlogPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getBlogs(1, 3); // Fixed perPage to 3
        setBlogPosts(response.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blogs');
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);
  return (
    <div className="bg-white w-full py-16 px-4 sm:px-8 lg:px-16 xl:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col gap-3 mb-12">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5">
              <Image 
                alt="Forward arrow icon" 
                className="w-full h-full" 
                src={forwardArrowIcon} 
                width={20}
                height={20}
              />
            </div>
            <span className="text-[#797e84] text-sm font-medium tracking-wider uppercase">
              BLOGS
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-medium text-black">
            Your Guide to Intentional Living
          </h2>
        </div>

        {/* Blog Posts - Horizontal scroll on mobile, grid on desktop */}
        {loading ? (
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 overflow-x-auto scrollbar-hide pb-4 md:overflow-x-visible md:pb-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse flex-shrink-0 w-80 md:w-auto">
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
        ) : blogPosts.length > 0 ? (
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 overflow-x-auto scrollbar-hide pb-4 md:overflow-x-visible md:pb-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group flex flex-col h-full flex-shrink-0 w-80 md:w-auto"
              >
                {/* Image Container */}
                <div className="relative h-48 w-full flex-shrink-0">
                  {post.blog_image ? (
                    <Image
                      src={post.blog_image}
                      alt={post.title}
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
                      {post.blog_category_name || 'Wellness'}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Read Time */}
                  <div className="flex items-center gap-1 mb-3 flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-500">{post.minutes_read || 5} min read</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg font-semibold text-black mb-1 group-hover:text-gray-700 transition-colors truncate">
                    {post.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1 overflow-hidden">
                    {post.slug || post.content || 'Read more about this blog post.'}
                  </p>
                  
                  {/* Read More Link */}
                  <div className="flex items-center gap-1 text-black font-medium text-sm group-hover:gap-2 transition-all mt-auto flex-shrink-0">
                    <span>Read more</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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

        {/* View All Button */}
        <div className="flex justify-center">
          <Link 
            href="/blog"
            className="flex items-center gap-2 px-6 py-3 border border-black rounded-full hover:bg-black hover:text-white transition-colors"
          >
            <span className="font-medium">View All</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
