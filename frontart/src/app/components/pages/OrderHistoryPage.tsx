import { useState } from 'react';
import { Package, Truck, CheckCircle, XCircle, Clock, Eye, Download, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '2024-02-05',
    status: 'delivered',
    total: 12500,
    items: 2,
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100',
    products: ['Abstract Wall Art', 'Modern Sculpture'],
    trackingNumber: 'TRACK123456',
    estimatedDelivery: '2024-02-10',
    address: '123 MG Road, Bangalore, Karnataka - 560001'
  },
  {
    id: 'ORD-2024-002',
    date: '2024-02-03',
    status: 'shipped',
    total: 8900,
    items: 1,
    image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=100',
    products: ['Canvas Print'],
    trackingNumber: 'TRACK123457',
    estimatedDelivery: '2024-02-09',
    address: '123 MG Road, Bangalore, Karnataka - 560001'
  },
  {
    id: 'ORD-2024-003',
    date: '2024-02-01',
    status: 'processing',
    total: 15600,
    items: 3,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100',
    products: ['Oil Painting', 'Frame Set', 'Art Book'],
    trackingNumber: '',
    estimatedDelivery: '2024-02-12',
    address: '123 MG Road, Bangalore, Karnataka - 560001'
  },
  {
    id: 'ORD-2024-004',
    date: '2024-01-28',
    status: 'cancelled',
    total: 5400,
    items: 1,
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100',
    products: ['Ceramic Vase'],
    trackingNumber: '',
    estimatedDelivery: '',
    address: '123 MG Road, Bangalore, Karnataka - 560001'
  }
];

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [selectedTab, setSelectedTab] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-blue-600" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const filterOrders = (status: string) => {
    if (status === 'all') return mockOrders;
    return mockOrders.filter(order => order.status === status);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your orders</CardDescription>
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

  const currentOrders = filterOrders(selectedTab);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold">{mockOrders.length}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Delivered</p>
                  <p className="text-2xl font-bold text-green-600">
                    {mockOrders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">In Transit</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {mockOrders.filter(o => o.status === 'shipped').length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-[#a73f2b]">
                    ₹{(mockOrders.reduce((sum, o) => sum + o.total, 0) / 1000).toFixed(1)}K
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="processing">Processing</TabsTrigger>
                <TabsTrigger value="shipped">Shipped</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-6">
                <div className="space-y-4">
                  {currentOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                      <p className="text-gray-600 mb-6">
                        {selectedTab === 'all'
                          ? "You haven't placed any orders yet"
                          : `No ${selectedTab} orders found`
                        }
                      </p>
                      <Button onClick={() => navigate('/marketplace')} className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:bg-[#B8941F]">
                        Start Shopping
                      </Button>
                    </div>
                  ) : (
                    currentOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          {/* Left: Order Info */}
                          <div className="flex gap-4 flex-1">
                            <img
                              src={order.image}
                              alt="Product"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-lg">{order.id}</h3>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(order.date).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  {order.items} {order.items === 1 ? 'item' : 'items'}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {order.products.join(', ')}
                              </p>
                              {order.trackingNumber && (
                                <p className="text-xs text-gray-500">
                                  Tracking: {order.trackingNumber}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-xl font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="w-4 h-4" />
                                View Details
                              </Button>
                              {order.status === 'delivered' && (
                                <Button variant="outline" size="sm" className="gap-2">
                                  <Download className="w-4 h-4" />
                                  Invoice
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Progress (for active orders) */}
                        {(order.status === 'processing' || order.status === 'shipped') && (
                          <div className="mt-6 pt-6 border-t">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700">Order Status</p>
                              {order.estimatedDelivery && (
                                <p className="text-sm text-gray-600">
                                  Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'short'
                                  })}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 flex-1">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="flex-1 h-1 bg-green-200" />
                              </div>
                              <div className="flex items-center gap-2 flex-1">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${order.status === 'shipped' ? 'bg-blue-100' : 'bg-gray-100'
                                  }`}>
                                  <Truck className={`w-5 h-5 ${order.status === 'shipped' ? 'text-blue-600' : 'text-gray-400'
                                    }`} />
                                </div>
                                <div className={`flex-1 h-1 ${order.status === 'shipped' ? 'bg-blue-200' : 'bg-gray-200'
                                  }`} />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                                  <CheckCircle className="w-5 h-5 text-gray-400" />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between mt-2">
                              <p className="text-xs text-gray-600">Confirmed</p>
                              <p className="text-xs text-gray-600">Shipped</p>
                              <p className="text-xs text-gray-600">Delivered</p>
                            </div>
                          </div>
                        )}

                        {/* Delivery Address */}
                        {order.status !== 'cancelled' && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-start gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mt-0.5" />
                              <div>
                                <p className="font-medium text-gray-900">Delivery Address</p>
                                <p>{order.address}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-[#a73f2b]/10 to-[#a73f2b]/10">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Need Help with Your Order?</h3>
                  <p className="text-gray-600">Contact our support team for assistance</p>
                </div>
                <Button onClick={() => navigate('/contact')} className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:bg-[#B8941F]">
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
