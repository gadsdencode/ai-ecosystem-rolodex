import { createContext, useContext, useState, useEffect } from 'react';
import { initiateSAMLLogin } from '../lib/sso';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithSSO: (organizationId: string, email?: string) => Promise<void>;
  handleSSOCallback: (samlAccessCode: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  rememberedOrganizationId: string | null;
  rememberedEmail: string | null;
}

const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_EMAIL: 'user_email',
  ORGANIZATION_ID: 'organization_id',
  REMEMBERED_ORG_ID: 'remembered_org_id',
  REMEMBERED_EMAIL: 'remembered_email'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rememberedOrganizationId, setRememberedOrganizationId] = useState<string | null>(null);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);

  // Check if the user is already authenticated and load remembered organization ID and email
  useEffect(() => {
    const checkAuth = () => {
      // Check for auth token in localStorage (regular login)
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      
      // Check for cookies that would be set by the server-side SAML callback
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const cookieToken = getCookie('auth_token');
      const cookieEmail = getCookie('user_email');
      const cookieOrgId = getCookie('organization_id');
      
      // Check if we have server-side SSO cookies and transfer to localStorage for consistency
      if (cookieToken) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, cookieToken);
        
        if (cookieEmail) {
          localStorage.setItem(STORAGE_KEYS.USER_EMAIL, cookieEmail);
          localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, cookieEmail);
        }
        
        if (cookieOrgId) {
          localStorage.setItem(STORAGE_KEYS.ORGANIZATION_ID, cookieOrgId);
          localStorage.setItem(STORAGE_KEYS.REMEMBERED_ORG_ID, cookieOrgId);
        }
        
        // Clear cookies after transferring data to localStorage
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'organization_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
      
      // Get stored values from localStorage (they may have just been set from cookies)
      const storedToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const storedOrgId = localStorage.getItem(STORAGE_KEYS.REMEMBERED_ORG_ID);
      const storedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
      
      setIsAuthenticated(!!storedToken);
      setRememberedOrganizationId(storedOrgId);
      setRememberedEmail(storedEmail);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real application, you would make an API call to authenticate the user
    // For this demo, we'll use hardcoded credentials
    if (username === 'admin' && password === 'abc123') {
      // Store token in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'demo_token_12345');
      setIsAuthenticated(true);
      return true;
    }
    
    return false;
  };

  const loginWithSSO = async (organizationId: string, email?: string): Promise<void> => {
    try {
      // Remember the organization ID for future logins
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_ORG_ID, organizationId);
      setRememberedOrganizationId(organizationId);
      
      // Also remember the email if provided
      if (email) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
        setRememberedEmail(email);
      }
      
      // Get the redirect URL from our backend proxy
      const response = await fetch('/api/saml/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          organizationExternalId: organizationId,
          email: email // Include email in the request if available
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate SAML login');
      }

      const data = await response.json();
      
      // Redirect the user to the identity provider
      window.location.href = data.redirectUrl;
    } catch (error) {
      console.error('Error initiating SSO login:', error);
      throw error;
    }
  };

  const handleSSOCallback = async (samlAccessCode: string): Promise<boolean> => {
    try {
      console.log('Handling SSO callback with access code:', samlAccessCode.substring(0, 10) + '...');
      
      // Call our backend API to handle the SSO callback
      const response = await fetch('/api/ssoready-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ samlAccessCode }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('SSO callback error response:', data);
        throw new Error(data.details || data.error || 'Failed to process SSO callback');
      }

      console.log('SSO callback successful response:', data);
      
      // Store authentication token and user data
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, data.email);
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION_ID, data.organizationExternalId);
      
      // Make sure we're storing the organization ID for future logins
      if (data.organizationExternalId) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_ORG_ID, data.organizationExternalId);
        setRememberedOrganizationId(data.organizationExternalId);
      }
      
      // Also store the email for future logins
      if (data.email) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, data.email);
        setRememberedEmail(data.email);
      }
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Error handling SSO callback:', error);
      return false;
    }
  };

  const logout = () => {
    // Remove auth data from localStorage
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATION_ID);
    // We intentionally keep REMEMBERED_ORG_ID and REMEMBERED_EMAIL for next login
    
    setIsAuthenticated(false);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    login,
    loginWithSSO,
    handleSSOCallback,
    logout,
    isLoading,
    rememberedOrganizationId,
    rememberedEmail
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