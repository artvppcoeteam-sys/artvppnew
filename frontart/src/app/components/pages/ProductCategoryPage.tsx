import { useEffect, useMemo, useState } from 'react';
import { Grid, List, Search, Star, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { ProductCard, Product } from '../ProductCard';
import { getProducts } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

export function ProductCategoryPage() {
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const maxPriceLimit = 100000;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts({ page: 1, limit: 200 });
        const backendProducts = response?.data?.products || [];

        const mapped: Product[] = backendProducts.map((p: any) => ({
          id: p._id,
          slug: p.slug,
          title: p.title,
          artist: p.artist?.username || 'Unknown Artist',
          artistAvatar: p.artist?.avatar?.url || '',
          price: Number(p.price) || 0,
          image: p.images?.[0]?.url || '',
          category: p.category || 'other',
          rating: p.rating?.average || p.rating || 0,
          reviews: p.rating?.count || p.numReviews || 0,
          stock: p.stock !== undefined ? p.stock : (p.countInStock || 0),
        }));

        setProducts(mapped);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    const intervalId = window.setInterval(loadProducts, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  const availableCategories = ['painting', 'crafts', 'prints', 'other'];

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 50000]);
    setSearchQuery('');
  };

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q ||
        product.title.toLowerCase().includes(q) ||
        (product.artist && product.artist.toLowerCase().includes(q));

      // Category
      const matchesCategory = selectedCategories.length === 0 ||
        (product.category && selectedCategories.includes(product.category));

      // Price
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0; // featured/default
      }
    });
  }, [products, searchQuery, sortBy, selectedCategories, priceRange]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({
        id: product.id,
        title: product.title,
        price: product.price,
        image: product.image
      });
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] relative pb-24">
      {/* Artistic Hero Header Section (Sync with Artist/Service pages) */}
      <div className="relative h-[420px] bg-[#0A0A0A] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?q=80&w=1972&auto=format&fit=crop" 
            alt="Art Gallery Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#F7F8FA]" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-md" style={{ fontFamily: 'Playfair Display, serif' }}>
              Explore the <span className="text-[#a73f2b]">Art Gallery</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
              Discover unique expressions and timeless masterpieces from India's most talented independent artists.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area - Overlapping with Hero for tighter layout */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-white sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-gray-900 text-xl" style={{ fontFamily: 'Outfit, sans-serif' }}>Filters</h3>
                {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && (
                  <button onClick={clearFilters} className="text-xs text-[#b30452] hover:underline font-bold uppercase tracking-widest">
                    Reset
                  </button>
                )}
              </div>

              {/* Price Filter */}
              <div className="mb-10">
                <h4 className="font-bold text-gray-400 mb-5 text-[10px] uppercase tracking-[0.2em]">Price Range</h4>
                <Slider
                  defaultValue={[0, 50000]}
                  max={maxPriceLimit}
                  step={100}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={(val) => setPriceRange([val[0], val[1]])}
                  className="mb-5"
                />
                <div className="flex items-center justify-between">
                  <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-900">₹{priceRange[0].toLocaleString()}</div>
                  <span className="text-gray-300 px-1">—</span>
                  <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-xs font-bold text-gray-900">₹{priceRange[1].toLocaleString()}{priceRange[1] === maxPriceLimit ? '+' : ''}</div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-bold text-gray-400 mb-5 text-[10px] uppercase tracking-[0.2em]">Categories</h4>
                <div className="space-y-3">
                  {availableCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleCategory(cat)}>
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${selectedCategories.includes(cat)
                        ? 'bg-gradient-to-br from-[#a73f2b] to-[#b30452] border-transparent shadow-md shadow-[#b30452]/20'
                        : 'border-gray-100 bg-gray-50 group-hover:border-[#a73f2b]/30'
                        }`}>
                        {selectedCategories.includes(cat) && <span className="text-white text-[10px] font-bold italic">✓</span>}
                      </div>
                      <span className={`text-sm tracking-wide transition-all duration-300 capitalize ${selectedCategories.includes(cat) ? 'text-gray-900 font-bold' : 'text-gray-500 group-hover:text-gray-900'}`}>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white/60 backdrop-blur-xl p-5 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white mb-10 gap-5">

              <div className="relative max-w-sm w-full group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-[#b30452] transition-colors" />
                <Input
                  placeholder="Masterpieces, artists, styles..."
                  className="pl-12 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:border-[#b30452]/30 focus:ring-[#b30452]/5 transition-all h-12 text-sm shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-5 ml-auto">
                <span className="text-gray-400 text-[10px] hidden md:block uppercase tracking-[0.2em] font-black">
                  <span className="text-gray-900 text-sm">{filteredProducts.length}</span> Pieces
                </span>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[200px] rounded-2xl border-gray-100 h-12 bg-gray-50/50 text-sm focus:ring-0 active:scale-95 transition-transform">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/60 shadow-2xl">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden md:flex bg-gray-100/50 p-1 rounded-2xl border border-gray-100">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-10 w-10 p-0 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-10 w-10 p-0 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-md scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Rendering */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8 px-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="animate-pulse bg-white p-4 rounded-[32px] border border-gray-100 flex flex-col gap-4">
                    <div className="aspect-[4/5] bg-gray-50 rounded-2xl"></div>
                    <div className="h-4 bg-gray-50 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-50 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-md rounded-[48px] border border-white/60 shadow-inner px-10"
              >
                <div className="w-24 h-24 bg-gray-100/30 rounded-full flex items-center justify-center mb-8 border border-white shadow-xl">
                  <Search className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">No Masterpieces Found</h3>
                <p className="text-gray-500 mb-10 max-w-sm text-center font-light leading-relaxed">
                  The gallery is empty for these selections. Expand your search or clear filters to discover more.
                </p>
                <Button
                  onClick={clearFilters}
                  className="rounded-full px-12 h-14 bg-[#0A0A0A] hover:bg-[#b30452] text-white shadow-xl shadow-black/10 transition-all font-bold tracking-wide active:scale-95"
                >
                  Reset All Filters
                </Button>
              </motion.div>
            ) : (
              <div className={viewMode === 'grid'
                ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-2"
                : "flex flex-col gap-6"
              }>
                {filteredProducts.map((product, idx) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx % 4 * 0.1 }}
                  >
                    {viewMode === 'grid' ? (
                      <ProductCard
                        product={product}
                        onViewDetails={() => navigate(`/product/${product.slug || product.id}`)}
                        onAddToCart={() => handleAddToCart(product)}
                      />
                    ) : (
                      <div className="flex flex-col md:flex-row bg-white/80 backdrop-blur-md rounded-[32px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] border border-white overflow-hidden hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-500 group">
                        <div className="md:w-64 aspect-square bg-gray-100 cursor-pointer overflow-hidden" onClick={() => navigate(`/product/${product.slug || product.id}`)}>
                          <img src={product.image} alt={product.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        </div>
                        <div className="p-8 flex flex-col justify-between flex-1">
                          <div>
                            <p className="text-[10px] text-[#b30452] font-black mb-2 uppercase tracking-[0.25em]">{product.artist}</p>
                            <h3 className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-[#b30452] transition-colors line-clamp-1 mb-3 pr-10" style={{ fontFamily: 'Outfit, sans-serif' }} onClick={() => navigate(`/product/${product.slug || product.id}`)}>
                              {product.title}
                            </h3>
                            <div className="flex gap-3 items-center">
                              <Badge variant="secondary" className="capitalize bg-gray-50 text-gray-500 border-gray-100 font-bold text-[9px] px-3 tracking-widest">{product.category}</Badge>
                              {product.rating && !isNaN(product.rating) && product.rating > 0 && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-1.5 font-bold tracking-tighter">
                                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {product.rating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-auto pt-8 border-t border-gray-50">
                            <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{product.price.toLocaleString('en-IN')}</span>
                            <Button
                              className="bg-[#0A0A0A] hover:bg-[#b30452] text-white h-14 px-10 rounded-2xl shadow-xl shadow-black/5 hover:shadow-[#b30452]/20 hover:-translate-y-1 transition-all duration-300 font-bold active:scale-95"
                              onClick={() => handleAddToCart(product)}
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
