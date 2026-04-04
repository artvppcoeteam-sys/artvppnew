import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddressStepProps {
    onNext: () => void;
}

export function AddressStep({ onNext }: AddressStepProps) {
    const { checkoutState, updateCheckoutState, user } = useApp();
    const [formData, setFormData] = useState(checkoutState.shippingInfo);

    // Pre-fill with user data if available and empty
    useEffect(() => {
        if (user && !formData.email) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.phone.length < 10) {
            toast.error('Please enter a valid phone number');
            return;
        }

        updateCheckoutState({ shippingInfo: formData });
        onNext();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Select Delivery Address</h2>
                <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add New Address
                </Button>
            </div>

            {/* Saved Addresses (Mock for now) */}
            <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-2 border-[#a73f2b] bg-[#a73f2b]/5 relative cursor-pointer">
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white text-xs px-2 py-1 rounded">DEFAULT</div>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                            <MapPin className="w-5 h-5 text-[#a73f2b] mt-1" />
                            <div>
                                <p className="font-semibold">{formData.fullName || 'New Address'}</p>
                                <p className="text-sm text-gray-600 mt-1">{formData.address || 'Start typing to see address here...'}</p>
                                <p className="text-sm text-gray-600">
                                    {formData.city} {formData.state} {formData.pincode}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">Phone: {formData.phone}</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-end">
                            <Button size="sm" onClick={handleSubmit} className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white">
                                Deliver Here
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-gray-50 px-2 text-muted-foreground">Or edit address details</span>
                </div>
            </div>

            <Card>
                <CardContent className="p-6">
                    <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+91" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" value={formData.address} onChange={handleChange} required placeholder="House No, Street, Landmark" />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" name="city" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">State</Label>
                                <Input id="state" name="state" value={formData.state} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pincode">Pincode</Label>
                                <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleChange} required />
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button type="submit" form="address-form" size="lg" className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white px-8">
                    Save and Continue
                </Button>
            </div>
        </div>
    );
}
