import { Shield, Lock, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { motion } from 'motion/react';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Shield className="w-16 h-16 text-[#a73f2b] mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
              {/* Introduction */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  At Artvpp, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using Artvpp, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </section>

              {/* Section 1 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Database className="w-6 h-6 text-[#a73f2b]" />
                  1. Information We Collect
                </h2>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1 Personal Information</h3>
                <p className="text-gray-700 leading-relaxed mb-2">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>Name, email address, and phone number</li>
                  <li>Billing and shipping addresses</li>
                  <li>Payment information (processed securely through third-party gateways)</li>
                  <li>Account credentials (username and password)</li>
                  <li>Profile information and preferences</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.2 Automatically Collected Information</h3>
                <p className="text-gray-700 leading-relaxed mb-2">When you access our platform, we automatically collect:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent</li>
                  <li>Referring website addresses</li>
                  <li>Click patterns and navigation paths</li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">1.3 Cookies and Tracking Technologies</h3>
                <p className="text-gray-700 leading-relaxed">
                  We use cookies, web beacons, and similar tracking technologies to track activity on our platform and hold certain information. You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-[#a73f2b]" />
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-700 leading-relaxed mb-2">We use the collected information for various purposes:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Processing and fulfilling your orders</li>
                  <li>Managing your account and providing customer support</li>
                  <li>Sending order confirmations and shipping updates</li>
                  <li>Personalizing your experience on the platform</li>
                  <li>Improving our products and services</li>
                  <li>Sending promotional communications (with your consent)</li>
                  <li>Detecting and preventing fraud and security threats</li>
                  <li>Complying with legal obligations</li>
                  <li>Analyzing usage patterns and trends</li>
                  <li>Facilitating communication between buyers and sellers</li>
                </ul>
              </section>

              {/* Section 3 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <UserCheck className="w-6 h-6 text-[#a73f2b]" />
                  3. Information Sharing and Disclosure
                </h2>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.1 Service Providers</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We share your information with third-party service providers who perform services on our behalf, including payment processing, shipping, email delivery, and analytics. These providers have access to your information only to perform specific tasks and are obligated to protect your information.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.2 Vendors and Artists</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  When you make a purchase, we share necessary information with the vendor/artist to fulfill your order. This includes your name, shipping address, and order details.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.3 Legal Requirements</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may disclose your information if required by law or in response to valid requests by public authorities (e.g., court orders, government regulations).
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">3.4 Business Transfers</h3>
                <p className="text-gray-700 leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred. We will provide notice before your information becomes subject to a different privacy policy.
                </p>
              </section>

              {/* Section 4 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-[#a73f2b]" />
                  4. Data Security
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure password hashing</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Secure payment processing through PCI-DSS compliant gateways</li>
                  <li>Regular data backups</li>
                </ul>
                <p className="text-gray-700 leading-relaxed">
                  However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
                </p>
              </section>

              {/* Section 5 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights and Choices</h2>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.1 Access and Update</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can access and update your personal information through your account settings. You may also request a copy of your data by contacting us.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.2 Marketing Communications</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can opt out of receiving promotional emails by clicking the "unsubscribe" link in our emails or updating your preferences in your account settings.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.3 Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-4">
                  You can set your browser to refuse all or some browser cookies. If you disable cookies, some features of our platform may not function properly.
                </p>

                <h3 className="text-lg font-semibold text-gray-800 mb-2">5.4 Data Deletion</h3>
                <p className="text-gray-700 leading-relaxed">
                  You have the right to request deletion of your personal information, subject to legal obligations. Contact us to initiate account deletion.
                </p>
              </section>

              {/* Section 6 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Account information is retained until you request deletion. Transaction records are kept for accounting and legal compliance purposes as required by Indian law.
                </p>
              </section>

              {/* Section 7 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can delete the information.
                </p>
              </section>

              {/* Section 8 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Third-Party Links</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to read their privacy policies.
                </p>
              </section>

              {/* Section 9 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  By using our platform, you consent to the transfer of your information to India and other countries where we operate.
                </p>
              </section>

              {/* Section 10 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  Significant changes will be communicated via email or prominent notice on our platform. Your continued use after changes indicates acceptance of the updated policy.
                </p>
              </section>

              {/* Section 11 */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                  <p className="text-gray-700 font-semibold">Privacy Team - Artvpp</p>
                  <p className="text-gray-700">Email: privacy@artvpp.com</p>
                  <p className="text-gray-700">Phone: +91 98765 43210</p>
                  <p className="text-gray-700">Address: 123 Art Street, Creative District, Mumbai, India</p>
                </div>
              </section>

              {/* Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex items-start gap-4">
                <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-2">Your Privacy Matters</h3>
                  <p className="text-sm text-green-800">
                    We are committed to protecting your privacy and maintaining the security of your personal information. If you have any concerns, please don't hesitate to contact us.
                  </p>
                </div>
              </div>

              {/* Warning Notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Data Protection Compliance</h3>
                  <p className="text-sm text-yellow-800">
                    This policy is designed to comply with applicable Indian data protection laws. We regularly review and update our practices to ensure ongoing compliance with evolving regulations.
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
