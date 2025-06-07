import { useRouter } from 'next/router';
import { useEffect, useState, ComponentType } from 'react';

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      const validateToken = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://app-back-gc64.onrender.com';
          console.log('Validating token with:', `${apiUrl}/api/auth/validate`);
          
          const res = await fetch(`${apiUrl}/api/auth/validate`, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json'
            }
          });

          console.log('Validation response status:', res.status);
          const data = await res.json();
          console.log('Validation response data:', data);

          if (!res.ok) {
            console.error('Token validation failed:', {
              status: res.status,
              statusText: res.statusText,
              data
            });
            router.push('/admin/login');
            return;
          }

          setAuthorized(true);
        } catch (error) {
          console.error('Token validation error:', error);
          router.push('/admin/login');
        }
      };

      validateToken();
    }, [router]);

    if (!authorized) {
      return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
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