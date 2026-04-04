import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { verifyEmail, resendVerification } from '../../utils/api';

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired' | 'no-token';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('no-token');
        setMessage('No verification token provided.');
        return;
      }

      try {
        const response = await verifyEmail(token);
        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(response.message || 'Verification failed.');
        }
      } catch (error: any) {
        const errorMessage = error?.message || 'Verification failed. Please try again.';

        if (errorMessage.toLowerCase().includes('expired')) {
          setStatus('expired');
          setMessage('Your verification link has expired.');
        } else {
          setStatus('error');
          setMessage(errorMessage);
        }
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      await resendVerification(email);
      toast.success('Verification email sent! Please check your inbox.');
      setEmail('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to send verification email.';
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
              <CardTitle>Verifying Your Email</CardTitle>
              <CardDescription>Please wait while we verify your email address...</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <CardTitle className="text-green-700">Email Verified!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <CardTitle className="text-red-700">Verification Failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-yellow-100">
                <RefreshCw className="w-10 h-10 text-yellow-600" />
              </div>
              <CardTitle className="text-yellow-700">Link Expired</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'no-token' && (
            <>
              <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-gray-100">
                <Mail className="w-10 h-10 text-gray-600" />
              </div>
              <CardTitle>Email Verification</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {status === 'success' && (
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                Your account is now active. You can sign in to start exploring.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white"
                size="lg"
              >
                Go to Login
              </Button>
            </div>
          )}

          {(status === 'error' || status === 'expired' || status === 'no-token') && (
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                Enter your email to receive a new verification link.
              </p>
              <form onSubmit={handleResendVerification} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#a73f2b] to-[#b30452] hover:brightness-110 hover:shadow-[0px_6px_20px_rgba(179,4,82,0.35)] rounded-[10px] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-250 border-0 text-white"
                  size="lg"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              </form>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-[#a73f2b] hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


