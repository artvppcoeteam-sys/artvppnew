import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function AuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser } = useApp();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Google authentication failed');
        navigate('/login');
        return;
      }

      if (!token) {
        toast.error('No authentication token received');
        navigate('/login');
        return;
      }

      try {
        // Store the token
        localStorage.setItem('token', token);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }

        // Decode token to get user info (simple decode, not verify)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const user = {
          id: payload.id,
          name: payload.username || payload.name,
          email: payload.email,
          role: payload.role,
          avatar: payload.avatar
        };

        setUser(user);
        toast.success('Successfully logged in with Google!');

        // Navigate based on role
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'artist' || user.role === 'vendor') {
          navigate('/vendor');
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Auth success error:', error);
        toast.error('Authentication failed');
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    handleAuthSuccess();
  }, [searchParams, navigate, setUser]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#a73f2b]" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait while we finish setting up your account...</p>
      </div>
    </div>
  );
}
