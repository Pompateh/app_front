import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Token found in localStorage, redirecting to dashboard');
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const apiUrl = 'https://app-back-gc64.onrender.com';
      console.log('Attempting login to:', `${apiUrl}/api/auth/login`);
      
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://wearenewstalgia.com'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      console.log('Response status:', res.status);
      console.log('Response headers:', Object.fromEntries(res.headers.entries()));

      const data = await res.json();
      console.log('Response data:', data);

      if (!res.ok) {
        console.error('Login error response:', {
          status: res.status,
          statusText: res.statusText,
          data
        });
        throw new Error(data.message?.message || data.message || `Login failed with status ${res.status}`);
      }

      // Store the token in localStorage
      const token = data.token || data.accessToken;
      if (token) {
        console.log('Token received:', token);
        localStorage.setItem('token', token);
        console.log('Token stored in localStorage');
        
        // Add a small delay before redirect to ensure token is stored
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          router.push('/admin/dashboard');
        }, 100);
      } else {
        console.error('No token in response:', data);
        throw new Error('No token received from server');
      }
    } catch (err: any) {
      console.error('Login error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white border rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
          required
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
          required
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className={`bg-blue-500 text-white py-2 px-4 w-full rounded hover:bg-blue-600 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;