import {
    User, MapPin, Package, CreditCard, Heart,
    MessageSquare, Bell, Ticket, LogOut,
    MoreHorizontal
} from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useApp } from '../../context/AppContext';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
    activeSection: string;
    basePath?: string;
    className?: string; // allow overriding classes
    // Removed onNavigate cause we use proper routing now 
    // but kept just in case some legacy component tries to pass it
    onNavigate?: (section: any) => void;
}

export function Sidebar({ activeSection, basePath = '/dashboard/user', className }: SidebarProps) {
    const { user, logout } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleNavigate = (id: string) => {
        navigate(`${basePath}/${id}`);
        setIsOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            title: 'MY ORDERS',
            items: [
                { id: 'orders', label: 'Orders List', icon: Package },
            ]
        },
        {
            title: 'ACCOUNT SETTINGS',
            items: [
                { id: 'profile', label: 'Profile Information', icon: User },
                { id: 'addresses', label: 'Manage Addresses', icon: MapPin },

            ]
        },
        {
            title: 'PAYMENTS',
            items: [
                { id: 'payments', label: 'Gift Cards, Saved UPI & Cards', icon: CreditCard },
            ]
        },
        {
            title: 'MY STUFF',
            items: [
                { id: 'coupons', label: 'My Coupons', icon: Ticket },
                { id: 'reviews', label: 'My Reviews & Ratings', icon: MessageSquare },
                { id: 'notifications', label: 'All Notifications', icon: Bell },
                { id: 'wishlist', label: 'My Wishlist', icon: Heart },
            ]
        }
    ];

    const SidebarContent = () => (
        <div className="h-full flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            {/* User Header */}
            <div className="p-4 border-b bg-gray-50/50">
                <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white">
                            {user?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                        <p className="text-xs text-gray-500 font-medium">Hello,</p>
                        <h3 className="font-bold text-gray-900 truncate">{user?.name || 'User'}</h3>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2">
                {menuItems.map((section, idx) => (
                    <div key={idx} className="px-4 py-2 border-b border-gray-100 last:border-0">
                        {section.title && (
                            <h4 className="text-xs font-semibold text-gray-400 mb-2 mt-2 px-2">
                                {section.title}
                            </h4>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const isActive = activeSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavigate(item.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200",
                                            isActive
                                                ? "bg-blue-50 text-blue-600 shadow-sm"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <item.icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-gray-400")} />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t bg-gray-50/50 space-y-2">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>

                <div className="pt-2 border-t border-gray-200/50">
                    <p className="text-xs font-medium text-gray-400 mb-2 px-2">Frequently Visited:</p>
                    <div className="flex flex-col gap-1">
                        <button className="text-xs text-gray-500 hover:text-blue-600 text-left px-2 py-1 rounded hover:bg-gray-100/50 transition-colors">
                            Track Order
                        </button>
                        <button className="text-xs text-gray-500 hover:text-blue-600 text-left px-2 py-1 rounded hover:bg-gray-100/50 transition-colors">
                            Help Center
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className={cn("hidden lg:block w-72 shrink-0 bg-white", className)}>
                <SidebarContent />
            </div>

            {/* Mobile Sidebar Trigger - handled in parent layout, but can be added here if needed */}
            <div className="lg:hidden mb-4">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full justify-between bg-white shadow-sm border-gray-200">
                            <span className="flex items-center gap-2 text-gray-900">
                                <MoreHorizontal className="w-4 h-4" />
                                <span className="font-medium">Dashboard Menu</span>
                            </span>
                            <Avatar className="w-6 h-6 ml-2">
                                <AvatarFallback className="text-xs bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white">
                                    {user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-80">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
