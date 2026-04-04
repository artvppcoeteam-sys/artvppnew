import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { CreditCard, Wallet, Smartphone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import RazorpayButton from './RazorpayButton';

interface PaymentStepProps {
    onSuccess: () => void;
    onBack: () => void;
}

export function PaymentStep({ onSuccess, onBack }: PaymentStepProps) {
    const { cart, cartTotal, checkoutState, updateCheckoutState, clearCart, addOrder } = useApp();
    const [paymentMethod, setPaymentMethod] = useState(checkoutState.paymentMethod);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const shippingCost = cartTotal >= 5000 ? 0 : 500;
    const tax = cartTotal * 0.18;
    const total = cartTotal + shippingCost + tax;

    // Handlers for Razorpay Button
    const handleRazorpaySuccess = (paymentId: string) => {
        console.log('Payment Successful:', paymentId);
        handleSuccess(paymentId);
    };

    const handleRazorpayFailure = (message: string) => {
        setError(message);
        setIsProcessing(false);
    };

    // Handler for Manual/COD Payment
    const handleManualPayment = () => {
        setIsProcessing(true);
        // Mock COD or other methods processing time
        setTimeout(() => {
            handleSuccess();
        }, 1500);
    };

    const handleSuccess = async (razorpayPaymentId?: string) => {
        try {
            // Save order before clearing cart
            await addOrder({
                items: cart,
                total: total,
                shippingInfo: checkoutState.shippingInfo,
                paymentMethod: paymentMethod,
                ...(razorpayPaymentId && { razorpayPaymentId })
            });

            await clearCart();
            onSuccess();
            toast.success('Order placed successfully!');
        } catch (error: any) {
            console.error('Order creation error:', error);
            toast.error(error?.message || 'Failed to place order');
            setError(error?.message || 'Failed to place order');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Inline Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Payment Options</CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(val: string) => {
                        setPaymentMethod(val);
                        updateCheckoutState({ paymentMethod: val });
                        setError(null);
                    }} className="space-y-4">

                        <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-[#a73f2b] bg-yellow-50' : 'border-gray-200'}`}>
                            <RadioGroupItem value="razorpay" id="razorpay" className="text-[#a73f2b]" />
                            <Label htmlFor="razorpay" className="flex-1 cursor-pointer flex items-center gap-4">
                                <div className="bg-white p-2 rounded border">
                                    <CreditCard className="w-6 h-6 text-[#a73f2b]" />
                                </div>
                                <div>
                                    <span className="font-semibold block">Razorpay Secure</span>
                                    <span className="text-sm text-gray-500">UPI, Cards, Netbanking, Wallets</span>
                                </div>
                            </Label>
                        </div>

                        <div className={`flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#a73f2b] bg-yellow-50' : 'border-gray-200'}`}>
                            <RadioGroupItem value="cod" id="cod" className="text-[#a73f2b]" />
                            <Label htmlFor="cod" className="flex-1 cursor-pointer flex items-center gap-4">
                                <div className="bg-white p-2 rounded border">
                                    <Wallet className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <span className="font-semibold block">Cash on Delivery</span>
                                    <span className="text-sm text-gray-500">Pay when you receive the order</span>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" onClick={onBack} disabled={isProcessing}>Back</Button>

                {paymentMethod === 'razorpay' ? (
                    <RazorpayButton
                        amount={total}
                        user={{
                            name: checkoutState.shippingInfo.fullName,
                            email: checkoutState.shippingInfo.email,
                            contact: checkoutState.shippingInfo.phone
                        }}
                        onSuccess={handleRazorpaySuccess}
                        onFailure={handleRazorpayFailure}
                        className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white px-8 py-6 text-lg rounded-full shadow-lg min-w-[200px]"
                    >
                        Pay ₹{total.toLocaleString()}
                    </RazorpayButton>
                ) : (
                    <Button
                        onClick={handleManualPayment}
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white px-8 py-6 text-lg rounded-full shadow-lg min-w-[200px]"
                    >
                        {isProcessing ? 'Processing Order...' : `Place Order`}
                    </Button>
                )}
            </div>

            <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                <Smartphone className="w-3 h-3" /> 100% Safe & Secure Payments
            </p>
        </div>
    );
}
