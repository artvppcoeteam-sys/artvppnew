import { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, Eye, Share2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, addToCart, user } = useApp();

  const handleRemoveFromWishlist = async (id: string) => {
    try {
      await removeFromWishlist(id);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error('Failed to remove from wishlist');
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      await addToCart({
        id: item.id,
        title: item.title,
        price: item.price,
        image: item.image,
        slug: item.slug
      });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleAddAllToCart = async () => {
    if (wishlist.length === 0) return;

    try {
      let added = 0;
      for (const item of wishlist) {
        await addToCart({
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          slug: item.slug
        });
        added++;
      }
      toast.success(`Added ${added} items to cart!`);
    } catch (error) {
      toast.error('Failed to add all items to cart');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Wishlist link copied to clipboard!');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">Please log in to view your wishlist</p>
              <Button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white rounded-[10px]">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalValue = wishlist.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8 text-[#a73f2b] fill-current" />
                My Wishlist
              </h1>
              <p className="text-gray-600">
                {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button
                onClick={handleAddAllToCart}
                className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white rounded-[10px] gap-2 border-0"
                disabled={wishlist.length === 0}
              >
                <ShoppingCart className="w-4 h-4" />
                Add All to Cart
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        {wishlist.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Total Value</p>
                  <p className="text-2xl font-bold text-[#a73f2b]">
                    ₹{totalValue.toLocaleString('en-IN')}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Items in Wishlist</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {wishlist.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wishlist Items */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {wishlist.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                  <div className="relative">
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-2"
                          onClick={() => navigate(`/product/${item.slug || item.id}`)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 text-gray-500">Artist details on product page</p>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-bold text-[#a73f2b]">
                        ₹{(item.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white rounded-[10px] border-0"
                      onClick={() => handleAddToCart(item)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {wishlist.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              Save your favorite artworks here to keep track of what you love.
            </p>
            <Button
              onClick={() => navigate('/marketplace')}
              className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white px-8 py-6 h-auto text-lg rounded-[10px] border-0"
            >
              Explore Collection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
