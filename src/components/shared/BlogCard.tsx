'use client';

import Image from 'next/image';
import Link from 'next/link';

// Image assets
const clockIcon = '/figma-assets/clock.svg';
const arrowIcon = '/figma-assets/arrow-right.svg';

interface BlogCardProps {
  id: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image: string;
  featured?: boolean;
  className?: string;
}

export default function BlogCard({
  id,
  title,
  category,
  readTime,
  excerpt,
  image,
  featured = false,
  className = ''
}: BlogCardProps) {
  return (
    <Link
      href={`/blog/${id}`}
      className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="relative h-48">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white px-3 py-1 rounded-full text-sm font-medium text-black">
            {category}
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Image
            src={clockIcon}
            alt="Read time"
            width={16}
            height={16}
            className="w-4 h-4"
          />
          <span className="text-sm text-gray-600">{readTime}</span>
        </div>
        
        <h3 className="text-lg font-semibold text-black group-hover:text-gray-700 transition-colors leading-tight" style={{ fontFamily: 'Lato, sans-serif' }}>
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm leading-relaxed" style={{ fontFamily: 'Lato, sans-serif' }}>
          {excerpt}
        </p>
        
        <div className="flex items-center gap-2 text-gray-600 text-sm">
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
  );
}
