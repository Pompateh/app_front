import { useRouter } from 'next/router';
import { useEffect, useState, ComponentType } from 'react';
import { supabase } from '../lib/supabaseClient';

export function withAuth<P extends object>(WrappedComponent: ComponentType<P>) {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
              setAuthorized(true);
        } else {
          router.replace('/admin/login');
          }
        setIsLoading(false);
      };

      checkSession();

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setAuthorized(false);
          router.replace('/admin/login');
        } else if (event === 'SIGNED_IN') {
          setAuthorized(true);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }, [router]);

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