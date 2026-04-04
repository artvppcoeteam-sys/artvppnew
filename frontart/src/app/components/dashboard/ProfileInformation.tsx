import { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { updateProfile } from '../../utils/api';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion"

export function ProfileInformation() {
    const { user, setUser } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            // Parse name into first/last
            const nameParts = (user.name || '').split(' ');
            setFormData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                gender: (user as any).gender || '',
                email: user.email || '',
                phone: (user as any).phone || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await updateProfile({
                firstName: formData.firstName,
                lastName: formData.lastName,
                gender: formData.gender || null,
                phone: formData.phone || null
            });

            if (response.success) {
                // Update local user state
                if (user) {
                    setUser({
                        ...user,
                        name: `${formData.firstName} ${formData.lastName}`.trim(),
                    });
                }
                toast.success('Profile updated successfully');
                setIsEditing(false);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        if (user) {
            const nameParts = (user.name || '').split(' ');
            setFormData({
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
                gender: (user as any).gender || '',
                email: user.email || '',
                phone: (user as any).phone || ''
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Manage your personal details</CardDescription>
                    </div>
                    {!isEditing && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-blue-600">
                            Edit
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={formData.firstName}
                                disabled={!isEditing}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                placeholder="Enter first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                disabled={!isEditing}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Your Gender</Label>
                        <RadioGroup
                            value={formData.gender}
                            disabled={!isEditing}
                            onValueChange={(val) => setFormData({ ...formData, gender: val })}
                            className="flex gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="male" id="male" />
                                <Label htmlFor="male">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="female" id="female" />
                                <Label htmlFor="female">Female</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="other" id="other" />
                                <Label htmlFor="other">Other</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    value={formData.email}
                                    disabled={true}
                                    className="pr-10 bg-gray-50"
                                />
                                <CheckCircle className="w-4 h-4 text-green-500 absolute right-3 top-3" />
                            </div>
                            <p className="text-xs text-gray-500">Email cannot be changed</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Mobile Number</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                disabled={!isEditing}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 98765 43210"
                            />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Save Changes
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h3 className="font-semibold text-lg">FAQs</h3>
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>What happens when I update my profile?</AccordionTrigger>
                        <AccordionContent>
                            Your profile information will be updated immediately. This information is used for order deliveries and communication.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                        <AccordionTrigger>Can I change my email address?</AccordionTrigger>
                        <AccordionContent>
                            Currently, email address cannot be changed as it's your primary login identifier. Contact support for assistance.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            <div className="pt-6 space-y-4">
                <Button variant="link" className="text-blue-600 p-0 h-auto">Deactivate Account</Button>
                <br />
                <Button variant="link" className="text-red-600 p-0 h-auto">Delete Account</Button>
            </div>
        </div>
    );
}
