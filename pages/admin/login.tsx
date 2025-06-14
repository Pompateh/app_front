import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Memoized function to validate token
  const validateToken = useCallback(async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app-back-gc64.onrender.com';
      const res = await fetch(`${apiUrl}/api/auth/validate`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Token validation failed');
      }

      const data = await res.json();
      return data.valid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }, []);

  // Memoized function to handle redirect
  const handleRedirect = useCallback(async () => {
    if (redirectAttempted) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      const isValid = await validateToken(token);
      if (isValid) {
        setRedirectAttempted(true);
        console.log('Token is valid, redirecting to dashboard');
        // Use window.location for a hard redirect
        window.location.href = '/admin/dashboard';
      } else {
        console.log('Token is invalid, removing from localStorage');
        localStorage.removeItem('token');
        setIsCheckingAuth(false);
      }
    } catch (error) {
      console.error('Redirect error:', error);
      localStorage.removeItem('token');
      setIsCheckingAuth(false);
    }
  }, [validateToken, redirectAttempted]);

  // Effect to check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      // Only check auth if we're on the login page and haven't attempted redirect
      if (window.location.pathname !== '/admin/login' || redirectAttempted) {
        setIsCheckingAuth(false);
        return;
      }

      await handleRedirect();
    };

    checkAuth();
  }, [handleRedirect, redirectAttempted]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    console.log('Login form submitted');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app-back-gc64.onrender.com';
      const loginUrl = `${apiUrl}/api/auth/login`;
      
      console.log('Attempting login to:', loginUrl);
      
      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
        credentials: 'include',
      });

      const data = await res.json();
      console.log('Login response:', res.status, data);

      if (!res.ok) {
        if (data.message && Array.isArray(data.message)) {
          throw new Error(data.message.join(', '));
        }
        throw new Error(data.message || `Login failed: ${res.status}`);
      }

      if (data.token) {
        console.log('Token received, storing in localStorage');
        localStorage.setItem('token', data.token);
        
        toast.success('Login successful');
        
        // Use window.location for a hard redirect
        console.log('Redirecting to dashboard...');
        setRedirectAttempted(true);
        window.location.href = '/admin/dashboard';
      } else {
        console.error('No token in response');
        throw new Error('No token received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin} noValidate>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;