import { useState } from 'react';
import { Package, Search, Filter, ChevronRight, Truck, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useApp } from '../../context/AppContext';

export function MyOrders() {
    const { orders } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };

    const filteredOrders = orders.filter(order =>
        order.items.some(item => item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Helper to render tracking steps
    const renderTrackingSteps = (status: string) => {
        const steps = ['Placed', 'Processing', 'Shipped', 'Delivered'];
        const currentStepIndex = steps.indexOf(status);

        // If cancelled, show a different UI
        if (status === 'Cancelled') return null;

        return (
            <div className="flex items-center w-full mt-4 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-10 transform -translate-y-1/2"></div>
                <div
                    className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] -z-10 transform -translate-y-1/2 transition-all duration-500"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    return (
                        <div key={step} className="flex-1 flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${isCompleted ? 'bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)]' : 'bg-gray-300'} ring-4 ring-white`}></div>
                            <span className={`text-[10px] mt-1 font-medium ${isCurrent ? 'text-[#a73f2b]' : 'text-gray-400'}`}>{step}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header & Search */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search your orders..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filter
                </Button>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-gray-900 font-medium">No orders found</h3>
                        <p className="text-sm text-gray-500">Go shopping to see your orders here!</p>
                        <Button variant="link" className="text-[#a73f2b] mt-2">Start Shopping</Button>
                    </div>
                ) : (
                    filteredOrders.map((order) => (
                        <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer group overflow-hidden">
                            <CardContent className="p-0">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center text-sm border-b">
                                    <div className="flex gap-4">
                                        <div>
                                            <span className="text-gray-500 block text-xs uppercase tracking-wider">Order Placed</span>
                                            <span className="font-medium text-gray-900">{order.date}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs uppercase tracking-wider">Total</span>
                                            <span className="font-medium text-gray-900">₹{order.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-gray-500 block text-xs uppercase tracking-wider">Order # {order.id}</span>
                                        <Button variant="link" className="h-auto p-0 text-[#a73f2b] text-xs">View Invoice</Button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Order Items Image (Show first item) */}
                                        <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border">
                                            <img src={order.items[0]?.image} alt={order.items[0]?.title} className="w-full h-full object-cover" />
                                        </div>

                                        {/* Order Details */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-semibold text-lg text-gray-900">{order.items[0]?.title}</h3>
                                                    {order.items.length > 1 && (
                                                        <p className="text-sm text-gray-500">and {order.items.length - 1} other item(s)</p>
                                                    )}
                                                    <p className="text-sm text-gray-500 mt-1">Status: <span className={`font-medium ${order.status === 'Delivered' ? 'text-green-600' : 'text-[#a73f2b]'}`}>{order.status}</span></p>

                                                    {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> Arriving by {order.deliveryDate}
                                                        </p>
                                                    )}
                                                </div>
                                                <Button className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white text-sm px-4">Track Package</Button>
                                            </div>

                                            {/* Tracking Progress Bar */}
                                            {renderTrackingSteps(order.status)}
                                            <div className="mt-4">
                                                <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Order {selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            Placed on {selectedOrder?.date} • Status: {selectedOrder?.status}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-4">
                            <div className="rounded border p-3">
                                <p className="font-medium mb-1">Shipping</p>
                                <p className="text-sm text-gray-600">
                                    {selectedOrder.shippingInfo?.fullName}, {selectedOrder.shippingInfo?.phone}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {selectedOrder.shippingInfo?.address}, {selectedOrder.shippingInfo?.city}, {selectedOrder.shippingInfo?.state} - {selectedOrder.shippingInfo?.pincode}
                                </p>
                            </div>
                            <div className="rounded border p-3">
                                <p className="font-medium mb-2">Items</p>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item: any) => (
                                        <div key={`${item.id}-${item.title}`} className="flex justify-between text-sm">
                                            <span>{item.title} x{item.quantity}</span>
                                            <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>₹{selectedOrder.total.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
