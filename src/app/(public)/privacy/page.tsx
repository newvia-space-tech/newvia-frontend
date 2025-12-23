'use client';

import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
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
                  Privacy Policy
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
                    NewVía (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, disclose, and protect personal data through the NewVía platform, website, and services.
                  </p>
                  <p className="leading-[24px]">
                    By using NewVía, you agree to the practices described in this Privacy Policy.
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
                <p className="leading-[24px] font-medium text-black">1. Information We Collect</p>
                <p className="leading-[24px]">We collect the following types of personal data:</p>
                
                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">1.1 Information You Provide to Us</p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Name</li>
                    <li className="leading-[24px] mb-0">Email address</li>
                    <li className="leading-[24px] mb-0">Phone number</li>
                    <li className="leading-[24px] mb-0">Account credentials</li>
                    <li className="leading-[24px] mb-0">Booking details</li>
                    <li className="leading-[24px] mb-0">Payment information (processed by third-party providers)</li>
                    <li className="leading-[24px]">Reviews, ratings, and messages</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">1.2 Information Automatically Collected</p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Device information</li>
                    <li className="leading-[24px] mb-0">IP address</li>
                    <li className="leading-[24px] mb-0">Browser type</li>
                    <li className="leading-[24px] mb-0">Platform activity</li>
                    <li className="leading-[24px] mb-0">Location (if enabled)</li>
                    <li className="leading-[24px]">Cookies and similar tracking technologies</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">1.3 Merchant-Specific Information</p>
                  <p className="leading-[24px]">For Merchants, we may also collect:</p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Business name</li>
                    <li className="leading-[24px] mb-0">Business address</li>
                    <li className="leading-[24px] mb-0">Service descriptions</li>
                    <li className="leading-[24px] mb-0">Operating hours</li>
                    <li className="leading-[24px] mb-0">Images</li>
                    <li className="leading-[24px]">Bank account details for payout</li>
                  </ul>
                </div>

                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 2 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">2. How We Use Your Information</p>
                <p className="leading-[24px]">We use personal data to:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Create and manage user and merchant accounts</li>
                  <li className="leading-[24px] mb-0">Facilitate service bookings</li>
                  <li className="leading-[24px] mb-0">Process payments and payouts</li>
                  <li className="leading-[24px] mb-0">Send confirmations, reminders, and notifications</li>
                  <li className="leading-[24px] mb-0">Improve platform performance and features</li>
                  <li className="leading-[24px] mb-0">Provide customer support</li>
                  <li className="leading-[24px] mb-0">Prevent fraud and misuse</li>
                  <li className="leading-[24px]">Comply with legal obligations</li>
                </ul>
                <p className="leading-[24px]">We do not sell your data to third parties.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 3 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">3. Payment & Financial Data</p>
                <p className="leading-[24px]">
                  NewVía does not store credit card information.
                  <br />
                  All payments are processed by secure third-party payment gateways (e.g., Stripe or local equivalents).
                </p>
                <p className="leading-[24px]">Merchants&apos; bank account details are used only for payouts.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 4 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">4. Sharing of Information</p>
                <p className="leading-[24px]">We may share your information with:</p>
                
                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">4.1 Merchants</p>
                  <p className="leading-[24px]">When you make a booking, necessary details are shared with the Merchant, such as:</p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Name</li>
                    <li className="leading-[24px] mb-0">Booking details</li>
                    <li className="leading-[24px]">Contact information (if required for service delivery)</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">4.2 Service Providers</p>
                  <p className="leading-[24px]">Trusted third-party providers that support:</p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Payment processing</li>
                    <li className="leading-[24px] mb-0">Cloud hosting</li>
                    <li className="leading-[24px] mb-0">Analytics</li>
                    <li className="leading-[24px] mb-0">Communication tools</li>
                    <li className="leading-[24px]">Customer support</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">4.3 Legal Authorities</p>
                  <p className="leading-[24px]">We may disclose information if required by law or to protect the rights, safety, and security of users and NewVía.</p>
                </div>

                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 5 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">5. Cookies & Tracking</p>
                <p className="leading-[24px]">NewVía uses cookies to:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Keep you logged in</li>
                  <li className="leading-[24px] mb-0">Improve site functionality</li>
                  <li className="leading-[24px] mb-0">Analyse usage patterns</li>
                  <li className="leading-[24px]">Personalise experience</li>
                </ul>
                <p className="leading-[24px]">Users can manage cookie preferences through browser settings.</p>
                <p className="leading-[24px]">(A full Cookie Notice will be provided in Document 5.)</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 6 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">6. Data Retention</p>
                <p className="leading-[24px]">We retain personal data only for as long as necessary for:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Account activity</li>
                  <li className="leading-[24px] mb-0">Legal obligations</li>
                  <li className="leading-[24px] mb-0">Dispute resolution</li>
                  <li className="leading-[24px]">Financial records (required by law)</li>
                </ul>
                <p className="leading-[24px]">Users may request account deletion at any time.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 7 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">7. Data Security</p>
                <p className="leading-[24px]">We use industry-standard measures to protect personal data, including:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Encryption</li>
                  <li className="leading-[24px] mb-0">Secure servers</li>
                  <li className="leading-[24px] mb-0">Access controls</li>
                  <li className="leading-[24px]">Regular security checks</li>
                </ul>
                <p className="leading-[24px]">However, no system is 100% secure. Users share information at their own risk.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 8 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">8. Your Rights</p>
                <p className="leading-[24px]">Depending on your country, you may have the right to:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Access your personal data</li>
                  <li className="leading-[24px] mb-0">Correct inaccurate data</li>
                  <li className="leading-[24px] mb-0">Request deletion</li>
                  <li className="leading-[24px] mb-0">Withdraw consent</li>
                  <li className="leading-[24px] mb-0">Object to certain uses</li>
                  <li className="leading-[24px]">Request data portability</li>
                </ul>
                <p className="leading-[24px]">Contact our support team to exercise these rights.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 9 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">9. Children&apos;s Privacy</p>
                <p className="leading-[24px]">
                  NewVía does not knowingly collect data from individuals under 18 years old (or under the age of majority in your country).
                  <br />
                  If a minor&apos;s data is found, it will be deleted upon verification.
                </p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 10 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">10. International Data Transfers</p>
                <p className="leading-[24px]">
                  Data may be stored or processed in countries where our service providers operate.
                  <br />
                  We ensure appropriate safeguards are in place.
                </p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 11 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">11. Changes to This Privacy Policy</p>
                <p className="leading-[24px]">
                  We may update this Privacy Policy from time to time.
                  <br />
                  All changes will be posted with a new Effective Date.
                  <br />
                  Continued use of NewVía means you accept the updated Policy.
                </p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 12 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">12. Contact Us</p>
                <p className="leading-[24px]">
                  NewVía Space Technology (RA0126510-U)
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

