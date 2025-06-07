import { useState } from 'react';
import { useRouter } from 'next/router';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Call your NestJS API for login
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Login failed' }));
        console.error('Login error:', errorData);
        console.error('Response status:', res.status);
        console.error('Response headers:', Object.fromEntries(res.headers.entries()));
        throw new Error(errorData.message || `Login failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log('Login successful:', data);
      
      // Redirect to the admin dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      console.error('Login error details:', err);
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white border rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 mb-4 w-full rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 w-full rounded hover:bg-blue-600">
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;