import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Search, Filter, ShoppingBag, Layers, Eye, Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import {
    adminGetAllProducts,
    adminGetAllServices,
    adminGetPendingRequests,
    adminCreateProduct,
    adminEditProduct,
    adminDeleteProduct,
    adminGetRequestDetails,
    adminApproveRequest,
    adminRejectRequest,
    getCategories
} from '../../../utils/api';
import { toast } from 'sonner';

interface AdminProductsProps {
    activeTab?: string;
}

interface PendingRequest {
    _id: string;
    actionType: 'create_product' | 'edit_product' | 'delete_product' | string;
    status: 'pending' | 'approved' | 'rejected' | string;
    artist?: { username?: string; email?: string };
    productId?: { title?: string; images?: Array<{ url: string }> };
    data?: any;
    images?: Array<{ url: string }>;
    artistNote?: string;
    adminNote?: string;
    rejectionReason?: string;
    createdAt: string;
    reviewedAt?: string;
}

export function AdminProducts({ activeTab = 'products' }: AdminProductsProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [loadingRequestDetails, setLoadingRequestDetails] = useState(false);
    const [reviewingAction, setReviewingAction] = useState<'approve' | 'reject' | null>(null);
    const [adminNote, setAdminNote] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    // Edit & Delete state
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({ title: '', description: '', price: '', stock: '', category: '', tags: '' });
    const [editImages, setEditImages] = useState<File[]>([]);
    const [editLoading, setEditLoading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [categories, setCategories] = useState<Array<{ _id: string; name: string; slug: string }>>([]);

    useEffect(() => {
        fetchData();
        const intervalId = window.setInterval(fetchData, 20000);
        return () => window.clearInterval(intervalId);
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [productsRes, servicesRes, requestsRes, categoriesRes] = await Promise.all([
                adminGetAllProducts(),
                adminGetAllServices(),
                adminGetPendingRequests(),
                getCategories()
            ]);

            if (productsRes.success) setProducts(productsRes.data.products || []);
            if (servicesRes.success) setServices(servicesRes.data.services || []);
            if (requestsRes.success) setRequests(requestsRes.data.requests || []);
            if (categoriesRes.success) setCategories(categoriesRes.data.categories || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product =>
        product.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.artist?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredServices = services.filter(service =>
        service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.artist?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRequestTitle = (request: PendingRequest) => {
        if (request.actionType === 'create_product') return request.data?.title || 'New Product';
        if (request.actionType === 'edit_product') return request.productId?.title || request.data?.changes?.title || 'Edit Product';
        if (request.actionType === 'delete_product') return request.productId?.title || request.data?.productTitle || 'Delete Product';
        return request.productId?.title || 'Product Request';
    };

    const getRequestTypeLabel = (actionType: string) => {
        switch (actionType) {
            case 'create_product':
                return 'Create';
            case 'edit_product':
                return 'Edit';
            case 'delete_product':
                return 'Delete';
            default:
                return actionType;
        }
    };

    const openRequestDetails = async (requestId: string) => {
        setRequestDialogOpen(true);
        setLoadingRequestDetails(true);
        setAdminNote('');
        setRejectionReason('');

        try {
            const response = await adminGetRequestDetails(requestId);
            if (response.success) {
                setSelectedRequest(response.data.request);
            } else {
                toast.error(response.message || 'Failed to fetch request details');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch request details');
            setRequestDialogOpen(false);
        } finally {
            setLoadingRequestDetails(false);
        }
    };

    const handleApprovePendingRequest = async (requestId: string) => {
        try {
            setReviewingAction('approve');
            const response = await adminApproveRequest(requestId, adminNote);
            if (response.success) {
                toast.success('Request approved and artist notified');
                setRequestDialogOpen(false);
                setSelectedRequest(null);
                fetchData();
            } else {
                toast.error(response.message || 'Failed to approve request');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve request');
        } finally {
            setReviewingAction(null);
        }
    };

    const handleRejectPendingRequest = async (requestId: string) => {
        try {
            setReviewingAction('reject');
            const response = await adminRejectRequest(requestId, rejectionReason, adminNote);
            if (response.success) {
                toast.success('Request rejected and artist notified');
                setRequestDialogOpen(false);
                setSelectedRequest(null);
                fetchData();
            } else {
                toast.error(response.message || 'Failed to reject request');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject request');
        } finally {
            setReviewingAction(null);
        }
    };

    const handleCreateProduct = async (formData: FormData) => {
        try {
            setCreating(true);
            const response = await adminCreateProduct(formData);
            if (response.success) {
                toast.success('Product created successfully');
                setShowAddForm(false);
                fetchData(); // Refresh the list
            } else {
                toast.error(response.message || 'Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error('Failed to create product');
        } finally {
            setCreating(false);
        }
    };

    const openEditDialog = (product: any) => {
        setEditingProduct(product);
        setEditFormData({
            title: product.title || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            stock: product.stock?.toString() || '',
            category: product.category || '',
            tags: (product.tags || []).join(', ')
        });
        setEditImages([]);
        setEditDialogOpen(true);
    };

    const handleEditProduct = async () => {
        if (!editingProduct) return;
        try {
            setEditLoading(true);
            const formData = new FormData();
            formData.append('title', editFormData.title);
            formData.append('description', editFormData.description);
            formData.append('price', editFormData.price);
            formData.append('stock', editFormData.stock);
            formData.append('category', editFormData.category);
            formData.append('tags', editFormData.tags);
            editImages.forEach((image) => {
                formData.append('images', image);
            });

            const response = await adminEditProduct(editingProduct._id, formData);
            if (response.success) {
                toast.success('Product updated successfully');
                setEditDialogOpen(false);
                setEditingProduct(null);
                fetchData();
            } else {
                toast.error(response.message || 'Failed to update product');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update product');
        } finally {
            setEditLoading(false);
        }
    };

    const openDeleteDialog = (product: any) => {
        setDeletingProduct(product);
        setDeleteDialogOpen(true);
    };

    const handleDeleteProduct = async () => {
        if (!deletingProduct) return;
        try {
            setDeleteLoading(true);
            const response = await adminDeleteProduct(deletingProduct._id);
            if (response.success) {
                toast.success('Product deleted successfully');
                setDeleteDialogOpen(false);
                setDeletingProduct(null);
                fetchData();
            } else {
                toast.error(response.message || 'Failed to delete product');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete product');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">Platform Content</h2>
            <Tabs defaultValue={activeTab}>
                <TabsList>
                    <TabsTrigger value="products">All Products ({products.length})</TabsTrigger>
                    <TabsTrigger value="services">All Services ({services.length})</TabsTrigger>
                    <TabsTrigger value="requests">Pending Requests ({requests.length})</TabsTrigger>
                </TabsList>

                {/* All Products Tab */}
                <TabsContent value="products" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Product Listings</CardTitle>
                                <div className="flex gap-2">
                                    <Button 
                                        onClick={() => setShowAddForm(!showAddForm)}
                                        className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:bg-[#B8952A]"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Product
                                    </Button>
                                    <div className="relative w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search products..." 
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </CardHeader>                        {showAddForm && (
                            <CardContent className="border-t">
                                <AddProductForm onSubmit={handleCreateProduct} loading={creating} categories={categories} />
                            </CardContent>
                        )}                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    <span>Loading products...</span>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Artist</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    No products found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProducts.map((product) => (
                                                <TableRow key={product._id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <img 
                                                                src={product.images?.[0]?.url || '/placeholder.jpg'} 
                                                                alt={product.title} 
                                                                className="w-10 h-10 rounded object-cover" 
                                                            />
                                                            <div>
                                                                <div className="font-medium">{product.displayName || product.title}</div>
                                                                {product.displayName && product.displayName !== product.title ? (
                                                                    <div className="text-xs text-muted-foreground">{product.title}</div>
                                                                ) : null}
                                                                <div className="text-sm text-muted-foreground">{product.category}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{product.artist?.username || 'Unknown'}</TableCell>
                                                    <TableCell>₹{product.price}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={product.verification?.status === 'approved' ? 'default' : 'secondary'}>
                                                            {product.verification?.status || 'pending'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(product)} title="Edit product">
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openDeleteDialog(product)} title="Delete product">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
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
                </TabsContent>

                {/* All Services Tab */}
                <TabsContent value="services" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Service Listings</CardTitle>
                                <div className="flex gap-2">
                                    <div className="relative w-64">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input 
                                            placeholder="Search services..." 
                                            className="pl-8"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <Button variant="outline" size="icon"><Filter className="w-4 h-4" /></Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    <span>Loading services...</span>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Artist</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredServices.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-8">
                                                    No services found
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
                                                                className="w-10 h-10 rounded object-cover" 
                                                            />
                                                            <div>
                                                                <div className="font-medium">{service.title}</div>
                                                                <div className="text-sm text-muted-foreground">{service.category}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{service.artist?.username || 'Unknown'}</TableCell>
                                                    <TableCell>₹{service.startingPrice}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={service.verification?.status === 'approved' ? 'default' : 'secondary'}>
                                                            {service.verification?.status || 'pending'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{new Date(service.createdAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            View
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pending Requests Tab */}
                <TabsContent value="requests" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Product Requests</CardTitle>
                            <CardDescription>Product creation/edit/delete requests from artists</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                    <span>Loading requests...</span>
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No pending requests</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Request</TableHead>
                                            <TableHead>Artist</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {requests.map((request) => (
                                            <TableRow key={request._id}>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{getRequestTitle(request)}</div>
                                                        <div className="text-sm text-muted-foreground capitalize">{request.actionType?.replace('_', ' ')}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{request.artist?.username || 'Unknown'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{getRequestTypeLabel(request.actionType)}</Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{request.status}</Badge>
                                                </TableCell>
                                                <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <Button variant="outline" size="sm" onClick={() => openRequestDetails(request._id)}>
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        Review
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Product Request</DialogTitle>
                        <DialogDescription>
                            Review artist submission and approve or reject this request.
                        </DialogDescription>
                    </DialogHeader>

                    {loadingRequestDetails ? (
                        <div className="py-8 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span>Loading request details...</span>
                        </div>
                    ) : selectedRequest ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Artist</p>
                                    <p className="font-medium">{selectedRequest.artist?.username || 'Unknown'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Type</p>
                                    <p className="font-medium">{getRequestTypeLabel(selectedRequest.actionType)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Status</p>
                                    <p className="font-medium capitalize">{selectedRequest.status}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Submitted</p>
                                    <p className="font-medium">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="rounded-md border p-3">
                                <p className="text-sm text-muted-foreground mb-1">Product</p>
                                <p className="font-medium">{getRequestTitle(selectedRequest)}</p>
                            </div>

                            {(selectedRequest.images?.length || selectedRequest.productId?.images?.length) ? (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Images</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(selectedRequest.images?.length ? selectedRequest.images : selectedRequest.productId?.images || []).map((img, index) => (
                                            <a
                                                key={`${img.url}-${index}`}
                                                href={img.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Open full image"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={`Request image ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-90"
                                                />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            {selectedRequest.artistNote && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Artist Note</p>
                                    <p className="text-sm rounded-md border p-3">{selectedRequest.artistNote}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="admin-note">Admin Note (Internal)</Label>
                                <Textarea
                                    id="admin-note"
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder="Optional internal note"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reject-reason">Rejection Reason (Shown to artist if rejected)</Label>
                                <Textarea
                                    id="reject-reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Explain why this request is rejected"
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => handleRejectPendingRequest(selectedRequest._id)}
                                    disabled={reviewingAction !== null}
                                >
                                    {reviewingAction === 'reject' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Reject
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:bg-[#B8952A]"
                                    onClick={() => handleApprovePendingRequest(selectedRequest._id)}
                                    disabled={reviewingAction !== null}
                                >
                                    {reviewingAction === 'approve' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Approve
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <div className="py-8 text-center text-muted-foreground">No request selected.</div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Product Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                        <DialogDescription>
                            Update product details. Leave image field empty to keep existing images.
                        </DialogDescription>
                    </DialogHeader>

                    {editingProduct && (
                        <div className="space-y-4">
                            {/* Current images */}
                            {editingProduct.images?.length > 0 && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Current Images</p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {editingProduct.images.map((img: any, i: number) => (
                                            <img key={i} src={img.url} alt={`Product ${i + 1}`} className="w-full h-20 object-cover rounded border" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input value={editFormData.title} onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <select
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={editFormData.category}
                                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat.slug}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editFormData.description}
                                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price (₹)</Label>
                                    <Input type="number" value={editFormData.price} onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Stock</Label>
                                    <Input type="number" value={editFormData.stock} onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tags (comma separated)</Label>
                                <Input value={editFormData.tags} onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })} placeholder="art, painting, digital" />
                            </div>

                            <div className="space-y-2">
                                <Label>Replace Images (optional)</Label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => setEditImages(Array.from(e.target.files || []))}
                                    className="w-full p-2 border rounded-md text-sm"
                                />
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={editLoading}>Cancel</Button>
                                <Button className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:bg-[#B8952A]" onClick={handleEditProduct} disabled={editLoading}>
                                    {editLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Pencil className="w-4 h-4 mr-2" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Delete Product</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the product.
                        </DialogDescription>
                    </DialogHeader>

                    {deletingProduct && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                                {deletingProduct.images?.[0]?.url && (
                                    <img src={deletingProduct.images[0].url} alt={deletingProduct.title} className="w-12 h-12 rounded object-cover" />
                                )}
                                <div>
                                    <p className="font-semibold">{deletingProduct.title}</p>
                                    <p className="text-sm text-muted-foreground">₹{deletingProduct.price} · by {deletingProduct.artist?.username || 'Unknown'}</p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDeleteProduct} disabled={deleteLoading}>
                                    {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                    Delete Product
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Add Product Form Component
function AddProductForm({ onSubmit, loading, categories }: { onSubmit: (formData: FormData) => void; loading: boolean; categories: Array<{ _id: string; name: string; slug: string }> }) {
    const [formData, setFormData] = useState({
        title: '',
        displayName: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        isDigital: false,
        tags: ''
    });
    const [images, setImages] = useState<File[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('displayName', formData.displayName);
        submitData.append('description', formData.description);
        submitData.append('price', formData.price);
        submitData.append('category', formData.category);
        submitData.append('stock', formData.stock);
        submitData.append('isDigital', formData.isDigital.toString());
        submitData.append('tags', formData.tags);
        
        images.forEach((image, index) => {
            submitData.append('images', image);
        });

        onSubmit(submitData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input 
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Display Name</label>
                    <Input 
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        placeholder="Shown on storefront"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
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
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    minLength={20}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Price (₹)</label>
                    <Input 
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Stock</label>
                    <Input 
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        required
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <input 
                        type="checkbox"
                        id="isDigital"
                        checked={formData.isDigital}
                        onChange={(e) => setFormData({...formData, isDigital: e.target.checked})}
                    />
                    <label htmlFor="isDigital" className="text-sm font-medium">Digital Product</label>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <Input 
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="art, painting, digital"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Images</label>
                <input 
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(Array.from(e.target.files || []))}
                    className="w-full p-2 border rounded-md"
                    required
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setFormData({
                    title: '', displayName: '', description: '', price: '', category: '', stock: '', isDigital: false, tags: ''
                })}>
                    Clear
                </Button>
                <Button type="submit" disabled={loading} className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:bg-[#B8952A]">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Create Product
                </Button>
            </div>
        </form>
    );
}
