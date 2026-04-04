import { useState } from 'react';
import { Mail, Lock, User, Phone, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../utils/api';

// Helper function to extract error messages from backend response
const getErrorMessage = (error: any): string => {
  return error?.message || 'Registration failed. Please try again.';
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password validation helper
  const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    return { valid: errors.length === 0, errors };
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordCheck = validatePassword(formData.password);
    if (!passwordCheck.valid) {
      toast.error(passwordCheck.errors.join('. '), {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        duration: 5000,
      });
      return;
    }

    // Validate terms
    if (!agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    // Validate username
    if (formData.username.length < 3 || formData.username.length > 30) {
      toast.error('Username must be 3-30 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error('Username can only contain letters, numbers, and underscores');
      return;
    }
    if (formData.displayName.trim().length < 2 || formData.displayName.trim().length > 60) {
      toast.error('Display name must be 2-60 characters');
      return;
    }

    // Validate phone number
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits');
      return;
    }

    setIsLoading(true);
    try {
      await register(
        formData.username,
        formData.displayName.trim(),
        formData.email,
        formData.password,
        formData.phone
      );
      toast.success('Account created successfully! Please check your email to verify your account.', {
        duration: 6000,
      });
      navigate('/login');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage, {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>Create Account</h1>
          <p className="text-gray-600">Join our creative community</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6 border border-gray-100">
          <Link to="/login" className="flex-1 text-center py-2.5 rounded-lg text-gray-500 hover:text-gray-900 font-medium transition-all">
            Sign In
          </Link>
          <Link to="/register" className="flex-1 text-center py-2.5 rounded-lg bg-gradient-to-r from-[#a73f2b] to-[#b30452] text-white font-medium shadow-[0_2px_8px_rgba(179, 4, 82,0.25)] transition-all">
            Sign Up
          </Link>
        </div>

        <Card className="shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-transparent bg-white p-2">
          <CardContent className="pt-6">
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="john_doe"
                    minLength={3}
                    maxLength={30}
                    autoComplete="username"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">3-30 characters, letters, numbers and underscores only</p>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="your@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="displayName">Display Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="John Doe"
                    minLength={2}
                    maxLength={60}
                    autoComplete="name"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="9876543210"
                    autoComplete="tel"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">10 digit phone number (required)</p>
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="Create a strong password"
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Min 8 characters with uppercase, lowercase and number</p>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="pl-10"
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-[#a73f2b] hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-[#a73f2b] hover:underline">Privacy Policy</Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full text-white rounded-[10px] shadow-md hover:shadow-lg transition-all duration-250 py-6 text-base mt-4 border-0 font-semibold tracking-wide bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)]"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info about becoming an artist */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-blue-800">
            <strong>Want to sell your art?</strong><br />
            Create an account first, verify your email, then{' '}
            <Link to="/sell" className="text-[#a73f2b] hover:underline font-medium">apply to become an artist</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
