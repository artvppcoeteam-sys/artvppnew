import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import {
    ImagePlus, Search, Filter, MoreVertical, Edit,
    Trash2, Eye, DollarSign, TrendingUp, Download,
    ShoppingBag, User, Calendar, Loader2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getMyProducts, getMyRequests, createProduct, getArtistOrders, getCategories } from '../../../utils/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';


export function VendorArtworks() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [submittingArtwork, setSubmittingArtwork] = useState(false);
    const [newArtworkImages, setNewArtworkImages] = useState<File[]>([]);
    const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);
    const [newArtwork, setNewArtwork] = useState({
        title: '',
        description: '',
        price: '',
        category: '',
        stock: '1',
        isDigital: false,
        tags: ''
    });

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        const intervalId = window.setInterval(fetchProducts, 30000);
        return () => window.clearInterval(intervalId);
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await getCategories();
            if (res.success) setCategories(res.data.categories || []);
        } catch (e) {
            console.error('Failed to fetch categories:', e);
        }
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await getMyProducts();
            if (response.success) {
                setProducts(response.data.products || []);
                const requestsResponse = await getMyRequests();
                if (requestsResponse.success) {
                    setPendingRequests(
                        (requestsResponse.data.requests || []).filter((r) => r.status === 'pending')
                    );
                }
            } else {
                toast.error('Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const resetArtworkForm = () => {
        setNewArtwork({
            title: '',
            description: '',
            price: '',
            category: '',
            stock: '1',
            isDigital: false,
            tags: ''
        });
        setNewArtworkImages([]);
    };

    const getRequestTitle = (request: any) => {
        if (request?.actionType === 'create_product') return request?.data?.title || 'Untitled Product';
        if (request?.actionType === 'edit_product') return request?.productId?.title || request?.data?.changes?.title || 'Product Edit Request';
        if (request?.actionType === 'delete_product') return request?.productId?.title || request?.data?.productTitle || 'Product Delete Request';
        return 'Product Request';
    };

    const getRequestPrice = (request: any) => {
        if (request?.actionType === 'create_product') return Number(request?.data?.price || 0);
        if (request?.actionType === 'edit_product') return Number(request?.data?.changes?.price || 0);
        return 0;
    };

    const handleAddArtwork = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!localStorage.getItem('token')) {
            toast.error('Session expired. Please login again.');
            navigate('/login');
            return;
        }

        if (newArtworkImages.length === 0) {
            toast.error('Please upload at least one image');
            return;
        }

        setSubmittingArtwork(true);
        try {
            const formData = new FormData();
            formData.append('title', newArtwork.title);
            formData.append('description', newArtwork.description);
            formData.append('price', newArtwork.price);
            formData.append('category', newArtwork.category);
            formData.append('stock', newArtwork.stock);
            formData.append('isDigital', String(newArtwork.isDigital));
            formData.append('tags', newArtwork.tags);

            newArtworkImages.forEach((image) => {
                formData.append('images', image);
            });

            const response = await createProduct(formData);
            if (response.success) {
                toast.success('Artwork submitted for admin review');
                setIsAddModalOpen(false);
                resetArtworkForm();
                fetchProducts();
            } else {
                toast.error(response.message || 'Failed to submit artwork');
            }
        } catch (error: any) {
            const message = error.message || 'Failed to submit artwork';
            toast.error(message);
            if (
                /access token|authentication|required|expired|unauthorized/i.test(message)
            ) {
                navigate('/login');
            }
        } finally {
            setSubmittingArtwork(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredPendingRequests = pendingRequests.filter((request) => {
        const title = getRequestTitle(request);
        return title.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight">My Artworks</h2>
                <Button className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0" onClick={() => setIsAddModalOpen(true)}>
                    <ImagePlus className="mr-2 h-4 w-4" /> Add New Artwork
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>All Products</CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search artworks..."
                                    className="pl-8"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span>Loading products...</span>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredPendingRequests.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-gray-700">Pending Requests</p>
                                    {filteredPendingRequests.map((request) => (
                                        <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50/30">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                                                    <img
                                                        src={request.images?.[0]?.url || request.productId?.images?.[0]?.url || '/placeholder.jpg'}
                                                        alt={getRequestTitle(request)}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{getRequestTitle(request)}</h3>
                                                    {getRequestPrice(request) > 0 && (
                                                        <p className="text-sm text-gray-500">Rs {getRequestPrice(request).toLocaleString()}</p>
                                                    )}
                                                    <p className="text-xs text-gray-500 capitalize">{request.actionType?.replace('_', ' ')}</p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">pending approval</Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {filteredProducts.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No approved products found</p>
                                    {pendingRequests.length > 0 && (
                                        <p className="mt-2 text-sm">
                                            You have {pendingRequests.length} pending product request(s) waiting for admin approval.
                                        </p>
                                    )}
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <div key={product._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 bg-gray-200 rounded-md overflow-hidden">
                                                <img
                                                    src={product.images?.[0]?.url || '/placeholder.jpg'}
                                                    alt={product.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">{product.title}</h3>
                                                <p className="text-sm text-gray-500">Rs {product.price.toLocaleString()}</p>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center"><Eye className="w-3 h-3 mr-1" /> {product.stats?.views || 0}</span>
                                                    <span className="flex items-center"><ShoppingBag className="w-3 h-3 mr-1" /> {product.stats?.bookings || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={product.verification?.status === 'approved' ? 'default' : product.verification?.status === 'pending' ? 'secondary' : 'destructive'}>
                                                {product.verification?.status || 'pending'}
                                            </Badge>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="w-4 h-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                setIsAddModalOpen(open);
                if (!open) resetArtworkForm();
            }}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Submit New Artwork</DialogTitle>
                        <DialogDescription>
                            Your artwork will be submitted for admin review before going live.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddArtwork} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <Input
                                    required
                                    value={newArtwork.title}
                                    onChange={(e) => setNewArtwork((prev) => ({ ...prev, title: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newArtwork.category}
                                    onChange={(e) => setNewArtwork((prev) => ({ ...prev, category: e.target.value }))}
                                    required
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category.slug}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea
                                className="w-full p-2 border rounded-md min-h-[100px]"
                                minLength={20}
                                value={newArtwork.description}
                                onChange={(e) => setNewArtwork((prev) => ({ ...prev, description: e.target.value }))}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Price (Rs)</label>
                                <Input
                                    type="number"
                                    min="1"
                                    required
                                    value={newArtwork.price}
                                    onChange={(e) => setNewArtwork((prev) => ({ ...prev, price: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Stock</label>
                                <Input
                                    type="number"
                                    min="1"
                                    required
                                    value={newArtwork.stock}
                                    onChange={(e) => setNewArtwork((prev) => ({ ...prev, stock: e.target.value }))}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-7">
                                <input
                                    id="vendor-is-digital"
                                    type="checkbox"
                                    checked={newArtwork.isDigital}
                                    onChange={(e) => setNewArtwork((prev) => ({ ...prev, isDigital: e.target.checked }))}
                                />
                                <label htmlFor="vendor-is-digital" className="text-sm">Digital Product</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                            <Input
                                value={newArtwork.tags}
                                onChange={(e) => setNewArtwork((prev) => ({ ...prev, tags: e.target.value }))}
                                placeholder="art, painting, abstract"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Images (1-5)</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="w-full p-2 border rounded-md"
                                onChange={(e) => setNewArtworkImages(Array.from(e.target.files || []))}
                                required
                            />
                            {newArtworkImages.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">{newArtworkImages.length} image(s) selected</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0" disabled={submittingArtwork}>
                                {submittingArtwork ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Submit for Review
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
export function VendorOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        completed: 0
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getArtistOrders();
            if (response.success) {
                const orderData = response.data.orders || [];
                setOrders(orderData);
                
                // Calculate stats
                const total = orderData.length;
                const pending = orderData.filter(order => order.status === 'pending').length;
                const completed = orderData.filter(order => order.status === 'delivered').length;
                
                setStats({ total, pending, completed });
            } else {
                toast.error('Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Orders</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-yellow-600">{stats.pending}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Completed</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{stats.completed}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span>Loading orders...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3">Order ID</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Item</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-muted-foreground">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order._id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium">{order._id.slice(-8)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-3 h-3 text-gray-400" /> {order.user?.username || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{order.items?.[0]?.title || 'N/A'}</td>
                                                <td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3 font-medium">₹{order.total?.toLocaleString() || '0'}</td>
                                                <td className="px-4 py-3">
                                                    <Badge variant={
                                                        order.status === 'pending' ? 'secondary' :
                                                            order.status === 'processing' ? 'outline' :
                                                                order.status === 'delivered' ? 'default' : 'destructive'
                                                    } className={
                                                        order.status === 'delivered' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''
                                                    }>
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>Details</Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Received Order {selectedOrder?._id?.slice(-8)}</DialogTitle>
                        <DialogDescription>
                            Status: {selectedOrder?.status} • {selectedOrder?.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : ''}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="rounded border p-3">
                                <p className="font-medium mb-1">Customer</p>
                                <p className="text-sm text-gray-600">{selectedOrder.user?.username || 'N/A'} ({selectedOrder.user?.email || 'N/A'})</p>
                            </div>
                            <div className="rounded border p-3">
                                <p className="font-medium mb-2">Items</p>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item) => (
                                        <div key={`${item.product}-${item.title}`} className="flex justify-between text-sm">
                                            <span>{item.title} x{item.quantity}</span>
                                            <span>₹{(item.subtotal || (item.price * item.quantity)).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="rounded border p-3">
                                <p className="font-medium mb-1">Shipping</p>
                                <p className="text-sm text-gray-600">
                                    {selectedOrder.shippingAddress?.fullName}, {selectedOrder.shippingAddress?.phone}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}
                                </p>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>₹{Number(selectedOrder.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export function VendorEarnings() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [earnings, setEarnings] = useState({
        total: 0,
        pending: 0,
        thisMonth: 0,
        lastMonth: 0,
        growth: 0
    });

    useEffect(() => {
        fetchEarningsData();
    }, []);

    const fetchEarningsData = async () => {
        try {
            setLoading(true);
            const response = await getArtistOrders();
            if (response.success) {
                const orderData = response.data.orders || [];
                setOrders(orderData);
                calculateEarnings(orderData);
            } else {
                toast.error('Failed to fetch earnings data');
            }
        } catch (error) {
            console.error('Error fetching earnings data:', error);
            toast.error('Failed to fetch earnings data');
        } finally {
            setLoading(false);
        }
    };

    const calculateEarnings = (orderData) => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

        let total = 0;
        let pending = 0;
        let thisMonthEarnings = 0;
        let lastMonthEarnings = 0;

        orderData.forEach(order => {
            if (order.status === 'delivered') {
                // Calculate artist's share (assuming 80% after platform fee)
                const artistShare = order.total * 0.8;
                total += artistShare;

                const orderDate = new Date(order.createdAt);
                if (orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear) {
                    thisMonthEarnings += artistShare;
                } else if (orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear) {
                    lastMonthEarnings += artistShare;
                }
            } else if (order.status === 'confirmed' || order.status === 'processing' || order.status === 'shipped') {
                pending += order.total * 0.8;
            }
        });

        const growth = lastMonthEarnings > 0 ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 : 0;

        setEarnings({
            total,
            pending,
            thisMonth: thisMonthEarnings,
            lastMonth: lastMonthEarnings,
            growth
        });
    };

    const earningData = [
        { month: 'Jan', revenue: 6500, commission: 1625 },
        { month: 'Feb', revenue: 7800, commission: 1950 },
        { month: 'Mar', revenue: 9200, commission: 2300 },
        { month: 'Apr', revenue: 8500, commission: 2125 },
        { month: 'May', revenue: 11000, commission: 2750 },
        { month: 'Jun', revenue: earnings.thisMonth, commission: earnings.thisMonth * 0.25 }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Earnings & Payouts</h2>
                <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export Report
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading earnings data...</span>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-green-50 border-green-100">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-green-800">Total Earnings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-900">₹{earnings.total.toLocaleString()}</div>
                                <p className="text-xs text-green-600 mt-1">Lifetime earnings</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Pending Payout</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">₹{earnings.pending.toLocaleString()}</div>
                                <p className="text-xs text-muted-foreground mt-1">Scheduled for next payout</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">This Month</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">₹{earnings.thisMonth.toLocaleString()}</div>
                                <p className={`text-xs mt-1 flex items-center ${earnings.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    <TrendingUp className="w-3 h-3 mr-1" /> {earnings.growth >= 0 ? '+' : ''}{earnings.growth.toFixed(1)}% vs last month
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Revenue vs Commission</CardTitle>
                            <CardDescription>Monthly breakdown of your earnings and platform fees</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={earningData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="revenue" name="Net Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="commission" name="Platform Fee" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

export function VendorCustomers() {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
            <Card>
                <CardContent className="py-20 text-center">
                    <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Customer Insights</h3>
                    <p className="text-gray-500">This feature will show repeat buyers and demographics.</p>
                </CardContent>
            </Card>
        </div>
    );
}

