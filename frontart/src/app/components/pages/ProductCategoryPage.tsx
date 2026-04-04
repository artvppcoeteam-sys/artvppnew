import { useEffect, useMemo, useState } from 'react';
import { Grid, List, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Slider } from '../ui/slider';
import { ProductCard, Product } from '../ProductCard';
import { getProducts } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';

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

  const availableCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [products]);

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
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header Area */}
      <div className="bg-white border-b py-8 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl mb-2 font-semibold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Discover Art
          </h1>
          <p className="text-gray-500 text-sm">
            Explore original artworks, prints, and handcrafted pieces from independent artists.
          </p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <div className="w-full lg:w-56 shrink-0 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-gray-900 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Filters</h3>
                {(selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000) && (
                  <button onClick={clearFilters} className="text-xs text-[#b30452] hover:underline font-medium">
                    Clear All
                  </button>
                )}
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wider">Price Range</h4>
                <Slider
                  defaultValue={[0, 50000]}
                  max={maxPriceLimit}
                  step={100}
                  value={[priceRange[0], priceRange[1]]}
                  onValueChange={(val) => setPriceRange([val[0], val[1]])}
                  className="mb-3"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 font-medium text-gray-600">₹{priceRange[0].toLocaleString()}</span>
                  <span className="text-xs text-gray-400">—</span>
                  <span className="text-xs bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 font-medium text-gray-600">₹{priceRange[1].toLocaleString()}{priceRange[1] === maxPriceLimit ? '+' : ''}</span>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 text-xs uppercase tracking-wider">Categories</h4>
                <div className="space-y-2">
                  {availableCategories.length === 0 && !loading && (
                    <p className="text-xs text-gray-500">No categories found.</p>
                  )}
                  {availableCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200 ${selectedCategories.includes(cat)
                        ? 'bg-gradient-to-r from-[#a73f2b] to-[#b30452] border-[#a73f2b]'
                        : 'border-gray-300 group-hover:border-[#a73f2b]'
                        }`}>
                        {selectedCategories.includes(cat) && <span className="text-white text-[9px] font-bold">✓</span>}
                      </div>
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize transition-colors">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100 mb-5 gap-3">

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search artworks, artists..."
                  className="pl-9 rounded-lg bg-gray-50 border-gray-200 focus:bg-white transition-all h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <span className="text-gray-500 text-sm hidden md:block">
                  <strong className="text-gray-900">{filteredProducts.length}</strong> results
                </span>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] rounded-lg border-gray-200 h-9 bg-gray-50 text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="name">Name: A to Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden md:flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`h-8 w-8 p-0 rounded-md ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm hover:bg-white/90' : 'text-gray-500'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={`h-8 w-8 p-0 rounded-md ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm hover:bg-white/90' : 'text-gray-500'}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product Grid / List */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="animate-pulse flex flex-col bg-white p-3 rounded-xl" style={{ aspectRatio: '2/3' }}>
                    <div className="bg-gray-200 rounded-lg mb-3" style={{ flex: 1 }}></div>
                    <div className="h-3 bg-gray-200 w-2/3 mb-1.5 rounded"></div>
                    <div className="h-3 bg-gray-200 w-1/2 mb-2 rounded"></div>
                    <div className="h-7 bg-gray-200 w-full rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-900 text-lg font-semibold">No artworks found</p>
                <p className="text-gray-500 mb-6 mt-2 text-sm">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters} className="rounded-lg">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-4'}>
                {filteredProducts.map((product) => (
                  viewMode === 'grid' ? (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={() => navigate(`/product/${product.slug || product.id}`)}
                      onAddToCart={handleAddToCart}
                    />
                  ) : (
                    <div key={product.id} className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="w-40 h-40 shrink-0 bg-gray-100 cursor-pointer" onClick={() => navigate(`/product/${product.slug || product.id}`)}>
                        <img src={product.image} alt={product.title} loading="lazy" className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4 flex flex-col justify-between flex-1">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">{product.artist}</p>
                          <h3 className="text-base font-semibold text-gray-900 cursor-pointer hover:text-[#b30452] line-clamp-1" style={{ fontFamily: 'Inter, sans-serif' }} onClick={() => navigate(`/product/${product.slug || product.id}`)}>
                            {product.title}
                          </h3>
                          <div className="mt-1 flex gap-2 items-center">
                            <span className="capitalize px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">{product.category}</span>
                            {product.rating && !isNaN(product.rating) && product.rating > 0 && (
                              <span className="text-[11px] text-gray-500">⭐ {product.rating.toFixed(1)}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
                          <Button
                            className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] text-white h-8 px-4 text-xs font-semibold rounded-lg border-0 shadow-sm hover:shadow-[#b30452]/20 transition-all duration-300"
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
