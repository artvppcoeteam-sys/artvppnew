import { Sidebar } from './Sidebar';
import { useApp } from '../../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { Outlet, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Header } from '../Header';

export function UserDashboard() {
    const { user } = useApp();
    const location = useLocation();
    const navigate = useNavigate();

    // Derive active section from URL
    // e.g. /dashboard/user/profile -> 'profile'
    const activeSection = location.pathname.split('/').pop() || 'profile';

    // Redirect /dashboard/user to /dashboard/user/profile
    useEffect(() => {
        if (location.pathname === '/dashboard/user' || location.pathname === '/dashboard/user/') {
            navigate('/dashboard/user/profile', { replace: true });
        }
    }, [location.pathname, navigate]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                        <CardDescription>Please log in to view your profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:bg-[#B8941F]">
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <Sidebar
                            activeSection={activeSection}
                            basePath="/dashboard/user"
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
                                <Outlet />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
