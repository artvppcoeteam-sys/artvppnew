import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function OrderSuccessPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white p-8 rounded-lg shadow-xl text-center"
            >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="text-3xl font-serif mb-4">Order Placed Successfully!</h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. Your order has been confirmed and we will begin processing it shortly.
                </p>
                <div className="space-y-3">
                    <Button
                        onClick={() => navigate('/orders')}
                        className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white"
                    >
                        View My Orders
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate('/marketplace')}
                        className="w-full"
                    >
                        Continue Shopping
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
