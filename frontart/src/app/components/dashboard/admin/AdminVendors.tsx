import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import {
    Check, X, MessageSquare, Eye, Store, Send, Loader2,
    RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import {
    getArtistApplications,
    getArtistApplicationDetails,
    approveArtistApplication,
    rejectArtistApplication,
    markApplicationUnderReview,
    getArtistApplicationStats,
    sendArtistSuggestion
} from '../../../utils/api';

interface Application {
    _id: string;
    fullName: string;
    submissionChannel?: 'standard' | 'student_link';
    primaryEmail: string;
    secondaryEmail: { address: string; isVerified: boolean };
    primaryPhone?: string;
    secondaryPhone: { number: string; isVerified: boolean };
    bio: string;
    status: 'pending' | 'under_review' | 'approved' | 'rejected';
    profilePicture: { url: string };
    artworks: Array<{ url: string; title: string; description?: string }>;
    portfolioWebsite?: string;
    socialMedia?: Record<string, string | null>;
    address?: { street: string; city: string; state: string; pincode: string; country: string };
    submittedAt: string;
    reviewedAt?: string;
    rejectionReason?: string;
    adminNotes?: string;
    userId?: { _id: string; username: string; email: string; avatar?: string };
    studentArtworkDetails?: Array<{
        category: string;
        title: string;
        price: number;
        size: string;
        medium: string;
        images: Array<{ url: string }>;
    }>;
}

interface Stats {
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
    total: number;
}

export function AdminVendors() {
    const [applications, setApplications] = useState<Application[]>([]);
    const [stats, setStats] = useState<Stats>({ pending: 0, under_review: 0, approved: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending');
    const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Action states
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    // Rejection modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [rejectNotes, setRejectNotes] = useState('');
    const [applicationToReject, setApplicationToReject] = useState<Application | null>(null);

    // Suggestion modal state
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const [suggestionText, setSuggestionText] = useState('');
    const [applicationForSuggestion, setApplicationForSuggestion] = useState<Application | null>(null);

    // Load applications
    const loadApplications = async (status = activeTab) => {
        setLoading(true);
        try {
            const response = await getArtistApplications({ status: status === 'all' ? 'all' : status, limit: 50 });
            if (response.success) {
                setApplications(response.data.applications);
                if (response.data.statusCounts) {
                    setStats(response.data.statusCounts);
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    // Load stats separately
    const loadStats = async () => {
        try {
            const response = await getArtistApplicationStats();
            if (response.success) {
                setStats(response.data?.stats || response.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    useEffect(() => {
        loadApplications();
        loadStats();
    }, []);

    // Handle tab change
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        loadApplications(tab);
    };

    // View application details
    const viewApplicationDetails = async (app: Application) => {
        setDetailLoading(true);
        setSelectedApplication(app);
        try {
            const response = await getArtistApplicationDetails(app._id);
            if (response.success) {
                setSelectedApplication(response.data.application);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load details');
        } finally {
            setDetailLoading(false);
        }
    };

    // Approve application
    const handleApprove = async (app: Application) => {
        setApproving(true);
        try {
            const response = await approveArtistApplication(app._id);
            if (response.success) {
                toast.success('Application approved! Artist has been notified via email.');
                loadApplications();
                loadStats();
                setSelectedApplication(null);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to approve application');
        } finally {
            setApproving(false);
        }
    };

    // Mark as under review
    const handleMarkUnderReview = async (app: Application) => {
        try {
            const response = await markApplicationUnderReview(app._id);
            if (response.success) {
                toast.success('Application marked as under review');
                loadApplications();
                loadStats();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    // Open reject modal
    const openRejectModal = (app: Application) => {
        setApplicationToReject(app);
        setRejectReason('');
        setRejectNotes('');
        setIsRejectModalOpen(true);
    };

    // Handle reject
    const handleReject = async () => {
        if (!applicationToReject) return;

        setRejecting(true);
        try {
            const response = await rejectArtistApplication(
                applicationToReject._id,
                rejectReason,
                rejectNotes,
                30
            );
            if (response.success) {
                toast.success('Application rejected. Artist has been notified via email.');
                setIsRejectModalOpen(false);
                loadApplications();
                loadStats();
                setSelectedApplication(null);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to reject application');
        } finally {
            setRejecting(false);
        }
    };

    // Open suggestion modal
    const openSuggestionModal = (app: Application) => {
        setApplicationForSuggestion(app);
        setSuggestionText('');
        setIsSuggestionModalOpen(true);
    };

    // Send suggestion
    const handleSendSuggestion = async () => {
        if (!applicationForSuggestion || !suggestionText.trim()) {
            toast.error('Please enter a suggestion');
            return;
        }

        try {
            const response = await sendArtistSuggestion(applicationForSuggestion._id, suggestionText);
            if (response.success) {
                toast.success(`Suggestion sent to ${applicationForSuggestion.fullName} via email`);
                setIsSuggestionModalOpen(false);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to send suggestion');
        }
    };

    // Status badge variant
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'under_review':
                return <Badge className="bg-blue-500 hover:bg-blue-600"><AlertCircle className="w-3 h-3 mr-1" />Under Review</Badge>;
            case 'approved':
                return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Artist Applications</h2>
                    <p className="text-muted-foreground">Review and manage artist applications.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => loadApplications()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-100 rounded-full">
                            <Clock className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.pending}</p>
                            <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <AlertCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.under_review}</p>
                            <p className="text-xs text-muted-foreground">Under Review</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-green-100 rounded-full">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.approved}</p>
                            <p className="text-xs text-muted-foreground">Approved</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-red-100 rounded-full">
                            <XCircle className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.rejected}</p>
                            <p className="text-xs text-muted-foreground">Rejected</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-gray-100 rounded-full">
                            <Store className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Applications Table with Tabs */}
            <Card>
                <CardHeader>
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                            <TabsTrigger value="under_review">Under Review ({stats.under_review})</TabsTrigger>
                            <TabsTrigger value="approved">Approved ({stats.approved})</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
                            <TabsTrigger value="all">All</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : applications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No applications found
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Applicant</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applications.map((app) => (
                                    <TableRow key={app._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={app.profilePicture?.url} />
                                                    <AvatarFallback>{app.fullName?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{app.fullName}</p>
                                                    <p className="text-xs text-muted-foreground">{app.secondaryPhone?.number}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <span className="text-sm">{app.secondaryEmail?.address}</span>
                                                {app.secondaryEmail?.isVerified && (
                                                    <CheckCircle className="w-3 h-3 text-green-500" />
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {app.submissionChannel === 'student_link' ? (
                                                <Badge variant="outline" className="text-blue-700 border-blue-200">Student Link</Badge>
                                            ) : (
                                                <Badge variant="outline">Standard</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(app.status)}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(app.submittedAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => viewApplicationDetails(app)} title="View Details">
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                {(app.status === 'pending' || app.status === 'under_review') && (
                                                    <>
                                                        {app.status === 'pending' && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                onClick={() => handleMarkUnderReview(app)}
                                                            >
                                                                Review
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className={`${app.secondaryEmail?.isVerified ? 'text-green-600 border-green-200 hover:bg-green-50' : 'text-gray-400 border-gray-200'}`}
                                                            onClick={() => {
                                                                if (!app.secondaryEmail?.isVerified) {
                                                                    toast.error('Cannot approve: Artist has not verified their secondary email yet');
                                                                    return;
                                                                }
                                                                handleApprove(app);
                                                            }}
                                                            disabled={approving || !app.secondaryEmail?.isVerified}
                                                            title={app.secondaryEmail?.isVerified ? 'Approve Application' : 'Email not verified'}
                                                        >
                                                            <Check className="w-4 h-4 mr-1" />
                                                            {app.secondaryEmail?.isVerified ? 'Approve' : 'Email ✗'}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => openRejectModal(app)}
                                                        >
                                                            <X className="w-4 h-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Application Detail Modal */}
            <Dialog open={!!selectedApplication} onOpenChange={(open) => !open && setSelectedApplication(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Application Details</DialogTitle>
                        <DialogDescription>Review the artist application details</DialogDescription>
                    </DialogHeader>
                    {detailLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                    ) : selectedApplication && (
                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-start gap-4">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={selectedApplication.profilePicture?.url} />
                                    <AvatarFallback className="text-2xl">{selectedApplication.fullName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold">{selectedApplication.fullName}</h3>
                                    <div className="flex flex-col gap-1 mt-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">Primary:</span>
                                            <span className="text-sm">{selectedApplication.primaryEmail}</span>
                                            <Badge variant="outline" className="text-green-600 border-green-200 text-xs">Verified</Badge>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">Secondary:</span>
                                            <span className="text-sm">{selectedApplication.secondaryEmail?.address}</span>
                                            {selectedApplication.secondaryEmail?.isVerified ? (
                                                <Badge variant="outline" className="text-green-600 border-green-200 text-xs">Verified</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">Not Verified</Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        {selectedApplication.primaryPhone && (
                                            <span>Primary Phone: {selectedApplication.primaryPhone}</span>
                                        )}
                                        <span>Secondary Phone: {selectedApplication.secondaryPhone?.number}</span>
                                    </div>
                                    <div className="mt-2">{getStatusBadge(selectedApplication.status)}</div>
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold mb-2">Artist Bio</h4>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.bio}</p>
                            </div>

                            {/* Portfolio & Social */}
                            {selectedApplication.portfolioWebsite && (
                                <div>
                                    <h4 className="font-semibold mb-2">Portfolio</h4>
                                    <a
                                        href={selectedApplication.portfolioWebsite}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        {selectedApplication.portfolioWebsite}
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            )}

                            {/* Address */}
                            {selectedApplication.address && (
                                <div>
                                    <h4 className="font-semibold mb-2">Address</h4>
                                    <p className="text-sm text-gray-700">
                                        {selectedApplication.address.street}, {selectedApplication.address.city}, {' '}
                                        {selectedApplication.address.state} - {selectedApplication.address.pincode}
                                    </p>
                                </div>
                            )}

                            {/* Artworks Gallery */}
                            <div>
                                <h4 className="font-semibold mb-3">Sample Artworks ({selectedApplication.artworks?.length || 0})</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {selectedApplication.artworks?.map((artwork, index) => (
                                        <div key={index} className="space-y-2">
                                            <a href={artwork.url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={artwork.url}
                                                    alt={artwork.title || `Artwork ${index + 1}`}
                                                    className="w-full aspect-square object-cover rounded-lg border hover:opacity-90 transition-opacity"
                                                />
                                            </a>
                                            <p className="text-sm text-center font-medium">{artwork.title || `Artwork ${index + 1}`}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedApplication.submissionChannel === 'student_link' && (
                                <div>
                                    <h4 className="font-semibold mb-3">Student Artwork Blocks ({selectedApplication.studentArtworkDetails?.length || 0})</h4>
                                    <div className="space-y-4">
                                        {selectedApplication.studentArtworkDetails?.map((item, index) => (
                                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                                                <div className="grid md:grid-cols-2 gap-2 text-sm">
                                                    <p><strong>Category:</strong> {item.category}</p>
                                                    <p><strong>Title:</strong> {item.title}</p>
                                                    <p><strong>Price:</strong> INR {item.price}</p>
                                                    <p><strong>Size:</strong> {item.size}</p>
                                                    <p><strong>Medium:</strong> {item.medium}</p>
                                                </div>
                                                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-3">
                                                    {item.images?.map((image, imageIndex) => (
                                                        <img
                                                            key={imageIndex}
                                                            src={image.url}
                                                            alt={`${item.title} ${imageIndex + 1}`}
                                                            className="w-full aspect-square object-cover rounded border"
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason (if rejected) */}
                            {selectedApplication.status === 'rejected' && selectedApplication.rejectionReason && (
                                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                    <h4 className="font-semibold text-red-700 mb-2">Rejection Reason</h4>
                                    <p className="text-sm text-red-600">{selectedApplication.rejectionReason}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-2 pt-4 border-t">
                                {(selectedApplication.status === 'pending' || selectedApplication.status === 'under_review') && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => openSuggestionModal(selectedApplication)}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Send Suggestion
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => { setSelectedApplication(null); openRejectModal(selectedApplication); }}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                        <Button
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => handleApprove(selectedApplication)}
                                            disabled={approving || !selectedApplication.secondaryEmail?.isVerified}
                                        >
                                            {approving ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4 mr-2" />
                                            )}
                                            Approve
                                        </Button>
                                    </>
                                )}
                                {!selectedApplication.secondaryEmail?.isVerified && selectedApplication.status !== 'rejected' && selectedApplication.status !== 'approved' && (
                                    <p className="text-sm text-orange-600">
                                        ⚠️ Cannot approve until secondary email is verified
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Reject Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejecting {applicationToReject?.fullName}'s application.
                            The artist will be notified via email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejectReason">Rejection Reason (Optional)</Label>
                            <Textarea
                                id="rejectReason"
                                placeholder="e.g., Portfolio needs more variety, Image quality issues..."
                                className="min-h-[100px]"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">This will be shared with the artist</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="rejectNotes">Admin Notes (Internal)</Label>
                            <Textarea
                                id="rejectNotes"
                                placeholder="Internal notes for admin team..."
                                value={rejectNotes}
                                onChange={(e) => setRejectNotes(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={rejecting}
                        >
                            {rejecting ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <X className="w-4 h-4 mr-2" />
                            )}
                            Reject Application
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Suggestion Modal */}
            <Dialog open={isSuggestionModalOpen} onOpenChange={setIsSuggestionModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Suggestion</DialogTitle>
                        <DialogDescription>
                            Send feedback to {applicationForSuggestion?.fullName}.
                            They will receive this via email.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="suggestion">Your Suggestion</Label>
                            <Textarea
                                id="suggestion"
                                placeholder="e.g., Please add more high-resolution images, Consider adding more diverse artwork styles..."
                                className="min-h-[150px]"
                                value={suggestionText}
                                onChange={(e) => setSuggestionText(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsSuggestionModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={handleSendSuggestion}
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send Suggestion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
