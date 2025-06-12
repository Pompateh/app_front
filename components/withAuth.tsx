import { useRouter } from 'next/router';
import { useEffect, useState, ComponentType } from 'react';
import { toast } from 'react-toastify';

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const validateToken = async () => {
        try {
          console.log('Validating token...');
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No token found in localStorage');
            toast.error('Please login to access this page');
            window.location.href = '/admin/login';
            return;
          }

          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app-back-gc64.onrender.com';
          console.log('Validating token with API:', `${apiUrl}/api/auth/validate`);
          
          const res = await fetch(`${apiUrl}/api/auth/validate`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include'
          });

          console.log('Token validation response:', res.status);

          if (!res.ok) {
            if (res.status === 401) {
              console.log('Token expired, attempting refresh...');
              // Try to refresh token
              const refreshRes = await fetch(`${apiUrl}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
              });

              if (!refreshRes.ok) {
                throw new Error('Session expired');
              }

              const refreshData = await refreshRes.json();
              console.log('Token refreshed successfully');
              localStorage.setItem('token', refreshData.accessToken);
              setAuthorized(true);
              return;
            }
            throw new Error('Token validation failed');
          }

          const data = await res.json();
          if (!data.valid) {
            throw new Error('Invalid token');
          }

          console.log('Token validation successful');
          setAuthorized(true);
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('token');
          toast.error('Session expired. Please login again.');
          window.location.href = '/admin/login';
        } finally {
          setIsLoading(false);
        }
      };

      // Only validate if we're not on the login page
      if (router.pathname !== '/admin/login') {
        validateToken();
      } else {
        setIsLoading(false);
      }
    }, [router.pathname]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    return authorized ? <WrappedComponent {...props} /> : null;
  };

  return Wrapper;
}

// Example token validation function (replace with your API logic)
async function validateToken(token: string): Promise<boolean> {
  // Simulate an API call to validate the token
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true); // Replace with actual validation logic
    }, 500);
  });
}