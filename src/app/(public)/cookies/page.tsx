'use client';

import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';

export default function CookieNoticePage() {
  return (
    <div className="min-h-screen bg-white">
      <UnifiedHeader showSearchBar={true} />
      
      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-[60px] py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col gap-10 lg:gap-[40px]">
            {/* Header Section */}
            <div className="flex flex-col gap-4 lg:gap-[16px]">
              <div className="flex flex-col gap-3 lg:gap-[12px]">
                <h1 
                  className="text-2xl sm:text-3xl lg:text-[28px] font-medium text-black capitalize leading-[36px]"
                  style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500 }}
                >
                  Cookie Notice
                </h1>
                
                <div 
                  className="flex flex-col gap-2 lg:gap-[8px] text-[#797e84] text-base leading-[24px]"
                  style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500 }}
                >
                  <p className="leading-[24px]">
                    NewVía Space Technology (RA0126510-U)
                    <br />
                    Effective Date: 1 December 2025
                  </p>
                  <p className="leading-[24px]">
                    This Cookie Notice explains how NewVía (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) uses cookies and similar technologies on our website and platform.
                  </p>
                  <p className="leading-[24px]">
                    By continuing to use NewVía, you agree to the use of cookies as described in this notice.
                  </p>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div 
              className="flex flex-col gap-2 lg:gap-[8px] text-[#797e84] text-base leading-[24px]"
              style={{ fontFamily: 'Lato, sans-serif', fontWeight: 500 }}
            >
              {/* Section 1 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">1. What Are Cookies?</p>
                <p className="leading-[24px]">
                  Cookies are small text files stored on your device when you visit a website.
                  <br />
                  They help improve functionality, performance, and user experience.
                </p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 2 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">2. Types of Cookies We Use</p>
                
                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">2.1 Essential Cookies</p>
                  <p className="leading-[24px]">Required for the platform to function, including:</p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Login sessions</li>
                    <li className="leading-[24px] mb-0">Booking functionality</li>
                    <li className="leading-[24px]">Security features</li>
                  </ul>
                  <p className="leading-[24px]">You cannot disable these because the platform will not work without them.</p>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">2.2 Performance & Analytics Cookies</p>
                  <p className="leading-[24px]">Used to understand how users interact with NewVía, such as:</p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Page visits</li>
                    <li className="leading-[24px] mb-0">Button clicks</li>
                    <li className="leading-[24px]">Browsing patterns</li>
                  </ul>
                  <p className="leading-[24px]">Examples: Google Analytics or similar tools.</p>
                  <p className="leading-[24px]">These help us improve speed, features, and usability.</p>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">2.3 Functional Cookies</p>
                  <p className="leading-[24px]">Used to remember your preferences, such as:</p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Language settings</li>
                    <li className="leading-[24px] mb-0">Region</li>
                    <li className="leading-[24px]">Saved browsing choices</li>
                  </ul>
                  <p className="leading-[24px] text-base">&nbsp;</p>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">2.4 Advertising & Marketing Cookies (Optional)</p>
                  <p className="leading-[24px]">May be used for:</p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Relevant ads</li>
                    <li className="leading-[24px] mb-0">Retargeting</li>
                    <li className="leading-[24px]">Campaign optimisation</li>
                  </ul>
                  <p className="leading-[24px]">We only use these if you consent.</p>
                  <p className="leading-[24px] text-base">&nbsp;</p>
                </div>
              </div>

              {/* Section 3 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">3. Third-Party Cookies</p>
                <p className="leading-[24px]">We may use cookies from trusted third parties, such as:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Payment processors</li>
                  <li className="leading-[24px] mb-0">Analytics providers</li>
                  <li className="leading-[24px] mb-0">Messaging tools</li>
                  <li className="leading-[24px]">Marketing platforms</li>
                </ul>
                <p className="leading-[24px]">These parties may collect anonymous usage data for their services.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 4 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">4. Managing Cookie Preferences</p>
                <p className="leading-[24px]">You can control or delete cookies in your browser settings:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Block certain cookies</li>
                  <li className="leading-[24px] mb-0">Delete existing cookies</li>
                  <li className="leading-[24px]">Set alerts before cookies are stored</li>
                </ul>
                <p className="leading-[24px]">However, disabling essential or functional cookies may affect platform performance.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 5 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">5. Updates to This Cookie Notice</p>
                <p className="leading-[24px]">
                  NewVía may update this notice to reflect changes in technology or regulations.
                  <br />
                  Any updates will be posted with a revised Effective Date.
                </p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 6 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">6. Contact Us</p>
                <p className="leading-[24px]">If you have questions about our cookie usage:</p>
                <p className="leading-[24px]">
                  NewVia Space Technology (RA0126510-U)
                  <br />
                  Email: admin@newviaspace.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

