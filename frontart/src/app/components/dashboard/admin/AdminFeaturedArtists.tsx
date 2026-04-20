import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Checkbox } from '../../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { Plus, Edit2, Trash2, Star, Loader2, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { toast } from 'sonner';
import { 
    adminGetFeaturedArtists, 
    createFeaturedArtist, 
    updateFeaturedArtist, 
    deleteFeaturedArtist, 
    getArtistArtworksForFeatured, 
    updateArtistFeaturedArtworks,
    getAllUsers
} from '../../../utils/api';

export function AdminFeaturedArtists() {
    const [featuredArtists, setFeaturedArtists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [allArtists, setAllArtists] = useState<any[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedFeatured, setSelectedFeatured] = useState<any>(null);

    // Form states
    const [newArtistId, setNewArtistId] = useState('');
    const [newName, setNewName] = useState('');
    const [newAvatar, setNewAvatar] = useState('');
    const [newCategory, setNewCategory] = useState('');
    const [newOrder, setNewOrder] = useState('1');
    const [newStatus, setNewStatus] = useState('active');

    // Artwork selection states
    const [artistArtworks, setArtistArtworks] = useState<any[]>([]);
    const [selectedArtworkIds, setSelectedArtworkIds] = useState<string[]>([]);
    const [loadingArtworks, setLoadingArtworks] = useState(false);

    useEffect(() => {
        fetchFeaturedArtists();
        fetchPotentialArtists();
    }, []);

    const fetchFeaturedArtists = async () => {
        try {
            setLoading(true);
            const res = await adminGetFeaturedArtists();
            if (res.success) {
                setFeaturedArtists(res.data);
            }
        } catch (error) {
            toast.error('Failed to fetch featured artists');
        } finally {
            setLoading(false);
        }
    };

    const fetchPotentialArtists = async () => {
        try {
            const res = await getAllUsers({ role: 'artist' });
            if (res.success) {
                setAllArtists(res.data.users);
            }
        } catch (error) {
            console.error('Error fetching artists:', error);
        }
    };

    const handleAddFeatured = async () => {
        if (!newName || !newCategory) {
            toast.error('Please fill all required fields (Name and Category)');
            return;
        }

        try {
            const res = await createFeaturedArtist({
                name: newName,
                avatar: newAvatar,
                category: newCategory,
                displayOrder: parseInt(newOrder),
                status: newStatus
            });

            if (res.success) {
                toast.success('Artist added to featured list');
                setIsAddModalOpen(false);
                resetForm();
                fetchFeaturedArtists();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to add featured artist');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this artist from featured list?')) {
            try {
                const res = await deleteFeaturedArtist(id);
                if (res.success) {
                    toast.success('Artist removed');
                    fetchFeaturedArtists();
                }
            } catch (error) {
                toast.error('Failed to remove artist');
            }
        }
    };

    const openEditModal = async (featured: any) => {
        setSelectedFeatured(featured);
        setNewName(featured.name || '');
        setNewAvatar(featured.avatar || '');
        setNewCategory(featured.category);
        setNewOrder(featured.displayOrder.toString());
        setNewStatus(featured.status);
        setIsEditModalOpen(true);
        
        // Fetch artworks only if artist reference exists
        setArtistArtworks([]);
        setSelectedArtworkIds([]);
        
        if (featured.artist?._id) {
            setLoadingArtworks(true);
            try {
                const res = await getArtistArtworksForFeatured(featured.artist._id);
                if (res.success) {
                    setArtistArtworks(res.data);
                    setSelectedArtworkIds(res.data.filter((a: any) => a.isFeatured).map((a: any) => a._id));
                }
            } catch (error) {
                toast.error('Failed to fetch artist artworks');
            } finally {
                setLoadingArtworks(false);
            }
        }
    };

    const handleUpdateFeatured = async () => {
        if (!selectedFeatured) return;

        try {
            // Update basic info
            const res = await updateFeaturedArtist(selectedFeatured._id, {
                name: newName,
                avatar: newAvatar,
                category: newCategory,
                displayOrder: parseInt(newOrder),
                status: newStatus
            });

            if (res.success) {
                // Update featured artworks
                await updateArtistFeaturedArtworks(selectedFeatured.artist._id, selectedArtworkIds);
                
                toast.success('Featured artist and artworks updated');
                setIsEditModalOpen(false);
                fetchFeaturedArtists();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to update');
        }
    };

    const toggleArtwork = (id: string) => {
        setSelectedArtworkIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const resetForm = () => {
        setNewArtistId('');
        setNewName('');
        setNewAvatar('');
        setNewCategory('');
        setNewOrder('1');
        setNewStatus('active');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Featured Artists</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage which artists appear on the homepage (Max 8 active).</p>
                </div>
                <Button 
                    className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] text-white"
                    onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Featured Artist
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        Dynamic Featured System
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Artist</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Display Order</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#b30452]" />
                                        <p className="mt-2 text-sm text-gray-500">Loading featured list...</p>
                                    </TableCell>
                                </TableRow>
                            ) : featuredArtists.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12">
                                        No featured artists found. Add your first one!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                featuredArtists.map((item) => (
                                    <TableRow key={item._id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-12 h-12 border border-gray-100">
                                                    <AvatarImage 
                                                        src={item.avatar || item.artist?.avatar} 
                                                        onError={(e) => {
                                                            const name = item.name || item.artist?.displayName || item.artist?.username || 'U';
                                                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f0fbff&color=0284c7`;
                                                        }}
                                                    />
                                                    <AvatarFallback>{(item.name || item.artist?.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-bold">{item.name || item.artist?.displayName || item.artist?.username}</div>
                                                    <div className="text-xs text-muted-foreground">{item.artist?.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.category}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="px-3 py-1 font-bold">
                                                Position #{item.displayOrder}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant="outline" 
                                                className={item.status === 'active' ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-700 border-gray-200"}
                                            >
                                                {item.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditModal(item)}>
                                                    <Edit2 className="w-4 h-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(item._id)}>
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Featured Artist</DialogTitle>
                        <DialogDescription>Select an artist to feature on the homepage.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Artist Name (for Homepage)</Label>
                            <Input placeholder="Enter display name" value={newName} onChange={e => setNewName(e.target.value)} />
                            <p className="text-[10px] text-muted-foreground">If the name matches an artist user, it will link to their profile automatically.</p>
                        </div>
                        <div className="grid gap-2">
                            <Label>Avatar Image (URL)</Label>
                            <Input placeholder="https://..." value={newAvatar} onChange={e => setNewAvatar(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <Input placeholder="e.g. Photography, Calligraphy" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Display Order (1-8)</Label>
                                <Input type="number" min="1" max="8" value={newOrder} onChange={e => setNewOrder(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Status</Label>
                                <Select onValueChange={setNewStatus} value={newStatus}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="bg-[#b30452] text-white" onClick={handleAddFeatured}>Add to Featured</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Modal with Artwork Selection */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Featured Artist: {selectedFeatured?.name || selectedFeatured?.artist?.displayName || selectedFeatured?.artist?.username}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="grid gap-2">
                            <Label>Artist Name</Label>
                            <Input value={newName} onChange={e => setNewName(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Avatar Image (URL)</Label>
                            <Input value={newAvatar} onChange={e => setNewAvatar(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Category</Label>
                                <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                            </div>
                            <div className="flex gap-4">
                                <div className="grid gap-2 flex-1">
                                    <Label>Position (1-8)</Label>
                                    <Input type="number" min="1" max="8" value={newOrder} onChange={e => setNewOrder(e.target.value)} />
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <Label>Status</Label>
                                    <Select onValueChange={setNewStatus} value={newStatus}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-bold flex items-center gap-2 mb-4">
                                <ImageIcon className="w-4 h-4" />
                                Select Artworks to Display on Profile
                            </h4>
                            
                            {loadingArtworks ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                </div>
                            ) : artistArtworks.length === 0 ? (
                                <p className="text-sm text-center py-4 text-gray-500">No artworks found for this artist.</p>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {artistArtworks.map(art => (
                                        <div 
                                            key={art._id}
                                            onClick={() => toggleArtwork(art._id)}
                                            className={cn(
                                                "relative aspect-square rounded-lg border-2 overflow-hidden cursor-pointer transition-all",
                                                selectedArtworkIds.includes(art._id) ? "border-[#b30452] ring-2 ring-[#b30452]/20" : "border-gray-200"
                                            )}
                                        >
                                            <img 
                                                src={art.images?.[0]?.url || art.image} 
                                                className="w-full h-full object-cover" 
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=200&q=80';
                                                }}
                                            />
                                            {selectedArtworkIds.includes(art._id) && (
                                                <div className="absolute top-1 right-1 bg-[#b30452] text-white rounded-full p-0.5">
                                                    <Star className="w-3 h-3 fill-white" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[10px] text-white truncate">
                                                {art.title}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button className="bg-[#b30452] text-white" onClick={handleUpdateFeatured}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Utility to merge classes
function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
