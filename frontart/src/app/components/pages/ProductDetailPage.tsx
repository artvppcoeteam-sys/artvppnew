import { useEffect, useState } from 'react';
import { Heart, ShoppingBag, ShoppingCart, Star, Package, Paintbrush, Ruler, Calendar, Tag, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
// @ts-ignore – api.js is a plain JS module with no TS declaration issues at runtime
import { getProductBySlug, getProducts } from '../../utils/api';

type ProductDetails = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  price: number;
  stock?: number;
  countInStock?: number;
  rating?: number | { average?: number; count?: number };
  numReviews?: number;
  medium?: string;
  material?: string;
  dimensions?: string;
  yearCreated?: number;
  artist?: { username?: string; avatar?: { url: string }; _id?: string };
  images?: { url: string }[];
};

export function ProductDetailPage() {
  const { id: slugOrId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slugOrId) return;
      try {
        setLoading(true);
        setSelectedImage(0);
        const productRes = await getProductBySlug(slugOrId);
        const foundProduct = productRes?.data?.product;
        setProduct(foundProduct || null);

        if (foundProduct?.category) {
          const relatedRes = await getProducts({ category: foundProduct.category, limit: 8 });
          const list = (relatedRes?.data?.products || [])
            .filter((p: any) => p._id !== foundProduct._id)
            .slice(0, 4);
          setRelatedProducts(list);
        } else {
          setRelatedProducts([]);
        }
      } catch (error) {
        console.error("Error loading product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slugOrId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product._id,
      title: product.title,
      price: product.price,
      image: product.images?.[0]?.url || ''
    });
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="bg-gray-50 border-b py-4">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-4">
              <div className="h-[500px] bg-gray-200 rounded-[10px] animate-pulse" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />)}
              </div>
            </div>
            <div className="space-y-6">
              <div className="h-6 bg-gray-200 w-1/3 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 w-3/4 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 w-1/4 rounded animate-pulse" />
              <div className="h-12 bg-gray-200 w-1/3 rounded animate-pulse" />
              <div className="h-24 bg-gray-200 w-full rounded animate-pulse" />
              <div className="h-12 bg-gray-200 w-full rounded animate-pulse" />
              <div className="h-12 bg-gray-200 w-full rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Artwork not found</h2>
          <Button onClick={() => navigate('/marketplace')} className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white rounded-[10px]">
            Back to Collection
          </Button>
        </div>
      </div>
    );
  }

  const images = (product.images || []).map((img) => img.url);
  const displayImages = images.length > 0 ? images : ['/placeholder.jpg'];
  const ratingRaw = product.rating as any;
  const rating = typeof ratingRaw === 'object' && ratingRaw !== null ? (Number(ratingRaw.average) || 0) : (Number(ratingRaw) || 0);
  const reviews = typeof ratingRaw === 'object' && ratingRaw !== null ? (ratingRaw.count || product.numReviews || 0) : (product.numReviews || 0);
  const stockCount = product.stock !== undefined ? product.stock : (product.countInStock || 0);
  const inStock = stockCount > 0;

  const formatDetailValue = (val: any) => {
    if (!val) return '—';
    if (typeof val === 'object') {
      if (val.width && val.height) {
        return `${val.width} x ${val.height} ${val.unit || ''}`;
      }
      if (val.name) return String(val.name);
      return '—';
    }
    return String(val);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button onClick={() => navigate('/')} className="hover:text-gray-900 transition-colors">Home</button>
            <span>/</span>
            <button onClick={() => navigate('/marketplace')} className="hover:text-gray-900 transition-colors">Marketplace</button>
            <span>/</span>
            <span className="text-gray-900 truncate max-w-xs">{String(product.title || '')}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          <div className="space-y-4">
            <div className="relative h-[480px] bg-white overflow-hidden rounded-xl shadow-sm group cursor-zoom-in border border-gray-100" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={displayImages[selectedImage]}
                alt={String(product.title || 'Artwork')}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                loading="eager"
              />
              <button
                className={`absolute top-5 right-5 p-2.5 rounded-full shadow-md transition-all hover:scale-110 ${isWishlisted ? 'bg-white text-red-500' : 'bg-white/90 text-gray-600 hover:text-red-400'}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {displayImages.length > 1 && (
              <div className={`grid gap-3 ${displayImages.length > 4 ? 'grid-cols-5' : 'grid-cols-4'}`}>
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-20 overflow-hidden bg-white rounded-lg border-2 transition-all flex items-center justify-center ${selectedImage === index ? 'border-[#b30452] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-contain" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 capitalize border-0 text-xs font-medium rounded px-2 py-0.5">
                {formatDetailValue(product.category) || 'Art'}
              </Badge>
            </div>

            <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-3 leading-tight">
              {String(product.title || '')}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                {product.artist?.avatar?.url ? (
                  <img src={product.artist.avatar.url} alt={product.artist.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-200">
                    {(product.artist?.username || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-gray-600 text-sm">by <span className="font-medium text-[#b30452]">{String(product.artist?.username || 'Unknown Artist')}</span></span>
            </div>

            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-700">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
              <span className="text-sm text-gray-400">({reviews} reviews)</span>
            </div>

            <div className="mb-5">
              <div className="text-4xl font-bold text-gray-900">
                ₹{Number(product.price || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-gray-400 mt-1">Inclusive of all taxes</div>
            </div>

            {inStock ? (
              stockCount <= 5 ? (
                <div className="text-sm text-orange-500 font-medium mb-4">⚠️ Only {stockCount} left in stock</div>
              ) : (
                <div className="text-sm text-green-600 font-medium mb-4">✓ In Stock</div>
              )
            ) : (
              <div className="text-sm text-red-500 font-medium mb-4">✗ Out of Stock</div>
            )}

            <div className="text-gray-600 leading-relaxed mb-7 text-sm border-t pt-5">
              {String(product.description || 'A unique and beautiful piece of art crafted with care.')}
            </div>

            <div className="space-y-3 mb-8">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!inStock}
                className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white h-12 text-base rounded-[10px] font-semibold border-0 flex items-center gap-2"
              >
                <ShoppingCart className="h-5 w-5" />
                ADD TO CART
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleBuyNow}
                disabled={!inStock}
                className="w-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white h-12 text-base rounded-[10px] font-semibold flex items-center gap-2 transition-all duration-200"
              >
                <ShoppingBag className="h-5 w-5" />
                BUY NOW
              </Button>
            </div>

            <div className="border border-gray-100 rounded-[10px] p-5 bg-gray-50">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Artwork Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                    <User className="w-4 h-4 text-[#b30452]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Artist</div>
                    <div className="font-medium text-gray-900 text-sm">{String(product.artist?.username || 'Unknown')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Tag className="w-4 h-4 text-[#b30452]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Category</div>
                    <div className="font-medium text-gray-900 text-sm capitalize">{formatDetailValue(product.category)}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Paintbrush className="w-4 h-4 text-[#b30452]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Medium</div>
                    <div className="font-medium text-gray-900 text-sm">{formatDetailValue(product.medium) || 'Mixed Media'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Package className="w-4 h-4 text-[#b30452]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Material</div>
                    <div className="font-medium text-gray-900 text-sm">{formatDetailValue(product.material) || 'Canvas'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Ruler className="w-4 h-4 text-[#b30452]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Size</div>
                    <div className="font-medium text-gray-900 text-sm">{formatDetailValue(product.dimensions) || 'Standard'}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                    <Calendar className="w-4 h-4 text-[#b30452]" />
                  </div>
                  <div>
                    <div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Year</div>
                    <div className="font-medium text-gray-900 text-sm">{formatDetailValue(product.yearCreated) || new Date().getFullYear()}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="border-t pt-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related: any) => (
                <div
                  key={related._id || related.id}
                  onClick={() => navigate(`/product/${related.slug || related._id || related.id}`)}
                  className="group cursor-pointer bg-white rounded-[10px] shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all hover:-translate-y-1"
                >
                  <div className="h-[180px] overflow-hidden bg-gray-100">
                    <img
                      src={related.images?.[0]?.url || related.image || '/placeholder.jpg'}
                      alt={String(related.title || 'Related Art')}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-500 truncate mb-1">
                      {typeof related.artist === 'object' ? String(related.artist?.username || 'Artist') : String(related.artist || 'Artist')}
                    </div>
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-1 group-hover:text-[#b30452] transition-colors">{String(related.title || '')}</h3>
                    <div className="text-[#b30452] font-bold mt-2 text-sm">₹{Number(related.price || 0).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
