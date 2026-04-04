import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Package, DollarSign, Image as ImageIcon, Clock, Loader2, Plus } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { getArtistOrders, getMyProducts, getMyRequests } from '../../../utils/api';
import { useApp } from '../../../context/AppContext';

interface Product {
    _id: string;
    title: string;
    price: number;
    views?: number;
    images?: Array<{ url: string }>;
    verification?: { status?: string };
    status?: string;
    createdAt: string;
}

interface PendingRequest {
    _id: string;
    actionType: string;
    status: string;
    data?: any;
    createdAt: string;
}

interface ArtistOrderItem {
    product?: string | { _id?: string };
    artist?: string | { _id?: string };
    title?: string;
    subtotal?: number;
    price?: number;
    quantity?: number;
}

interface ArtistOrder {
    _id: string;
    orderNumber?: string;
    user?: { username?: string };
    items?: ArtistOrderItem[];
    status: string;
    createdAt: string;
}

const PENDING_ORDER_STATUSES = new Set(['pending', 'confirmed', 'processing', 'shipped']);

export function VendorOverview() {
    const navigate = useNavigate();
    const { user } = useApp();

    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [orders, setOrders] = useState<ArtistOrder[]>([]);

    const fetchDashboardData = async () => {
        if (!localStorage.getItem('token')) {
            setLoading(false);
            return;
        }

        try {
            const [productsRes, requestsRes, ordersRes] = await Promise.all([
                getMyProducts(),
                getMyRequests(),
                getArtistOrders()
            ]);

            if (productsRes?.success) {
                setProducts(productsRes.data?.products || []);
            }

            if (requestsRes?.success) {
                setRequests(requestsRes.data?.requests || []);
            }

            if (ordersRes?.success) {
                setOrders(ordersRes.data?.orders || []);
            }
        } catch (error) {
            console.error('Vendor overview fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const intervalId = window.setInterval(fetchDashboardData, 30000);
        return () => window.clearInterval(intervalId);
    }, []);

    const myOrderSummaries = useMemo(() => {
        const currentUserId = user?.id;
        if (!currentUserId) return [] as Array<ArtistOrder & { myItems: ArtistOrderItem[]; mySubtotal: number }>;

        return orders
            .map((order) => {
                const myItems = (order.items || []).filter((item) => {
                    const artistField = item.artist;
                    const artistId = typeof artistField === 'string' ? artistField : artistField?._id;
                    return artistId === currentUserId;
                });

                const mySubtotal = myItems.reduce((sum, item) => {
                    const subtotal = item.subtotal ?? ((item.price || 0) * (item.quantity || 0));
                    return sum + subtotal;
                }, 0);

                return {
                    ...order,
                    myItems,
                    mySubtotal
                };
            })
            .filter((order) => order.myItems.length > 0);
    }, [orders, user?.id]);

    const stats = useMemo(() => {
        const totalOrders = myOrderSummaries.length;
        const pendingOrders = myOrderSummaries.filter((order) => PENDING_ORDER_STATUSES.has(order.status)).length;
        const deliveredRevenue = myOrderSummaries
            .filter((order) => order.status === 'delivered')
            .reduce((sum, order) => sum + order.mySubtotal, 0);
        const pendingRevenue = myOrderSummaries
            .filter((order) => PENDING_ORDER_STATUSES.has(order.status))
            .reduce((sum, order) => sum + order.mySubtotal, 0);

        const approvedArtworks = products.filter(
            (product) => product.verification?.status === 'approved' && product.status === 'active'
        );

        const pendingArtworkRequests = requests.filter(
            (request) =>
                request.status === 'pending' &&
                ['create_product', 'edit_product', 'delete_product'].includes(request.actionType)
        );

        return {
            totalOrders,
            pendingOrders,
            deliveredRevenue,
            pendingRevenue,
            activeArtworks: approvedArtworks.length,
            pendingArtworkRequests: pendingArtworkRequests.length
        };
    }, [myOrderSummaries, products, requests]);

    const salesTrend = useMemo(() => {
        const months: Array<{ key: string; name: string; revenue: number }> = [];
        const now = new Date();

        for (let i = 5; i >= 0; i -= 1) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const name = date.toLocaleString('en-US', { month: 'short' });
            months.push({ key, name, revenue: 0 });
        }

        const revenueByMonth = new Map(months.map((m) => [m.key, 0]));

        myOrderSummaries
            .filter((order) => order.status === 'delivered')
            .forEach((order) => {
                const orderDate = new Date(order.createdAt);
                const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
                revenueByMonth.set(key, (revenueByMonth.get(key) || 0) + order.mySubtotal);
            });

        return months.map((month) => ({
            name: month.name,
            revenue: revenueByMonth.get(month.key) || 0
        }));
    }, [myOrderSummaries]);

    const topArtworks = useMemo(() => {
        const revenueByProduct = new Map<string, { revenue: number; sales: number }>();

        myOrderSummaries
            .filter((order) => order.status === 'delivered')
            .forEach((order) => {
                order.myItems.forEach((item) => {
                    const productIdField = item.product;
                    const productId = typeof productIdField === 'string' ? productIdField : productIdField?._id;
                    if (!productId) return;

                    const entry = revenueByProduct.get(productId) || { revenue: 0, sales: 0 };
                    const subtotal = item.subtotal ?? ((item.price || 0) * (item.quantity || 0));
                    entry.revenue += subtotal;
                    entry.sales += item.quantity || 0;
                    revenueByProduct.set(productId, entry);
                });
            });

        return products
            .map((product) => {
                const performance = revenueByProduct.get(product._id) || { revenue: 0, sales: 0 };
                return {
                    id: product._id,
                    title: product.title,
                    views: product.views || 0,
                    sales: performance.sales,
                    revenue: performance.revenue
                };
            })
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
    }, [products, myOrderSummaries]);

    const recentOrders = useMemo(() => {
        return [...myOrderSummaries]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 6)
            .map((order) => ({
                id: order.orderNumber || order._id.slice(-8),
                artwork: order.myItems.map((item) => item.title || 'Artwork').slice(0, 2).join(', '),
                customer: order.user?.username || 'Customer',
                date: new Date(order.createdAt).toLocaleDateString(),
                status: order.status,
                amount: order.mySubtotal
            }));
    }, [myOrderSummaries]);

    if (loading) {
        return (
            <div className="py-16 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin mr-2" />
                <span>Loading vendor overview...</span>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Vendor Overview</h2>
                <Button className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0" onClick={() => navigate('/dashboard/vendor/artworks')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Art
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rs {stats.deliveredRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Delivered order earnings</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <Package className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">Orders containing your artworks</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved Artworks</CardTitle>
                        <ImageIcon className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeArtworks}</div>
                        <p className="text-xs text-muted-foreground">Live on marketplace</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingArtworkRequests + stats.pendingOrders}</div>
                        <p className="text-xs text-muted-foreground">{stats.pendingArtworkRequests} artwork requests, Rs {stats.pendingRevenue.toLocaleString()} pending revenue</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrend}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a73f2b" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#a73f2b" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => [`Rs ${Number(value).toLocaleString()}`, 'Revenue']} />
                                <Area type="monotone" dataKey="revenue" stroke="#a73f2b" fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Top Artwork Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topArtworks.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No artwork performance data yet.</p>
                            ) : (
                                topArtworks.map((art) => (
                                    <div key={art.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="grid gap-1">
                                            <p className="text-sm font-medium leading-none">{art.title}</p>
                                            <p className="text-xs text-muted-foreground">{art.sales} sales - {art.views} views</p>
                                        </div>
                                        <div className="font-bold">Rs {art.revenue.toLocaleString()}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3">Order ID</th>
                                    <th className="px-4 py-3">Artwork</th>
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders yet</td>
                                    </tr>
                                ) : (
                                    recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{order.id}</td>
                                            <td className="px-4 py-3">{order.artwork}</td>
                                            <td className="px-4 py-3">{order.customer}</td>
                                            <td className="px-4 py-3">{order.date}</td>
                                            <td className="px-4 py-3">Rs {order.amount.toLocaleString()}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    order.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : order.status === 'shipped'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : order.status === 'delivered'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
