import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
    CheckCircle2, Upload, Loader2, Mail, Phone,
    Lock, X, Image as ImageIcon, Clock, XCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
    applyArtist,
    sendArtistEmailOtp,
    verifyArtistEmailOtp,
    getMyArtistApplication
} from '../../utils/api';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MIN_ARTWORKS = 5;
const MAX_ARTWORKS = 5;

export function SellArtPage() {
    const { user, isAuthLoading } = useApp();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const profilePicInputRef = useRef<HTMLInputElement>(null);

    // Application status
    const [existingApplication, setExistingApplication] = useState<any>(null);
    const [loadingApplication, setLoadingApplication] = useState(true);

    // Form state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        secondaryEmail: '',
        secondaryPhone: '',
        bio: '',
        category: '',
        portfolio: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
    });

    // Email verification state
    const [emailOtpSent, setEmailOtpSent] = useState(false);
    const [emailOtp, setEmailOtp] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [sendingOtp, setSendingOtp] = useState(false);

    // File upload state
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [profilePicturePreview, setProfilePicturePreview] = useState<string | null>(null);
    const [artworkFiles, setArtworkFiles] = useState<File[]>([]);
    const [artworkPreviews, setArtworkPreviews] = useState<string[]>([]);
    const [artworkTitles, setArtworkTitles] = useState<string[]>(Array(MAX_ARTWORKS).fill(''));

    // Check for existing application on mount
    useEffect(() => {
        const checkExistingApplication = async () => {
            if (!user) {
                setLoadingApplication(false);
                return;
            }

            try {
                const response = await getMyArtistApplication();
                if (response.success && response.data?.hasApplication && response.data?.application) {
                    setExistingApplication(response.data.application);
                }
                // If hasApplication is false, that's fine - user can apply
            } catch (error) {
                // Error fetching application - user can still try to apply
                console.log('Error checking application:', error);
            } finally {
                setLoadingApplication(false);
            }
        };

        if (!isAuthLoading) {
            checkExistingApplication();
        }
    }, [user, isAuthLoading]);

    // File validation helper
    const validateFile = (file: File): string | null => {
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return `${file.name}: Only JPG, PNG, and WebP images are allowed`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `${file.name}: File size must be less than 5MB`;
        }
        return null;
    };

    // Handle profile picture upload
    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
            toast.error(error);
            return;
        }

        setProfilePicture(file);
        setProfilePicturePreview(URL.createObjectURL(file));
    };

    // Handle artwork upload
    const handleArtworkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remainingSlots = MAX_ARTWORKS - artworkFiles.length;
        if (files.length > remainingSlots) {
            toast.error(`You can only upload ${remainingSlots} more image(s). Maximum is ${MAX_ARTWORKS}.`);
            return;
        }

        const validFiles: File[] = [];
        const newPreviews: string[] = [];

        for (const file of files) {
            const error = validateFile(file);
            if (error) {
                toast.error(error);
                continue;
            }
            validFiles.push(file);
            newPreviews.push(URL.createObjectURL(file));
        }

        setArtworkFiles(prev => [...prev, ...validFiles]);
        setArtworkPreviews(prev => [...prev, ...newPreviews]);
    };

    // Remove artwork
    const removeArtwork = (index: number) => {
        URL.revokeObjectURL(artworkPreviews[index]);
        setArtworkFiles(prev => prev.filter((_, i) => i !== index));
        setArtworkPreviews(prev => prev.filter((_, i) => i !== index));
        setArtworkTitles(prev => {
            const newTitles = [...prev];
            newTitles.splice(index, 1);
            newTitles.push('');
            return newTitles;
        });
    };

    // Handle send OTP for secondary email
    const handleSendOtp = async () => {
        if (!formData.secondaryEmail) {
            toast.error('Please enter a secondary email first');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.secondaryEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        // Check if secondary email is same as primary
        if (formData.secondaryEmail.toLowerCase() === user?.email?.toLowerCase()) {
            toast.error('Secondary email must be different from your primary email');
            return;
        }

        setSendingOtp(true);
        try {
            // First submit a partial application to save the email, then send OTP
            // For now, we'll use a placeholder - the actual OTP will be sent after submission
            toast.info('OTP will be sent to your secondary email after you submit the application');
            setEmailOtpSent(true);
        } catch (error: any) {
            toast.error(error.message || 'Failed to send OTP');
        } finally {
            setSendingOtp(false);
        }
    };

    // Handle verify OTP
    const handleVerifyOtp = async () => {
        if (!emailOtp || emailOtp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }

        setVerifyingEmail(true);
        try {
            await verifyArtistEmailOtp(emailOtp);
            setEmailVerified(true);
            toast.success('Email verified successfully!');
        } catch (error: any) {
            toast.error(error.message || 'Invalid OTP');
        } finally {
            setVerifyingEmail(false);
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName.trim()) {
            toast.error('Please enter your full name');
            return;
        }

        if (!formData.secondaryEmail.trim()) {
            toast.error('Secondary email is required');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.secondaryEmail)) {
            toast.error('Please enter a valid secondary email address');
            return;
        }

        // Check if secondary email is same as primary
        if (formData.secondaryEmail.toLowerCase() === user?.email?.toLowerCase()) {
            toast.error('Secondary email must be different from your primary email');
            return;
        }

        if (!formData.bio.trim() || formData.bio.trim().split(/\s+/).length < 15) {
            toast.error('Bio must have at least 15 words');
            return;
        }

        if (!formData.secondaryPhone.trim()) {
            toast.error('Secondary phone number is required');
            return;
        }

        if (!profilePicture) {
            toast.error('Please upload a profile picture');
            return;
        }

        if (artworkFiles.length < MIN_ARTWORKS) {
            toast.error(`Please upload at least ${MIN_ARTWORKS} sample artworks`);
            return;
        }

        if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
            toast.error('Please fill in your complete address');
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = new FormData();

            // Basic info
            submitData.append('fullName', formData.fullName);
            submitData.append('bio', formData.bio);

            // Contact info - use correct field names
            submitData.append('secondaryPhone', formData.secondaryPhone);
            submitData.append('secondaryEmail', formData.secondaryEmail);

            // Address
            submitData.append('street', formData.street);
            submitData.append('city', formData.city);
            submitData.append('state', formData.state);
            submitData.append('pincode', formData.pincode);
            submitData.append('country', 'India');

            // Portfolio
            if (formData.portfolio) {
                submitData.append('portfolioWebsite', formData.portfolio);
            }

            // Profile picture
            submitData.append('profilePicture', profilePicture);

            // Artworks
            artworkFiles.forEach((file) => {
                submitData.append('artworks', file);
            });

            // Artwork titles as JSON
            const titles = artworkTitles.slice(0, artworkFiles.length).map((t, i) => t || `Artwork ${i + 1}`);
            submitData.append('artworkTitles', JSON.stringify(titles));

            const response = await applyArtist(submitData);

            if (response.success) {
                toast.success('Application submitted successfully! Please verify your email.');
                // Refresh to show pending status
                const appResponse = await getMyArtistApplication();
                if (appResponse.success) {
                    setExistingApplication(appResponse.data.application);
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isAuthLoading || loadingApplication) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-[#a73f2b]" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Not logged in - show login prompt
    if (!user) {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full text-center p-6">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <Lock className="w-8 h-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl">Sign In Required</CardTitle>
                        <CardDescription>
                            You need to be logged in to apply as an artist.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-gray-500">
                            Create an account or sign in to submit your artist application.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0">
                                Sign In
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/register')} className="w-full">
                                Create Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Already an artist
    if (user.role === 'artist') {
        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full text-center p-6">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <CardTitle className="text-2xl">You're Already an Artist!</CardTitle>
                        <CardDescription>
                            Your artist account is active. Start selling your artworks!
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button onClick={() => navigate('/dashboard/vendor')} className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0">
                            Go to Artist Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Existing pending/under_review application
    if (existingApplication && ['pending', 'under_review'].includes(existingApplication.status)) {
        const isEmailVerified = existingApplication.secondaryEmail?.isVerified;

        return (
            <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-gray-50">
                <Card className="max-w-md w-full text-center p-6">
                    <CardHeader>
                        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                        <CardTitle className="text-2xl">Application {existingApplication.status === 'under_review' ? 'Under Review' : 'Pending'}</CardTitle>
                        <CardDescription>
                            Your artist application has been submitted and is being reviewed by our team.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg text-left">
                            <p className="text-sm text-gray-600"><strong>Submitted:</strong> {new Date(existingApplication.submittedAt).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600"><strong>Status:</strong> {existingApplication.status.replace('_', ' ').toUpperCase()}</p>
                            <p className="text-sm text-gray-600">
                                <strong>Email Verified:</strong> {isEmailVerified ?
                                    <span className="text-green-600">Yes ✓</span> :
                                    <span className="text-orange-600">No (Required for approval)</span>
                                }
                            </p>
                        </div>

                        {!isEmailVerified && (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-left">
                                <p className="text-sm text-orange-700 font-medium mb-2">
                                    ⚠️ Please verify your secondary email to complete your application
                                </p>
                                <p className="text-xs text-orange-600 mb-3">
                                    Secondary Email: {existingApplication.secondaryEmail?.address}
                                </p>

                                {!emailOtpSent ? (
                                    <Button
                                        size="sm"
                                        className="bg-orange-500 hover:bg-orange-600"
                                        onClick={async () => {
                                            setSendingOtp(true);
                                            try {
                                                await sendArtistEmailOtp();
                                                setEmailOtpSent(true);
                                                toast.success('OTP sent to your secondary email');
                                            } catch (error: any) {
                                                toast.error(error.message || 'Failed to send OTP');
                                            } finally {
                                                setSendingOtp(false);
                                            }
                                        }}
                                        disabled={sendingOtp}
                                    >
                                        {sendingOtp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Send Verification OTP
                                    </Button>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-xs text-green-600">OTP sent! Check your email.</p>
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="Enter 6-digit OTP"
                                                value={emailOtp}
                                                onChange={e => setEmailOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                maxLength={6}
                                                className="w-32"
                                            />
                                            <Button
                                                size="sm"
                                                onClick={async () => {
                                                    if (!emailOtp || emailOtp.length !== 6) {
                                                        toast.error('Please enter a valid 6-digit OTP');
                                                        return;
                                                    }
                                                    setVerifyingEmail(true);
                                                    try {
                                                        await verifyArtistEmailOtp(emailOtp);
                                                        setEmailVerified(true);
                                                        toast.success('Email verified successfully!');
                                                        // Reload application to update UI
                                                        const appResponse = await getMyArtistApplication();
                                                        if (appResponse.success && appResponse.data?.application) {
                                                            setExistingApplication(appResponse.data.application);
                                                        }
                                                    } catch (error: any) {
                                                        toast.error(error.message || 'Invalid OTP');
                                                    } finally {
                                                        setVerifyingEmail(false);
                                                    }
                                                }}
                                                disabled={verifyingEmail}
                                            >
                                                {verifyingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                                            </Button>
                                        </div>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="text-xs p-0 h-auto"
                                            onClick={async () => {
                                                setSendingOtp(true);
                                                try {
                                                    await sendArtistEmailOtp();
                                                    toast.success('New OTP sent');
                                                } catch (error: any) {
                                                    toast.error(error.message || 'Failed to resend OTP');
                                                } finally {
                                                    setSendingOtp(false);
                                                }
                                            }}
                                            disabled={sendingOtp}
                                        >
                                            Resend OTP
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        <p className="text-sm text-gray-500">
                            You'll be notified via email once your application is reviewed. This usually takes 24-48 hours.
                        </p>
                        <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                            Back to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Rejected application - show reapply option if cooldown passed
    if (existingApplication && existingApplication.status === 'rejected') {
        const canReapply = existingApplication.canReapplyAfter
            ? new Date() >= new Date(existingApplication.canReapplyAfter)
            : true;

        if (!canReapply) {
            return (
                <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-gray-50">
                    <Card className="max-w-md w-full text-center p-6">
                        <CardHeader>
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <XCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <CardTitle className="text-2xl">Application Not Approved</CardTitle>
                            <CardDescription>
                                Your previous application was not approved.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {existingApplication.rejectionReason && (
                                <div className="bg-red-50 p-4 rounded-lg text-left">
                                    <p className="text-sm text-red-700"><strong>Reason:</strong> {existingApplication.rejectionReason}</p>
                                </div>
                            )}
                            <p className="text-sm text-gray-500">
                                You can reapply after {new Date(existingApplication.canReapplyAfter).toLocaleDateString()}.
                            </p>
                            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                                Back to Home
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    }

    // Main application form
    return (
        <div className="min-h-screen relative bg-gray-900">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=2071&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/30 to-gray-900"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Hero Section */}
                <div className="w-full max-w-4xl mx-auto text-center space-y-6 py-24 px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif font-bold tracking-tight text-white"
                    >
                        Share Your Art with the World
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto"
                    >
                        Join our curated community of artists. Apply to sell your artworks on ArtVPP and reach collectors globally.
                    </motion.p>
                </div>

                {/* Application Form */}
                <div className="w-full max-w-3xl px-4 pb-24">
                    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-sm">
                        <CardHeader className="text-center border-b pb-8">
                            <CardTitle className="text-3xl font-serif">Artist Application</CardTitle>
                            <CardDescription className="text-base text-gray-600">
                                Complete the form below. Our team reviews every portfolio to ensure quality.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Primary Email (Non-editable) */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <Label className="text-sm text-gray-500">Primary Email (Verified)</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span className="font-medium">{user?.email}</span>
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full Name *</Label>
                                    <Input
                                        id="fullName"
                                        required
                                        placeholder="Your full legal name"
                                        value={formData.fullName}
                                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>

                                {/* Secondary Email */}
                                <div className="space-y-2">
                                    <Label htmlFor="secondaryEmail">Secondary Email * (for business communications)</Label>
                                    <Input
                                        id="secondaryEmail"
                                        type="email"
                                        required
                                        placeholder="business@email.com"
                                        value={formData.secondaryEmail}
                                        onChange={e => setFormData({ ...formData, secondaryEmail: e.target.value })}
                                        className="bg-white"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Must be different from your primary email. You'll need to verify this email after submission.
                                    </p>
                                </div>

                                {/* Phone Numbers */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Primary Phone (Non-editable if exists) */}
                                    <div className="space-y-2">
                                        <Label>Primary Phone</Label>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-600">
                                                {user?.phone || 'Not set in profile'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Secondary Phone (Required) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="secondaryPhone">Secondary Phone *</Label>
                                        <Input
                                            id="secondaryPhone"
                                            type="tel"
                                            required
                                            placeholder="9876543210"
                                            value={formData.secondaryPhone}
                                            onChange={e => setFormData({ ...formData, secondaryPhone: e.target.value })}
                                            className="bg-white"
                                        />
                                        <p className="text-xs text-gray-500">10 digit number without country code</p>
                                    </div>
                                </div>

                                {/* Profile Picture */}
                                <div className="space-y-2">
                                    <Label>Profile Picture *</Label>
                                    <div className="flex items-center gap-4">
                                        {profilePicturePreview ? (
                                            <div className="relative">
                                                <img
                                                    src={profilePicturePreview}
                                                    alt="Profile"
                                                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProfilePicture(null);
                                                        setProfilePicturePreview(null);
                                                    }}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => profilePicInputRef.current?.click()}
                                                className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#a73f2b] transition-colors"
                                            >
                                                <Upload className="w-8 h-8 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            <p>Upload a professional photo</p>
                                            <p className="text-xs">JPG, PNG or WebP (Max 5MB)</p>
                                        </div>
                                    </div>
                                    <input
                                        ref={profilePicInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={handleProfilePicChange}
                                        className="hidden"
                                    />
                                </div>

                                {/* Bio */}
                                <div className="space-y-2">
                                    <Label htmlFor="bio">About You / Artist Statement * (min 15 words)</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Tell us about your artistic journey, style, and what inspires your work..."
                                        className="min-h-[120px] bg-white"
                                        value={formData.bio}
                                        onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        required
                                    />
                                    <p className="text-xs text-gray-500">
                                        Word count: {formData.bio.trim() ? formData.bio.trim().split(/\s+/).length : 0} / 15 minimum
                                    </p>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <Label htmlFor="category">Primary Art Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={v => setFormData({ ...formData, category: v })}
                                    >
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="painting">Painting</SelectItem>
                                            <SelectItem value="sculpture">Sculpture</SelectItem>
                                            <SelectItem value="photography">Photography</SelectItem>
                                            <SelectItem value="digital">Digital Art</SelectItem>
                                            <SelectItem value="mixed">Mixed Media</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Portfolio Link */}
                                <div className="space-y-2">
                                    <Label htmlFor="portfolio">Portfolio Link (Optional)</Label>
                                    <Input
                                        id="portfolio"
                                        placeholder="https://instagram.com/yourart or behance.net/yourprofile"
                                        value={formData.portfolio}
                                        onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>

                                {/* Address */}
                                <div className="space-y-4">
                                    <Label className="text-base font-medium">Address *</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <Input
                                                placeholder="Street Address"
                                                value={formData.street}
                                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                                className="bg-white"
                                                required
                                            />
                                        </div>
                                        <Input
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            className="bg-white"
                                            required
                                        />
                                        <Input
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            className="bg-white"
                                            required
                                        />
                                        <Input
                                            placeholder="Pincode"
                                            value={formData.pincode}
                                            onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                            className="bg-white"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Sample Artworks Upload */}
                                <div className="space-y-4">
                                    <Label className="text-base font-medium">Sample Artworks * (Upload exactly {MAX_ARTWORKS})</Label>
                                    <p className="text-sm text-gray-500">
                                        Upload {MAX_ARTWORKS} of your best artworks. These will be reviewed by our team.
                                    </p>

                                    {/* Artwork Previews Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {artworkPreviews.map((preview, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={preview}
                                                    alt={`Artwork ${index + 1}`}
                                                    className="w-full aspect-square object-cover rounded-lg border-2 border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeArtwork(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <Input
                                                    placeholder={`Title (optional)`}
                                                    value={artworkTitles[index]}
                                                    onChange={e => {
                                                        const newTitles = [...artworkTitles];
                                                        newTitles[index] = e.target.value;
                                                        setArtworkTitles(newTitles);
                                                    }}
                                                    className="mt-2 text-sm"
                                                />
                                            </div>
                                        ))}

                                        {/* Upload Button */}
                                        {artworkFiles.length < MAX_ARTWORKS && (
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#a73f2b] hover:bg-gray-50 transition-colors"
                                            >
                                                <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">Add Artwork</p>
                                                <p className="text-xs text-gray-400">{artworkFiles.length}/{MAX_ARTWORKS}</p>
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        multiple
                                        onChange={handleArtworkUpload}
                                        className="hidden"
                                    />

                                    <p className="text-xs text-gray-500">
                                        JPG, PNG or WebP (Max 5MB each). {artworkFiles.length}/{MAX_ARTWORKS} uploaded
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white py-6 text-lg"
                                        disabled={isSubmitting || artworkFiles.length < MIN_ARTWORKS}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Submitting Application...
                                            </>
                                        ) : (
                                            'Submit Application'
                                        )}
                                    </Button>
                                    <p className="text-xs text-center text-gray-500 mt-4">
                                        By submitting, you agree to ArtVPP's{' '}
                                        <Link to="/terms" className="text-[#a73f2b] hover:underline">Vendor Terms & Conditions</Link>.
                                    </p>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
