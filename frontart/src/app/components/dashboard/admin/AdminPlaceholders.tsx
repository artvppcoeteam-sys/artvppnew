import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { UserPlus, Store } from 'lucide-react';

export function AdminUsers() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
            <Card>
                <CardContent className="h-96 flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">User List & Actions Placeholder</span>
                </CardContent>
            </Card>
        </div>
    );
}

export function AdminVendors() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Vendor Management</h2>
                <Button>
                    <UserPlus className="mr-2 h-4 w-4" /> Approve New Vendors
                </Button>
            </div>
            <Card>
                <CardContent className="h-96 flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">Vendor List & Approval Queue Placeholder</span>
                </CardContent>
            </Card>
        </div>
    );
}

export function AdminArtworks() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Artwork Moderation</h2>
            <Card>
                <CardContent className="h-96 flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">All Artworks & Moderation Placeholder</span>
                </CardContent>
            </Card>
        </div>
    );
}

export function AdminReports() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
            <Card>
                <CardContent className="h-96 flex items-center justify-center bg-gray-50">
                    <span className="text-gray-400">Detailed Reports & Export Options Placeholder</span>
                </CardContent>
            </Card>
        </div>
    );
}
