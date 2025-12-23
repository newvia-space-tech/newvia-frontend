'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function TestimonialSection() {
  return (
    <div className="bg-white w-full pt-16 pb-8 px-4 sm:px-8 lg:px-16 xl:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="box-border content-stretch flex flex-col gap-8 sm:gap-10 items-center justify-center overflow-clip p-6 sm:p-15 relative rounded-3 bg-white">
          {/* Main Heading */}
          <h2 className="font-medium leading-8 sm:leading-10 not-italic relative shrink-0 text-2xl sm:text-3xl text-black text-center whitespace-pre">
            The People Who Believe in Us
          </h2>

          {/* Testimonial Card */}
          <div className="bg-[#f8f9f8] box-border content-stretch flex flex-col sm:flex-row gap-4 sm:gap-8 items-center p-4 sm:p-6 relative rounded-3 shrink-0 w-full">
            {/* Profile Image */}
            <Link 
              href="https://luxelinkasia.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="relative rounded-full shrink-0 w-20 h-20 sm:w-32 sm:h-32 lg:w-39 lg:h-39 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
            >
              <Image
                src="/figma-assets/matthias_weiskopf.png"
                alt="Matthias Weiskopf"
                width={156}
                height={156}
                className="object-cover w-full h-full rounded-full"
              />
            </Link>

            {/* Content */}
            <div className="content-stretch flex flex-col gap-3 items-center sm:items-start text-center sm:text-left">
              {/* Quote */}
              <p className="font-normal leading-6 sm:leading-7 not-italic relative shrink-0 text-base sm:text-lg text-black max-w-2xl">
                A long-time advocate of excellence in experience design, Matthias Weiskopf, Founder of LUXE/LINK, recognises NewVía&apos;s efforts to bring the principles of luxury and intentionality into the wellness industry. With over 25 years in global luxury, Matthias believes that the future of meaningful brands lies in how they make people feel — a vision that resonates strongly with NewVía&apos;s mission to reimagine wellness through design, technology, and trust.
              </p>

              {/* Attribution */}
              <Link 
                href="https://luxelinkasia.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="content-stretch flex flex-col items-center sm:items-start justify-center leading-5 sm:leading-6 not-italic relative shrink-0 whitespace-pre hover:opacity-80 transition-opacity"
              >
                <p className="font-semibold relative shrink-0 text-base sm:text-lg text-black">
                  Matthias Weiskopf
                </p>
                <p className="font-normal relative shrink-0 text-[#797e84] text-sm sm:text-base">
                  Founder of Luxe/Link
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
