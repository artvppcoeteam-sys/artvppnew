import { useState, useEffect } from 'react';
import { Ticket, Copy, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { getCoupons } from '../../utils/api';

interface Coupon {
    _id: string;
    code: string;
    description: string;
    discountType: string;
    discountValue: number;
    expiresAt: string;
    minOrderAmount: number;
}

export function MyCoupons() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            setIsLoading(true);
            const response = await getCoupons();
            if (response.success) {
                setCoupons(response.data?.coupons || []);
            }
        } catch (error: any) {
            // Silently handle - user may not have any coupons
            setCoupons([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success('Coupon code copied!');
    };

    const formatExpiry = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (coupons.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <Ticket className="w-12 h-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">No Coupons Available</h3>
                <p>You don't have any active coupons at the moment.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">My Coupons ({coupons.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
                {coupons.map((coupon) => (
                    <Card key={coupon._id} className="relative overflow-hidden border-dashed border-2 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <Ticket className="w-24 h-24" />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 tracking-wider">{coupon.code}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {coupon.discountType === 'percentage'
                                            ? `${coupon.discountValue}% off`
                                            : `₹${coupon.discountValue} off`}
                                        {coupon.description && ` - ${coupon.description}`}
                                    </p>
                                </div>
                                <Button size="icon" variant="outline" className="h-8 w-8 bg-white" onClick={() => handleCopy(coupon.code)}>
                                    <Copy className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="flex justify-between items-end border-t border-orange-200/50 pt-4">
                                <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded">
                                    Valid until {formatExpiry(coupon.expiresAt)}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {coupon.minOrderAmount > 0 ? `Min. order ₹${coupon.minOrderAmount}` : 'No min. order'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
