import { loadRazorpay } from '../../utils/loadRazorpay';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import logo from '../../../assets/artvpplogo.png';

type RazorpayButtonProps = {
    amount: number; // in INR
    user: {
        name: string;
        email: string;
        contact: string;
    };
    onSuccess: (paymentId: string) => void;
    onFailure: (message: string) => void;
    className?: string;
    children?: React.ReactNode;
};

export default function RazorpayButton({
    amount,
    user,
    onSuccess,
    onFailure,
    className,
    children
}: RazorpayButtonProps) {
    const handlePayment = async () => {
        const res = await loadRazorpay();

        if (!res) {
            onFailure("Razorpay SDK failed to load. Are you online?");
            return;
        }

        const key = import.meta.env.VITE_RAZORPAY_KEY_ID;

        if (!key) {
            onFailure("Payment gateway not configured. Please set VITE_RAZORPAY_KEY_ID in .env");
            return;
        }


        const options = {
            key,
            amount: Math.round(amount * 100), // convert INR to paise
            currency: "INR",
            name: "ArtVPP",
            description: "Order Payment",
            image: logo,
            handler: function (response: any) {
                onSuccess(response.razorpay_payment_id);
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: user.contact,
            },
            theme: {
                color: "#a73f2b", // ArtVPP Gold
            },
            modal: {
                ondismiss: function () {
                    onFailure("Payment cancelled by user.");
                },
            },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
    };

    return (
        <Button
            onClick={handlePayment}
            className={className || "w-full rounded-lg bg-black text-white py-3 hover:opacity-90 transition"}
        >
            {children || "Pay with Razorpay"}
        </Button>
    );
}
