import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Search, Eye, Check, X, Loader2 } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from "../../ui/sheet";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { toast } from 'sonner';
import { adminGetPendingRequests, adminGetRequestDetails, adminApproveRequest, adminRejectRequest } from '../../../utils/api';

interface ProductRequest {
    _id: string;
    type: 'create' | 'edit' | 'delete';
    status: 'pending' | 'approved' | 'rejected';
    product?: {
        _id: string;
        title: string;
        price: number;
        category?: { name: string };
        images?: { url: string }[];
        description?: string;
    };
    newData?: {
        title?: string;
        price?: number;
        description?: string;
        images?: { url: string }[];
    };
    artist?: {
        _id: string;
        username: string;
        email: string;
    };
    createdAt: string;
    adminNotes?: string;
}

export function AdminArtworks() {
    const [searchTerm, setSearchTerm] = useState('');
    const [requests, setRequests] = useState<ProductRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    // Reject modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [requestToReject, setRequestToReject] = useState<ProductRequest | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const response = await adminGetPendingRequests();
            if (response.success) {
                setRequests(response.data.requests || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const viewRequestDetails = async (request: ProductRequest) => {
        setDetailLoading(true);
        setSelectedRequest(request);
        try {
            const response = await adminGetRequestDetails(request._id);
            if (response.success) {
                setSelectedRequest(response.data.request);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load details');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleApprove = async (request: ProductRequest) => {
        setApproving(true);
        try {
            const response = await adminApproveRequest(request._id);
            if (response.success) {
                toast.success('Request approved! Product has been published.');
                loadRequests();
                setSelectedRequest(null);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve request');
        } finally {
            setApproving(false);
        }
    };

    const openRejectModal = (request: ProductRequest) => {
        setRequestToReject(request);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const handleReject = async () => {
        if (!requestToReject) return;

        setRejecting(true);
        try {
            const response = await adminRejectRequest(requestToReject._id);
            if (response.success) {
                toast.success('Request rejected. Artist has been notified.');
                setIsRejectModalOpen(false);
                loadRequests();
                setSelectedRequest(null);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject request');
        } finally {
            setRejecting(false);
        }
    };

    const filteredRequests = requests.filter(req => {
        const title = req.newData?.title || req.product?.title || '';
        const artistName = req.artist?.username || '';
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               artistName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'create': return { label: 'New Product', color: 'bg-blue-100 text-blue-800' };
            case 'edit': return { label: 'Edit Request', color: 'bg-yellow-100 text-yellow-800' };
            case 'delete': return { label: 'Delete Request', color: 'bg-red-100 text-red-800' };
            default: return { label: type, color: 'bg-gray-100 text-gray-800' };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Artwork Moderation</h2>
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search artworks..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>Review and approve artwork submissions from artists.</CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredRequests.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No pending requests. All caught up! 🎉
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Artwork</TableHead>
                                    <TableHead>Artist</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRequests.map((req) => {
                                    const title = req.newData?.title || req.product?.title || 'Untitled';
                                    const price = req.newData?.price || req.product?.price || 0;
                                    const image = req.newData?.images?.[0]?.url || req.product?.images?.[0]?.url;
                                    const typeInfo = getTypeLabel(req.type);

                                    return (
                                        <TableRow key={req._id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded bg-gray-100 overflow-hidden">
                                                        {image ? (
                                                            <img src={image} alt={title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                                                                No img
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span>{title}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{req.artist?.username || 'Unknown'}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={typeInfo.color}>
                                                    {typeInfo.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>₹{price.toLocaleString()}</TableCell>
                                            <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" title="View Details" onClick={() => viewRequestDetails(req)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0"
                                                        title="Approve"
                                                        onClick={() => handleApprove(req)}
                                                        disabled={approving}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8 w-8 p-0"
                                                        title="Reject"
                                                        onClick={() => openRejectModal(req)}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Detail Sheet */}
            <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Request Details</SheetTitle>
                        <SheetDescription>Review the artwork submission details.</SheetDescription>
                    </SheetHeader>
                    {detailLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : selectedRequest && (
                        <div className="space-y-6 py-6">
                            {/* Images */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Images</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {(selectedRequest.newData?.images || selectedRequest.product?.images || []).map((img, idx) => (
                                        <div key={idx} className="rounded-lg overflow-hidden border">
                                            <img src={img.url} alt={`Image ${idx + 1}`} className="w-full h-32 object-cover" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">Title</h4>
                                    <p>{selectedRequest.newData?.title || selectedRequest.product?.title}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">Price</h4>
                                    <p>₹{(selectedRequest.newData?.price || selectedRequest.product?.price || 0).toLocaleString()}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">Description</h4>
                                    <p className="text-sm text-gray-600">
                                        {selectedRequest.newData?.description || selectedRequest.product?.description || 'No description provided'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">Artist</h4>
                                    <p>{selectedRequest.artist?.username} ({selectedRequest.artist?.email})</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-500">Request Type</h4>
                                    <Badge variant="outline" className={getTypeLabel(selectedRequest.type).color}>
                                        {getTypeLabel(selectedRequest.type).label}
                                    </Badge>
                                </div>
                            </div>

                            {/* Actions */}
                            <SheetFooter className="flex gap-2">
                                <Button
                                    variant="destructive"
                                    onClick={() => openRejectModal(selectedRequest)}
                                    disabled={rejecting}
                                >
                                    <X className="w-4 h-4 mr-2" /> Reject
                                </Button>
                                <Button
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(selectedRequest)}
                                    disabled={approving}
                                >
                                    {approving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                    Approve
                                </Button>
                            </SheetFooter>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* Reject Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejection (optional). The artist will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="rejectReason">Reason (Optional)</Label>
                        <Textarea
                            id="rejectReason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Image quality needs improvement, pricing issues..."
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={rejecting}>
                            {rejecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Reject Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
