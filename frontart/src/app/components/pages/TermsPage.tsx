import { FileText, Shield, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { motion } from 'motion/react';

export function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <FileText className="w-16 h-16 text-[#a73f2b] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-gray-600">Last updated: February 8, 2026</p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-8 space-y-8">
              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  By accessing and using Artvpp ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  These Terms & Conditions govern your use of our website and services, including all products, software, and services offered through our platform.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Accounts</h2>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Registration</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  To access certain features, you must register for an account. You must provide accurate and complete information and keep your account information updated.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Account Security</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 Account Types</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Customer accounts for purchasing art and services</li>
                  <li>Vendor accounts for selling artwork (subject to approval)</li>
                  <li>Admin accounts for platform management</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Products and Services</h2>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 Product Listings</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All product descriptions, images, and specifications are provided by vendors. While we strive for accuracy, we do not guarantee that product descriptions or other content is accurate, complete, reliable, or error-free.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 Pricing</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless otherwise stated. Prices are subject to change without notice.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 Creative Services</h3>
                <p className="text-gray-700 leading-relaxed">
                  Custom commissions and creative services are subject to individual agreements between customers and artists. Timelines and deliverables must be agreed upon before work begins.
                </p>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Orders and Payments</h2>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 Order Acceptance</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your order is an offer to purchase products. We reserve the right to accept or decline your order for any reason. All orders are subject to product availability.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 Payment Methods</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We accept UPI, credit/debit cards, net banking, and digital wallets. All payments are processed through secure third-party payment gateways.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 Order Cancellation</h3>
                <p className="text-gray-700 leading-relaxed">
                  Orders can be cancelled within 24 hours of placement. After this period, cancellation is subject to vendor approval and may incur charges.
                </p>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Shipping and Delivery</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We ship to addresses within India. Shipping times vary based on location and product type. Standard delivery takes 3-7 business days for metro cities and 7-10 days for other locations.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Risk of loss and title for products pass to you upon delivery to the carrier. We are not responsible for delays caused by shipping carriers or customs.
                </p>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Returns and Refunds</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We offer a 7-day return policy for most products from the date of delivery. Items must be unused, in original packaging, and in resalable condition.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Custom-made and commissioned artworks are non-returnable unless damaged or significantly different from the agreed specifications.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Refunds are processed within 5-7 business days of receiving the returned item. Shipping charges are non-refundable except in cases of damaged or defective products.
                </p>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  All content on this platform, including but not limited to text, graphics, logos, images, and software, is the property of Artvpp or its content suppliers and is protected by intellectual property laws.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Artists retain copyright to their original works. By listing products, vendors grant Artvpp a license to display and promote their work on the platform.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Users may not reproduce, distribute, or create derivative works from any content without explicit permission.
                </p>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Activities</h2>
                <p className="text-gray-700 leading-relaxed mb-2">You agree not to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Upload malicious code or viruses</li>
                  <li>Engage in fraudulent activities</li>
                  <li>Harass or harm other users</li>
                  <li>Attempt to gain unauthorized access to the platform</li>
                  <li>Use automated systems to access the platform</li>
                  <li>Resell products without authorization</li>
                </ul>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Artvpp shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use the service.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Our total liability for any claims under these terms shall not exceed the amount paid by you for the product or service in question.
                </p>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Dispute Resolution</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Any disputes arising from these terms shall be governed by the laws of India. You agree to submit to the exclusive jurisdiction of courts in Mumbai, India.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We encourage users to contact our support team to resolve disputes informally before pursuing legal action.
                </p>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the platform. Your continued use of the platform after changes constitutes acceptance of the modified terms.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We will notify users of significant changes via email or prominent notice on the platform.
                </p>
              </section>

              {/* Section 12 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Information</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions about these Terms & Conditions, please contact us at:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                  <p className="text-gray-700">Email: legal@artvpp.com</p>
                  <p className="text-gray-700">Phone: +91 98765 43210</p>
                  <p className="text-gray-700">Address: 123 Art Street, Creative District, Mumbai, India</p>
                </div>
              </section>

              {/* Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 flex items-start gap-4">
                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
                  <p className="text-sm text-blue-800">
                    These terms are effective as of the last updated date shown above. By continuing to use Artvpp after this date, you agree to be bound by the updated terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
