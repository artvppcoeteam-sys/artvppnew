import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { getNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../utils/api';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

export function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            const response = await getNotifications();
            if (response.success) {
                setNotifications(response.data?.notifications || []);
            }
        } catch (error: any) {
            setNotifications([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearAll = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch (error: any) {
            toast.error(error.message || 'Failed to clear notifications');
        }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await markNotificationRead(id);
            setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (error: any) {
            toast.error(error.message || 'Failed to mark as read');
        }
    };

    const formatDate = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return '1 day ago';
        return `${days} days ago`;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                <Bell className="w-12 h-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900">No Notifications</h3>
                <p>You're all caught up!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Notifications</h2>
                <Button variant="outline" size="sm" onClick={handleClearAll} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" /> Clear All
                </Button>
            </div>
            <div className="space-y-2">
                {notifications.map((notification) => (
                    <Card key={notification._id} className={`transition-colors ${notification.read ? 'bg-white' : 'bg-blue-50/50 border-blue-100'}`}>
                        <CardContent className="p-4 flex gap-4 items-start">
                            <div className={`mt-1 w-2 h-2 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-blue-600'}`} />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>{notification.title}</h3>
                                    <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            {!notification.read && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-600" onClick={() => handleMarkRead(notification._id)} title="Mark as read">
                                    <CheckCheck className="w-4 h-4" />
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
