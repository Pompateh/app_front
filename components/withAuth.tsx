import { useRouter } from 'next/router';
import { useEffect, useState, ComponentType } from 'react';

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
      const checkAuthorization = async () => {
        try {
          // Check if we're on the client side
          if (typeof window === 'undefined') {
            return;
          }

          // Validate the token with an API call
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/validate`, {
            credentials: 'include', // This ensures cookies are sent with the request
          });

          if (!response.ok) {
            router.push('/admin/login');
            return;
          }

          setAuthorized(true);
        } catch (error) {
          console.error('Authorization check failed:', error);
          router.push('/admin/login');
        }
      };

      checkAuthorization();
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