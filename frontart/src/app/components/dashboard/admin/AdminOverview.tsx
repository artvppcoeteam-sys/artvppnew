import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Users, Store, DollarSign, Activity, TrendingUp, UserPlus, ShoppingCart, Clock, AlertCircle, ArrowUpRight, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Badge } from '../../ui/badge';
import { ScrollArea } from '../../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { useNavigate } from 'react-router-dom';
import { adminGetAllOrders, getAllUsers, adminGetPendingRequests } from '../../../utils/api';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}`;

const formatRelativeTime = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg">
      <p className="text-sm font-semibold mb-2">{label}</p>
      {payload.map((p: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-xs mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-600 capitalize">{p.name}:</span>
          <span className="font-medium">{typeof p.value === 'number' && p.name !== 'users' && p.name !== 'vendors' ? formatCurrency(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export function AdminOverview() {
  const [timeRange, setTimeRange] = useState('6m');
  const [chartType, setChartType] = useState('line');
  const [activeMetrics, setActiveMetrics] = useState(['revenue', 'commission']);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        const [usersRes, ordersRes, requestsRes] = await Promise.allSettled([
          getAllUsers(),
          adminGetAllOrders({ limit: 500 }),
          adminGetPendingRequests()
        ]);

        if (usersRes.status === 'fulfilled' && usersRes.value?.success) {
          setUsers(usersRes.value.data?.users || []);
        } else {
          setUsers([]);
        }

        if (ordersRes.status === 'fulfilled' && ordersRes.value?.success) {
          setOrders(ordersRes.value.data?.orders || []);
        } else {
          setOrders([]);
        }

        if (requestsRes.status === 'fulfilled' && requestsRes.value?.success) {
          setPendingRequests(requestsRes.value.data?.requests || []);
        } else {
          setPendingRequests([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  const nonCancelledOrders = useMemo(() => orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded'), [orders]);
  const totalRevenue = useMemo(() => nonCancelledOrders.reduce((sum, o) => sum + Number(o.total || 0), 0), [nonCancelledOrders]);
  const commission = useMemo(() => totalRevenue * 0.2, [totalRevenue]);
  const activeVendors = useMemo(() => users.filter((u) => ['artist', 'vendor'].includes(u.role) && u.isActive !== false).length, [users]);
  const totalUsers = users.length;

  const recentActivity = useMemo(() => {
    const orderActivity = nonCancelledOrders.slice(0, 6).map((o: any) => ({
      id: `order-${o._id}`,
      user: o.shippingAddress?.fullName || o.user?.username || 'Customer',
      action: `placed order ${o.orderNumber || o._id?.slice(-8)}`,
      time: formatRelativeTime(new Date(o.createdAt)),
      createdAt: new Date(o.createdAt).getTime()
    }));

    const userActivity = users
      .filter((u: any) => u.createdAt)
      .slice(0, 6)
      .map((u: any) => ({
        id: `user-${u._id}`,
        user: u.username || 'User',
        action: `registered as ${u.role}`,
        time: formatRelativeTime(new Date(u.createdAt)),
        createdAt: new Date(u.createdAt).getTime()
      }));

    return [...orderActivity, ...userActivity].sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
  }, [nonCancelledOrders, users]);

  const topVendors = useMemo(() => {
    const userMap = new Map(users.map((u: any) => [u._id, u]));
    const byVendor = new Map<string, { revenue: number; orders: number }>();

    nonCancelledOrders.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const artistId = String(item.artist || '');
        if (!artistId) return;
        const current = byVendor.get(artistId) || { revenue: 0, orders: 0 };
        current.revenue += Number(item.subtotal || item.price * item.quantity || 0);
        current.orders += 1;
        byVendor.set(artistId, current);
      });
    });

    return Array.from(byVendor.entries())
      .map(([artistId, stats]) => ({
        name: userMap.get(artistId)?.username || 'Vendor',
        sales: formatCurrency(stats.revenue),
        orders: stats.orders,
        status: stats.orders > 20 ? 'Trending' : stats.orders > 8 ? 'Stable' : 'Rising',
        revenue: stats.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [nonCancelledOrders, users]);

  const seriesData = useMemo(() => {
    if (timeRange === '6m') {
      const months = Array.from({ length: 6 }).map((_, idx) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - idx));
        d.setDate(1);
        return d;
      });
      const data = months.map((d) => ({
        key: monthKey(d),
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        revenue: 0,
        commission: 0,
        vendors: 0,
        users: 0
      }));
      const index = new Map(data.map((row, i) => [row.key, i]));

      nonCancelledOrders.forEach((o: any) => {
        const d = new Date(o.createdAt);
        const idx = index.get(monthKey(d));
        if (idx !== undefined) {
          data[idx].revenue += Number(o.total || 0);
          data[idx].commission += Number(o.total || 0) * 0.2;
        }
      });

      data.forEach((row, idx) => {
        const monthDate = months[idx];
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
        row.users = users.filter((u: any) => u.createdAt && new Date(u.createdAt) <= monthEnd).length;
        row.vendors = users.filter((u: any) => ['artist', 'vendor'].includes(u.role) && u.createdAt && new Date(u.createdAt) <= monthEnd).length;
      });

      return data;
    }

    const days = timeRange === '7d' ? 7 : 30;
    const data = Array.from({ length: days + 1 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - i));
      return {
        key: d.toISOString().slice(0, 10),
        name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: 0,
        commission: 0,
        vendors: activeVendors,
        users: totalUsers
      };
    });
    const index = new Map(data.map((row, i) => [row.key, i]));
    nonCancelledOrders.forEach((o: any) => {
      const d = new Date(o.createdAt).toISOString().slice(0, 10);
      const idx = index.get(d);
      if (idx !== undefined) {
        data[idx].revenue += Number(o.total || 0);
        data[idx].commission += Number(o.total || 0) * 0.2;
      }
    });
    return data;
  }, [timeRange, nonCancelledOrders, users, activeVendors, totalUsers]);

  const userDistribution = useMemo(() => {
    const vendors = users.filter((u: any) => ['artist', 'vendor'].includes(u.role)).length;
    const customers = users.filter((u: any) => u.role === 'user').length;
    return [
      { name: 'Customers', value: customers, color: '#FF8042' },
      { name: 'Vendors', value: vendors, color: '#8884d8' }
    ];
  }, [users]);

  const pendingOrders = orders.filter((o) => ['pending', 'confirmed', 'processing'].includes(o.status)).length;
  const newUsers7d = users.filter((u: any) => u.createdAt && Date.now() - new Date(u.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length;

  const toggleMetric = (metric: string) => {
    setActiveMetrics((prev) => (prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]));
  };

  const renderChart = () => {
    const commonProps = {
      data: seriesData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 }
    };

    const renderLines = () => (
      <>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {activeMetrics.includes('revenue') && <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} name="revenue" />}
        {activeMetrics.includes('commission') && <Line type="monotone" dataKey="commission" stroke="#3b82f6" strokeWidth={3} dot={{ r: 3 }} name="commission" />}
        {activeMetrics.includes('vendors') && <Line type="monotone" dataKey="vendors" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} name="vendors" />}
        {activeMetrics.includes('users') && <Line type="monotone" dataKey="users" stroke="#f97316" strokeWidth={3} dot={{ r: 3 }} name="users" />}
      </>
    );

    const renderAreas = () => (
      <>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {activeMetrics.includes('revenue') && <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="revenue" />}
        {activeMetrics.includes('commission') && <Area type="monotone" dataKey="commission" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCommission)" name="commission" />}
      </>
    );

    const renderBars = () => (
      <>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {activeMetrics.includes('revenue') && <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} name="revenue" />}
        {activeMetrics.includes('commission') && <Bar dataKey="commission" fill="#3b82f6" radius={[4, 4, 0, 0]} name="commission" />}
      </>
    );

    if (chartType === 'area') return <AreaChart {...commonProps}>{renderAreas()}</AreaChart>;
    if (chartType === 'bar') return <BarChart {...commonProps}>{renderBars()}</BarChart>;
    return <LineChart {...commonProps}>{renderLines()}</LineChart>;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-white border-green-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer" onClick={() => toggleMetric('revenue')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> From live order data
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer" onClick={() => toggleMetric('commission')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Platform Commission</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(commission)}</div>
            <p className="text-xs text-blue-600 mt-1">20% platform fee</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer" onClick={() => toggleMetric('vendors')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Active Vendors</CardTitle>
            <Store className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{activeVendors}</div>
            <p className="text-xs text-purple-600 mt-1">From user accounts</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-100 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer" onClick={() => toggleMetric('users')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total Users</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{totalUsers}</div>
            <p className="text-xs text-orange-600 mt-1 flex items-center">
              <UserPlus className="w-3 h-3 mr-1" /> +{newUsers7d} new in 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-t-4 border-t-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Platform Performance</CardTitle>
                <CardDescription>Live metrics overview</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Tabs value={chartType} onValueChange={setChartType} className="h-8">
                  <TabsList className="h-8">
                    <TabsTrigger value="line" className="h-6 px-2"><LineChartIcon className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="bar" className="h-6 px-2"><BarChart3 className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="area" className="h-6 px-2"><Activity className="w-4 h-4" /></TabsTrigger>
                  </TabsList>
                </Tabs>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px] h-8">
                    <Calendar className="w-3.5 h-3.5 mr-2 opacity-50" />
                    <SelectValue placeholder="Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="h-[400px]">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-500">Loading overview data...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-gray-500" />
                  User Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[250px] flex flex-col items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={userDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
                <CardDescription>From live order items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topVendors.length === 0 ? (
                    <p className="text-sm text-gray-500">No vendor sales data available.</p>
                  ) : topVendors.map((vendor, i) => (
                    <div key={`${vendor.name}-${i}`} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded-md transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold text-sm">{i + 1}</div>
                        <div>
                          <p className="text-sm font-medium">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">{vendor.orders} Orders</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">{vendor.sales}</p>
                        <Badge variant="secondary" className="text-[10px] h-5 bg-gray-100 text-gray-700">{vendor.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md border-l-4 border-l-orange-500 overflow-hidden">
            <CardHeader className="bg-orange-50/30 pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Pending Actions
              </CardTitle>
              <CardDescription>Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="block group cursor-pointer" onClick={() => navigate('/dashboard/admin/artworks')}>
                <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-full text-orange-600"><Store className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Product Requests</p>
                      <p className="text-xs text-gray-500">Pending admin review</p>
                    </div>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">{pendingRequests.length}</Badge>
                </div>
              </div>

              <div className="block group cursor-pointer" onClick={() => navigate('/dashboard/admin/orders?filter=pending')}>
                <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm group-hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600"><ShoppingCart className="w-4 h-4" /></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Pending Orders</p>
                      <p className="text-xs text-gray-500">Awaiting processing</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">{pendingOrders}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-6">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-gray-500">No recent activity yet.</p>
                  ) : recentActivity.map((activity) => (
                    <div key={activity.id} className="relative pl-6 pb-2 border-l border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors p-2 rounded-r-lg group">
                      <div className="absolute -left-[5px] top-3 w-2.5 h-2.5 rounded-full bg-gray-200 ring-4 ring-white group-hover:bg-yellow-400 transition-colors" />
                      <div className="flex flex-col gap-1">
                        <p className="text-sm text-gray-800">
                          <span className="font-semibold">{activity.user}</span> {activity.action}
                        </p>
                        <span className="text-xs text-gray-400">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
