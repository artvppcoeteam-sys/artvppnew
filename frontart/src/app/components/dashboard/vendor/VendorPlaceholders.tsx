import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { ImagePlus } from 'lucide-react';

export function VendorArtworks() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">My Artworks</h2>
                <Button>
                    <ImagePlus className="mr-2 h-4 w-4" /> Add New Artwork
                </Button>
            </div>
            <Card className="border-dashed border-2">
                <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-muted-foreground mb-4">You have 12 active artworks.</p>
                    {/* Placeholder for artwork list */}
                    <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center">
                        <span className="text-gray-400">Artwork List Placeholder</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function VendorOrders() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Vendor Orders</h2>
            <Card>
                <CardContent className="h-96 flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">Vendor Orders List Placeholder</span>
                </CardContent>
            </Card>
        </div>
    );
}

export function VendorEarnings() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">My Earnings</h2>
            <Card>
                <CardContent className="h-96 flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">Earnings & Payouts Placeholder</span>
                </CardContent>
            </Card>
        </div>
    );
}

export function VendorSettings() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Vendor Profile Settings</h2>
            <Card>
                <CardContent className="h-96 flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">Profile & Bank Details Form Placeholder</span>
                </CardContent>
            </Card>
        </div>
    );
}
