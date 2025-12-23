'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const arrowIcon = '/figma-assets/arrow-right.svg';
const logoImg = '/figma-assets/logo.svg';
const locationIcon = '/figma-assets/map-pin.svg';
const instagramIcon = '/figma-assets/instagram-logo.svg';
const facebookIcon = '/figma-assets/facebook-logo.svg';
const linkedinIcon = '/figma-assets/linkedin-logo.svg';
const xIcon = '/figma-assets/x-logo.svg';
const dividerLine = '/figma-assets/divider-line.svg';

export default function Footer() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-[#f8f9f8] flex flex-col gap-8 lg:gap-10 items-center pb-8 lg:pb-10 pt-12 lg:pt-15 px-4 sm:px-6 lg:px-8 xl:px-25 w-full">
      {/* CTA Section - Only show if user is not logged in */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-[#eee8a9] to-[#dbe4d5] flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-50 items-center p-6 sm:p-8 lg:p-10 rounded-lg w-full">
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-xl sm:text-2xl font-semibold text-black leading-8 sm:leading-10" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 600, lineHeight: '40px' }}>
              List your services, reach more customers, grow faster.
            </h3>
          </div>
          <Link
            href="/auth/login/provider"
            className="bg-white flex gap-2 items-center px-4 py-2.5 rounded-full whitespace-nowrap"
            style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500, fontSize: '16px', lineHeight: '24px' }}
          >
            <span className="text-black">List Your Shop</span>
            <Image
              src={arrowIcon}
              alt="Arrow Right"
              width={20}
              height={20}
              className="w-3 h-3 brightness-0"
            />
          </Link>
        </div>
      )}

      {/* Main Footer Content */}
      <div className="flex flex-col gap-8 items-center w-full max-w-7xl">
        {/* Mobile Layout (< md) */}
        <div className="flex md:hidden flex-col gap-8 items-center w-full">
          {/* Logo and Follow Us Side by Side */}
          <div className="flex flex-row gap-8 items-start justify-between w-full">
            {/* Company Logo */}
            <div className="flex justify-start">
              <div className="w-16 h-14">
                <Image
                  src={logoImg}
                  alt="Newvia Logo"
                  width={116}
                  height={116}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Follow Us */}
            <div className="flex flex-col gap-3 items-end">
              <h4 className="text-black text-lg font-bold" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '28px' }}>
                Follow Us
              </h4>
              <div className="flex gap-3">
                <Link
                  href="https://instagram.com/newviaofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white rounded-4.5 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Image
                    src={instagramIcon}
                    alt="Instagram"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </Link>
                <Link
                  href="https://www.facebook.com/share/16U7bpigNN/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white rounded-4.5 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Image
                    src={facebookIcon}
                    alt="Facebook"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/newvia-global/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white rounded-4.5 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Image
                    src={linkedinIcon}
                    alt="LinkedIn"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </Link>
                <Link
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white rounded-4.5 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Image
                    src={xIcon}
                    alt="X (Twitter)"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Pages and Help Side by Side - Center Aligned */}
          <div className="grid grid-cols-2 gap-8 w-full">
            {/* Pages */}
            <div className="flex flex-col gap-5 items-center">
              <h4 className="text-black text-lg font-bold text-center" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '28px' }}>
                Pages
              </h4>
              <div className="flex flex-col gap-4 text-[#797e84] text-sm items-center" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                <Link href="/about" className="hover:text-black transition-colors">About</Link>
                <Link href="/careers" className="hover:text-black transition-colors">Careers</Link>
                <Link href="/press" className="hover:text-black transition-colors">Press</Link>
                <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
              </div>
            </div>

            {/* Help */}
            <div className="flex flex-col gap-5 items-center">
              <h4 className="text-black text-lg font-bold text-center" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '28px' }}>
                Help
              </h4>
              <div className="flex flex-col gap-4 text-[#797e84] text-sm items-center" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                <Link href="/faq" className="hover:text-black transition-colors">FAQ</Link>
                <Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
                <Link href="/refund" className="hover:text-black transition-colors">Refund & Cancellation Policy</Link>
                <Link href="/cookies" className="hover:text-black transition-colors">Cookie Notice</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop/Tablet Layout (≥ md) */}
        <div className="hidden md:flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-34 items-start w-full">
          {/* Company Info */}
          <div className="flex-1 flex flex-col gap-6 lg:gap-8 items-center lg:items-start pt-5">
            <div className="w-20 h-16 lg:w-23 lg:h-20">
              <Image
                src={logoImg}
                alt="Newvia Logo"
                width={116}
                height={116}
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 lg:gap-15 items-start pt-5 w-full lg:w-auto">
            {/* Pages */}
            <div className="flex flex-col gap-5 items-center sm:items-start w-50">
              <h4 className="text-black text-lg font-bold text-center sm:text-left" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '28px' }}>
                Pages
              </h4>
              <div className="flex flex-col gap-4 text-[#797e84] text-sm sm:text-base items-center sm:items-start" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                <Link href="/about" className="hover:text-black transition-colors">About</Link>
                <Link href="/careers" className="hover:text-black transition-colors">Careers</Link>
                <Link href="/press" className="hover:text-black transition-colors">Press</Link>
                <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                <Link href="/contact" className="hover:text-black transition-colors">Contact</Link>
              </div>
            </div>

            {/* Help */}
            <div className="flex flex-col gap-5 items-center sm:items-start w-55">
              <h4 className="text-black text-lg font-bold text-center sm:text-left" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '28px' }}>
                Help
              </h4>
              <div className="flex flex-col gap-4 text-[#797e84] text-sm sm:text-base items-center sm:items-start" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
                <Link href="/faq" className="hover:text-black transition-colors">FAQ</Link>
                <Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link>
                <Link href="/refund" className="hover:text-black transition-colors">Refund & Cancellation Policy</Link>
                <Link href="/cookies" className="hover:text-black transition-colors">Cookie Notice</Link>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex flex-col gap-5 items-center sm:items-start w-50">
              <h4 className="text-black text-lg font-bold text-center sm:text-left" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 700, lineHeight: '28px' }}>
                Follow Us
              </h4>
              <div className="flex gap-3 justify-center sm:justify-start">
                <Link
                  href="https://instagram.com/newviaofficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white rounded-4.5 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Image
                    src={instagramIcon}
                    alt="Instagram"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </Link>
                <Link
                  href="https://www.facebook.com/share/16U7bpigNN/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white rounded-4.5 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Image
                    src={facebookIcon}
                    alt="Facebook"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </Link>
                <Link
                  href="https://www.linkedin.com/company/newvia-global/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white rounded-4.5 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Image
                    src={linkedinIcon}
                    alt="LinkedIn"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </Link>
                <Link
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white rounded-4.5 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Image
                    src={xIcon}
                    alt="X (Twitter)"
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full">
          <Image
            src={dividerLine}
            alt="Divider"
            width={1200}
            height={1}
            className="w-full h-px"
          />
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-black text-base" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 400, lineHeight: '24px' }}>
            © 2025 NewVía. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
