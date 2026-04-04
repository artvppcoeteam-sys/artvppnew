import { DashboardLayout } from '../shared/DashboardLayout';
import {
    LayoutDashboard, Image as ImageIcon, ShoppingBag,
    DollarSign, User, HelpCircle, MessageSquare
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export function VendorDashboard() {
    const { user } = useApp();
    const navigate = useNavigate();
    const location = useLocation();

    // Derive active section from URL
    const activeSection = location.pathname.split('/').pop() || 'overview';

    // Redirect /dashboard/vendor to /dashboard/vendor/overview
    useEffect(() => {
        if (location.pathname === '/dashboard/vendor' || location.pathname === '/dashboard/vendor/') {
            navigate('/dashboard/vendor/overview', { replace: true });
        }
    }, [location.pathname, navigate]);

    if (user?.role !== 'artist' && user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Access Restricted</CardTitle>
                        <CardDescription>This area is for Vendors/Artists only.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate('/')} className="w-full">
                            Return Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const menuItems = [
        {
            title: 'MAIN',
            items: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/dashboard/vendor/overview' },
                { id: 'artworks', label: 'My Artworks', icon: ImageIcon, path: '/dashboard/vendor/artworks' },
                { id: 'add-artwork', label: 'Add New Artwork', icon: ImageIcon, path: '/dashboard/vendor/add-artwork' },
                { id: 'orders', label: 'Orders', icon: ShoppingBag, path: '/dashboard/vendor/orders' },
            ]
        },
        {
            title: 'FINANCE',
            items: [
                { id: 'earnings', label: 'Earnings / Revenue', icon: DollarSign, path: '/dashboard/vendor/earnings' },
                { id: 'payouts', label: 'Payouts (Coming Soon)', icon: DollarSign, path: '/dashboard/vendor/payouts' },
            ]
        },
        {
            title: 'ACCOUNT',
            items: [
                { id: 'customers', label: 'Customers', icon: User, path: '/dashboard/vendor/customers' },
                { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/dashboard/vendor/messages' },
                { id: 'support', label: 'Help & Support', icon: HelpCircle, path: '/dashboard/vendor/support' },
            ]
        }
    ];

    return (
        <DashboardLayout
            menuItems={menuItems}
            activeSection={activeSection}
            onNavigate={(id, path) => {
                if (path) {
                    navigate(path);
                } else {
                    navigate(`/dashboard/vendor/${id}`);
                }
            }}
        >
            <Outlet />
        </DashboardLayout>
    );
}
