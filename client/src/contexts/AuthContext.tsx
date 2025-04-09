import { createContext, useContext, useState, useEffect } from 'react';
import { initiateSAMLLogin } from '../lib/sso';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithSSO: (organizationId: string) => Promise<void>;
  handleSSOCallback: (samlAccessCode: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if the user is already authenticated (e.g., from localStorage)
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real application, you would make an API call to authenticate the user
    // For this demo, we'll use hardcoded credentials
    if (username === 'admin' && password === 'abc123') {
      // Store token in localStorage
      localStorage.setItem('auth_token', 'demo_token_12345');
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  const loginWithSSO = async (organizationId: string): Promise<void> => {
    try {
      // Get the redirect URL from SSOReady
      const redirectUrl = await initiateSAMLLogin(organizationId);
      
      // Redirect the user to the identity provider
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('Error initiating SSO login:', error);
      throw error;
    }
  };

  const handleSSOCallback = async (samlAccessCode: string): Promise<boolean> => {
    try {
      // Call our backend API to handle the SSO callback
      const response = await fetch('/api/ssoready-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ samlAccessCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to process SSO callback');
      }

      const data = await response.json();
      
      // Store authentication token
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_email', data.email);
      localStorage.setItem('organization_id', data.organizationExternalId);
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error handling SSO callback:', error);
      return false;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('organization_id');
    setIsAuthenticated(false);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    login,
    loginWithSSO,
    handleSSOCallback,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}