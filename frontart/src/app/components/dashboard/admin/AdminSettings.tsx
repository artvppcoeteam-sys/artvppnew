import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';
import { Save, Shield, CreditCard, Globe } from 'lucide-react';
import { toast } from 'sonner';
import {
    getStudentArtworkPublishingSetting,
    updateStudentArtworkPublishingSetting
} from '../../../utils/api';

export function AdminSettings() {
    const [publishingEnabled, setPublishingEnabled] = useState(false);
    const [publishingLoading, setPublishingLoading] = useState(false);

    useEffect(() => {
        const loadPublishingSetting = async () => {
            try {
                const response = await getStudentArtworkPublishingSetting();
                if (response.success) {
                    setPublishingEnabled(Boolean(response.data?.enabled));
                }
            } catch (error) {
                console.error('Failed to load student artwork publishing setting', error);
            }
        };

        loadPublishingSetting();
    }, []);

    const handlePublishingToggle = async () => {
        const confirmed = window.confirm('Are you sure you want to publish approved artworks submitted by students?');
        if (!confirmed) return;

        setPublishingLoading(true);
        try {
            const response = await updateStudentArtworkPublishingSetting(true);
            if (response.success) {
                setPublishingEnabled(true);
                toast.success(response.message || 'Student artwork publishing setting updated');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update student artwork publishing setting');
        } finally {
            setPublishingLoading(false);
        }
    };

    const handleSave = () => {
        // Simulate API call
        setTimeout(() => toast.success("Settings saved successfully."), 500);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
                    <p className="text-muted-foreground">Configure global settings, fees, and security.</p>
                </div>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" /> Save All Changes
                </Button>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="financials">Financials</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> General Information</CardTitle>
                            <CardDescription>Basic store details and visibility.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="siteName">Site Name</Label>
                                    <Input id="siteName" defaultValue="Artvpp Marketplace" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supportEmail">Support Email</Label>
                                    <Input id="supportEmail" defaultValue="support@artvpp.com" />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Maintenance Mode</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Prevent users from accessing the store during updates.
                                    </p>
                                </div>
                                <Switch />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between gap-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Publish Approved Student Artwork</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Student-submitted approved artworks stay hidden from marketplace until you publish them.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    onClick={handlePublishingToggle}
                                    disabled={publishingLoading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {publishingLoading
                                        ? 'Updating...'
                                        : 'Publish Approved Student Artwork'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Financial Settings */}
                <TabsContent value="financials" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Commission & Fees</CardTitle>
                            <CardDescription>Manage platform revenue model.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="commission">Default Commission Rate (%)</Label>
                                    <Input id="commission" type="number" defaultValue="20" />
                                    <p className="text-xs text-muted-foreground">Percentage taken from each sale.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax">Default Tax Rate (%)</Label>
                                    <Input id="tax" type="number" defaultValue="18" />
                                    <p className="text-xs text-muted-foreground">GST/VAT applied to orders.</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Label htmlFor="payout">Minimum Payout Amount (₹)</Label>
                                <Input id="payout" type="number" defaultValue="1000" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Security Settings */}
                <TabsContent value="security" className="mt-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Security & Access</CardTitle>
                            <CardDescription>Manage admin access and safety protocols.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Two-Factor Authentication (2FA)</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enforce 2FA for all admin accounts.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">New Vendor Approval</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Require manual approval for all new vendor registrations.
                                    </p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
