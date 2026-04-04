import { useState, useEffect } from 'react';
import { MapPin, Plus, MoreVertical, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { toast } from 'sonner';
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../../utils/api';

interface Address {
    _id: string;
    type: string;
    fullName: string;
    phone: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
    isDefault: boolean;
}

export function ManageAddresses() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        type: 'home',
        fullName: '',
        phone: '',
        street: '',
        landmark: '',
        city: '',
        state: '',
        country: 'India',
        pincode: '',
        isDefault: false
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            setIsLoading(true);
            const response = await getAddresses();
            if (response.success) {
                setAddresses(response.data.addresses || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to fetch addresses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteAddress(id);
            setAddresses(addresses.filter(a => a._id !== id));
            toast.success('Address deleted successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete address');
        }
    };

    const handleSetDefault = async (id: string) => {
        try {
            await setDefaultAddress(id);
            setAddresses(addresses.map(a => ({ ...a, isDefault: a._id === id })));
            toast.success('Default address updated');
        } catch (error: any) {
            toast.error(error.message || 'Failed to set default address');
        }
    };

    const resetForm = () => {
        setFormData({
            type: 'home',
            fullName: '',
            phone: '',
            street: '',
            landmark: '',
            city: '',
            state: '',
            country: 'India',
            pincode: '',
            isDefault: false
        });
        setEditingId(null);
    };

    const handleAddNew = () => {
        resetForm();
        setIsOpen(true);
    };

    const handleEdit = (address: Address) => {
        setFormData({
            type: address.type,
            fullName: address.fullName,
            phone: address.phone,
            street: address.street,
            landmark: address.landmark || '',
            city: address.city,
            state: address.state,
            country: address.country || 'India',
            pincode: address.pincode,
            isDefault: address.isDefault
        });
        setEditingId(address._id);
        setIsOpen(true);
    };

    const handleSave = async () => {
        if (!formData.fullName || !formData.phone || !formData.street || !formData.city || !formData.state || !formData.pincode) {
            toast.error('Please fill all required fields');
            return;
        }
        if (!/^\d{6}$/.test(formData.pincode)) {
            toast.error('Pincode must be 6 digits');
            return;
        }

        setIsSaving(true);
        try {
            if (editingId) {
                const response = await updateAddress(editingId, formData);
                if (response.success) {
                    await fetchAddresses();
                    toast.success('Address updated successfully');
                }
            } else {
                const response = await addAddress(formData);
                if (response.success) {
                    await fetchAddresses();
                    toast.success('New address added successfully');
                }
            }
            setIsOpen(false);
            resetForm();
        } catch (error: any) {
            toast.error(error.message || 'Failed to save address');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Manage Addresses</h2>
                <Button onClick={handleAddNew} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                    Add New Address
                </Button>
            </div>

            {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                    <MapPin className="w-12 h-12 mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">No Addresses Saved</h3>
                    <p>Add your first delivery address</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {addresses.map((address) => (
                        <Card key={address._id} className="relative group hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-gray-500 uppercase text-xs tracking-wider">{address.type}</Badge>
                                            {address.isDefault && <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200">Default</Badge>}
                                        </div>
                                        <h3 className="font-semibold text-lg">{address.fullName}</h3>
                                        <p className="text-gray-600">{address.street}{address.landmark && `, ${address.landmark}`}</p>
                                        <p className="text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                                        <p className="text-gray-600">{address.country}</p>
                                        <p className="text-gray-900 font-medium pt-2">Phone: {address.phone}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(address)}>Edit</DropdownMenuItem>
                                            {!address.isDefault && (
                                                <DropdownMenuItem onClick={() => handleSetDefault(address._id)}>Set as Default</DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(address._id)}>Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold">{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                        <div className="space-y-4">
                            <div>
                                <Label>Address Type *</Label>
                                <select className="w-full border rounded p-2 mt-1" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="home">Home</option>
                                    <option value="office">Office</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <Label>Full Name *</Label>
                                <Input value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Enter full name" className="mt-1" />
                            </div>
                            <div>
                                <Label>Phone Number *</Label>
                                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" className="mt-1" />
                            </div>
                            <div>
                                <Label>Street Address *</Label>
                                <Input value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} placeholder="House/Flat No., Building, Street" className="mt-1" />
                            </div>
                            <div>
                                <Label>Landmark (Optional)</Label>
                                <Input value={formData.landmark} onChange={(e) => setFormData({ ...formData, landmark: e.target.value })} placeholder="Near landmark" className="mt-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>City *</Label>
                                    <Input value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" className="mt-1" />
                                </div>
                                <div>
                                    <Label>Pincode *</Label>
                                    <Input value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} placeholder="6-digit pincode" maxLength={6} className="mt-1" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>State *</Label>
                                    <Input value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="State" className="mt-1" />
                                </div>
                                <div>
                                    <Label>Country *</Label>
                                    <Input value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} placeholder="Country" className="mt-1" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="isDefault" checked={formData.isDefault} onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })} />
                                <label htmlFor="isDefault" className="text-sm">Set as default address</label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Save Address
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
