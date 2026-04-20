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

// Platform services — All services are now live
const PLATFORM_SERVICES = [
  {
    id: 'studio-hire',
    title: 'Studio on Hire',
    description: 'Professional video & photo studio with chroma green screen, lighting, Sony A7M3 camera kit and full equipment setup.',
    icon: <Building2 className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&q=80',
    available: true,
    link: '/services/studio-hire',
  },
  {
    id: 'photography',
    title: 'Photography',
    description: 'Professional photography services for events, portraits, products, and creative projects.',
    icon: <Camera className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
    available: true,
    link: '/services/photography',
    configKey: 'photography',
  },
  {
    id: 'calligraphy',
    title: 'Calligraphy',
    description: 'Hand lettering and calligraphy for invitations, branding, wall art, and custom commissions.',
    icon: <Paintbrush className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80',
    available: true,
    link: '/services/calligraphy',
    configKey: 'calligraphy',
  },
  {
    id: 'videography',
    title: 'Videography',
    description: 'Cinematic videography for short films, reels, corporate videos, and documentaries.',
    icon: <Video className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80',
    available: true,
    link: '/services/videography',
    configKey: 'videography',
  },
  {
    id: 'wall-painting',
    title: 'Wall Painting',
    description: 'Custom indoor & outdoor wall paintings, murals, and artistic wall décor by professional artists.',
    icon: <Paintbrush className="w-7 h-7" />,
    image: 'https://res.cloudinary.com/djljjozxa/image/upload/v1771403170/artvpp/frontend/images/slider4.jpg',
    available: true,
    link: '/services/wall-painting',
    configKey: 'wall-painting',
  },
  {
    id: 'sculpture-3d',
    title: 'Sculpture & 3D Art',
    description: 'Custom sculptures, 3D art installations, and artistic modeling services.',
    icon: <Boxes className="w-7 h-7" />,
    image: 'https://res.cloudinary.com/djljjozxa/image/upload/v1771403183/artvpp/frontend/images/y.jpg',
    available: true,
    link: '/services/sculpture',
    configKey: 'sculpture',
  },
  {
    id: 'design-branding',
    title: 'Design & Branding',
    description: 'Logo design, branding packages, and creative design services for businesses and individuals.',
    icon: <Palette className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80',
    available: true,
    link: '/services/branding',
    configKey: 'branding',
  },
  {
    id: 'workshops',
    title: 'Workshops & Classes',
    description: 'Art workshops, creative classes, and hands-on learning sessions with professional artists.',
    icon: <GraduationCap className="w-7 h-7" />,
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    available: true,
    link: '/services/workshops',
    configKey: 'workshops',
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
      {/* Artistic Hero Header */}
      <section className="relative h-[450px] bg-[#0A0A0A] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1945&auto=format&fit=crop" 
            alt="Artistic background" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#F8F9FB]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
              Our Services
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
              Explore our range of professional artistic services tailored to your needs
            </p>
          </motion.div>
        </div>
      </section>

      {/* Platform Services Grid */}
      <section className="py-20">
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
                      src={service.configKey && platformConfigs?.[service.configKey] 
                        ? (platformConfigs[service.configKey].heroImage?.url || platformConfigs[service.configKey].galleryImages?.[0]?.url || service.image) 
                        : service.image}
                      alt={service.configKey && platformConfigs?.[service.configKey]
                        ? (platformConfigs[service.configKey].title || service.title)
                        : service.title}
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
        <section className="py-20">
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
