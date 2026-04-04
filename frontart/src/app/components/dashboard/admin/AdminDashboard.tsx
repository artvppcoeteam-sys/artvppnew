import { useState } from 'react';
import { DashboardLayout } from '../shared/DashboardLayout';
import { AdminOverview } from './AdminOverview';
import { AdminVendors } from './AdminVendors';
import { AdminProducts } from './AdminProducts';
import { AdminUsers } from './AdminUsers';
import { AdminArtworks } from './AdminArtworks';
import { AdminServices } from './AdminServices';
import { AdminOrders } from './AdminOrders';
import { AdminCategories } from './AdminCategories';
import { AdminRevenue } from './AdminRevenue';
import { AdminReports } from './AdminReports';
import { AdminContent } from './AdminContent';
import { AdminSettings } from './AdminSettings';
import { AdminSupport } from './AdminSupport';
import {
    LayoutDashboard, Users, Store as StoreIcon, Image as ImageIcon,
    FileText, ShoppingBag, Settings, PieChart, Layers, Box,
    CreditCard, HelpCircle, Palette
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';

interface AdminDashboardProps {
    onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
    const { user } = useApp();
    const [activeSection, setActiveSection] = useState('overview');

    // Enforce Admin Access
    if (user?.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="text-red-600">Access Denied</CardTitle>
                        <CardDescription>This area is restricted to Administrators only.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="mb-4 text-sm text-gray-500">
                            You do not have permission to view this page. Please log in with an administrator account.
                        </p>
                        <Button onClick={() => onNavigate('home')} className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0">
                            Return Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const menuItems = [
        {
            title: 'OVERVIEW',
            items: [
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            ]
        },
        {
            title: 'MANAGEMENT',
            items: [
                { id: 'vendors', label: 'Sellers / Vendors', icon: StoreIcon },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'artworks', label: 'Artworks', icon: ImageIcon },
                { id: 'orders', label: 'Orders', icon: ShoppingBag },
            ]
        },
        {
            title: 'DISCOVER & SERVICES',
            items: [
                { id: 'categories', label: 'Categories', icon: Layers },
                { id: 'services', label: 'Services', icon: Palette },
            ]
        },
        {
            title: 'FINANCE',
            items: [
                { id: 'revenue', label: 'Revenue & Commission', icon: CreditCard },
                { id: 'reports', label: 'Reports & Analytics', icon: PieChart },
            ]
        },
        {
            title: 'PLATFORM',
            items: [
                { id: 'content', label: 'Content Management', icon: FileText },
                { id: 'settings', label: 'Platform Settings', icon: Settings },
                { id: 'support', label: 'Support Tickets', icon: HelpCircle },
            ]
        }
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'overview': return <AdminOverview />;

            // Management
            case 'vendors': return <AdminVendors />;
            case 'users': return <AdminUsers />;
            case 'artworks': return <AdminArtworks />;
            case 'orders': return <AdminOrders />;

            // Discover
            case 'categories': return <AdminCategories />;
            case 'services': return <AdminServices />;

            // Fallbacks/Legacy
            case 'products': return <AdminProducts activeTab="products" />;

            // Finance
            case 'revenue': return <AdminRevenue />;
            case 'reports': return <AdminReports />;

            // Platform
            case 'content': return <AdminContent />;
            case 'settings': return <AdminSettings />;
            case 'support': return <AdminSupport />;

            default: return <AdminOverview />;
        }
    };

    return (
        <DashboardLayout
            menuItems={menuItems}
            activeSection={activeSection}
            onNavigate={(id) => setActiveSection(id)}
        >
            {renderContent()}
        </DashboardLayout>
    );
}
