import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Clock, Loader2, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService, getServiceBySlug, getServices } from '../../utils/api';
import { useApp } from '../../context/AppContext';

export function ServiceDetailPage() {
  const { id: serviceParam } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();

  const [service, setService] = useState(null);
  const [relatedServices, setRelatedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    packageName: '',
    description: ''
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: user?.name || prev.name, email: user?.email || prev.email }));
  }, [user]);

  useEffect(() => {
    const fetchService = async () => {
      if (!serviceParam) return;

      try {
        setLoading(true);
        let serviceData = null;

        try {
          const detailRes = await getServiceBySlug(serviceParam);
          if (detailRes?.success) {
            serviceData = detailRes?.data?.service;
          }
        } catch {
          const listRes = await getServices({ page: 1, limit: 200 });
          if (listRes?.success) {
            serviceData = (listRes?.data?.services || []).find(
              (s) => s._id === serviceParam || s.slug === serviceParam
            );
          }
        }

        if (!serviceData) {
          setService(null);
          return;
        }

        setService(serviceData);
        setFormData((prev) => ({
          ...prev,
          packageName: prev.packageName || serviceData?.pricing?.[0]?.name || 'Basic'
        }));

        const relatedRes = await getServices({ page: 1, limit: 4, category: serviceData.category });
        if (relatedRes?.success) {
          const related = (relatedRes?.data?.services || []).filter((s) => s._id !== serviceData._id).slice(0, 3);
          setRelatedServices(related);
        }
      } catch (error) {
        console.error('Error loading service detail:', error);
        toast.error('Failed to load service details');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [serviceParam]);

  const pricingPackages = useMemo(() => {
    if (service?.pricing?.length) return service.pricing;
    if (!service) return [];

    return [{
      name: 'Basic',
      price: Number(service.startingPrice || 0),
      features: service.features?.length ? service.features : ['Custom deliverables based on your requirement'],
      deliveryTime: service.deliveryTime
    }];
  }, [service]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!service) return;

    if (!user) {
      toast.error('Please login to book a service');
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      const response = await bookService(service._id, {
        packageName: formData.packageName,
        requirements: formData.description,
        contactInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }
      });

      if (response?.success) {
        toast.success(response.message || 'Service booked successfully');
        setFormData((prev) => ({ ...prev, description: '', phone: '' }));
      }
    } catch (error) {
      console.error('Service booking error:', error);
      toast.error(error.message || 'Failed to book service');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading service...
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Service not found</h2>
          <Button onClick={() => navigate('/services')}>Back to Services</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 border-b">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center text-sm text-gray-500">
            <button onClick={() => navigate('/')} className="hover:text-[#a73f2b] transition-colors">Home</button>
            <span className="mx-2">/</span>
            <button onClick={() => navigate('/services')} className="hover:text-[#a73f2b] transition-colors">Services</button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{service.title}</span>
          </nav>
        </div>
      </div>

      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#a73f2b]/5 to-[#a73f2b]/5" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-4 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] text-white border-0">{service.category}</Badge>
              <h1 className="text-5xl font-light mb-6 text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>{service.title}</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-8 font-light">{service.description}</p>

              <div className="flex items-center gap-8 mb-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Starting from</p>
                  <p className="text-4xl font-light text-[#a73f2b]">Rs {Number(service.startingPrice || 0).toLocaleString()}</p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery time</p>
                  <p className="text-2xl font-light text-gray-900 flex items-center gap-2"><Clock className="w-5 h-5" />{service.deliveryTime}</p>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-2xl">
                <img src={service.images?.[0]?.url || '/placeholder.jpg'} alt={service.title} className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light mb-12 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Pricing Packages</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPackages.map((pkg, index) => (
              <Card key={pkg.name + index} className="h-full">
                <CardContent className="p-8">
                  <h3 className="text-xl font-medium mb-2 text-gray-900">{pkg.name}</h3>
                  <div className="mb-6">
                    <span className="text-3xl font-light text-[#a73f2b]">Rs {Number(pkg.price || 0).toLocaleString()}</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {(pkg.features || []).map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-[#a73f2b] mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={formData.packageName === pkg.name ? 'default' : 'outline'}
                    onClick={() => setFormData((prev) => ({ ...prev, packageName: pkg.name }))}
                    className={formData.packageName === pkg.name ? 'w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0' : 'w-full'}
                  >
                    {formData.packageName === pkg.name ? 'Selected' : `Choose ${pkg.name}`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="request-form" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-light mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>Book This Service</h2>
                <p className="text-gray-600 font-light">Submit your project details and the artist will contact you.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="mt-2" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="package">Package *</Label>
                    <Select value={formData.packageName} onValueChange={(value) => setFormData({ ...formData, packageName: value })}>
                      <SelectTrigger className="mt-2"><SelectValue placeholder="Select package" /></SelectTrigger>
                      <SelectContent>
                        {pricingPackages.map((pkg, index) => (
                          <SelectItem key={pkg.name + index} value={pkg.name}>{pkg.name} - Rs {Number(pkg.price || 0).toLocaleString()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Project Requirements *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={5}
                    className="mt-2"
                    placeholder="Describe your requirements, size, style, timeline, and any reference details..."
                  />
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-900">Your details are used only for this booking and project communication.</p>
                </div>

                <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:from-[#a73f2b] hover:to-[#a73f2b] text-white py-6 text-base font-medium">
                  {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {submitting ? 'SUBMITTING...' : 'BOOK SERVICE'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {relatedServices.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-light mb-12 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>Related Services</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedServices.map((relatedService) => (
                <Card key={relatedService._id} className="overflow-hidden hover:shadow-xl transition-all group cursor-pointer" onClick={() => navigate(`/service/${relatedService.slug || relatedService._id}`)}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img src={relatedService.images?.[0]?.url || '/placeholder.jpg'} alt={relatedService.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-medium mb-2 text-gray-900">{relatedService.title}</h3>
                    <p className="text-gray-600 font-light mb-4 line-clamp-2">{relatedService.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-light text-[#a73f2b]">Rs {Number(relatedService.startingPrice || 0).toLocaleString()}</span>
                      <Button variant="ghost" className="text-[#a73f2b]">View Details<ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
