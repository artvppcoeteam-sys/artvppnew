import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search, Check, X, Loader2 } from 'lucide-react';
import { adminApproveService, adminGetAllServices, adminRejectService } from '../../../utils/api';
import { toast } from 'sonner';

export function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');

  const fetchServices = async (status = statusFilter) => {
    try {
      setLoading(true);
      const response = await adminGetAllServices({ page: 1, limit: 200, status });
      if (response?.success) {
        setServices(response?.data?.services || []);
      } else {
        toast.error('Failed to fetch services');
      }
    } catch (error) {
      console.error('Admin services fetch error:', error);
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices(statusFilter);
  }, [statusFilter]);

  const filteredServices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return services;
    return services.filter((service) =>
      service?.title?.toLowerCase().includes(q)
      || service?.category?.toLowerCase().includes(q)
      || service?.artist?.username?.toLowerCase().includes(q)
    );
  }, [services, searchTerm]);

  const handleApprove = async (serviceId) => {
    try {
      setActingId(serviceId);
      const response = await adminApproveService(serviceId);
      if (response?.success) {
        toast.success('Service approved');
        await fetchServices(statusFilter);
      } else {
        toast.error('Failed to approve service');
      }
    } catch (error) {
      console.error('Service approve error:', error);
      toast.error(error.message || 'Failed to approve service');
    } finally {
      setActingId('');
    }
  };

  const handleReject = async (serviceId) => {
    const reason = window.prompt('Enter rejection reason') || 'Service does not meet guidelines';

    try {
      setActingId(serviceId);
      const response = await adminRejectService(serviceId, reason);
      if (response?.success) {
        toast.success('Service rejected');
        await fetchServices(statusFilter);
      } else {
        toast.error('Failed to reject service');
      }
    } catch (error) {
      console.error('Service reject error:', error);
      toast.error(error.message || 'Failed to reject service');
    } finally {
      setActingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Service Moderation</h2>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <CardTitle>Service Listings</CardTitle>
              <CardDescription>Approve or reject artist service submissions.</CardDescription>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant={statusFilter === 'pending' ? 'default' : 'outline'} onClick={() => setStatusFilter('pending')}>Pending</Button>
                <Button variant={statusFilter === 'approved' ? 'default' : 'outline'} onClick={() => setStatusFilter('approved')}>Approved</Button>
                <Button variant={statusFilter === 'rejected' ? 'default' : 'outline'} onClick={() => setStatusFilter('rejected')}>Rejected</Button>
                <Button variant={statusFilter === 'all' ? 'default' : 'outline'} onClick={() => setStatusFilter('all')}>All</Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading services...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Starting Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No services found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredServices.map((service) => (
                    <TableRow key={service._id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={service.images?.[0]?.url || '/placeholder.jpg'}
                            alt={service.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <div>
                            <p className="font-medium">{service.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{service.artist?.username || 'Unknown'}</TableCell>
                      <TableCell>{service.category}</TableCell>
                      <TableCell>Rs {Number(service.startingPrice || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={service.verification?.status === 'approved' ? 'default' : service.verification?.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {service.verification?.status || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(service.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {service.verification?.status !== 'approved' && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={actingId === service._id}
                              onClick={() => handleApprove(service._id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                          )}
                          {service.verification?.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={actingId === service._id}
                              onClick={() => handleReject(service._id)}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
