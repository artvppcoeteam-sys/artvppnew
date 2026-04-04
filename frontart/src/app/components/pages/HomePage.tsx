import { useState, useEffect } from 'react';
import { ArrowRight, Star, Palette, Users, Award, TrendingUp, Sparkles, Heart, ShoppingBag, Brush, CheckCircle, Play, ChevronRight, Info, Eye } from 'lucide-react';
import emp from '../../../assets/emp.png';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { featuredArtists } from '../../data/mockData';
import { getProducts } from '../../utils/api';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import slider1 from '../../../assets/slider1.jpg';
import slider2 from '../../../assets/slider2.jpg';
import slider3 from '../../../assets/slider3.jpg';
import slider4 from '../../../assets/slider4.jpg';
import slider5 from '../../../assets/slider5.jpg';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const }
  }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 }
  }
};

const SHOW_STATS_AND_FINAL_CTA = false;

export function HomePage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);

  const [featuredArtworks, setFeaturedArtworks] = useState<any[]>([]);

  // Fetch real products for the featured collection
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await getProducts({ limit: 8, sortBy: 'createdAt', sortOrder: 'desc' });
        if (res.success && res.data?.products) {
          setFeaturedArtworks(res.data.products.map((p: any) => ({
            id: p.slug || p._id,
            title: p.title,
            artist: p.artist?.username || 'Unknown Artist',
            image: p.images?.[0]?.url || '',
            price: p.price || 0,
            category: p.category || '',
            medium: p.category || '',
          })));
        }
      } catch (e) {
        console.error('Failed to fetch featured artworks:', e);
      }
    };
    fetchFeatured();
  }, []);

  const heroSlides = [
    { id: 'slide-1', image: "https://res.cloudinary.com/djljjozxa/image/upload/v1771403167/artvpp/frontend/images/slider1.jpg", title: 'Discover Indian Art', artist: 'Curated Collection' },
    { id: 'slide-2', image: "https://res.cloudinary.com/djljjozxa/image/upload/v1771403168/artvpp/frontend/images/slider2.jpg", title: 'Celebrate Creativity', artist: 'Master Works' },
    { id: 'slide-3', image: "https://res.cloudinary.com/djljjozxa/image/upload/v1771403169/artvpp/frontend/images/slider3.jpg", title: 'Timeless Beauty', artist: 'Heritage Series' },
    { id: 'slide-4', image: "https://res.cloudinary.com/djljjozxa/image/upload/v1771403170/artvpp/frontend/images/slider4.jpg", title: 'Modern Expressions', artist: 'Contemporary Art' },
    { id: 'slide-5', image: "https://res.cloudinary.com/djljjozxa/image/upload/v1771403172/artvpp/frontend/images/slider5.avif", title: 'Artistic Excellence', artist: 'Featured Artists' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);



  const handleViewPortfolio = (artistId: string) => {
    const artist = featuredArtists.find(a => a.id === artistId);
    setSelectedArtist(artist);
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      {/* Hero Section - matches marketing design */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black">
        {/* Background Layer with Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img
                src={heroSlides[currentSlide].image}
                alt={heroSlides[currentSlide].title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/40 z-1" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex flex-col items-center"
            >
              {/* Badge */}
              <motion.div variants={fadeIn} className="mb-6">
                <span className="inline-flex items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 text-sm font-medium text-white shadow-sm">
                  Values Art & Creativity
                </span>
              </motion.div>

              {/* Main Heading improved visibility and responsiveness */}
              <motion.div variants={fadeIn} className="mb-2 w-full">
                <h1 className="text-3xl sm:text-5xl lg:text-[72px] font-bold text-white tracking-tight leading-[1.2] lg:leading-[1.1] drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Your ART deserves
                </h1>
              </motion.div>

              <motion.div variants={fadeIn} className="mb-6 w-full">
                <h2 className="text-3xl sm:text-5xl lg:text-[72px] font-bold text-white tracking-tight leading-[1.2] lg:leading-[1.1] drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Freedom Upload Free on
                </h2>
              </motion.div>
              <motion.div variants={fadeIn} className="mb-6 px-4 text-center">
                <span
                  className="text-5xl sm:text-8xl lg:text-[96px] font-extrabold tracking-tight inline-block px-4"
                  style={{
                    background: "linear-gradient(to right, #fdbc5aff, #fc5522ff, #f345c7ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(2px 2px 14px rgba(0,0,0,0.35))",
                    fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif",
                    lineHeight: "1.2",
                    letterSpacing: "-1px",
                    fontWeight: "900"
                  }}
                >
                  ArtVPP
                </span>
              </motion.div>
              {/* CTA Buttons */}
              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-5">
                <Button
                  size="lg"
                  onClick={() => navigate('/marketplace')}
                  className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-white px-8 sm:px-12 py-5 sm:py-7 text-lg sm:text-xl rounded-2xl font-bold border-0 shadow-lg shadow-[#b30452]/20"
                >
                  Explore Products
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/marketplace')}
                  className="bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-white hover:text-black px-8 sm:px-12 py-5 sm:py-7 text-lg sm:text-xl rounded-2xl font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  Our Artworks
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {SHOW_STATS_AND_FINAL_CTA && (
        <>
          {/* Stats Bar */}
          <section className="bg-gradient-to-r from-[#6A11CB] to-[#2575FC] py-12">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
                {[
                  { value: '5,000+', label: 'Artworks Available' },
                  { value: '1,200+', label: 'Talented Artists' },
                  { value: '15,000+', label: 'Happy Collectors' },
                  { value: '98%', label: 'Satisfaction Rate' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-3xl lg:text-4xl font-light mb-2">{stat.value}</div>
                    <div className="text-sm opacity-90 tracking-wide">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* Featured Collection */}
      <section className="py-20 bg-white">
        <div className="max-w-[1200px] mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Featured Collection
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] mx-auto mb-6 rounded-full" />
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Discover our hand-picked selection of premium artworks from top Indian artists.
            </p>
          </motion.div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-8">
            {featuredArtworks.length === 0 ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse w-full">
                  <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-4" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              ))
            ) : (
              featuredArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  variants={fadeIn}
                  whileHover={{ y: -10 }}
                  onClick={() => navigate(`/product/${artwork.id}`)}
                  className="group cursor-pointer w-full"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-white mb-4 rounded-[12px] shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex items-center justify-center">
                    <img
                      src={artwork.image}
                      alt={artwork.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

                    {/* Quick Actions */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <button className="bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors">
                        <Heart className="w-5 h-5 text-gray-900" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 px-1">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#b30452] transition-colors line-clamp-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {artwork.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">{artwork.artist}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-lg font-bold text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ₹{artwork.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 capitalize bg-gray-100 px-1.5 py-0.5 rounded">{artwork.medium}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <motion.div variants={fadeIn} className="text-center mt-16">
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/marketplace')}
              className="border border-gray-200 bg-white text-gray-900 hover:bg-gray-50 px-12 py-6 text-base rounded-[10px] font-medium tracking-wide shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
            >
              VIEW ALL ARTWORKS
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Explore by Category */}
      <section className="py-24 bg-[#F8F9FB]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 mb-2" style={{ fontFamily: 'Poppins, sans-serif', letterSpacing: '-0.3px' }}>
                Explore by Category
              </h2>
              <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto">
                From traditional to contemporary, physical to digital – discover the perfect creative solution.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Physical Art',
                  subtitle: 'Originals & prints',
                  image: 'https://russell-collection.com/wp-content/uploads/2025/04/abstract-art-examples.jpg?&w=900',
                  onClick: () => navigate('/marketplace')
                },
                {
                  name: 'Digital Art',
                  subtitle: 'Instant downloads',
                  image: 'https://vac3.sgp1.digitaloceanspaces.com/wp-content/uploads/2023/05/06162238/176937-1536x864.webp?w=900',
                  onClick: () => navigate('/marketplace')
                },
                {
                  name: 'Custom Services',
                  subtitle: 'Commissions & more',
                  image: 'https://5.imimg.com/data5/SELLER/Default/2023/2/YE/UO/VJ/9107407/beautiful-abstract-frameless-wall-painting-for-home-springfield-500x500.jpg?v=165448385&w=900',
                  onClick: () => navigate('/services')
                },
                {
                  name: 'Learn',
                  subtitle: 'Workshops & courses',
                  image: 'https://t4.ftcdn.net/jpg/04/48/77/29/360_F_448772985_m27ElmCFlqzL7d7tfwlSRNpnU6k7MA7l.jpg?w=900',
                  onClick: () => navigate('/services')
                }
              ].map((category) => (
                <motion.button
                  key={category.name}
                  variants={fadeIn}
                  whileHover={{ y: -6 }}
                  onClick={category.onClick}
                  className="group text-left rounded-3xl overflow-hidden bg-white shadow-[0_14px_45px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-[#b30452]"
                >
                  <div className="relative aspect-[4/3]">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute inset-0 flex items-end">
                      <div className="p-4 sm:p-5">
                        <h3 className="text-base sm:text-lg font-semibold text-white mb-1">
                          {category.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-white/80">
                          {category.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Artist Spotlight - Full Width */}
      <section className="py-0 bg-[#F8F9FB]" >
        <div className="grid lg:grid-cols-2">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-[500px] lg:h-[700px] overflow-hidden"
          >
            <img
              src={emp}
              alt="Artist at work"
              className="w-full h-full object-cover"
            />
            {/* Added overlay to ensure it's not too bright if image is light */}
            <div className="absolute inset-0 bg-black/15" />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="flex items-center bg-[#F8F9FB] p-6 md:p-12 lg:p-20"
          >
            <div>

              <h2 className="text-4xl lg:text-5xl mb-6 font-light tracking-tight text-gray-900">
                Empowering Artists
                <br />
                Worldwide
              </h2>

              <p className="text-lg text-gray-600 mb-8 font-light leading-relaxed">
                Join our community of over 1,200 talented artists showcasing their work to art enthusiasts across India. From traditional masters to contemporary innovators.
              </p>

              <div className="space-y-6 mb-10">
                {[
                  { title: 'Global Recognition', desc: 'Showcase your work to thousands of collectors' },
                  { title: 'Fair Commission', desc: 'Industry-leading rates for artists' },
                  { title: 'Full Support', desc: 'Marketing, logistics, and customer service handled' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-2 h-2 bg-[#b30452] hover:bg-[#a73f2b] rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-sm text-gray-600 font-light">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/sell')}
                  className="bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 text-white px-12 py-6 text-base rounded-[10px] font-semibold tracking-wide shadow-sm hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:-translate-y-0.5 transition-all duration-300 border-0"
                >
                  Become an Artist
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/services')}
                  className="bg-white border border-gray-200 text-gray-900 px-10 py-6 text-base rounded-[10px] font-medium tracking-wide hover:bg-gray-50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
                >
                  Explore Services
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-20 px-5 bg-[#fafafa]">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
                Featured Artists
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] mx-auto mb-6 rounded-full" />
              <p className="text-gray-600 max-w-2xl mx-auto text-lg font-light">
                Meet the creative minds behind our selection
              </p>
            </motion.div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-y-20 gap-x-8 pt-10">
              {featuredArtists.map((artist) => (
                <motion.div
                  key={artist.id}
                  variants={fadeIn}
                  whileHover={{ y: -6, boxShadow: '0 14px 40px rgba(0,0,0,0.12)' }}
                  className="bg-white rounded-[18px] p-7 pt-16 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col items-center text-center transition-all duration-300 ease-in-out group cursor-pointer relative"
                  onClick={() => handleViewPortfolio(artist.id)}
                >
                  {/* Overlapping Artist Image */}
                  <div className="absolute -top-[65px] left-1/2 -translate-x-1/2 z-10">
                    <div className="w-[130px] h-[130px] rounded-full overflow-hidden border-4 border-white shadow-[0_8px_25px_rgba(0,0,0,0.15)] bg-white">
                      <img
                        src={artist.avatar}
                        alt={artist.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {artist.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium mb-6">
                    {artist.specialty}
                  </p>

                  <div className="w-full flex items-center justify-around border-y border-gray-50 py-4 mb-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="text-xs">🎨</span>
                        <div className="text-lg font-bold text-gray-900 bg-[#f5f5f5] px-3 py-1 rounded-[14px]">{artist.artworks}</div>
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Works</div>
                    </div>
                    <div className="w-[1px] h-10 bg-gray-100" />
                    <div className="text-center">
                      <div className="flex items-center gap-1.5 justify-center">
                        <span className="text-xs">👥</span>
                        <div className="inline-flex items-center px-3.5 py-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] text-white rounded-full text-xs font-bold shadow-sm">
                          {artist.followers}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mt-1">Followers</div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewPortfolio(artist.id);
                    }}
                    className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] text-white font-bold py-2.5 rounded-[10px] transition-all duration-300 hover:-translate-y-0.5 shadow-md shadow-[#b30452]/20 text-sm"
                  >
                    View Profile
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>


      {/* Why Choose Artvpp */}
      <section className="py-20 bg-white" >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#111827] mb-2">
                Why Choose Artvpp ?
              </h2>
              <p className="text-sm sm:text-base text-[#6B7280] max-w-2xl mx-auto">
                We&apos;re committed to creating the best experience for artists and art lovers.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  iconBg: 'bg-[#FDE7FF]',
                  iconColor: 'text-[#EC4899]',
                  title: 'Curated Selection',
                  desc: 'Every artwork and artist is carefully vetted for quality and authenticity.'
                },
                {
                  iconBg: 'bg-[#E0ECFF]',
                  iconColor: 'text-[#4F46E5]',
                  title: 'Artist Community',
                  desc: 'Join a vibrant community of artists and creative professionals.'
                },
                {
                  iconBg: 'bg-[#DCFCE7]',
                  iconColor: 'text-[#22C55E]',
                  title: 'Secure Payments',
                  desc: 'Safe and secure transactions with buyer protection.'
                },
                {
                  iconBg: 'bg-[#FFE4E6]',
                  iconColor: 'text-[#FB7185]',
                  title: 'Growth Support',
                  desc: 'Tools and resources to help artists grow their business.'
                }
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  variants={fadeIn}
                  className="text-center px-4"
                >
                  <div
                    className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${item.iconBg} ${item.iconColor}`}
                  >
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-[#111827] mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B7280] leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>




      {/* Ready to Start CTA - full width above footer */}
      <section className="relative py-20 text-white overflow-hidden" >
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#a73f2b] to-[#b30452] opacity-95" />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_55%)]" />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeIn}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-4"
            >
              Ready to Start Your Creative Journey?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-sm sm:text-base md:text-lg text-white/90 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of artists and art lovers in India&apos;s fastest-growing creative marketplace.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Button
                size="lg"
                onClick={() => navigate('/marketplace')}
                className="bg-white text-gray-900 hover:bg-gray-50 px-8 sm:px-10 py-3 rounded-[10px] font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250"
              >
                Explore Marketplace
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/sell')}
                className="border border-white/40 text-white bg-transparent hover:bg-white/10 px-8 sm:px-10 py-3 rounded-[10px] font-medium transition-all duration-250"
              >
                Become a Vendor
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Artist Portfolio Dialog */}
      < Dialog open={!!selectedArtist
      } onOpenChange={(open) => !open && setSelectedArtist(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArtist && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={selectedArtist.avatar}
                    alt={selectedArtist.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#b30452]"
                  />
                  <div>
                    <DialogTitle className="text-3xl font-light" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {selectedArtist.name}
                    </DialogTitle>
                    <DialogDescription className="text-base text-gray-600">
                      {selectedArtist.specialty}
                    </DialogDescription>
                    {selectedArtist.verified && (
                      <Badge className="mt-2 bg-[#b30452] hover:bg-[#a73f2b] text-white border-0">
                        Verified Artist
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 text-gray-900">About the Artist</h3>
                  <p className="text-gray-600 font-light leading-relaxed">{selectedArtist.bio}</p>
                </div>

                <div className="flex items-center gap-8 py-6 border-y">
                  <div>
                    <p className="text-3xl font-light text-[#b30452]">{selectedArtist.artworks}</p>
                    <p className="text-sm text-gray-600">Artworks Created</p>
                  </div>
                  <div>
                    <p className="text-3xl font-light text-[#b30452]">{selectedArtist.followers}</p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-[#b30452] text-[#b30452]" />
                      <span className="text-3xl font-light">4.9</span>
                    </div>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-900">Portfolio Gallery</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      "https://res.cloudinary.com/djljjozxa/image/upload/v1771403139/artvpp/frontend/images/a.jpg", "https://res.cloudinary.com/djljjozxa/image/upload/v1771403144/artvpp/frontend/images/d.jpg", "https://res.cloudinary.com/djljjozxa/image/upload/v1771403150/artvpp/frontend/images/g.jpg",
                      "https://res.cloudinary.com/djljjozxa/image/upload/v1771403160/artvpp/frontend/images/l.jpg", "https://res.cloudinary.com/djljjozxa/image/upload/v1771403164/artvpp/frontend/images/p.jpg", "https://res.cloudinary.com/djljjozxa/image/upload/v1771403183/artvpp/frontend/images/y.jpg"
                    ].map((img, i) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden group cursor-pointer">
                        <img
                          src={img}
                          alt={`Artwork ${i}`}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => {
                      setSelectedArtist(null);
                      navigate('/services');
                    }}
                    className="flex-1 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 text-white py-6 text-base rounded-[10px] font-medium shadow-sm hover:shadow-[0px_6px_20px_rgba(179,4,82,0.3)] transition-all duration-300 border-0"
                  >
                    <Eye className="mr-2 h-5 w-5" />
                    Request Commission
                  </Button>
                  <Button
                    onClick={() => setSelectedArtist(null)}
                    variant="outline"
                    className="px-8 py-6 text-base rounded-[10px] border border-gray-200"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
