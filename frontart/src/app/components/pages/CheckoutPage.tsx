import { useState, useEffect } from 'react';
import { Check, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { loadRazorpayScript } from '../../utils/razorpay';
import logo from '../../../assets/artvpplogo.png';
import { useNavigate } from 'react-router-dom';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart, user } = useApp();
  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmation'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  const shippingCost = cartTotal >= 5000 ? 0 : 500;
  const tax = cartTotal * 0.18;
  const total = cartTotal + shippingCost + tax;

  useEffect(() => {
    if (cart.length === 0 && step !== 'confirmation') {
      navigate('/marketplace');
    }
  }, [cart, step, navigate]);

  if (cart.length === 0 && step !== 'confirmation') {
    return null;
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }

    if (!shippingInfo.phone || shippingInfo.phone.length < 10) {
      toast.error('Please provide a valid phone number');
      return;
    }

    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (paymentMethod === 'razorpay') {
      setIsProcessing(true);
      const res = await loadRazorpayScript();

      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!key) {
        toast.error('Razorpay key is not configured');
        setIsProcessing(false);
        return;
      }

      const options = {
        key,
        amount: Math.round(total * 100), // Amount in paise
        currency: 'INR',
        name: 'ARTVPP',
        description: 'Art Purchase',
        image: logo, // Assuming logo is available or use a URL
        handler: function (response: any) {
          console.log('Payment Successful:', response);
          toast.success('Payment processed successfully!');
          clearCart();
          setStep('confirmation');
          setIsProcessing(false);
        },
        prefill: {
          name: shippingInfo.fullName,
          email: shippingInfo.email,
          contact: shippingInfo.phone,
        },
        notes: {
          address: shippingInfo.address,
        },
        theme: {
          color: '#a73f2b',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      // Simulate other payment methods
      setIsProcessing(true);
      setTimeout(() => {
        toast.success('Payment processed successfully!');
        clearCart();
        setStep('confirmation');
        setIsProcessing(false);
      }, 2000);
    }
  };

  const paymentOptions = [
    {
      id: 'razorpay',
      name: 'Razorpay (Official)',
      description: 'UPI, Cards, Wallets & More',
      icon: <CreditCard className="w-6 h-6" />,
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Google Pay, PhonePe, Paytm',
      icon: <Smartphone className="w-6 h-6" />,
    },
  ];

  if (step === 'confirmation') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-2xl w-full mx-4 shadow-xl border-none">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-10 h-10 text-green-600" />
            </motion.div>
            <h1 className="text-3xl font-serif mb-4">Order Confirmed!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your purchase. Your order has been confirmed and will be shipped soon.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left border">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Order Number:</span>
                <span className="font-semibold">ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Email:</span>
                <span>{shippingInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="text-2xl font-bold text-[#a73f2b]">₹{total.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-gray-600 mb-8">
              We've sent a confirmation email to <strong>{shippingInfo.email}</strong>
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white px-12 py-6 text-lg rounded-full"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-5xl font-serif mb-8 text-center md:text-left">Checkout</h1>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step === 'shipping' ? 'bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white shadow-lg scale-110' : 'bg-green-500 text-white'
                }`}>
                {step === 'shipping' ? '1' : <Check className="w-6 h-6" />}
              </div>
              <span className={`ml-3 hidden sm:inline font-medium ${step === 'shipping' ? 'text-[#a73f2b]' : 'text-green-600'}`}>Shipping</span>
            </div>
            <div className="w-24 h-0.5 bg-gray-200"></div>
            <div className="flex items-center group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step === 'payment' ? 'bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white shadow-lg scale-110' : 'bg-gray-200 text-gray-500'
                }`}>
                2
              </div>
              <span className={`ml-3 hidden sm:inline font-medium ${step === 'payment' ? 'text-[#a73f2b]' : 'text-gray-400'}`}>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="border-none shadow-xl">
                    <CardHeader className="border-b pb-6 px-8">
                      <CardTitle className="text-2xl font-serif">Shipping Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      {!user && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                          <p className="text-amber-800 text-sm">You are checking out as a guest. Logging in will speed up the process.</p>
                          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>Login</Button>
                        </div>
                      )}
                      <form onSubmit={handleShippingSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                              id="fullName"
                              placeholder="e.g. John Doe"
                              value={shippingInfo.fullName}
                              onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                              required
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="e.g. john@example.com"
                              value={shippingInfo.email}
                              onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                              required
                              className="h-12"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+91 98765 43210"
                            value={shippingInfo.phone}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                            required
                            className="h-12"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Address *</Label>
                          <Input
                            id="address"
                            value={shippingInfo.address}
                            onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                            required
                            placeholder="House number, apartment, street name"
                            className="h-12"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={shippingInfo.city}
                              onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                              required
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              value={shippingInfo.state}
                              onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                              required
                              className="h-12"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pincode">Pincode *</Label>
                            <Input
                              id="pincode"
                              value={shippingInfo.pincode}
                              onChange={(e) => setShippingInfo({ ...shippingInfo, pincode: e.target.value })}
                              required
                              className="h-12"
                            />
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button
                            type="submit"
                            size="lg"
                            className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white py-6 text-lg rounded-full shadow-lg"
                          >
                            Continue to Payment
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="border-none shadow-xl">
                    <CardHeader className="border-b pb-6 px-8">
                      <CardTitle className="text-2xl font-serif">Payment Method</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <form onSubmit={handlePaymentSubmit} className="space-y-8">
                        <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                          <div className="space-y-4">
                            {paymentOptions.map((option) => (
                              <div
                                key={option.id}
                                className={`flex items-center space-x-4 p-6 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === option.id
                                  ? 'border-[#a73f2b] bg-[#a73f2b]/5 shadow-sm'
                                  : 'border-gray-100 hover:border-gray-200'
                                  }`}
                                onClick={() => setPaymentMethod(option.id)}
                              >
                                <RadioGroupItem value={option.id} id={option.id} className="text-[#a73f2b]" />
                                <div className="flex items-center gap-4 flex-1">
                                  <div className={`p-3 rounded-lg ${paymentMethod === option.id ? 'bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {option.icon}
                                  </div>
                                  <div>
                                    <Label htmlFor={option.id} className="text-lg font-medium cursor-pointer">
                                      {option.name}
                                    </Label>
                                    <p className="text-sm text-gray-500">{option.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>

                        <div className="bg-gray-50 p-6 rounded-xl space-y-4 border border-gray-100">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Smartphone className="w-4 h-4" />
                            Secure, encrypted payment powered by Razorpay.
                          </p>
                          <p className="text-xs text-gray-400">
                            By clicking "Place Order", you agree to ARTVPP's Terms of Service and Privacy Policy.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="flex-1 py-6 rounded-full"
                            onClick={() => setStep('shipping')}
                            disabled={isProcessing}
                          >
                            Back to Shipping
                          </Button>
                          <Button
                            type="submit"
                            size="lg"
                            className="flex-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white py-6 text-lg rounded-full shadow-lg"
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Processing...' : `Pay ₹${total.toLocaleString()}`}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-none shadow-xl">
              <CardHeader className="border-b pb-6 px-8">
                <CardTitle className="text-2xl font-serif">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-[#a73f2b] mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t font-medium">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (GST 18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center text-gray-900">
                      <span className="text-lg">Total</span>
                      <span className="text-3xl font-bold text-[#a73f2b]">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
