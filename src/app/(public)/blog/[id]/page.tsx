'use client';

import Image from 'next/image';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { getBlogDetail, getBlogs } from '@/services/blog/blog';
import { BlogDetail, Blog } from '@/types';

// Image assets
const clockIcon = '/figma-assets/clock.svg';
const calendarIcon = '/figma-assets/calendar.svg';
const arrowIcon = '/figma-assets/arrow-right.svg';

// Format date from timestamp
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

interface BlogDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function BlogDetailsPage({ params }: BlogDetailsPageProps) {
  const { id } = use(params);
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch blog details
        const blogData = await getBlogDetail(id);
        setBlog(blogData);
        
        // Fetch related blogs (exclude current blog)
        const blogsResponse = await getBlogs(1, 3);
        const filteredBlogs = blogsResponse.items.filter(b => b.id !== id);
        setRelatedBlogs(filteredBlogs.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog');
        console.error('Error fetching blog:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlogData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white">
          <Header theme="light" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-20 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-white">
          <Header theme="light" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-20 py-20">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Blog not found'}</p>
            <Link href="/blog" className="text-blue-600 hover:underline">
              Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white">
        <Header theme="light" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-20 py-20">
        <div className="flex flex-col gap-10 items-center">
          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-semibold text-black text-center leading-tight" style={{ fontFamily: 'Lato, sans-serif' }}>
            {blog.title}
          </h1>

          {/* Content Container */}
          <div className="flex flex-col gap-8 w-full">
            {/* Image and Metadata */}
            <div className="flex flex-col gap-5">
              <div className="relative h-[400px] w-full rounded-xl overflow-hidden">
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
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <Image
                    src={clockIcon}
                    alt="Read time"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <span className="text-base text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500 }}>
                    {blog.minutes_read || 5} min read
                  </span>
                </div>
                {blog.published_at && (
                <div className="flex items-center gap-2">
                  <Image
                    src={calendarIcon}
                    alt="Publish date"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  <span className="text-base text-[#797e84]" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500 }}>
                      {formatDate(blog.published_at)}
                  </span>
                </div>
                )}
              </div>
            </div>

            {/* Blog Content */}
            <article className="flex flex-col gap-8 w-full">
              <div className="blog-content prose prose-lg max-w-none">
                <ReactMarkdown>{blog.content || ''}</ReactMarkdown>
              </div>
            </article>
          </div>
        </div>
      </div>

      {/* View More Blogs */}
      {relatedBlogs.length > 0 && (
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 xl:px-20">
          {/* Header Section */}
          <div className="mb-12">
            <h2 className="text-2xl lg:text-3xl font-medium text-black" style={{ fontFamily: 'Lato, sans-serif' }}>
              View More Blogs
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedBlogs.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group block border border-gray-100"
              >
                {/* Image Container */}
                <div className="relative h-40 w-full">
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
                <div className="p-5">
                  {/* Read Time */}
                  <div className="flex items-center gap-1 mb-3">
                    <Image
                      src={clockIcon}
                      alt="Read time"
                      width={16}
                      height={16}
                      className="w-4 h-4 text-gray-400"
                    />
                      <span className="text-sm text-gray-500">{post.minutes_read || 5} min read</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-base font-semibold text-black mb-2 group-hover:text-gray-700 transition-colors line-clamp-2" style={{ fontFamily: 'Lato, sans-serif' }}>
                    {post.title}
                  </h3>
                  
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
        </div>
      </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
