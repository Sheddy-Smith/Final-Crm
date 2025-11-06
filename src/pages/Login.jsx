import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Lock, LogIn, AlertCircle, Loader } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ThemeToggle from '@/components/ThemeToggle';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, error: authError, initialize, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('Shahidmultaniii@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login({ email, password });

    if (result.success) {
      toast.success('Login Successful! Welcome back!');
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Invalid email or password. Please try again.');
      toast.error('Login Failed!');
    }
  };

  const handleForgotPassword = () => {
    toast.info('Contact admin at malwatrolley@gmail.com for password reset.', {
      icon: <AlertCircle className="text-blue-500" />,
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-dark-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-6">
          <img
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhUspgoCiiYzdVTGXzZ_eGuIJ4DFg467VMmQwkaQgCwek_y_BYYegfR67o1gk2bXxPaWd6VhJoR-7npqySIzyK8IV7EY67YDAgviRmXwOA5FzauC4kmjeqe4C-y9Du6u5aOsZiPvRBv0xnoKb6Pi5KGlDs3KxoeyMT5oQYY5ffMBD9s412M4KrDevShgOw/s320/logo.png"
            alt="Malwa CRM Logo"
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-4 text-2xl font-bold text-brand-dark dark:text-dark-text">
            Malwa CRM Login
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Sign in to access your dashboard
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red bg-transparent dark:text-dark-text dark:border-gray-600 transition-all"
                placeholder="your@email.com"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red bg-transparent dark:text-dark-text dark:border-gray-600 transition-all"
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          {(error || authError) && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error || authError}
              </p>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full py-2.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Login
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleForgotPassword}
              className="text-sm"
            >
              Forgot Password?
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Malwa Trolley CRM © 2025 • Version 2.0
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
