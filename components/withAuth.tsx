import { useRouter } from 'next/router';
import { useEffect, useState, ComponentType } from 'react';

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const validateToken = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No token found in localStorage');
            router.push('/admin/login');
            return;
          }

          const apiUrl = 'https://app-back-gc64.onrender.com';
          console.log('Validating token with:', `${apiUrl}/api/auth/validate`);
          
          const res = await fetch(`${apiUrl}/api/auth/validate`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Origin': 'https://wearenewstalgia.com'
            },
            credentials: 'include'
          });

          console.log('Validation response status:', res.status);
          const data = await res.json();
          console.log('Validation response data:', data);

          if (!res.ok || !data.valid) {
            console.error('Token validation failed:', {
              status: res.status,
              statusText: res.statusText,
              data
            });
            localStorage.removeItem('token');
            router.push('/admin/login');
            return;
          }

          console.log('Token validation successful:', data);
          setAuthorized(true);
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('token');
          router.push('/admin/login');
        } finally {
          setIsLoading(false);
        }
      };

      validateToken();
    }, [router]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!authorized) {
      return null; // This will trigger the redirect in useEffect
    }

    return <WrappedComponent {...props} />;
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