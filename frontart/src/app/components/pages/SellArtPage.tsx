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
    Lock, X, Image as ImageIcon, Clock, XCircle,
    Star, Plus
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
        <div className="min-h-screen relative bg-[#F7F8FA] pb-24">
            {/* Artistic Header Section */}
            <div className="relative h-[450px] bg-[#0A0A0A] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img 
                        src="https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=2071&auto=format&fit=crop" 
                        alt="Art background" 
                        className="w-full h-full object-cover opacity-40"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#F7F8FA]" />
                </div>
                
                <div className="relative z-10 max-w-5xl mx-auto px-6 h-full flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-white mb-6 drop-shadow-md" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Share Your Art with the World
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                            Join our curated community of artists. Apply to sell your artworks on ArtVPP and reach collectors globally.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Application Container */}
            <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-20">
                <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-white/95 backdrop-blur-md rounded-[32px] overflow-hidden">
                    <CardHeader className="bg-white border-b border-gray-100 p-10 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#a73f2b] to-[#b30452] rounded-2xl mb-6 shadow-lg shadow-[#b30452]/20">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <CardTitle className="text-4xl font-serif font-bold text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Artist Application
                        </CardTitle>
                        <CardDescription className="text-lg text-gray-600">
                            Complete the form below. Our team reviews every portfolio to ensure quality.
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="p-10 space-y-12">
                        <form onSubmit={handleSubmit} className="space-y-12">
                            
                            {/* Section 1: Basic Information */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">1. Artist Profile</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Primary Email */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700">Primary Email</Label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                            <Mail className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-600 font-medium">{user?.email}</span>
                                            <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                                        </div>
                                        <p className="text-[11px] text-gray-400">Linked to your account</p>
                                    </div>

                                    {/* Full Name */}
                                    <div className="space-y-3">
                                        <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700">Full Legal Name *</Label>
                                        <Input
                                            id="fullName"
                                            required
                                            placeholder="Your full legal name"
                                            value={formData.fullName}
                                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                            className="h-14 bg-white border-gray-200 focus:border-[#a73f2b] focus:ring-[#a73f2b]/10 rounded-2xl px-5 transition-all text-gray-900"
                                        />
                                    </div>

                                    {/* Secondary Email */}
                                    <div className="space-y-3">
                                        <Label htmlFor="secondaryEmail" className="text-sm font-semibold text-gray-700">Business Email *</Label>
                                        <Input
                                            id="secondaryEmail"
                                            type="email"
                                            required
                                            placeholder="business@email.com"
                                            value={formData.secondaryEmail}
                                            onChange={e => setFormData({ ...formData, secondaryEmail: e.target.value })}
                                            className="h-14 bg-white border-gray-200 focus:border-[#a73f2b] focus:ring-[#a73f2b]/10 rounded-2xl px-5 transition-all"
                                        />
                                        <p className="text-[11px] text-gray-500 leading-tight">
                                            Must be different from your primary email. You'll need to verify this email after submission.
                                        </p>
                                    </div>

                                    {/* Phones */}
                                    <div className="space-y-3">
                                        <Label className="text-sm font-semibold text-gray-700">Primary Phone</Label>
                                        <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                                            <Phone className="w-5 h-5 text-gray-400" />
                                            <span className="text-gray-600 font-medium">
                                                {user?.phone || 'Not set in profile'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-400">Current profile number</p>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="secondaryPhone" className="text-sm font-semibold text-gray-700">Business Phone *</Label>
                                        <Input
                                            id="secondaryPhone"
                                            type="tel"
                                            required
                                            placeholder="9876543210"
                                            value={formData.secondaryPhone}
                                            onChange={e => setFormData({ ...formData, secondaryPhone: e.target.value })}
                                            className="h-14 bg-white border-gray-200 focus:border-[#a73f2b] focus:ring-[#a73f2b]/10 rounded-2xl px-5 transition-all"
                                        />
                                        <p className="text-[11px] text-gray-500">10 digit number without country code</p>
                                    </div>
                                </div>

                                {/* Profile Photo Upload */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-semibold text-gray-700">Profile Photo *</Label>
                                    <div className="flex items-center gap-8 p-6 bg-gray-50/50 rounded-[24px] border border-dashed border-gray-200 group hover:border-[#a73f2b] transition-all">
                                        <div className="relative">
                                            {profilePicturePreview ? (
                                                <div className="relative w-32 h-32">
                                                    <img
                                                        src={profilePicturePreview}
                                                        alt="Profile"
                                                        className="w-full h-full rounded-[24px] object-cover border-4 border-white shadow-md"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setProfilePicture(null);
                                                            setProfilePicturePreview(null);
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => profilePicInputRef.current?.click()}
                                                    className="w-32 h-32 rounded-[24px] bg-white border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer group-hover:border-[#a73f2b]/50 group-hover:bg-white transition-all shadow-sm"
                                                >
                                                    <Upload className="w-8 h-8 text-gray-300 group-hover:text-[#a73f2b]" />
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-2">Upload</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <h4 className="font-bold text-gray-900">Upload a professional photo</h4>
                                            <p className="text-sm text-gray-500 font-light max-w-xs">This will be used as your artist profile picture once approved.</p>
                                            <p className="text-[11px] text-gray-400 font-medium mt-1">JPG, PNG or WebP (Max 5MB)</p>
                                        </div>
                                        <input
                                            ref={profilePicInputRef}
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleProfilePicChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                
                                {/* Bio */}
                                <div className="space-y-4">
                                    <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Artistic Journey & Statement *</Label>
                                    <div className="relative">
                                        <Textarea
                                            id="bio"
                                            placeholder="Tell us about your artistic journey, style, and what inspires your work..."
                                            className="min-h-[160px] bg-white border-gray-200 focus:border-[#a73f2b] focus:ring-[#a73f2b]/10 rounded-[24px] px-6 py-5 text-gray-900 placeholder:text-gray-400 resize-none transition-all"
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                            required
                                        />
                                        <div className="absolute bottom-4 right-6">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${formData.bio.trim().split(/\s+/).length >= 15 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {formData.bio.trim() ? formData.bio.trim().split(/\s+/).length : 0} / 15 minimum
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Portfolio & Category */}
                            <div className="space-y-8 pt-6">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle2 className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">2. Specialization & Portfolio</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Primary Category *</Label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={v => setFormData({ ...formData, category: v })}
                                        >
                                            <SelectTrigger className="h-14 bg-white border-gray-200 rounded-2xl px-5 focus:ring-[#a73f2b]/10 transition-all">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                                                <SelectItem value="painting">Painting</SelectItem>
                                                <SelectItem value="sculpture">Sculpture</SelectItem>
                                                <SelectItem value="photography">Photography</SelectItem>
                                                <SelectItem value="digital">Digital Art</SelectItem>
                                                <SelectItem value="mixed">Mixed Media</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="portfolio" className="text-sm font-semibold text-gray-700">Social / Behance Portfolio Link</Label>
                                        <Input
                                            id="portfolio"
                                            placeholder="https://instagram.com/yourart"
                                            value={formData.portfolio}
                                            onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                                            className="h-14 bg-white border-gray-200 focus:border-[#a73f2b] focus:ring-[#a73f2b]/10 rounded-2xl px-5"
                                        />
                                    </div>
                                </div>

                                {/* Address Grid */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-semibold text-gray-700">Business Address *</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50/50 rounded-[32px] border border-gray-100">
                                        <div className="md:col-span-4">
                                            <Input
                                                placeholder="Street Address"
                                                value={formData.street}
                                                onChange={e => setFormData({ ...formData, street: e.target.value })}
                                                className="h-12 bg-white border-gray-200 rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                placeholder="City"
                                                value={formData.city}
                                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                                                className="h-12 bg-white border-gray-200 rounded-xl"
                                                required
                                            />
                                        </div>
                                        <Input
                                            placeholder="State"
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            className="h-12 bg-white border-gray-200 rounded-xl"
                                            required
                                        />
                                        <Input
                                            placeholder="Pincode"
                                            value={formData.pincode}
                                            onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                                            className="h-12 bg-white border-gray-200 rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Artwork Selection */}
                            <div className="space-y-8 pt-6">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Star className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">3. Sample Artworks</h3>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-sm text-gray-600 font-medium">Upload exactly 5 of your best artworks. These will be reviewed by our team.</p>
                                    <p className="text-xs text-gray-400">High quality images improve your chances of approval.</p>
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                    {artworkPreviews.map((preview, index) => (
                                        <motion.div 
                                            key={index} 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group"
                                        >
                                            <div className="aspect-[4/5] rounded-[24px] overflow-hidden border border-gray-200 shadow-sm relative">
                                                <img
                                                    src={preview}
                                                    alt={`Artwork ${index + 1}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeArtwork(index)}
                                                        className="bg-white text-red-600 rounded-full p-2 shadow-xl hover:scale-110 transition-transform"
                                                    >
                                                        <X className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {artworkFiles.length < MAX_ARTWORKS && (
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="aspect-[4/5] border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:border-[#a73f2b] hover:bg-gray-50/50 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <Plus className="w-6 h-6 text-gray-400 group-hover:text-[#a73f2b]" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-500 group-hover:text-gray-900 uppercase tracking-widest">Add Artwork</p>
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium">{artworkFiles.length} / {MAX_ARTWORKS} Uploaded</p>
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

                                <div className="p-5 bg-gray-50 rounded-2xl flex items-start gap-4">
                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mt-0.5">
                                        <Clock className="w-3 h-3 text-gray-500" />
                                    </div>
                                    <p className="text-xs text-gray-500 flex-1 leading-relaxed">
                                        Allowed formats: JPG, PNG or WebP. Maximum file size is 5MB each. You must provide exactly 5 artworks for a complete portfolio review.
                                    </p>
                                </div>
                            </div>

                            {/* Submit Section */}
                            <div className="pt-12 border-t border-gray-100 text-center space-y-6">
                                <Button
                                    type="submit"
                                    className="w-full h-16 bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0_10px_30px_rgba(179,4,82,0.3)] rounded-2xl border-0 text-white font-bold text-xl transition-all shadow-lg hover:-translate-y-1"
                                    disabled={isSubmitting || artworkFiles.length < MIN_ARTWORKS}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                            Filing Application...
                                        </>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </Button>
                                
                                <p className="text-sm text-gray-500">
                                    By submitting, you agree to ArtVPP's{' '}
                                    <Link to="/terms" className="text-[#a73f2b] font-bold hover:underline">Vendor Terms & Conditions</Link>.
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Trust Badges */}
                <div className="mt-16 flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
                    <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Secure Review</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-widest">Verified Artists</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
