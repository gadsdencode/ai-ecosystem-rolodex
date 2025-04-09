import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [checkingCookies, setCheckingCookies] = useState(true);

  // First, check for auth cookies directly
  useEffect(() => {
    const checkAuthCookies = () => {
      // Check if we have auth cookies (for direct SSO redirects)
      const hasCookies = document.cookie.includes('auth_token=');
      
      console.log('Checking auth cookies directly in ProtectedRoute:', { 
        hasCookies, 
        isAuthenticated, 
        isLoading 
      });
      
      // If no cookies and not authenticated and not loading, redirect to login
      if (!hasCookies && !isAuthenticated && !isLoading) {
        console.log('No auth cookies or localStorage auth, redirecting to login');
        setLocation('/login');
      }
      
      setCheckingCookies(false);
    };
    
    // Short delay to allow AuthContext to initialize and process cookies
    const timerId = setTimeout(checkAuthCookies, 300);
    return () => clearTimeout(timerId);
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading while checking auth state
  if (isLoading || checkingCookies) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 text-apple-blue animate-spin" />
      </div>
    );
  }

  // Only render children if authenticated
  return isAuthenticated ? <>{children}</> : null;
}