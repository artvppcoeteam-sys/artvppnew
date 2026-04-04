import { useApp } from '../../context/AppContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ShoppingCart, MapPin, Edit2 } from 'lucide-react';

interface OrderSummaryStepProps {
    onNext: () => void;
    onBack: () => void;
    onChangeAddress: () => void;
}

export function OrderSummaryStep({ onNext, onBack, onChangeAddress }: OrderSummaryStepProps) {
    const { cart, cartTotal, checkoutState } = useApp();
    const { shippingInfo } = checkoutState;

    const shippingCost = cartTotal >= 5000 ? 0 : 500;
    const tax = cartTotal * 0.18;
    const total = cartTotal + shippingCost + tax;

    return (
        <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
                {/* Selected Address Preview */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 uppercase tracking-widest">
                            Delivery Address
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={onChangeAddress} className="text-[#a73f2b] hover:text-[#a73f2b]">
                            CHANGE
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="font-semibold">{shippingInfo.fullName}</p>
                                <p className="text-sm text-gray-600">
                                    {shippingInfo.address}, {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}
                                </p>
                                <p className="text-sm text-gray-600">Phone: {shippingInfo.phone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cart Items */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Order Items ({cart.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="flex gap-4 border-b pb-4 last:border-0 last:pb-0">
                                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden border">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium">{item.title}</h3>
                                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                                        {item.quantity > 1 && (
                                            <span className="text-xs text-gray-500">(₹{item.price.toLocaleString()} each)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Price Details Sidebar */}
            <div className="md:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle className="text-lg text-gray-500 uppercase tracking-widest text-sm">Price Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span>Price ({cart.length} items)</span>
                            <span>₹{cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Discount</span>
                            <span className="text-green-600">- ₹0</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>Delivery Charges</span>
                            <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost}`}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span>GST (18%)</span>
                            <span>₹{tax.toLocaleString()}</span>
                        </div>

                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>Total Amount</span>
                                <span>₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="pt-4 space-y-3">
                            <Button
                                onClick={onNext}
                                className="w-full bg-[#fb641b] hover:bg-[#ff7f00] text-white py-6 text-lg font-medium shadow-md uppercase"
                            >
                                Continue
                            </Button>
                            <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                                <ShoppingCart className="w-3 h-3" /> Safe and Secure Payments
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
