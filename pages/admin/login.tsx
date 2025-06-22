import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { supabase } from '../../lib/supabaseClient';

const Login = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace('/admin/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);

    // Supabase uses email for login, so we'll treat the 'username' field as email.
    const { error } = await supabase.auth.signInWithPassword({
      email: username,
      password: password,
      });

    if (error) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } else {
        toast.success('Login successful');
      router.replace('/admin/dashboard');
    }

    setIsLoading(false);
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
            </label>
              <div className="mt-1">
            <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
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
                  autoComplete="current-password"
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