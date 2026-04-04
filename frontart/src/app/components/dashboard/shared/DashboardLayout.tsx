import { ReactNode } from 'react';
import { DashboardSidebar } from './DashboardSidebar';
import { MenuSection } from './types';
import { motion } from 'motion/react';
import { Header } from '../../Header';

interface DashboardLayoutProps {
    children: ReactNode;
    menuItems: MenuSection[];
    activeSection: string;
    onNavigate: (id: string, path?: string) => void;
}

export function DashboardLayout({ children, menuItems, activeSection, onNavigate }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <DashboardSidebar
                            menuItems={menuItems}
                            activeSection={activeSection}
                            onNavigate={onNavigate}
                            className="lg:w-1/4"
                        />

                        {/* Main Content */}
                        <div className="flex-1 lg:w-3/4">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                {children}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
