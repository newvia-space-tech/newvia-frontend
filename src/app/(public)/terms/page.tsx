'use client';

import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';

export default function TermsOfServicePage() {
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
                  Terms of service
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
                    These Terms of Service (&quot;Terms&quot;) govern your access to and use of the NewVía platform (&quot;NewVía&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). By accessing or using NewVía, you (&quot;User&quot;, &quot;Customer&quot;) agree to these Terms.
                  </p>
                  <p className="leading-[24px]">
                    If you do not agree, please do not use the platform.
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
                <p className="leading-[24px] font-medium text-black">1. About NewVía</p>
                <p className="leading-[24px]">
                  NewVía Space Technology (RA0126510-U) operates a digital marketplace where users can discover, book, and purchase wellness and beauty services offered by independent providers (&quot;Merchants&quot;).
                  <br />
                  NewVía is not the service provider. All services are delivered by the Merchant.
                </p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 2 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">2. Eligibility</p>
                <p className="leading-[24px]">
                  You must be at least 18 years old to use NewVía.
                  <br />
                  By using the platform, you confirm that the information you provide is accurate and truthful.
                </p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 3 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">3. Your Account</p>
                <p className="leading-[24px]">When creating an account, you agree to:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Provide accurate information</li>
                  <li className="leading-[24px] mb-0">Keep your login details secure</li>
                  <li className="leading-[24px]">Be responsible for all activities under your account</li>
                </ul>
                <p className="leading-[24px]">NewVía may suspend or terminate accounts that violate these Terms.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 4 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">4. Bookings & Payments</p>
                
                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">4.1 Booking Confirmation</p>
                  <p className="leading-[24px]">A booking is confirmed when payment is successfully completed.</p>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">4.2 Payment Processing</p>
                  <p className="leading-[24px]">
                    Payments are securely processed by third-party payment providers.
                    <br />
                    NewVía does not store credit card details.
                  </p>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">4.3 Pricing</p>
                  <p className="leading-[24px]">Prices are set by Merchants. NewVía is not responsible for price changes or errors made by Merchants.</p>
                </div>

                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 5 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">5. Refunds, Cancellations & No-Shows</p>
                <p className="leading-[24px]">
                  Refunds are handled according to both:
                  <br />
                  (1) NewVía&apos;s refund rules
                  <br />
                  (2) The Merchant&apos;s cancellation policy
                </p>
                <p className="leading-[24px]">Refunds may be issued when:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Merchant cancels the appointment</li>
                  <li className="leading-[24px] mb-0">Service was not delivered</li>
                  <li className="leading-[24px] mb-0">Service was significantly different from the listing</li>
                  <li className="leading-[24px]">Both parties agree to a refund</li>
                </ul>
                
                <p className="leading-[24px] font-medium text-black">Refund Timing</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">NewVía processes approved refunds within 1–3 business days</li>
                  <li className="leading-[24px] mb-0">Banks/payment providers typically take 5–10 business days</li>
                  <li className="leading-[24px]">Some cases may take up to 15 business days</li>
                </ul>
                
                <p className="leading-[24px] font-medium text-black">Rescheduling</p>
                <p className="leading-[24px]">Rescheduling depends on the Merchant&apos;s availability and policy.</p>
                
                <p className="leading-[24px] font-medium text-black">No-Show</p>
                <p className="leading-[24px]">If a customer does not show up, the Merchant may charge up to 100% of the service value, depending on their stated policy.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 6 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">6. Merchant Services</p>
                <p className="leading-[24px]">
                  All services listed on NewVía are provided by independent Merchants.
                  <br />
                  Merchants are solely responsible for:
                </p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Service quality</li>
                  <li className="leading-[24px] mb-0">Licensing and certifications</li>
                  <li className="leading-[24px] mb-0">Safety and hygiene</li>
                  <li className="leading-[24px] mb-0">Accurate information</li>
                  <li className="leading-[24px] mb-0">Customer service</li>
                  <li className="leading-[24px]">Compliance with local laws</li>
                </ul>
                <p className="leading-[24px]">NewVía is not liable for any issues arising from services delivered by Merchants.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 7 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">7. Reviews</p>
                <p className="leading-[24px]">
                  Users may leave reviews only after completing a booking.
                  <br />
                  NewVía may remove reviews that are:
                </p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Abusive</li>
                  <li className="leading-[24px] mb-0">Fake or misleading</li>
                  <li className="leading-[24px] mb-0">Spam</li>
                  <li className="leading-[24px] mb-0">Irrelevant</li>
                  <li className="leading-[24px]">Violating platform rules</li>
                </ul>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 8 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">8. Prohibited Activities</p>
                <p className="leading-[24px]">You agree not to:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Misuse the platform</li>
                  <li className="leading-[24px] mb-0">Use fraudulent payment methods</li>
                  <li className="leading-[24px] mb-0">Post harmful or illegal content</li>
                  <li className="leading-[24px] mb-0">Violate privacy or intellectual property</li>
                  <li className="leading-[24px] mb-0">Circumvent NewVía to avoid fees</li>
                  <li className="leading-[24px]">Harass Merchants or staff</li>
                </ul>
                <p className="leading-[24px]">NewVía may suspend accounts that breach these rules.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 9 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">9. Intellectual Property</p>
                <p className="leading-[24px]">
                  All content, branding, trademarks, and technology on NewVía belong to:
                  <br />
                  NewVía Space Technology (RA0126510-U)
                </p>
                <p className="leading-[24px]">Users may not copy, reproduce, or redistribute platform content without permission.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 10 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">10. Liability & Disclaimer</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">NewVía is a platform facilitator, not a service provider.</li>
                  <li className="leading-[24px] mb-0">We are not liable for injuries, damages, losses, or misconduct arising from Merchant services.</li>
                  <li className="leading-[24px]">NewVía is not responsible for external events such as natural disasters, technical failures, or government restrictions.</li>
                </ul>
                <p className="leading-[24px]">To the fullest extent permitted by law, NewVía&apos;s total liability shall not exceed the total amount you paid for the affected booking.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 11 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">11. Account Termination</p>
                <p className="leading-[24px]">NewVía may suspend or terminate accounts if:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Terms are violated</li>
                  <li className="leading-[24px] mb-0">Fraud is suspected</li>
                  <li className="leading-[24px] mb-0">Misconduct is reported</li>
                  <li className="leading-[24px]">Legal obligations require it</li>
                </ul>
                <p className="leading-[24px]">Users may close their accounts anytime through support.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 12 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">12. Changes to Terms</p>
                <p className="leading-[24px]">
                  NewVía may update these Terms to reflect operational or legal changes.
                  <br />
                  Updates will be posted on the website with the new effective date.
                </p>
                <p className="leading-[24px]">Continued use of the platform means you accept the updated Terms.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 13 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">13. Governing Law</p>
                <p className="leading-[24px]">
                  These Terms are governed by the laws of Malaysia.
                  <br />
                  Any disputes shall be handled under Malaysian jurisdiction.
                </p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 14 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">14. Contact</p>
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

