import { Package, RefreshCw, Clock, Mail, Phone, CheckCircle, AlertCircle } from 'lucide-react';

export function ReturnsRefundsPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-[#FAFAFA] to-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#a73f2b] to-[#a73f2b] mb-6">
                        <RefreshCw className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-gray-900 mb-4">
                        Returns & Refunds Policy
                    </h1>
                    <p className="text-lg text-gray-600">
                        Your satisfaction is our priority. We're here to help with returns and refunds.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Quick Summary */}
                <div className="bg-gradient-to-br from-[#FFF8E7] to-white border border-[#a73f2b]/20 rounded-2xl p-8 mb-12">
                    <h2 className="text-2xl font-['Playfair_Display'] font-bold text-gray-900 mb-6 flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-[#a73f2b]" />
                        Quick Summary
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <Clock className="w-8 h-8 mx-auto mb-3 text-[#a73f2b]" />
                            <p className="font-semibold text-gray-900">30-Day Returns</p>
                            <p className="text-sm text-gray-600 mt-1">From delivery date</p>
                        </div>
                        <div className="text-center">
                            <Package className="w-8 h-8 mx-auto mb-3 text-[#a73f2b]" />
                            <p className="font-semibold text-gray-900">Original Packaging</p>
                            <p className="text-sm text-gray-600 mt-1">Items must be unused</p>
                        </div>
                        <div className="text-center">
                            <RefreshCw className="w-8 h-8 mx-auto mb-3 text-[#a73f2b]" />
                            <p className="font-semibold text-gray-900">7-10 Days</p>
                            <p className="text-sm text-gray-600 mt-1">Refund processing</p>
                        </div>
                    </div>
                </div>

                {/* Return Policy */}
                <section className="mb-12">
                    <h2 className="text-3xl font-['Playfair_Display'] font-bold text-gray-900 mb-6">
                        Return Policy
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                30-Day Return Window
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                We accept returns within 30 days of the delivery date. Items must be in their original condition,
                                unused, and in the original packaging with all tags attached. Original artworks and custom commissions
                                are subject to different return conditions (see below).
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Eligible Items
                            </h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Prints and reproductions in original packaging</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Art merchandise (t-shirts, mugs, totes) with tags attached</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Handcrafted items if unopened and in original condition</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>Damaged or defective items (any condition)</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                Non-Returnable Items
                            </h3>
                            <ul className="space-y-2 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <span>Original artworks (unless damaged in shipping)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <span>Custom commissioned pieces</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <span>Digital art downloads (all sales final)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <span>Workshop and class bookings (see cancellation policy)</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Refund Process */}
                <section className="mb-12">
                    <h2 className="text-3xl font-['Playfair_Display'] font-bold text-gray-900 mb-6">
                        Refund Process
                    </h2>

                    <div className="space-y-8">
                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#a73f2b] to-[#C9A858] text-white flex items-center justify-center font-bold">
                                1
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Initiate Return Request
                                </h3>
                                <p className="text-gray-600">
                                    Contact our support team via email at returns@artvpp.com or call us at +91-XXXX-XXXX.
                                    Provide your order number and reason for return.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#a73f2b] to-[#C9A858] text-white flex items-center justify-center font-bold">
                                2
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Receive Return Authorization
                                </h3>
                                <p className="text-gray-600">
                                    We'll send you a Return Merchandise Authorization (RMA) number and shipping instructions
                                    within 24-48 hours.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#a73f2b] to-[#C9A858] text-white flex items-center justify-center font-bold">
                                3
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Ship the Item
                                </h3>
                                <p className="text-gray-600">
                                    Pack the item securely in its original packaging and ship it to the address provided.
                                    We recommend using a trackable shipping method.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#a73f2b] to-[#C9A858] text-white flex items-center justify-center font-bold">
                                4
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Receive Refund
                                </h3>
                                <p className="text-gray-600">
                                    Once we receive and inspect the item, we'll process your refund within 7-10 business days.
                                    The refund will be credited to your original payment method.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Exchange Policy */}
                <section className="mb-12">
                    <h2 className="text-3xl font-['Playfair_Display'] font-bold text-gray-900 mb-6">
                        Exchange Policy
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        We're happy to facilitate exchanges for different sizes, colors, or similar items. Exchange requests
                        must be made within 30 days of delivery. The exchange process follows the same steps as returns,
                        but please specify you'd like an exchange when contacting us.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        If there's a price difference between items, we'll either refund the difference or send a payment
                        request for the additional amount.
                    </p>
                </section>

                {/* Damaged or Defective Items */}
                <section className="mb-12">
                    <h2 className="text-3xl font-['Playfair_Display'] font-bold text-gray-900 mb-6">
                        Damaged or Defective Items
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        If you receive a damaged or defective item, please contact us immediately with photos of the damage.
                        We'll arrange for a replacement or full refund, including return shipping costs.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <p className="text-blue-900 font-semibold mb-2">
                            For damaged items, please:
                        </p>
                        <ul className="space-y-1 text-blue-800">
                            <li>• Take photos of the damaged item and packaging</li>
                            <li>• Contact us within 48 hours of delivery</li>
                            <li>• Keep all original packaging until resolution</li>
                        </ul>
                    </div>
                </section>

                {/* Cancellation Policy */}
                <section className="mb-12">
                    <h2 className="text-3xl font-['Playfair_Display'] font-bold text-gray-900 mb-6">
                        Workshop Cancellation Policy
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        Workshop and class bookings can be cancelled with a full refund if done at least 7 days before
                        the scheduled date. Cancellations made 3-7 days before receive a 50% refund. No refunds for
                        cancellations within 3 days of the workshop date.
                    </p>
                </section>

                {/* Contact Information */}
                <section className="bg-gradient-to-br from-[#FAFAFA] to-white rounded-2xl p-8 border border-gray-200">
                    <h2 className="text-2xl font-['Playfair_Display'] font-bold text-gray-900 mb-6">
                        Need Help with a Return?
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Our customer support team is here to assist you with any return or refund inquiries.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <Mail className="w-6 h-6 text-[#a73f2b] flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-gray-900">Email</p>
                                <p className="text-gray-600">returns@artvpp.com</p>
                                <p className="text-sm text-gray-500 mt-1">Response within 24 hours</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Phone className="w-6 h-6 text-[#a73f2b] flex-shrink-0 mt-1" />
                            <div>
                                <p className="font-semibold text-gray-900">Phone</p>
                                <p className="text-gray-600">+91-XXXX-XXXXXX</p>
                                <p className="text-sm text-gray-500 mt-1">Mon-Sat, 10 AM - 6 PM IST</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Last Updated */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
                    Last updated: February 9, 2026
                </div>
            </div>
        </div>
    );
}
