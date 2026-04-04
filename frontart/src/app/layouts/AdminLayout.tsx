import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Users, Store as StoreIcon, ImageIcon, ShoppingBag, Layers, Palette, CreditCard, PieChart, FileText, Settings, HelpCircle, LogOut, Menu, X } from 'lucide-react';
import { cn } from '../components/ui/utils';
import { Button } from '../components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Header } from '../components/Header';

export function AdminLayout() {
    const { user, logout } = useApp();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Mapping current path to active section ID
    const currentPath = location.pathname.split('/').pop() || 'overview';

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

    const handleNavigate = (id: string) => {
        navigate(`/dashboard/admin/${id}`);
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex flex-col h-screen bg-[#fcfcfc]">
            <Header />

            {/* Mobile Top Bar */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-[#f8f7f5] border-b border-black/5 z-30">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#a73f2b] to-[#b30452]">
                        <LayoutDashboard className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[#333333] font-bold tracking-tight">Admin Dashboard</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-[#333333] hover:bg-black/5"
                >
                    <Menu className="w-6 h-6" />
                </Button>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile Overlay */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <aside className={cn(
                    "fixed lg:static inset-y-0 left-0 w-[260px] lg:w-72 flex flex-col border-r border-black/5 bg-[#f8f7f5] h-full shadow-xl z-50 lg:z-20 transition-all duration-300 ease-in-out",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}>
                    <div className="p-8 border-b border-black/5 bg-[#f8f7f5]">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-[#a73f2b] to-[#b30452] shadow-lg shadow-[#b30452]/20">
                                    <LayoutDashboard className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[#333333]">Admin Panel</span>
                            </h2>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(false)}
                                className="lg:hidden text-gray-400 hover:text-gray-900 hover:bg-black/5"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4">
                        {menuItems.map((section, idx) => (
                            <div key={idx} className="px-4 mb-2 border-b border-black/5 last:border-0 pb-4">
                                {section.title && (
                                    <h4 className="text-[10px] font-bold text-gray-400 mb-4 mt-6 px-4 tracking-[0.2em] uppercase">
                                        {section.title}
                                    </h4>
                                )}
                                <div className="space-y-1 px-2">
                                    {section.items.map((item) => {
                                        const isActive = currentPath === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => handleNavigate(item.id)}
                                                className={cn(
                                                    "w-full flex items-center gap-3.5 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 group relative overflow-hidden",
                                                    isActive
                                                        ? "text-white shadow-md shadow-[#b30452]/20"
                                                        : "text-[#333333] hover:text-[#b30452] hover:bg-[#b30452]/10"
                                                )}
                                            >
                                                {/* Active background gradient */}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeTabMobileRefined"
                                                        className="absolute inset-0 bg-gradient-to-r from-[#a73f2b] to-[#b30452] z-0"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 0.3 }}
                                                    />
                                                )}
                                                <item.icon className={cn(
                                                    "w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110",
                                                    isActive ? "text-white" : "text-gray-500 group-hover:text-[#b30452]"
                                                )} />
                                                <span className="relative z-10 font-semibold">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-black/5 bg-[#f8f7f5]">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-4 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl px-4 py-6 transition-all duration-300 group"
                            onClick={() => {
                                logout();
                                navigate('/login');
                            }}
                        >
                            <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            <span className="font-semibold text-sm">Logout Session</span>
                        </Button>
                    </div>
                </aside>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/30">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
