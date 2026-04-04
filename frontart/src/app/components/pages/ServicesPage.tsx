import { ArrowRight, Clock, Loader2, Search, Camera, Video, Paintbrush, Layers, GraduationCap, Boxes, Building2, Palette } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPlatformServiceConfig, getServiceCategories, getServices } from '../../utils/api';
import { Input } from '../ui/input';
import { toast } from 'sonner';

// Platform services — Studio on Hire is live, others are coming soon
const PLATFORM_SERVICES = [
  {
    id: 'studio-hire',
    title: 'Studio on Hire',
    description: 'Professional video & photo studio with chroma green screen, lighting, Sony A7M3 camera kit and full equipment setup.',
    icon: <Building2 className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600',
    available: true,
    link: '/services/studio-hire',
  },
  {
    id: 'photography',
    title: 'Photography',
    description: 'Professional photography services for events, portraits, products, and creative projects.',
    icon: <Camera className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
    available: true,
    link: '/services/photography',
    configKey: 'photography',
  },
  {
    id: 'calligraphy',
    title: 'Calligraphy',
    description: 'Hand lettering and calligraphy for invitations, branding, wall art, and custom commissions.',
    icon: <Paintbrush className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600',
    available: true,
    link: '/services/calligraphy',
    configKey: 'calligraphy',
  },
  {
    id: 'videography',
    title: 'Videography',
    description: 'Cinematic videography for short films, reels, corporate videos, and documentaries.',
    icon: <Video className="w-7 h-7" />,
    image: 'data:image/jpeg;base64,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',
    available: false,
  },
  {
    id: 'wall-painting',
    title: 'Wall Painting',
    description: 'Custom indoor & outdoor wall paintings, murals, and artistic wall décor by professional artists.',
    icon: <Paintbrush className="w-7 h-7" />,
    image: 'https://res.cloudinary.com/djljjozxa/image/upload/v1771403170/artvpp/frontend/images/slider4.jpg',
    available: false,
  },
  {
    id: 'sculpture-3d',
    title: 'Sculpture & 3D Art',
    description: 'Custom sculptures, 3D art installations, and artistic modeling services.',
    icon: <Boxes className="w-7 h-7" />,
    image: 'https://res.cloudinary.com/djljjozxa/image/upload/v1771403183/artvpp/frontend/images/y.jpg',
    available: false,
  },
  {
    id: 'design-branding',
    title: 'Design & Branding',
    description: 'Logo design, branding packages, and creative design services for businesses and individuals.',
    icon: <Palette className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600',
    available: false,
  },
  {
    id: 'workshops',
    title: 'Workshops & Classes',
    description: 'Art workshops, creative classes, and hands-on learning sessions with professional artists.',
    icon: <GraduationCap className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
    available: false,
  },
];

export function ServicesPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [platformConfigs, setPlatformConfigs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  );
  const [comingSoonService, setComingSoonService] = useState<any>(null);

  // Sync category filter when URL query changes
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, categoriesRes] = await Promise.all([
          getServices({ page: 1, limit: 200 }),
          getServiceCategories()
        ]);

        if (servicesRes?.success) {
          setServices(servicesRes?.data?.services || []);
        }

        if (categoriesRes?.success) {
          setCategories(categoriesRes?.data?.categories || []);
        }

        const configKeys = PLATFORM_SERVICES.map((service: any) => service.configKey).filter(Boolean);
        if (configKeys.length) {
          const results = await Promise.all(
            configKeys.map((key: string) => getPlatformServiceConfig(key).catch(() => null))
          );
          const nextMap: Record<string, any> = {};
          results.forEach((res: any, index: number) => {
            const key = configKeys[index];
            if (res?.success) nextMap[key] = res?.data?.service || null;
          });
          setPlatformConfigs(nextMap);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch = !q
        || service.title?.toLowerCase().includes(q)
        || service.description?.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [services, selectedCategory, search]);

  const handleServiceClick = (service: any) => {
    if (service.available) {
      navigate(service.link);
    } else {
      setComingSoonService(service);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Hero */}
      <section className="relative py-20 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl mb-6 font-light tracking-tight text-[#111827] leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
              Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Explore our range of professional artistic services tailored to your needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Platform Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-[#111827] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              What We Offer
            </h2>
            <p className="text-gray-600 font-light max-w-xl mx-auto">
              Professional creative services powered by ArtVPP
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLATFORM_SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                whileHover={{ y: -8 }}
                onClick={() => handleServiceClick(service)}
                className="cursor-pointer group"
              >
                <Card className="overflow-hidden border-0 shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300 h-full relative rounded-2xl bg-white group-hover:ring-1 group-hover:ring-[#b30452]/20">
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                    <img
                      src={service.configKey ? (platformConfigs?.[service.configKey]?.heroImage?.url || platformConfigs?.[service.configKey]?.galleryImages?.[0]?.url || service.image) : service.image}
                      alt={service.configKey ? (platformConfigs?.[service.configKey]?.title || service.title) : service.title}
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!service.available ? 'grayscale-[40%]' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Available / Coming Soon Badge */}
                    {service.available ? (
                      <Badge className="absolute top-3 right-3 bg-emerald-500 text-white border-0 shadow-lg text-xs">
                        ● Available
                      </Badge>
                    ) : (
                      <Badge className="absolute top-3 right-3 bg-gray-800/80 text-white border-0 shadow-lg text-xs">
                        Coming Soon
                      </Badge>
                    )}

                    {/* Icon overlay */}
                    <div className="absolute bottom-3 left-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        {service.icon}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="text-lg font-semibold text-[#111827] mb-1.5 group-hover:text-[#4F46E5] transition-colors">
                      {service.configKey ? (platformConfigs?.[service.configKey]?.title || service.title) : service.title}
                    </h3>
                    <p className="text-sm text-gray-500 font-light line-clamp-2 leading-relaxed">
                      {service.configKey ? (platformConfigs?.[service.configKey]?.subtitle || service.description) : service.description}
                    </p>

                    {service.available && (
                      <div className="mt-4 flex items-center text-sm font-semibold text-[#b30452] group-hover:gap-2 transition-all">
                        View Details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DB Services (from artists) */}
      {!loading && filteredServices.length > 0 && (
        <section className="py-20 bg-[#F8F9FB]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14"
            >
              <h2 className="text-3xl md:text-4xl font-semibold text-[#111827] mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                Artist Services
              </h2>
              <p className="text-gray-600 font-light max-w-xl mx-auto">
                Services offered by our talented artists
              </p>
            </motion.div>

            <div className="mb-8 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9 rounded-[10px]"
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory('all')}
                  className={selectedCategory === 'all' ? 'bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0' : ''}
                >
                  All
                </Button>
                {categories.map((categoryObj) => (
                  <Button
                    key={categoryObj._id}
                    variant={selectedCategory === categoryObj._id ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(categoryObj._id)}
                    className={selectedCategory === categoryObj._id ? 'bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0' : ''}
                  >
                    {categoryObj._id} ({categoryObj.count})
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden border-0 shadow-[0_6px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.12)] transition-all duration-300 h-full group bg-white rounded-2xl group-hover:ring-1 group-hover:ring-[#b30452]/20">
                    <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative">
                      <img
                        src={service.images?.[0]?.url || '/placeholder.jpg'}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className="absolute top-4 right-4 bg-white/95 text-gray-900 border-0">
                        {service.category}
                      </Badge>
                    </div>

                    <CardContent className="p-8">
                      <h3 className="text-2xl font-medium mb-3 text-gray-900">{service.title}</h3>
                      <p className="text-gray-600 font-light mb-6 line-clamp-2">{service.description}</p>

                      <div className="space-y-4 mb-8 pb-8 border-b">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-light text-sm">Starting from</span>
                          <span className="text-2xl font-light text-[#a73f2b]">
                            Rs {Number(service.startingPrice || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600 font-light text-sm">Delivery</span>
                          <span className="text-gray-900 font-medium flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4" />
                            {service.deliveryTime}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate(`/service/${service.slug || service._id}`)}
                        className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white py-4 text-base rounded-[10px] font-medium tracking-wide shadow-sm group-hover:shadow-md transition-colors"
                      >
                        VIEW DETAILS
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coming Soon Dialog */}
      <Dialog open={!!comingSoonService} onOpenChange={() => setComingSoonService(null)}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader className="items-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#a73f2b]/10 flex items-center justify-center text-[#a73f2b]">
              {comingSoonService?.icon}
            </div>
            <DialogTitle className="text-2xl font-light" style={{ fontFamily: 'Playfair Display, serif' }}>
              {comingSoonService?.title}
            </DialogTitle>
            <DialogDescription className="text-base pt-2 leading-relaxed">
              {comingSoonService?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)]"></span>
              </span>
              <span className="text-sm font-medium text-gray-700">Coming Soon</span>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              We're working hard to bring this service to you. Stay tuned for updates!
            </p>
          </div>

          <Button
            onClick={() => setComingSoonService(null)}
            className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white py-5 rounded-[10px] font-medium"
          >
            Got it
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
