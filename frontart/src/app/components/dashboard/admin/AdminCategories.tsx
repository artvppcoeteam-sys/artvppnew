import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Plus, Trash2, Edit2, Tag, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../../ui/dialog";
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import { adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory } from '../../../utils/api';

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    productCount?: number;
    isActive: boolean;
}

export function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const response = await adminGetCategories();
            if (response.success) {
                setCategories(response.data.categories || []);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const openCreateDialog = () => {
        setIsEditMode(false);
        setSelectedCategory(null);
        setFormData({ name: '', description: '' });
        setIsDialogOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setIsEditMode(true);
        setSelectedCategory(category);
        setFormData({ name: category.name, description: category.description || '' });
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) {
            toast.error('Category name is required');
            return;
        }

        setSaving(true);
        try {
            if (isEditMode && selectedCategory) {
                const response = await adminUpdateCategory(selectedCategory._id, formData);
                if (response.success) {
                    toast.success('Category updated successfully');
                    loadCategories();
                }
            } else {
                const response = await adminCreateCategory(formData);
                if (response.success) {
                    toast.success('Category created successfully');
                    loadCategories();
                }
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.message || 'Failed to save category');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (categoryId: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        setDeleting(categoryId);
        try {
            const response = await adminDeleteCategory(categoryId);
            if (response.success) {
                toast.success('Category deleted successfully');
                loadCategories();
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete category');
        } finally {
            setDeleting(null);
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
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Category Management</h2>
                    <p className="text-muted-foreground">Manage artwork categories and filters.</p>
                </div>
                <Button className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0" onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    {categories.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No categories yet. Create your first category.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Category Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Products</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((cat) => (
                                    <TableRow key={cat._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Tag className="w-4 h-4 text-gray-500" />
                                                {cat.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{cat.slug}</TableCell>
                                        <TableCell className="text-muted-foreground max-w-xs truncate">
                                            {cat.description || '-'}
                                        </TableCell>
                                        <TableCell>{cat.productCount || 0} items</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {cat.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0"
                                                onClick={() => openEditDialog(cat)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(cat._id)}
                                                disabled={deleting === cat._id}
                                            >
                                                {deleting === cat._id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditMode ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                        <DialogDescription>
                            {isEditMode ? 'Update the category details.' : 'Create a new category for artworks.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Oil Painting"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of this category"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={saving}>
                            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            {isEditMode ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
