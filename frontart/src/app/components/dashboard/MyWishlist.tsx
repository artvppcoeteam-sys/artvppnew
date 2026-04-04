import { Trash2, ShoppingCart, Heart, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../../utils/api';

interface WishlistItem {
    _id: string;
    product: {
        _id: string;
        title: string;
        price: number;
        compareAtPrice?: number;
        images: { url: string }[];
        stock: number;
        slug: string;
    };
}

export function MyWishlist() {
    const { addToCart } = useApp();
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            setIsLoading(true);
            const response = await getWishlist();
            if (response.success) {
                setItems(response.data?.wishlist?.products || []);
            }
        } catch (error: any) {
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemove = async (productId: string) => {
        try {
            await apiRemoveFromWishlist(productId);
            setItems(items.filter(i => i.product._id !== productId));
            toast.success('Removed from wishlist');
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove item');
        }
    };

    const handleAddToCart = async (item: WishlistItem) => {
        if (item.product.stock <= 0) {
            toast.error('Item is out of stock');
            return;
        }
        await addToCart({
            id: item.product._id,
            title: item.product.title,
            price: item.product.price,
            image: item.product.images?.[0]?.url || '',
        });
        toast.success('Item added to cart');
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
            <h2 className="text-xl font-semibold">My Wishlist ({items.length})</h2>

            {items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg border border-dashed">
                    <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Your wishlist is empty</h3>
                    <p className="text-gray-500 mb-6">Save items you want to buy later</p>
                    <Button>Start Shopping</Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {items.map((item) => {
                        const product = item.product;
                        const discount = product.compareAtPrice
                            ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
                            : 0;

                        return (
                            <Card key={item._id} className="overflow-hidden group hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex gap-4">
                                    <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden shrink-0">
                                        <img
                                            src={product.images?.[0]?.url || '/placeholder.png'}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                    onClick={() => handleRemove(product._id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                                                {product.compareAtPrice && (
                                                    <>
                                                        <span className="text-sm text-gray-500 line-through">₹{product.compareAtPrice.toLocaleString()}</span>
                                                        <span className="text-xs text-green-600 font-medium">{discount}% OFF</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            {product.stock > 0 ? (
                                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">In Stock</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">Out of Stock</Badge>
                                            )}
                                            <Button
                                                size="sm"
                                                className="gap-2 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:bg-[#B8941F]"
                                                disabled={product.stock <= 0}
                                                onClick={() => handleAddToCart(item)}
                                            >
                                                <ShoppingCart className="w-4 h-4" /> Add to Cart
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
