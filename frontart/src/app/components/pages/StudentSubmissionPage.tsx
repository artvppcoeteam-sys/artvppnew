import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Loader2, Plus, Trash2, Upload, CheckCircle2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '../ui/dialog';
import { toast } from 'sonner';
import {
    checkStudentSubmissionAvailability,
    submitStudentArtworkSubmission
} from '../../utils/api';

const FORM_STORAGE_KEY = 'student-artwork-submission-draft-v1';
const CATEGORY_OPTIONS = [
    'Calligraphy Artworks',
    'Digital Art',
    'Metal Art & Craft',
    'Mural Art',
    'Paintings',
    'Photographs',
    'Prints',
    'Handicrafts',
    'Sketches'
];

type CategoryOption = typeof CATEGORY_OPTIONS[number];

type ArtworkDraft = {
    category: CategoryOption;
    title: string;
    price: string;
    size: string;
    medium: string;
    description: string;
    files: File[];
    previews: string[];
    coverIndex: number;
    categoryMeta: Record<string, string | boolean>;
};

const LICENSE_OPTIONS = ['Personal Use', 'Commercial Use', 'Editorial Use', 'Exclusive Rights'];

const isYes = (value: unknown) => value === true || value === 'yes';

const sanitizeMeta = (meta: Record<string, string | boolean>) => {
    const cleaned: Record<string, string | boolean> = {};
    Object.entries(meta).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
            cleaned[key] = value;
            return;
        }
        const next = String(value || '').trim();
        if (next) cleaned[key] = next;
    });
    return cleaned;
};

const validateCategoryMeta = (artwork: ArtworkDraft) => {
    const m = artwork.categoryMeta || {};

    switch (artwork.category) {
        case 'Paintings':
        case 'Sketches':
            if (!m.frameOption) return false;
            if (m.frameOption === 'with_frame') {
                return !!m.sizeWithFrame && !!m.sizeWithoutFrame && !!m.priceWithFrame && !!m.frameMaterial;
            }
            return !!(m.sizeWithoutFrame || artwork.size);

        case 'Photographs':
            if (!m.frameOption || !m.printMedium || !m.licenseType) return false;
            if (m.frameOption === 'with_frame') {
                return !!m.sizeWithFrame && !!m.sizeWithoutFrame && !!m.priceWithFrame && !!m.frameMaterial;
            }
            return !!(m.sizeWithoutFrame || artwork.size);

        case 'Calligraphy Artworks':
            if (!m.frameOption || !m.scriptStyle || !m.licenseType) return false;
            if (m.frameOption === 'with_frame') {
                return !!m.sizeWithFrame && !!m.sizeWithoutFrame && !!m.priceWithFrame && !!m.frameMaterial;
            }
            return !!(m.sizeWithoutFrame || artwork.size);

        case 'Digital Art':
            return !!m.fileFormat && !!m.resolution && !!m.dimensions && !!m.deliveryMethod && !!m.licenseType;

        case 'Prints':
            if (!m.printType || !m.editionType || !m.paperType || !m.frameOption) return false;
            if (m.editionType === 'Limited Edition' && !m.editionNumber) return false;
            if (m.frameOption === 'with_frame') {
                return !!m.sizeWithFrame && !!m.sizeWithoutFrame && !!m.priceWithFrame && !!m.frameMaterial;
            }
            return !!(m.sizeWithoutFrame || artwork.size);

        case 'Metal Art & Craft':
            return !!m.material && !!m.technique && !!m.dimensions3d && !!m.weight && !!m.finishType && !!m.mountType;

        case 'Mural Art':
            return !!m.muralMedium && !!m.scale && !!m.surfaceType && !!m.originality && !!m.availabilityType;

        case 'Handicrafts':
            return !!m.craftType && !!m.materialsUsed && !!m.dimensions3d && !!m.weight && isYes(m.handmadeCertified) && !!m.quantityAvailable;

        default:
            return true;
    }
};

const createArtworkDraft = (): ArtworkDraft => ({
    category: 'Paintings',
    title: '',
    price: '',
    size: '',
    medium: '',
    description: '',
    files: [],
    previews: [],
    coverIndex: 0,
    categoryMeta: {}
});

const renderCategorySpecificFields = (
    artwork: ArtworkDraft,
    idx: number,
    updateMeta: (artworkIndex: number, key: string, value: string | boolean) => void
) => {
    const meta = artwork.categoryMeta || {};
    const frameOption = String(meta.frameOption || '');
    const editionType = String(meta.editionType || '');

    const frameFields = (
        <div className="grid md:grid-cols-2 gap-3">
            <div>
                <Label>Frame Option *</Label>
                <Select value={frameOption} onValueChange={(value) => updateMeta(idx, 'frameOption', value)}>
                    <SelectTrigger><SelectValue placeholder="Select frame option" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="with_frame">With Frame</SelectItem>
                        <SelectItem value="without_frame">Without Frame</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {frameOption === 'with_frame' && (
                <>
                    <div><Label>Size With Frame (W X H) *</Label><Input value={String(meta.sizeWithFrame || '')} onChange={(e) => updateMeta(idx, 'sizeWithFrame', e.target.value)} /></div>
                    <div><Label>Size Without Frame (W X H) *</Label><Input value={String(meta.sizeWithoutFrame || '')} onChange={(e) => updateMeta(idx, 'sizeWithoutFrame', e.target.value)} /></div>
                    <div><Label>Price With Frame *</Label><Input value={String(meta.priceWithFrame || '')} onChange={(e) => updateMeta(idx, 'priceWithFrame', e.target.value)} /></div>
                    <div><Label>Frame Material / Description *</Label><Input value={String(meta.frameMaterial || '')} onChange={(e) => updateMeta(idx, 'frameMaterial', e.target.value)} /></div>
                </>
            )}

            {frameOption === 'without_frame' && (
                <div>
                    <Label>Size Without Frame (W X H) *</Label>
                    <Input value={artwork.size || ''} readOnly className="bg-gray-100" />
                </div>
            )}
        </div>
    );

    switch (artwork.category) {
        case 'Paintings':
            return frameFields;

        case 'Photographs':
            return (
                <div className="space-y-3">
                    {frameFields}
                    <div className="grid md:grid-cols-2 gap-3">
                        <div><Label>Print Medium *</Label><Input value={String(meta.printMedium || '')} onChange={(e) => updateMeta(idx, 'printMedium', e.target.value)} placeholder="Glossy, Matte, Canvas" /></div>
                        <div>
                            <Label>License Type *</Label>
                            <Select value={String(meta.licenseType || '')} onValueChange={(value) => updateMeta(idx, 'licenseType', value)}>
                                <SelectTrigger><SelectValue placeholder="Select license" /></SelectTrigger>
                                <SelectContent>
                                    {LICENSE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            );

        case 'Calligraphy Artworks':
            return (
                <div className="space-y-3">
                    {frameFields}
                    <div className="grid md:grid-cols-2 gap-3">
                        <div><Label>Script Style *</Label><Input value={String(meta.scriptStyle || '')} onChange={(e) => updateMeta(idx, 'scriptStyle', e.target.value)} placeholder="Arabic, Devanagari, Latin..." /></div>
                        <div>
                            <Label>License Type *</Label>
                            <Select value={String(meta.licenseType || '')} onValueChange={(value) => updateMeta(idx, 'licenseType', value)}>
                                <SelectTrigger><SelectValue placeholder="Select license" /></SelectTrigger>
                                <SelectContent>
                                    {LICENSE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            );

        case 'Digital Art':
            return (
                <div className="grid md:grid-cols-2 gap-3">
                    <div><Label>File Format *</Label><Input value={String(meta.fileFormat || '')} onChange={(e) => updateMeta(idx, 'fileFormat', e.target.value)} placeholder="JPEG, PNG, SVG, TIFF" /></div>
                    <div><Label>Resolution (DPI) *</Label><Input value={String(meta.resolution || '')} onChange={(e) => updateMeta(idx, 'resolution', e.target.value)} /></div>
                    <div><Label>Dimensions *</Label><Input value={String(meta.dimensions || '')} onChange={(e) => updateMeta(idx, 'dimensions', e.target.value)} placeholder="e.g. 4000x3000 px" /></div>
                    <div><Label>Delivery Method *</Label><Input value={String(meta.deliveryMethod || '')} onChange={(e) => updateMeta(idx, 'deliveryMethod', e.target.value)} placeholder="Digital Download / Print-on-Demand" /></div>
                    <div>
                        <Label>License Type *</Label>
                        <Select value={String(meta.licenseType || '')} onValueChange={(value) => updateMeta(idx, 'licenseType', value)}>
                            <SelectTrigger><SelectValue placeholder="Select license" /></SelectTrigger>
                            <SelectContent>
                                {LICENSE_OPTIONS.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            );

        case 'Prints':
            return (
                <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                        <div><Label>Print Type *</Label><Input value={String(meta.printType || '')} onChange={(e) => updateMeta(idx, 'printType', e.target.value)} placeholder="Giclee, Screen Print..." /></div>
                        <div>
                            <Label>Edition Type *</Label>
                            <Select value={editionType} onValueChange={(value) => updateMeta(idx, 'editionType', value)}>
                                <SelectTrigger><SelectValue placeholder="Select edition type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Open Edition">Open Edition</SelectItem>
                                    <SelectItem value="Limited Edition">Limited Edition</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {editionType === 'Limited Edition' && (
                            <div><Label>Edition Number *</Label><Input value={String(meta.editionNumber || '')} onChange={(e) => updateMeta(idx, 'editionNumber', e.target.value)} placeholder="e.g. 3/50" /></div>
                        )}
                        <div><Label>Paper / Substrate Type *</Label><Input value={String(meta.paperType || '')} onChange={(e) => updateMeta(idx, 'paperType', e.target.value)} /></div>
                    </div>
                    {frameFields}
                </div>
            );

        case 'Metal Art & Craft':
            return (
                <div className="grid md:grid-cols-2 gap-3">
                    <div><Label>Material *</Label><Input value={String(meta.material || '')} onChange={(e) => updateMeta(idx, 'material', e.target.value)} /></div>
                    <div><Label>Technique *</Label><Input value={String(meta.technique || '')} onChange={(e) => updateMeta(idx, 'technique', e.target.value)} /></div>
                    <div><Label>Dimensions (L x W x H) *</Label><Input value={String(meta.dimensions3d || '')} onChange={(e) => updateMeta(idx, 'dimensions3d', e.target.value)} /></div>
                    <div><Label>Weight *</Label><Input value={String(meta.weight || '')} onChange={(e) => updateMeta(idx, 'weight', e.target.value)} /></div>
                    <div><Label>Finish Type *</Label><Input value={String(meta.finishType || '')} onChange={(e) => updateMeta(idx, 'finishType', e.target.value)} /></div>
                    <div>
                        <Label>Mount Type *</Label>
                        <Select value={String(meta.mountType || '')} onValueChange={(value) => updateMeta(idx, 'mountType', value)}>
                            <SelectTrigger><SelectValue placeholder="Wall-mounted or freestanding" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="wall_mounted">Wall-mounted</SelectItem>
                                <SelectItem value="freestanding">Freestanding</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            );

        case 'Mural Art':
            return (
                <div className="grid md:grid-cols-2 gap-3">
                    <div><Label>Mural Medium *</Label><Input value={String(meta.muralMedium || '')} onChange={(e) => updateMeta(idx, 'muralMedium', e.target.value)} /></div>
                    <div><Label>Scale *</Label><Input value={String(meta.scale || '')} onChange={(e) => updateMeta(idx, 'scale', e.target.value)} placeholder="sq. ft / sq. m" /></div>
                    <div><Label>Surface Type *</Label><Input value={String(meta.surfaceType || '')} onChange={(e) => updateMeta(idx, 'surfaceType', e.target.value)} /></div>
                    <div>
                        <Label>Original / Reproduction *</Label>
                        <Select value={String(meta.originality || '')} onValueChange={(value) => updateMeta(idx, 'originality', value)}>
                            <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="original">Original</SelectItem>
                                <SelectItem value="reproduction">Reproduction</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Availability Type *</Label>
                        <Select value={String(meta.availabilityType || '')} onValueChange={(value) => updateMeta(idx, 'availabilityType', value)}>
                            <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="commission_only">Commission Only</SelectItem>
                                <SelectItem value="print_available">Print Available</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            );

        case 'Handicrafts':
            return (
                <div className="grid md:grid-cols-2 gap-3">
                    <div><Label>Craft Type *</Label><Input value={String(meta.craftType || '')} onChange={(e) => updateMeta(idx, 'craftType', e.target.value)} /></div>
                    <div><Label>Materials Used *</Label><Input value={String(meta.materialsUsed || '')} onChange={(e) => updateMeta(idx, 'materialsUsed', e.target.value)} /></div>
                    <div><Label>Dimensions (L x W x H) *</Label><Input value={String(meta.dimensions3d || '')} onChange={(e) => updateMeta(idx, 'dimensions3d', e.target.value)} /></div>
                    <div><Label>Weight *</Label><Input value={String(meta.weight || '')} onChange={(e) => updateMeta(idx, 'weight', e.target.value)} /></div>
                    <div><Label>Quantity Available *</Label><Input value={String(meta.quantityAvailable || '')} onChange={(e) => updateMeta(idx, 'quantityAvailable', e.target.value)} /></div>
                    <div>
                        <Label>Handmade Certification *</Label>
                        <Select value={String(meta.handmadeCertified || '')} onValueChange={(value) => updateMeta(idx, 'handmadeCertified', value === 'yes')}>
                            <SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="yes">I confirm this is handmade</SelectItem>
                                <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            );

        case 'Sketches':
            return (
                <div className="space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                        <div><Label>Sketch Medium *</Label><Input value={String(meta.sketchMedium || '')} onChange={(e) => updateMeta(idx, 'sketchMedium', e.target.value)} /></div>
                        <div><Label>Paper Type *</Label><Input value={String(meta.paperType || '')} onChange={(e) => updateMeta(idx, 'paperType', e.target.value)} /></div>
                    </div>
                    {frameFields}
                </div>
            );

        default:
            return null;
    }
};

export function StudentSubmissionPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [referenceId, setReferenceId] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [form, setForm] = useState({
        displayName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        bio: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        termsAccepted: false,
        honeypot: ''
    });

    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
    const [checkingAvailability, setCheckingAvailability] = useState(false);

    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePreview, setProfilePreview] = useState<string>('');
    const [artworks, setArtworks] = useState<ArtworkDraft[]>([createArtworkDraft()]);

    const updateArtworkMeta = (
        artworkIndex: number,
        key: string,
        value: string | boolean
    ) => {
        setArtworks((prev) => prev.map((item, idx) => {
            if (idx !== artworkIndex) return item;

            const syncedMeta = key === 'frameOption' && value === 'without_frame'
                ? { sizeWithoutFrame: item.size }
                : {};

            return {
                ...item,
                categoryMeta: {
                    ...item.categoryMeta,
                    ...syncedMeta,
                    [key]: value
                }
            };
        }));
    };

    useEffect(() => {
        const raw = localStorage.getItem(FORM_STORAGE_KEY);
        if (!raw) return;

        try {
            const parsed = JSON.parse(raw);
            if (parsed?.form) {
                setForm((prev) => ({ ...prev, ...parsed.form, password: '', confirmPassword: '' }));
            }
            if (Array.isArray(parsed?.artworks) && parsed.artworks.length > 0) {
                setArtworks(parsed.artworks.map((a: any) => ({
                    ...createArtworkDraft(),
                    ...a,
                    categoryMeta: a?.categoryMeta || {},
                    files: [],
                    previews: []
                })));
            }
        } catch {
            localStorage.removeItem(FORM_STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        const save = setInterval(() => {
            const snapshot = {
                form: {
                    ...form,
                    password: '',
                    confirmPassword: ''
                },
                artworks: artworks.map((a) => ({
                    category: a.category,
                    title: a.title,
                    price: a.price,
                    size: a.size,
                    medium: a.medium,
                    description: a.description,
                    coverIndex: a.coverIndex,
                    categoryMeta: a.categoryMeta || {}
                }))
            };
            localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(snapshot));
        }, 30000);

        return () => clearInterval(save);
    }, [form, artworks]);

    useEffect(() => {
        if (!form.username && !form.email) {
            setUsernameAvailable(null);
            setEmailAvailable(null);
            return;
        }

        const timeout = setTimeout(async () => {
            if (form.username.length < 3 && !form.email) return;
            setCheckingAvailability(true);
            try {
                const response = await checkStudentSubmissionAvailability({
                    username: form.username || undefined,
                    email: form.email || undefined
                });
                if (response.success) {
                    setUsernameAvailable(response.data.usernameAvailable);
                    setEmailAvailable(response.data.emailAvailable);
                }
            } catch {
                // Keep UX non-blocking if availability call fails.
            } finally {
                setCheckingAvailability(false);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [form.username, form.email]);

    useEffect(() => () => {
        if (profilePreview) URL.revokeObjectURL(profilePreview);
        artworks.forEach((a) => a.previews.forEach((p) => URL.revokeObjectURL(p)));
    }, [profilePreview, artworks]);

    const requiredReady =
        !!profilePicture
        && !!form.displayName.trim()
        && !!form.username.trim()
        && !!form.email.trim()
        && !!form.phone.trim()
        && !!form.password
        && form.password === form.confirmPassword
        && !!form.fullName.trim()
        && form.bio.trim().split(/\s+/).length >= 15
        && !!form.street.trim()
        && !!form.city.trim()
        && !!form.state.trim()
        && !!form.pincode.trim()
        && artworks.length > 0
        && artworks.every((a) => a.title.trim() && a.price.trim() && a.size.trim() && a.medium.trim() && a.files.length >= 1)
        && artworks.every((a) => validateCategoryMeta(a))
        && !!form.termsAccepted
        && usernameAvailable !== false
        && emailAvailable !== false;

    const updateArtwork = (index: number, patch: Partial<ArtworkDraft>) => {
        setArtworks((prev) => prev.map((item, idx) => {
            if (idx !== index) return item;

            const next = { ...item, ...patch };
            if (next.categoryMeta?.frameOption === 'without_frame') {
                next.categoryMeta = {
                    ...next.categoryMeta,
                    sizeWithoutFrame: next.size
                };
            }

            return next;
        }));
    };

    const onProfileChange = (file?: File) => {
        if (!file) return;
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Profile picture must be JPG, PNG, or WebP');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Profile picture must be under 10MB');
            return;
        }
        if (profilePreview) URL.revokeObjectURL(profilePreview);
        setProfilePicture(file);
        setProfilePreview(URL.createObjectURL(file));
    };

    const onArtworkFilesChange = (artworkIndex: number, files: FileList | null) => {
        if (!files) return;
        const selected = Array.from(files);
        const current = artworks[artworkIndex];

        if (current.files.length + selected.length > 6) {
            toast.error('Maximum 6 images per artwork block');
            return;
        }

        const nextFiles: File[] = [...current.files];
        const nextPreviews: string[] = [...current.previews];

        for (const file of selected) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                toast.error(`${file.name}: only JPG, PNG, WebP allowed`);
                continue;
            }
            if (file.size > 10 * 1024 * 1024) {
                toast.error(`${file.name}: file must be under 10MB`);
                continue;
            }
            nextFiles.push(file);
            nextPreviews.push(URL.createObjectURL(file));
        }

        updateArtwork(artworkIndex, { files: nextFiles, previews: nextPreviews });
    };

    const removeArtworkImage = (artworkIndex: number, imageIndex: number) => {
        const current = artworks[artworkIndex];
        URL.revokeObjectURL(current.previews[imageIndex]);

        const nextFiles = current.files.filter((_, idx) => idx !== imageIndex);
        const nextPreviews = current.previews.filter((_, idx) => idx !== imageIndex);
        const nextCover = Math.max(0, Math.min(current.coverIndex, nextFiles.length - 1));

        updateArtwork(artworkIndex, {
            files: nextFiles,
            previews: nextPreviews,
            coverIndex: nextCover
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!requiredReady) {
            toast.error('Please complete all required fields first');
            return;
        }

        if (!profilePicture) {
            toast.error('Profile picture is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                payload.append(key, String(value));
            });

            payload.append('profilePicture', profilePicture);

            artworks.forEach((item) => {
                item.files.forEach((file) => {
                    payload.append('artworkImages', file);
                });
            });

            // Build global image indexes in the same order as appended files.
            let globalImageIndex = 0;
            const normalizedMeta = artworks.map((item) => {
                const imageIndexes = item.files.map(() => {
                    const value = globalImageIndex;
                    globalImageIndex += 1;
                    return value;
                });
                return {
                    category: item.category,
                    title: item.title,
                    price: Number(item.price),
                    size: item.size,
                    medium: item.medium,
                    description: item.description,
                    primaryImageIndex: item.coverIndex,
                    imageIndexes,
                    categoryMeta: sanitizeMeta(item.categoryMeta || {})
                };
            });

            payload.set('artworksMeta', JSON.stringify(normalizedMeta));

            const response = await submitStudentArtworkSubmission(payload);
            if (response.success) {
                setReferenceId(response.data.referenceId || response.data.applicationId);
                setShowSuccessModal(true);
                toast.success('Thanks for submitting. Your artwork is under review by admin. You will be updated via email.');
                localStorage.removeItem(FORM_STORAGE_KEY);
            }
        } catch (error: any) {
            toast.error(error.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#57b2c7] py-10 px-4">
            <div className="max-w-5xl mx-auto space-y-6">
                <Card className=" border-[#f4d7b3] shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-extrabold uppercase tracking-wide bg-gradient-to-r from-[#f97d06] via-[#b42baf] to-[#e33668] bg-clip-text text-transparent">
                            Final Artwork Submission
                        </CardTitle>
                        <CardDescription className="text-gray-600">Submit your artwork details for admin to review. Check email for current status.</CardDescription>
                    </CardHeader>
                </Card>

                <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-green-700">
                                <CheckCircle2 className="w-5 h-5" /> Submission Received
                            </DialogTitle>
                            <DialogDescription className="text-gray-700">
                                Your artwork has been submitted and is under review. You will be updated via email.
                            </DialogDescription>
                        </DialogHeader>
                        {referenceId ? <p className="text-sm text-gray-600">Reference ID: <strong>{referenceId}</strong></p> : null}
                        <DialogFooter>
                            <Button type="button" onClick={() => setShowSuccessModal(false)}>Close</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-white/80 shadow-sm">
                        <CardHeader><CardTitle>User Registration Information</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label>Profile Picture *</Label>
                                <div className="mt-2 flex flex-col items-start gap-2">
                                    <label
                                        htmlFor="student-profile-picture"
                                        className="h-24 w-24 rounded-full border-2 border-dashed border-gray-300 bg-white cursor-pointer flex items-center justify-center overflow-hidden hover:border-[#a73f2b]"
                                    >
                                        {profilePreview ? (
                                            <img src={profilePreview} alt="Profile preview" className="h-full w-full object-cover" />
                                        ) : (
                                            <Plus className="w-8 h-8 text-gray-500" />
                                        )}
                                    </label>
                                    <input
                                        id="student-profile-picture"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => onProfileChange(e.target.files?.[0])}
                                        className="hidden"
                                    />
                                    <p className="text-sm text-gray-600">Upload profile picture</p>
                                </div>
                            </div>

                            <div>
                                <Label>Display Name *</Label>
                                <Input value={form.displayName} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} maxLength={60} required />
                            </div>

                            <div>
                                <Label>Username *</Label>
                                <Input value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value.replace(/\s/g, '') }))} required />
                                {checkingAvailability ? <p className="text-xs text-gray-500 mt-1">Checking...</p> : null}
                                {usernameAvailable === false ? <p className="text-xs text-red-600 mt-1">Username already taken</p> : null}
                                {usernameAvailable === true ? <p className="text-xs text-green-700 mt-1">Username available</p> : null}
                            </div>

                            <div>
                                <Label>Email *</Label>
                                <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
                                {emailAvailable === false ? <p className="text-xs text-red-600 mt-1">Email already registered</p> : null}
                            </div>

                            <div>
                                <Label>Phone *</Label>
                                <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
                            </div>

                            <div>
                                <Label>Password *</Label>
                                <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
                            </div>

                            <div>
                                <Label>Confirm Password *</Label>
                                <Input type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} required />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Full Name *</Label>
                                <Input value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} required />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Bio *</Label>
                                <Textarea value={form.bio} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} rows={4} required />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/80 shadow-sm">
                        <CardHeader><CardTitle>Address</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label>Postal Address *</Label>
                                <Textarea value={form.street} onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))} rows={3} required />
                            </div>
                            <div><Label>City *</Label><Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} required /></div>
                            <div><Label>State *</Label><Input value={form.state} onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))} required /></div>
                            <div><Label>Pincode *</Label><Input value={form.pincode} onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))} required /></div>
                            <div><Label>Country *</Label><Input value={form.country} onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))} required /></div>
                        </CardContent>
                    </Card>

                    <Card className="border-white/80 shadow-sm">
                        <CardHeader>
                            <CardTitle>Artwork Submission</CardTitle>
                            <CardDescription>Each artwork needs 1-6 images and one cover image.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {artworks.map((artwork, idx) => (
                                <div key={idx} className="border border-[#f1e3d4] rounded-lg p-4 space-y-3 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium">Artwork #{idx + 1}</h4>
                                        {artworks.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setArtworks((prev) => prev.filter((_, i) => i !== idx))}>
                                                <Trash2 className="w-4 h-4 mr-1" /> Remove
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-3">
                                        <div>
                                            <Label>Category *</Label>
                                            <Select value={artwork.category} onValueChange={(value) => updateArtwork(idx, { category: value as CategoryOption, categoryMeta: {} })}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORY_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div><Label>Title *</Label><Input value={artwork.title} onChange={(e) => updateArtwork(idx, { title: e.target.value })} required /></div>
                                        <div><Label>Price (INR) *</Label><Input type="number" min="1" step="0.01" value={artwork.price} onChange={(e) => updateArtwork(idx, { price: e.target.value })} required /></div>
                                        <div><Label>Size (W X H) *</Label><Input value={artwork.size} onChange={(e) => updateArtwork(idx, { size: e.target.value })} required /></div>
                                        <div><Label>Medium / Material *</Label><Input value={artwork.medium} onChange={(e) => updateArtwork(idx, { medium: e.target.value })} required /></div>
                                    </div>

                                    <div>
                                        <Label>Description</Label>
                                        <Textarea value={artwork.description} onChange={(e) => updateArtwork(idx, { description: e.target.value })} rows={2} />
                                    </div>

                                    <div className="border border-[#f0e2d8] rounded-md p-3 bg-gradient-to-r from-orange-50/60 to-rose-50/40">
                                        <p className="text-sm font-medium mb-3">Category Specific Details</p>
                                        {renderCategorySpecificFields(artwork, idx, updateArtworkMeta)}
                                    </div>

                                    <div>
                                        <Label>Images (1-6) *</Label>
                                        <div className="mt-2 rounded-md border-2 border-dashed border-[#a73f2b] bg-orange-50 p-4">
                                            <input
                                                id={`artwork-images-${idx}`}
                                                type="file"
                                                multiple
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={(e) => onArtworkFilesChange(idx, e.target.files)}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor={`artwork-images-${idx}`}
                                                className="mx-auto flex w-full max-w-sm cursor-pointer items-center justify-center gap-2 rounded-md bg-[#a73f2b] px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-[#8c3322]"
                                            >
                                                <Upload className="h-4 w-4" />
                                                Choose Artwork Images
                                            </label>
                                            <p className="mt-2 text-center text-xs text-gray-600">
                                                JPG, PNG, WebP up to 10MB each
                                            </p>
                                        </div>
                                    </div>

                                    {artwork.previews.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                                            {artwork.previews.map((src, imageIdx) => (
                                                <div key={src} className={`relative border rounded p-1 ${artwork.coverIndex === imageIdx ? 'border-green-500' : 'border-gray-200'}`}>
                                                    <img src={src} alt={`Artwork ${idx + 1} preview ${imageIdx + 1}`} className="h-20 w-full object-cover rounded" />
                                                    <div className="mt-1 flex gap-1">
                                                        <Button type="button" size="sm" variant={artwork.coverIndex === imageIdx ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => updateArtwork(idx, { coverIndex: imageIdx })}>
                                                            Cover
                                                        </Button>
                                                        <Button type="button" size="sm" variant="ghost" className="h-7 text-xs" onClick={() => removeArtworkImage(idx, imageIdx)}>
                                                            Remove
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            <Button type="button" variant="outline" onClick={() => setArtworks((prev) => [...prev, createArtworkDraft()])}>
                                <Plus className="w-4 h-4 mr-2" /> Add Another Artwork
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-white/80 shadow-sm">
                        <CardHeader><CardTitle>Terms & Conditions</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="max-h-48 overflow-y-auto border rounded p-3 text-sm text-gray-700">
                                By submitting this form, you confirm that all information provided and artwork uploaded are your original work or properly licensed, and that your submission respects the rights of others.
                                Your submission will be reviewed by the admin team, and approved submission will be published on the platform.
                                You also agree to the ArtVPP Terms, Privacy Policy, and moderation guidelines.
                            </div>
                            <div className="flex items-start gap-2">
                                <Checkbox checked={form.termsAccepted} onCheckedChange={(value) => setForm((p) => ({ ...p, termsAccepted: !!value }))} />
                                <Label>I have read and agree to the Terms & Conditions and Privacy Policy *</Label>
                            </div>
                        </CardContent>
                    </Card>

                    <input
                        type="text"
                        value={form.honeypot}
                        onChange={(e) => setForm((p) => ({ ...p, honeypot: e.target.value }))}
                        className="hidden"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                    />

                    <Button type="submit" disabled={!requiredReady || isSubmitting} className="w-full md:w-auto bg-gradient-to-r from-[#f97d06] via-[#b42baf] to-[#e33668] text-white hover:opacity-95">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                        Submit for Admin Review
                    </Button>
                </form>
            </div>
        </div>
    );
}
