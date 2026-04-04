import { CheckCircle, Package, Truck, MapPin, Calendar, CreditCard, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export function OrderConfirmationPage() {
    const navigate = useNavigate();
    const { orders, checkoutState } = useApp();

    // Get the most recently placed order
    const latestOrder = orders[0];

    if (!latestOrder) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-white py-16 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-200 mb-6">
                        <AlertCircle className="w-12 h-12 text-gray-400" />
                    </div>
                    <h1 className="text-3xl font-['Playfair_Display'] font-bold text-gray-900 mb-4">
                        No Recent Order Found
                    </h1>
                    <p className="text-gray-600 mb-8">
                        It looks like you haven't placed an order yet.
                    </p>
                    <button
                        onClick={() => navigate('/marketplace')}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#a73f2b] to-[#C9A858] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Browse Marketplace
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        );
    }

    const orderNumber = latestOrder.id;
    const orderDate = latestOrder.date;
    const estimatedDelivery = latestOrder.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const orderItems = latestOrder.items || [];
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = latestOrder.total || subtotal;
    const shippingCost = total - subtotal > 0 ? total - subtotal : 0;

    const shippingInfo = latestOrder.shippingInfo || checkoutState.shippingInfo;
    const paymentMethod = latestOrder.paymentMethod || 'razorpay';

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FAFAFA] to-white py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 mb-6 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-gray-900 mb-4">
                        Order Confirmed!
                    </h1>
                    <p className="text-xl text-gray-600 mb-2">
                        Thank you for your purchase
                    </p>
                    <p className="text-gray-500">
                        We've sent a confirmation email to your registered email address
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8">
                    {/* Order Number Banner */}
                    <div className="bg-gradient-to-r from-[#a73f2b] to-[#C9A858] px-8 py-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <p className="text-sm text-white/80 mb-1">Order Number</p>
                                <p className="text-2xl font-bold text-white font-mono">{orderNumber}</p>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-sm text-white/80 mb-1">Order Date</p>
                                <p className="text-lg font-semibold text-white">{orderDate}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-8">
                        <h2 className="text-2xl font-['Playfair_Display'] font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <Package className="w-6 h-6 text-[#a73f2b]" />
                            Order Summary
                        </h2>

                        {/* Items */}
                        <div className="space-y-4 mb-8">
                            {orderItems.length > 0 ? orderItems.map((item) => (
                                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200">
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Package className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                        {item.quantity > 1 && (
                                            <p className="text-sm text-gray-500">₹{item.price.toLocaleString('en-IN')} each</p>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center py-4">Order items details will be available in your order history.</p>
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toLocaleString('en-IN')}</span>
                            </div>
                            {shippingCost > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>₹{shippingCost.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                            {shippingCost === 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600 font-medium">Free</span>
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                            <span>Total</span>
                            <span className="text-2xl text-[#a73f2b]">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                    </div>
                </div>

                {/* Delivery & Payment Information */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Estimated Delivery */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Truck className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Estimated Delivery</h3>
                                <p className="text-gray-600">{estimatedDelivery}</p>
                                <p className="text-sm text-gray-500 mt-1">You'll receive tracking info via email</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                                <p className="text-gray-600 text-sm">
                                    {shippingInfo.fullName}<br />
                                    {shippingInfo.address}<br />
                                    {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}
                                    {shippingInfo.phone && <><br />Phone: {shippingInfo.phone}</>}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Payment</h3>
                                <p className="text-gray-600 text-sm capitalize">
                                    {paymentMethod === 'razorpay' ? 'Razorpay (Online)' : paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod}
                                </p>
                                <Badge className="mt-2" status={latestOrder.status} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-br from-[#FFF8E7] to-white rounded-2xl p-8 border border-[#a73f2b]/20 mb-8">
                    <h2 className="text-2xl font-['Playfair_Display'] font-bold text-gray-900 mb-6">
                        What Happens Next?
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white flex items-center justify-center font-bold flex-shrink-0">
                                1
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Order Processing</p>
                                <p className="text-sm text-gray-600">We'll prepare your items for shipment within 1-2 business days</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white flex items-center justify-center font-bold flex-shrink-0">
                                2
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Shipment & Tracking</p>
                                <p className="text-sm text-gray-600">You'll receive tracking details via email and SMS</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white flex items-center justify-center font-bold flex-shrink-0">
                                3
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Delivery</p>
                                <p className="text-sm text-gray-600">Your order will arrive by {estimatedDelivery}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/orders')}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#a73f2b] to-[#C9A858] text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                        <Package className="w-5 h-5" />
                        Track Order
                    </button>

                    <button
                        onClick={() => navigate('/marketplace')}
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-[#a73f2b] text-[#a73f2b] rounded-full font-semibold hover:bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:text-white transition-all duration-300"
                    >
                        Continue Shopping
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Help Section */}
                <div className="mt-12 text-center">
                    <p className="text-gray-600 mb-4">
                        Need help with your order?
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                        <button
                            onClick={() => navigate('/contact')}
                            className="flex items-center gap-2 text-[#a73f2b] hover:text-[#a73f2b] transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Contact Support
                        </button>
                        <button
                            onClick={() => navigate('/help')}
                            className="flex items-center gap-2 text-[#a73f2b] hover:text-[#a73f2b] transition-colors"
                        >
                            <Calendar className="w-4 h-4" />
                            View FAQs
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Badge({ className, status }: { className?: string; status: string }) {
    const colorMap: Record<string, string> = {
        'Placed': 'bg-blue-100 text-blue-700',
        'Processing': 'bg-yellow-100 text-yellow-700',
        'Shipped': 'bg-purple-100 text-purple-700',
        'Delivered': 'bg-green-100 text-green-700',
        'Cancelled': 'bg-red-100 text-red-700',
    };
    const colors = colorMap[status] || 'bg-gray-100 text-gray-700';
    return (
        <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${colors} ${className || ''}`}>
            {status}
        </span>
    );
}
