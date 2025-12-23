'use client';

import UnifiedHeader from '@/components/layout/UnifiedHeader';
import Footer from '@/components/layout/Footer';

export default function RefundPolicyPage() {
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
                  Refund and cancellation policy
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
                    This Refund & Cancellation Policy explains how refunds, cancellations, rescheduling, and no-show situations are handled on NewVía.
                    <br />
                    By making a booking on NewVía, you agree to these terms.
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
                <p className="leading-[24px] font-medium text-black">1. General Policy</p>
                <p className="leading-[24px]">
                  NewVía is a platform that connects customers with independent wellness and beauty providers (&quot;Merchants&quot;).
                  <br />
                  Each Merchant may set their own cancellation, rescheduling, and no-show policy.
                  <br />
                  These policies are shown clearly before checkout.
                </p>
                <p className="leading-[24px]">The rules below apply platform-wide, unless otherwise stated by the Merchant.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 2 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">2. Cancellations by Customer</p>
                
                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">2.1 Free Cancellation Window</p>
                  <p className="leading-[24px]">
                    Customers may cancel a booking if the Merchant&apos;s policy allows it.
                    <br />
                    Examples of typical Merchant policies:
                  </p>
                  <ul className="list-disc ml-6 space-y-0">
                    <li className="leading-[24px] mb-0">Flexible: Free cancellation up to 24 hours before appointment</li>
                    <li className="leading-[24px] mb-0">Moderate: Free cancellation up to 48 hours before appointment</li>
                    <li className="leading-[24px] mb-0">Strict: No refunds once booking is confirmed</li>
                    <li className="leading-[24px]">Custom: As stated on the Merchant&apos;s page</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">2.2 Late Cancellations</p>
                  <p className="leading-[24px]">If cancelled outside the free cancellation window, the refund amount follows the Merchant&apos;s policy (e.g., 50%, or non-refundable).</p>
                </div>

                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 3 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">3. Cancellations by Merchant</p>
                <p className="leading-[24px]">If the Merchant cancels a booking for any reason (staff unavailable, closed, emergency):</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">The customer receives a 100% full refund</li>
                  <li className="leading-[24px] mb-0">NewVía will process the refund automatically</li>
                  <li className="leading-[24px]">The customer may choose to rebook another slot or provider</li>
                </ul>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 4 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">4. No-Show Policy</p>
                <p className="leading-[24px]">If a customer does not arrive for the appointment:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">The Merchant may charge up to 100% of the booking value</li>
                  <li className="leading-[24px]">This depends on the stated policy at the time of booking</li>
                </ul>
                <p className="leading-[24px]">No-shows are considered a completed booking unless evidence of service failure is provided.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 5 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">5. Rescheduling</p>
                <p className="leading-[24px]">Rescheduling depends entirely on the Merchant&apos;s availability and policy.</p>
                <p className="leading-[24px]">Common rules:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Flexible: Reschedule up to 24 hours before</li>
                  <li className="leading-[24px] mb-0">Moderate: Reschedule up to 48 hours before</li>
                  <li className="leading-[24px]">Strict: No rescheduling</li>
                </ul>
                <p className="leading-[24px]">NewVía does not guarantee rescheduling if the Merchant&apos;s slots are full.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 6 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">6. Refund Eligibility</p>
                <p className="leading-[24px]">Refunds may be granted when:</p>
                <ol className="list-decimal ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">The Merchant cancels the appointment</li>
                  <li className="leading-[24px] mb-0">The service is not delivered</li>
                  <li className="leading-[24px] mb-0">The service is significantly different from what was listed</li>
                  <li className="leading-[24px] mb-0">Booking was charged in error</li>
                  <li className="leading-[24px] mb-0">Both the Merchant and customer agree to refund</li>
                  <li className="leading-[24px]">NewVía determines that the Merchant failed to deliver the service</li>
                </ol>
                <p className="leading-[24px]">Refunds will not be granted when:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">The customer changes their mind after the cancellation window</li>
                  <li className="leading-[24px] mb-0">The service was delivered as described</li>
                  <li className="leading-[24px] mb-0">The Merchant&apos;s policy clearly states &quot;strict&quot; or &quot;non-refundable&quot;</li>
                  <li className="leading-[24px]">No-shows due to personal scheduling issues</li>
                </ul>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 7 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">7. Refund Process & Timing</p>
                
                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">7.1 Refund Processing by NewVía</p>
                  <p className="leading-[24px]">
                    Approved refunds are processed by NewVía within:
                    <br />
                    1–3 business days
                  </p>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">7.2 Bank & Card Processing Time</p>
                  <p className="leading-[24px]">
                    Banks, card issuers, and payment gateways typically take:
                    <br />
                    5–10 business days to return funds to your account.
                  </p>
                </div>

                <div className="flex flex-col gap-2 lg:gap-[8px] ml-0">
                  <p className="leading-[24px] font-medium text-black">7.3 Maximum Delay Clause</p>
                  <p className="leading-[24px]">
                    Some financial institutions may take up to:
                    <br />
                    15 business days
                  </p>
                </div>

                <p className="leading-[24px]">Refunds are always returned to the original payment method used at checkout.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 8 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">8. Incorrect Charges</p>
                <p className="leading-[24px]">If a customer believes they were incorrectly charged:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">Contact NewVía support</li>
                  <li className="leading-[24px] mb-0">Provide booking ID and screenshot</li>
                  <li className="leading-[24px]">NewVía will investigate within 3–5 business days</li>
                </ul>
                <p className="leading-[24px]">If confirmed, a correction or refund will be issued.</p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 9 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">9. Dispute Resolution</p>
                <p className="leading-[24px]">If a customer and Merchant disagree:</p>
                <ul className="list-disc ml-6 space-y-0">
                  <li className="leading-[24px] mb-0">NewVía will review evidence from both sides</li>
                  <li className="leading-[24px] mb-0">NewVía may request proof of service delivery</li>
                  <li className="leading-[24px]">NewVía&apos;s decision will be final to protect fairness for both parties</li>
                </ul>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 10 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">10. Modifications to This Policy</p>
                <p className="leading-[24px]">
                  NewVía may update this policy to reflect changes in operations or legal requirements.
                  <br />
                  Updates will be posted with a new Effective Date.
                </p>
                <p className="leading-[24px] text-base">&nbsp;</p>
              </div>

              {/* Section 11 */}
              <div className="flex flex-col gap-2 lg:gap-[8px]">
                <p className="leading-[24px] font-medium text-black">11. Contact Us</p>
                <p className="leading-[24px]">For refund or cancellation inquiries:</p>
                <p className="leading-[24px]">
                  NewVía Space Technology (RA0126510-U)
                  <br />
                  Email: support@newviaspace.com
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

