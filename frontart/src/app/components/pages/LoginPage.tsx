import { useState } from 'react';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useApp } from '../../context/AppContext';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

// Helper function to extract error messages from backend response
const getErrorMessage = (error: any): string => {
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.map((e: any) => e.message).join('. ');
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return error?.message || 'Login failed. Please try again.';
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const normalizedEmail = loginData.email.trim().toLowerCase();

    if (!normalizedEmail || !loginData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      const response = await login(normalizedEmail, loginData.password);
      toast.success('Login successful!');

      // Navigate based on role
      if (response.role === 'admin') {
        navigate('/dashboard/admin');
      } else if (response.role === 'artist') {
        navigate('/dashboard/vendor');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);

      if (errorMessage.toLowerCase().includes('verify') || errorMessage.toLowerCase().includes('verification')) {
        toast.error(errorMessage, {
          icon: <AlertCircle className="w-5 h-5 text-yellow-500" />,
          duration: 6000,
          action: {
            label: 'Verify Email',
            onClick: () => navigate('/verify-email'),
          },
        });
      } else {
        toast.error(errorMessage, {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          duration: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 text-[#111827]" style={{ fontFamily: 'Poppins, sans-serif' }}>Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-white rounded-xl p-1 shadow-sm mb-6 border border-gray-100">
          <Link to="/login" className="flex-1 text-center py-2.5 rounded-lg bg-gradient-to-r from-[#a73f2b] to-[#b30452] text-white font-medium shadow-[0_2px_8px_rgba(179, 4, 82,0.25)] transition-all">
            Sign In
          </Link>
          <Link to="/register" className="flex-1 text-center py-2.5 rounded-lg text-gray-500 hover:text-gray-900 font-medium transition-all">
            Sign Up
          </Link>
        </div>

        <Card className="shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-transparent bg-white p-2">
          <CardContent className="pt-6">
            {/* Google Sign In */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-6 rounded-[10px] border-gray-200 text-gray-700 hover:bg-gray-50 bg-white shadow-sm font-medium"
                onClick={() => {
                  loginWithGoogle();
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-4 text-gray-500">or continue with email</span>
                </div>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className="pl-10 h-12"
                    placeholder="Email address"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="pl-10 h-12"
                    placeholder="Password"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-[#a73f2b] hover:underline transition-colors mt-2">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full text-white rounded-[10px] shadow-md hover:shadow-lg transition-all duration-250 py-6 text-base mt-2 border-0 font-semibold tracking-wide"
                style={{ background: 'linear-gradient(135deg, #a73f2bff, #b30452ff)' }}
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
                By continuing, you agree to our{' '}
                <Link to="/terms" className="hover:text-[#a73f2b] hover:underline transition-colors">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="hover:text-[#a73f2b] hover:underline transition-colors">Privacy Policy</Link>
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Info about roles */}
        <p className="text-center text-xs text-gray-500 mt-4">
          One account for everything - buy art, or{' '}
          <Link to="/sell" className="text-[#a73f2b] hover:underline">
            apply to sell
          </Link>
        </p>
      </div>
    </div>
  );
}
