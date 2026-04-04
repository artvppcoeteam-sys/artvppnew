import { useState, useEffect } from 'react';
import { CreditCard, Wallet, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';

export function Payments() {
    const [isLoading, setIsLoading] = useState(true);
    const [cards, setCards] = useState<any[]>([]);
    const [upiIds, setUpiIds] = useState<any[]>([]);

    useEffect(() => {
        // Simulating API call - in production this would fetch from backend
        // Payment methods are typically stored securely and not easily retrieved
        setIsLoading(false);
        setCards([]);
        setUpiIds([]);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Gift Cards */}
            <section>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-blue-600" />
                    Gift Cards
                </h3>
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                    <CardContent className="flex justify-between items-center p-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total Balance</p>
                            <p className="text-3xl font-bold text-gray-900">₹0</p>
                        </div>
                        <Button variant="outline" className="bg-white hover:bg-white/90">Add Gift Card</Button>
                    </CardContent>
                </Card>
            </section>

            {/* Saved Cards */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        Saved Cards
                    </h3>
                </div>

                {cards.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <CreditCard className="w-12 h-12 mb-4 text-gray-300" />
                            <h4 className="text-lg font-medium text-gray-900">No Saved Cards</h4>
                            <p className="text-sm">Your saved cards will appear here after your first purchase</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {/* Cards would be rendered here */}
                    </div>
                )}
            </section>

            {/* Saved UPI */}
            <section>
                <h3 className="text-lg font-semibold mb-4">Saved UPI IDs</h3>
                {upiIds.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                            <Wallet className="w-12 h-12 mb-4 text-gray-300" />
                            <h4 className="text-lg font-medium text-gray-900">No Saved UPI IDs</h4>
                            <p className="text-sm">Your saved UPI IDs will appear here after your first UPI payment</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="p-0">
                            {/* UPI IDs would be rendered here */}
                        </CardContent>
                    </Card>
                )}
            </section>

            <p className="text-xs text-gray-500 text-center">
                Payment methods are securely managed by Razorpay. We never store your complete card details.
            </p>
        </div>
    );
}
