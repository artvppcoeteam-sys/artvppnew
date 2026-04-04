import { useState } from 'react';
import {
  Package, ShoppingBag, DollarSign, TrendingUp, Plus, Edit, Trash2,
  Eye, Heart, Wallet, Download, Search, Filter, AlertCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  vendorAnalyticsData,
  vendorProducts,
  vendorOrders,
  vendorPayouts
} from '../../data/mockData';
import { AddProductModal } from '../modals/AddProductModal';
import { EditProductModal } from '../modals/EditProductModal';
import { OrderDetailsModal } from '../modals/OrderDetailsModal';
import { toast } from 'sonner';

interface EnhancedVendorDashboardProps {
  onNavigate: (page: string) => void;
}

export function EnhancedVendorDashboard({ onNavigate }: EnhancedVendorDashboardProps) {
  const [addProductModalOpen, setAddProductModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Calculate stats
  const totalRevenue = vendorOrders.reduce((sum, order) => sum + order.amount, 0);
  const totalSold = vendorProducts.reduce((sum, product) => sum + product.sold, 0);
  const activeListings = vendorProducts.filter(p => p.status === 'active').length;
  const pendingOrders = vendorOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
  const pendingPayout = vendorPayouts.find(p => p.status === 'pending');

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${(totalRevenue / 1000).toFixed(0)}K`,
      change: '+15.2%',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Products Sold',
      value: totalSold.toString(),
      change: '+12.5%',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      label: 'Active Listings',
      value: activeListings.toString(),
      change: `${vendorProducts.length} total`,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      label: 'Pending Orders',
      value: pendingOrders.toString(),
      change: 'Requires action',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'sold out': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddProduct = (data: any) => {
    toast.success('Product added successfully!');
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setEditProductModalOpen(true);
  };

  const handleUpdateProduct = (data: any) => {
    toast.success('Product updated successfully!');
  };

  const handleDeleteProduct = (productId: string) => {
    toast.error('Product deleted');
  };

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setOrderModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back, Meera! Manage your art gallery and track sales</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <div className={`p - 2 rounded - lg ${stat.bgColor} `}>
                  <stat.icon className={`h - 5 w - 5 ${stat.color} `} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl mb-1">{stat.value}</div>
                <p className="text-xs text-gray-600">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pending Payout Alert */}
        {pendingPayout && (
          <Card className="mb-8 border-[#a73f2b] bg-gradient-to-r from-orange-50 to-white">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Payout Ready</h3>
                  <p className="text-sm text-gray-600">
                    ₹{pendingPayout.amount.toLocaleString()} available for withdrawal ({pendingPayout.period})
                  </p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white rounded-[10px] shadow-sm hover:shadow-md transition-all duration-250">
                <Download className="w-4 h-4 mr-2" />
                Request Payout
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Revenue and orders over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={vendorAnalyticsData.salesByMonth}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a73f2b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a73f2b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#a73f2b"
                    fillOpacity={1}
                    fill="url(#colorSales)"
                    name="Sales (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Product Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Top selling products by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={vendorAnalyticsData.productPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#a73f2b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Revenue by Category */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Sales breakdown by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vendorAnalyticsData.revenueByCategory.map((category, index) => {
                const total = vendorAnalyticsData.revenueByCategory.reduce((sum, cat) => sum + cat.value, 0);
                const percentage = (category.value / total * 100).toFixed(1);
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-gray-600">
                        ₹{category.value.toLocaleString()} ({percentage}%)
                      </span>
                    </div>
                    <Progress value={parseFloat(percentage)} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>My Products</CardTitle>
                    <CardDescription>Manage your artwork listings</CardDescription>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white rounded-[10px] shadow-sm hover:shadow-md transition-all duration-250"
                    onClick={() => setAddProductModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input placeholder="Search products..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Sold</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Likes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={product.image} alt={product.name} />
                              <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>₹{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={product.stock === 0 ? 'text-red-600 font-medium' : ''}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>{product.sold}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 text-gray-400" />
                            {product.reviews}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-red-400" />
                            {(product as any).likes || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(product.status)}>
                            {product.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Track and fulfill customer orders</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Search orders..." className="w-64" />
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Tracking</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{order.product}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          {order.id ? (
                            <span className="text-xs text-blue-600">TRK-{order.id}</span>
                          ) : (
                            <span className="text-xs text-gray-400">Not Shipped</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payouts Tab */}
          <TabsContent value="payouts">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <CardDescription>Track your earnings and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 mb-1">Total Earned</p>
                      <p className="text-2xl font-semibold text-green-900">
                        ₹{vendorPayouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-800 mb-1">Pending Payout</p>
                      <p className="text-2xl font-semibold text-yellow-900">
                        ₹{pendingPayout?.amount.toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-1">Next Payout</p>
                      <p className="text-2xl font-semibold text-blue-900">Feb 15</p>
                    </div>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payout ID</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vendorPayouts.map((payout) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium">{payout.id}</TableCell>
                        <TableCell>{payout.period}</TableCell>
                        <TableCell>{(payout as any).ordersCount || 0} orders</TableCell>
                        <TableCell className="font-semibold">₹{payout.amount.toLocaleString()}</TableCell>
                        <TableCell>Transaction success</TableCell>
                        <TableCell>UPI/Bank</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(payout.status)}>
                            {payout.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid gap-6">
              {/* Profile Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your artist profile and gallery</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="artist-name">Artist Name</Label>
                        <Input id="artist-name" defaultValue="Meera Kapoor" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue="meera@example.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialty">Specialty</Label>
                      <Input id="specialty" defaultValue="Abstract & Contemporary Art" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Artist Bio</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        defaultValue="Contemporary abstract artist specializing in vibrant color palettes and emotional expression through geometric forms."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="portfolio">Portfolio URL</Label>
                      <Input id="portfolio" defaultValue="https://meerakapoor.art" />
                    </div>
                    <Button className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white rounded-[10px] shadow-sm hover:shadow-md transition-all duration-250">
                      Save Changes
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Payment Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Manage how you receive payments</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">Bank Name</Label>
                      <Input id="bank-name" defaultValue="HDFC Bank" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input id="account-number" defaultValue="****6789" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ifsc">IFSC Code</Label>
                        <Input id="ifsc" defaultValue="HDFC0001234" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="upi">UPI ID</Label>
                      <Input id="upi" defaultValue="meera@okhdfc" />
                    </div>
                    <Button variant="outline">Update Payment Details</Button>
                  </form>
                </CardContent>
              </Card>

              {/* Store Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Settings</CardTitle>
                  <CardDescription>Configure your gallery preferences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Accept Custom Commissions</p>
                        <p className="text-sm text-gray-600">Allow customers to request custom artwork</p>
                      </div>
                      <Button variant="outline" size="sm">Enabled</Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Vacation Mode</p>
                        <p className="text-sm text-gray-600">Temporarily pause all sales</p>
                      </div>
                      <Button variant="outline" size="sm">Disabled</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddProductModal
        open={addProductModalOpen}
        onClose={() => setAddProductModalOpen(false)}
        onSubmit={handleAddProduct}
      />
      <EditProductModal
        open={editProductModalOpen}
        onClose={() => setEditProductModalOpen(false)}
        product={selectedProduct}
        onSubmit={handleUpdateProduct}
      />
      <OrderDetailsModal
        open={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  );
}
