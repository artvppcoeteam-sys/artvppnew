import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle, ChevronDown, ChevronUp, Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { adminUpdatePlatformServiceConfig, adminUploadPlatformServiceImages, bookPlatformService, getPlatformServiceConfig } from '../../utils/api';
import { motion } from 'motion/react';

const DEFAULT_CONFIG: any = {
  serviceName: '',
  title: '',
  subtitle: '',
  city: '',
  heroImage: null,
  galleryImages: [],
  whatWeOffer: [],
  perfectFor: [],
  equipmentCategories: [],
  pricingOptions: [],
  discountRules: { fiveDayDiscountPerDay: 0 },
  responseTimeText: ''
};

const clean = (value: unknown) => String(value || '').trim();
const toPricingId = (value: string) => clean(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const normalizeImage = (image: any) => {
  const url = clean(image?.url);
  return url ? { url, publicId: image?.publicId ? clean(image.publicId) : null } : null;
};
const normalizeConfig = (value: any) => ({
  serviceName: clean(value?.serviceName),
  title: clean(value?.title),
  subtitle: clean(value?.subtitle),
  city: clean(value?.city),
  heroImage: normalizeImage(value?.heroImage),
  galleryImages: (Array.isArray(value?.galleryImages) ? value.galleryImages : []).map(normalizeImage).filter(Boolean),
  whatWeOffer: (Array.isArray(value?.whatWeOffer) ? value.whatWeOffer : []).map((item: any) => ({
    title: clean(item?.title),
    description: clean(item?.description),
    image: normalizeImage(item?.image)
  })),
  perfectFor: (Array.isArray(value?.perfectFor) ? value.perfectFor : []).map((item: any) => clean(item)).filter(Boolean),
  equipmentCategories: (Array.isArray(value?.equipmentCategories) ? value.equipmentCategories : []).map((item: any) => ({
    name: clean(item?.name),
    image: normalizeImage(item?.image),
    items: Array.isArray(item?.items) ? item.items.map((row: any) => clean(row)).filter(Boolean) : []
  })),
  pricingOptions: (Array.isArray(value?.pricingOptions) ? value.pricingOptions : []).map((item: any) => ({
    id: clean(item?.id) || toPricingId(item?.name || ''),
    name: clean(item?.name),
    price: Number(item?.price || 0),
    billingUnit: item?.billingUnit === 'hour' ? 'hour' : 'day',
    description: clean(item?.description)
  })).filter((item: any) => item.name),
  discountRules: {
    fiveDayDiscountPerDay: Math.max(0, Number(value?.discountRules?.fiveDayDiscountPerDay ?? 0))
  },
  responseTimeText: clean(value?.responseTimeText)
});

const readCacheValue = (key: string) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.value ?? parsed ?? null;
  } catch {
    return null;
  }
};

const writeCacheValue = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify({ updatedAt: Date.now(), value }));
  } catch {
    // ignore quota / privacy mode failures
  }
};

const clearCacheValue = (key: string) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

function EditorImagePreview({ url, alt }: { url?: string; alt: string }) {
  if (!clean(url)) {
    return <div className="h-[120px] rounded-[10px] border border-dashed border-[#d9cfbf] bg-[#faf6ef]" />;
  }

  return <img src={url} alt={alt} className="h-[120px] w-full rounded-[10px] border border-[#eee] object-cover" />;
}

async function uploadSingleImage(
  files: FileList | null,
  uploadImages: (files: FileList | null) => Promise<any[]>
) {
  const images = await uploadImages(files);
  return images[0] || null;
}

export function PlatformServicePage({
  serviceKey,
  badgeText = 'Creative Service'
}: {
  serviceKey: string;
  badgeText?: string;
}) {
  const navigate = useNavigate();
  const { user } = useApp();
  const isAdmin = user?.role === 'admin';

  const configCacheKey = `platform.${serviceKey}.configCache.v1`;
  const draftCacheKey = `platform.${serviceKey}.draftCache.v1`;

  const [config, setConfig] = useState<any>(DEFAULT_CONFIG);
  const [draft, setDraft] = useState<any>(DEFAULT_CONFIG);
  const [draftHydrated, setDraftHydrated] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [dataSource, setDataSource] = useState<'backend' | 'cache' | 'fallback'>('backend');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    date: '',
    pricingOptionId: '',
    durationValue: '1',
    purpose: '',
    message: ''
  });

  const effectiveConfig = isAdmin && showEditor ? draft : config;
  const bookingDisabled = isAdmin && showEditor;

  useEffect(() => {
    setFormData((prev) => ({ ...prev, name: user?.name || prev.name, email: user?.email || prev.email }));
  }, [user]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await getPlatformServiceConfig(serviceKey);
        const nextConfig = normalizeConfig(response?.data?.service);
        setConfig(nextConfig);
        setDraft(nextConfig);
        setDataSource('backend');
        writeCacheValue(configCacheKey, nextConfig);
        setFormData((prev) => ({ ...prev, pricingOptionId: nextConfig.pricingOptions?.[0]?.id || '' }));
      } catch {
        const cachedConfig = readCacheValue(configCacheKey);
        if (cachedConfig && typeof cachedConfig === 'object') {
          const nextConfig = normalizeConfig(cachedConfig);
          setConfig(nextConfig);
          setDraft(nextConfig);
          setDataSource('cache');
          toast.error('Backend not reachable. Showing last saved service details.');
          setFormData((prev) => ({ ...prev, pricingOptionId: nextConfig.pricingOptions?.[0]?.id || '' }));
        } else {
          const fallback = normalizeConfig({});
          setConfig(fallback);
          setDraft(fallback);
          setDataSource('fallback');
          toast.error('Failed to load service details');
          setFormData((prev) => ({ ...prev, pricingOptionId: '' }));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceKey]);

  useEffect(() => {
    if (!isAdmin) {
      setDraftHydrated(false);
      return;
    }
    if (loading) return;
    if (draftHydrated) return;

    const cachedDraft = readCacheValue(draftCacheKey);
    if (cachedDraft && typeof cachedDraft === 'object') {
      setDraft(normalizeConfig({ ...config, ...cachedDraft }));
    }
    setDraftHydrated(true);
  }, [config, draftCacheKey, draftHydrated, isAdmin, loading]);

  useEffect(() => {
    if (!isAdmin) return;
    if (loading) return;
    if (!draftHydrated) return;
    writeCacheValue(draftCacheKey, draft);
  }, [draft, draftCacheKey, draftHydrated, isAdmin, loading]);

  useEffect(() => {
    const first = effectiveConfig.pricingOptions?.[0]?.id || '';
    if (!first) return;
    if (!formData.pricingOptionId) {
      setFormData((prev) => ({ ...prev, pricingOptionId: first }));
      return;
    }
    const exists = (effectiveConfig.pricingOptions || []).some((p: any) => p.id === formData.pricingOptionId);
    if (!exists) setFormData((prev) => ({ ...prev, pricingOptionId: first }));
  }, [effectiveConfig.pricingOptions, formData.pricingOptionId]);

  const selectedPricing = useMemo(
    () =>
      (effectiveConfig.pricingOptions || []).find((item: any) => item.id === formData.pricingOptionId) ||
      effectiveConfig.pricingOptions?.[0],
    [effectiveConfig.pricingOptions, formData.pricingOptionId]
  );
  const estimate = useMemo(() => {
    const duration = Math.max(1, Number(formData.durationValue || 1));
    const subtotal = duration * Number(selectedPricing?.price || 0);
    const discount = duration >= 5 ? duration * Number(effectiveConfig.discountRules?.fiveDayDiscountPerDay || 0) : 0;
    return { subtotal, discount, total: Math.max(subtotal - discount, 0) };
  }, [effectiveConfig.discountRules, formData.durationValue, selectedPricing]);

  const uploadImages = async (files: FileList | null) => {
    if (!files?.length) return [];
    if (!localStorage.getItem('token')) {
      throw new Error('Admin login expired. Please login again before uploading images.');
    }
    if (!isAdmin) {
      throw new Error('Only admin can upload service images.');
    }
    const data = new FormData();
    Array.from(files).forEach((file) => data.append('images', file));
    const response = await adminUploadPlatformServiceImages(serviceKey, data);
    return response?.data?.images || [];
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = normalizeConfig({
        ...draft,
        galleryImages: (draft.galleryImages || []).map(normalizeImage).filter(Boolean),
        whatWeOffer: (draft.whatWeOffer || []).filter((item: any) => clean(item?.title) || clean(item?.description) || clean(item?.image?.url)),
        pricingOptions: (draft.pricingOptions || []).map((item: any) => ({ ...item, id: clean(item?.id) || toPricingId(item?.name || '') })).filter((item: any) => clean(item?.name))
      });
      const response = await adminUpdatePlatformServiceConfig(serviceKey, payload);
      const nextConfig = normalizeConfig(response?.data?.service);
      setConfig(nextConfig);
      setDraft(nextConfig);
      setDataSource('backend');
      clearCacheValue(draftCacheKey);
      writeCacheValue(configCacheKey, nextConfig);
      toast.success('Service details updated');
      setShowEditor(false);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleBooking = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      const response = await bookPlatformService(serviceKey, { ...formData, durationValue: Number(formData.durationValue) });
      if (!response?.success) throw new Error(response?.message || 'Booking failed');
      toast.success(response.message || 'Booking submitted');
      setFormData((prev) => ({ ...prev, phone: '', date: '', durationValue: '1', purpose: '', message: '' }));
    } catch (error: any) {
      toast.error(error?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#fcfaf6]">
      <div className={`px-4 py-2 text-center text-xs font-medium ${dataSource === 'backend' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
        {dataSource === 'backend'
          ? 'Connected to backend service data'
          : dataSource === 'cache'
            ? 'Backend not reachable right now. Showing cached service data.'
            : 'Backend not reachable right now. Showing blank defaults.'}
      </div>

      {isAdmin && (
        <div className="bg-white border-b border-[#e7dfd1] p-4">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-[#4a3135]">Admin Service Editor</p>
              <Button type="button" variant="outline" onClick={() => setShowEditor((value) => !value)}>{showEditor ? 'Hide Editor' : 'Edit Service Content'}</Button>
            </div>
            {showEditor && (
              <div className="mt-4 space-y-5 rounded-2xl border border-[#e7dfd1] bg-[#fffdfa] p-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input value={draft.serviceName || ''} placeholder="Service name" onChange={(e) => setDraft((prev: any) => ({ ...prev, serviceName: e.target.value }))} />
                  <Input value={draft.city || ''} placeholder="City" onChange={(e) => setDraft((prev: any) => ({ ...prev, city: e.target.value }))} />
                </div>
                <Input value={draft.title || ''} placeholder="Title" onChange={(e) => setDraft((prev: any) => ({ ...prev, title: e.target.value }))} />
                <Textarea rows={3} value={draft.subtitle || ''} placeholder="Subtitle" onChange={(e) => setDraft((prev: any) => ({ ...prev, subtitle: e.target.value }))} />

                <div className="rounded-xl border border-[#e7dfd1] bg-white p-4">
                  <Label>Hero Image</Label>
                  <div className="mt-3 grid md:grid-cols-2 gap-4 items-start">
                    <EditorImagePreview url={draft.heroImage?.url} alt="Hero image preview" />
                    <div className="flex flex-col gap-2">
                      <label className="inline-flex items-center justify-center rounded-md border border-input px-3 py-2 text-sm cursor-pointer w-fit">
                        Upload Hero
                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { try { setUploading(true); const image = await uploadSingleImage(e.target.files, uploadImages); if (image) setDraft((prev: any) => ({ ...prev, heroImage: image })); } catch (error: any) { toast.error(error?.message || 'Hero upload failed'); } finally { setUploading(false); e.target.value = ''; } }} />
                      </label>
                      <Button type="button" variant="outline" onClick={() => setDraft((prev: any) => ({ ...prev, heroImage: null }))}>Remove Hero</Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-[#e7dfd1] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between"><Label>Gallery Images</Label></div>
                  <div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[14px]">
                    {(draft.galleryImages || []).map((img: any, index: number) => (
                      <div key={index} className="p-[10px] bg-[#fafafa] rounded-[10px] space-y-2 border border-[#eee]">
                        <EditorImagePreview url={img?.url} alt={`Gallery image ${index + 1}`} />
                        <Button type="button" variant="ghost" size="sm" className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 h-8" onClick={() => setDraft((prev: any) => ({ ...prev, galleryImages: prev.galleryImages.filter((_: any, itemIndex: number) => itemIndex !== index) }))}>Remove</Button>
                      </div>
                    ))}
                  </div>
                  <label className="inline-flex items-center justify-center rounded-md border border-input px-3 py-2 text-sm font-medium cursor-pointer w-fit hover:bg-gray-50 transition-colors">
                    Upload Gallery Images
                    <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => { try { setUploading(true); const images = await uploadImages(e.target.files); if (images.length) setDraft((prev: any) => ({ ...prev, galleryImages: [...(prev.galleryImages || []), ...images] })); } catch (error: any) { toast.error(error?.message || 'Gallery upload failed'); } finally { setUploading(false); e.target.value = ''; } }} />
                  </label>
                </div>

                <div className="rounded-xl border border-[#e7dfd1] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>What We Offer</Label>
                    <Button type="button" variant="outline" onClick={() => setDraft((prev: any) => ({ ...prev, whatWeOffer: [...(prev.whatWeOffer || []), { title: '', description: '', image: null }] }))}><Plus className="h-4 w-4 mr-1" />Add</Button>
                  </div>
                  {(draft.whatWeOffer || []).map((offer: any, index: number) => (
                    <div key={index} className="rounded-xl border border-[#efe7db] p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-[#221819]">Offer {index + 1}</p>
                        <Button type="button" variant="outline" onClick={() => setDraft((prev: any) => ({ ...prev, whatWeOffer: prev.whatWeOffer.filter((_: any, itemIndex: number) => itemIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input value={offer?.title || ''} placeholder="Title" onChange={(e) => setDraft((prev: any) => ({ ...prev, whatWeOffer: prev.whatWeOffer.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, title: e.target.value } : item) }))} />
                        <label className="inline-flex items-center justify-center rounded-md border border-input px-3 py-2 text-sm cursor-pointer w-fit">
                          Upload Offer Image
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { try { setUploading(true); const image = await uploadSingleImage(e.target.files, uploadImages); if (image) setDraft((prev: any) => ({ ...prev, whatWeOffer: prev.whatWeOffer.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, image } : item) })); } catch (error: any) { toast.error(error?.message || 'Offer image upload failed'); } finally { setUploading(false); e.target.value = ''; } }} />
                        </label>
                      </div>
                      <Textarea rows={3} value={offer?.description || ''} placeholder="Description" onChange={(e) => setDraft((prev: any) => ({ ...prev, whatWeOffer: prev.whatWeOffer.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, description: e.target.value } : item) }))} />
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[#e7dfd1] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between"><Label>Equipment / Inclusions</Label><Button type="button" variant="outline" onClick={() => setDraft((prev: any) => ({ ...prev, equipmentCategories: [...(prev.equipmentCategories || []), { name: '', image: null, items: [] }] }))}><Plus className="h-4 w-4 mr-1" />Add</Button></div>
                  {(draft.equipmentCategories || []).map((category: any, index: number) => (
                    <div key={index} className="rounded-xl border border-[#efe7db] p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-[#221819]">Category {index + 1}</p>
                        <Button type="button" variant="outline" onClick={() => setDraft((prev: any) => ({ ...prev, equipmentCategories: prev.equipmentCategories.filter((_: any, itemIndex: number) => itemIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                      <Input value={category?.name || ''} placeholder="Category name" onChange={(e) => setDraft((prev: any) => ({ ...prev, equipmentCategories: prev.equipmentCategories.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, name: e.target.value } : item) }))} />
                      <div className="flex flex-wrap gap-2">
                        <label className="inline-flex items-center justify-center rounded-md border border-input px-3 py-2 text-sm cursor-pointer w-fit">
                          Upload Category Image
                          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { try { setUploading(true); const image = await uploadSingleImage(e.target.files, uploadImages); if (image) setDraft((prev: any) => ({ ...prev, equipmentCategories: prev.equipmentCategories.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, image } : item) })); } catch (error: any) { toast.error(error?.message || 'Category image upload failed'); } finally { setUploading(false); e.target.value = ''; } }} />
                        </label>
                        <Button type="button" variant="outline" onClick={() => setDraft((prev: any) => ({ ...prev, equipmentCategories: prev.equipmentCategories.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, image: null } : item) }))}>Remove Category Image</Button>
                      </div>
                      <Textarea rows={4} value={(category?.items || []).join('\n')} placeholder="One item per line" onChange={(e) => setDraft((prev: any) => ({ ...prev, equipmentCategories: prev.equipmentCategories.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, items: e.target.value.split('\n').map((row) => row.trim()).filter(Boolean) } : item) }))} />
                    </div>
                  ))}
                </div>

                <div className="rounded-xl border border-[#e7dfd1] bg-white p-4 space-y-3">
                  <div className="flex items-center justify-between"><Label>Pricing</Label><Button type="button" variant="outline" onClick={() => setDraft((prev: any) => ({ ...prev, pricingOptions: [...(prev.pricingOptions || []), { id: '', name: '', price: 0, billingUnit: 'day', description: '' }] }))}><Plus className="h-4 w-4 mr-1" />Add</Button></div>
                  {(draft.pricingOptions || []).map((option: any, index: number) => (
                    <div key={index} className="rounded-xl border border-[#efe7db] p-4 grid md:grid-cols-4 gap-3">
                      <Input value={option?.name || ''} placeholder="Name" onChange={(e) => setDraft((prev: any) => ({ ...prev, pricingOptions: prev.pricingOptions.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, name: e.target.value, id: toPricingId(e.target.value) } : item) }))} />
                      <Input type="number" min={0} value={option?.price ?? 0} placeholder="Price" onChange={(e) => setDraft((prev: any) => ({ ...prev, pricingOptions: prev.pricingOptions.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, price: Number(e.target.value || 0) } : item) }))} />
                      <select className="h-10 rounded-md border border-input px-3 bg-white" value={option?.billingUnit || 'day'} onChange={(e) => setDraft((prev: any) => ({ ...prev, pricingOptions: prev.pricingOptions.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, billingUnit: e.target.value === 'hour' ? 'hour' : 'day' } : item) }))}><option value="day">Per Day</option><option value="hour">Per Hour</option></select>
                      <Button type="button" variant="outline" onClick={() => setDraft((prev: any) => ({ ...prev, pricingOptions: prev.pricingOptions.filter((_: any, itemIndex: number) => itemIndex !== index) }))}><Trash2 className="h-4 w-4" /></Button>
                      <Input className="md:col-span-4" value={option?.description || ''} placeholder="Description" onChange={(e) => setDraft((prev: any) => ({ ...prev, pricingOptions: prev.pricingOptions.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, description: e.target.value } : item) }))} />
                    </div>
                  ))}
                </div>

                <Textarea rows={3} value={(draft.perfectFor || []).join('\n')} placeholder="Perfect for items, one per line" onChange={(e) => setDraft((prev: any) => ({ ...prev, perfectFor: e.target.value.split('\n').map((row) => row.trim()).filter(Boolean) }))} />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowEditor(false)}>Cancel</Button>
                  <Button type="button" disabled={saving || uploading} onClick={handleSave}>{saving ? 'Saving...' : uploading ? 'Uploading...' : 'Save'}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <section className="relative overflow-hidden bg-[#171111]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1b1213] via-[#2f1f21] to-[#0d0b0b]" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${effectiveConfig.heroImage?.url}")`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-black/45" />
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 md:py-28">
          <Badge className="mb-5 bg-[#a73f2b]/18 text-[#E8CA72] border-[#a73f2b]/25">{badgeText}</Badge>
          <h1 className="text-4xl md:text-6xl font-light text-white tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>{effectiveConfig.title}</h1>
          <p className="mt-5 text-lg md:text-xl text-white/75 max-w-2xl leading-relaxed">{effectiveConfig.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/8 border border-white/10 px-4 py-2 text-sm text-white/90">{effectiveConfig.city}</span>
            {(effectiveConfig.pricingOptions || []).map((option: any) => <span key={option.id} className="rounded-full bg-[#a73f2b]/14 border border-[#a73f2b]/25 px-4 py-2 text-sm text-[#f5e2a0]">{option.name}: Rs {Number(option.price || 0).toLocaleString()} / {option.billingUnit}</span>)}
          </div>
          {!!effectiveConfig.perfectFor?.length && <div className="mt-7 flex flex-wrap gap-2">{effectiveConfig.perfectFor.map((item: string, index: number) => <span key={index} className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-sm text-white/85">{item}</span>)}</div>}
          <div className="mt-9"><a href="#pricing" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] px-8 py-4 text-white font-semibold">Explore Pricing <ArrowRight className="w-5 h-5" /></a></div>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {effectiveConfig.heroImage?.url ? <img src={effectiveConfig.heroImage.url} alt={effectiveConfig.title} className="md:col-span-2 h-72 md:h-96 w-full object-cover rounded-[24px] border border-white/10" /> : <div className="md:col-span-2 h-72 md:h-96 rounded-[24px] border border-white/10 bg-[linear-gradient(135deg,#2b1b1e,#120d0d)]" />}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-4">{(effectiveConfig.galleryImages || []).slice(0, 2).map((image: any, index: number) => <img key={index} src={image.url} alt={`Preview ${index + 1}`} className="h-32 md:h-[188px] w-full object-cover rounded-[20px] border border-white/10" />)}</div>
          </div>
        </div>
      </section>

      {!!effectiveConfig.galleryImages?.length && (
        <section className="py-[60px] px-5 bg-white">
          <div className="max-w-[1400px] mx-auto">
            <h2 className="text-[28px] font-semibold text-[#221819] mb-[24px]" style={{ fontFamily: 'Playfair Display, serif' }}>
              Portfolio
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
              {effectiveConfig.galleryImages.map((image: any, index: number) => (
                <motion.div
                  key={index}
                  whileHover={{ translateY: -4 }}
                  className="bg-white rounded-[14px] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.08)] transition-all duration-300"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-[12px] m-1">
                    <img
                      src={image.url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-[220px] object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {!!effectiveConfig.whatWeOffer?.length && <section className="py-16 bg-white"><div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"><h2 className="text-4xl font-light text-[#221819] text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>What We Offer</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{effectiveConfig.whatWeOffer.map((offer: any, index: number) => <div key={index} className="overflow-hidden rounded-[24px] border border-[#e7dfd1] bg-[#fffdfa]">{offer?.image?.url ? <img src={offer.image.url} alt={offer.title} className="h-52 w-full object-cover" /> : <div className="h-52 bg-[linear-gradient(135deg,#f4ebdf,#fbf7f0)]" />}<div className="p-5"><h3 className="text-lg font-semibold text-[#221819]">{offer.title}</h3><p className="mt-2 text-sm text-gray-600 leading-6">{offer.description}</p></div></div>)}</div></div></section>}

      {!!effectiveConfig.pricingOptions?.length && <section id="pricing" className="py-14 bg-[#fbf7f0]"><div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"><h2 className="text-4xl font-light text-[#221819] text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>Pricing Options</h2><div className={`grid gap-6 ${effectiveConfig.pricingOptions.length > 1 ? 'md:grid-cols-2' : 'max-w-xl mx-auto'}`}>{effectiveConfig.pricingOptions.map((option: any, index: number) => <div key={option.id || index} className={`rounded-[24px] border p-6 ${index === 0 ? 'bg-[#2d1c1f] border-[#5b4349] text-white' : 'bg-white border-[#e7dfd1] text-[#221819]'}`}><p className={`text-xs uppercase tracking-[0.28em] ${index === 0 ? 'text-[#d8c288]' : 'text-[#8f7f69]'}`}>per {option.billingUnit}</p><h3 className="mt-3 text-2xl font-semibold">{option.name}</h3><p className="mt-4 text-3xl font-semibold">Rs {Number(option.price || 0).toLocaleString()}</p><p className={`mt-3 text-sm leading-6 ${index === 0 ? 'text-white/75' : 'text-gray-600'}`}>{option.description}</p></div>)}</div></div></section>}

      {!!effectiveConfig.equipmentCategories?.length && <section id="equipment" className="py-16 bg-white"><div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8"><h2 className="text-4xl font-light text-[#221819] text-center mb-10" style={{ fontFamily: 'Playfair Display, serif' }}>Inclusions</h2><div className="max-w-4xl mx-auto space-y-4">{effectiveConfig.equipmentCategories.map((category: any, index: number) => <div key={index} className="overflow-hidden rounded-xl border border-[#e7dfd1] bg-white"><button type="button" onClick={() => setExpandedCategory(expandedCategory === index ? null : index)} className="w-full flex justify-between items-center p-4 bg-[#faf6ef]"><div className="flex items-center gap-3 text-left">{category?.image?.url ? <img src={category.image.url} alt={category.name} className="h-12 w-12 rounded object-cover" /> : null}<span className="font-medium text-[#221819]">{category.name}</span></div>{expandedCategory === index ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</button>{expandedCategory === index && <ul className="p-4 grid md:grid-cols-2 gap-2">{(category.items || []).map((item: string, itemIndex: number) => <li key={itemIndex} className="text-sm flex items-start gap-2"><CheckCircle className="h-4 w-4 text-[#a73f2b] mt-0.5" />{item}</li>)}</ul>}</div>)}</div></div></section>}

      <section id="booking" className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleBooking} className="bg-white rounded-2xl p-8 shadow-2xl space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Request a Booking</h3>
            {bookingDisabled && <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Save your content changes to enable booking with the updated pricing.</div>}
            {!effectiveConfig.pricingOptions?.length && <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">Add at least one pricing option in the editor before taking bookings.</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label>Full Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required disabled={bookingDisabled} /></div><div><Label>Email *</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={bookingDisabled} /></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><Label>Phone *</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required disabled={bookingDisabled} /></div><div><Label>Preferred Date *</Label><Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} min={new Date().toISOString().split('T')[0]} required disabled={bookingDisabled} /></div></div>
            <div><Label>Package *</Label><select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.pricingOptionId} onChange={(e) => setFormData({ ...formData, pricingOptionId: e.target.value })} required disabled={!effectiveConfig.pricingOptions?.length || bookingDisabled}>{(effectiveConfig.pricingOptions || []).map((option: any) => <option key={option.id} value={option.id}>{option.name} - Rs {Number(option.price || 0).toLocaleString()} / {option.billingUnit}</option>)}</select></div>
            <div><Label>Duration ({selectedPricing?.billingUnit || 'day'}) *</Label><Input type="number" min={1} value={formData.durationValue} onChange={(e) => setFormData({ ...formData, durationValue: e.target.value })} required disabled={bookingDisabled} /></div>
            <div className="rounded-md border bg-gray-50 p-3 text-sm"><p>Subtotal: Rs {estimate.subtotal.toLocaleString()}</p><p>Discount: Rs {estimate.discount.toLocaleString()}</p><p className="font-semibold text-[#a73f2b]">Total: Rs {estimate.total.toLocaleString()}</p></div>
            <div><Label>Purpose</Label><Input value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} disabled={bookingDisabled} /></div>
            <div><Label>Additional Notes</Label><Textarea rows={3} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} disabled={bookingDisabled} /></div>
            <Button type="submit" disabled={submitting || !effectiveConfig.pricingOptions?.length || bookingDisabled} className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] hover:from-[#a73f2b] hover:to-[#a73f2b] text-white py-6 text-base rounded-full font-medium tracking-wide shadow-lg">{submitting ? 'Submitting...' : 'Submit Booking Request'} <ArrowRight className="ml-2 w-5 h-5" /></Button>
            <p className="text-xs text-gray-500 text-center">{effectiveConfig.responseTimeText}</p>
          </form>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Button variant="outline" type="button" onClick={() => navigate('/services')} className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-10 py-5 rounded-full font-medium tracking-wide">
            Browse All Services <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

export function PhotographyServicePage() {
  return <PlatformServicePage serviceKey="photography" badgeText="Media Service" />;
}

export function CalligraphyServicePage() {
  return <PlatformServicePage serviceKey="calligraphy" badgeText="Hand Lettering" />;
}
