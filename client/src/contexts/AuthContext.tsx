import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initiateSAMLLogin } from '../lib/sso';

interface UserInfo {
  email: string;
  organizationId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserInfo | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithSSO: (organizationId: string, email?: string) => Promise<void>;
  handleSSOCallback: (samlAccessCode: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  rememberedOrganizationId: string | null;
  rememberedEmail: string | null;
}

const STORAGE_KEYS = {
  REMEMBERED_ORG_ID: 'remembered_org_id',
  REMEMBERED_EMAIL: 'remembered_email',
  // Legacy keys for migration - will be removed after reading
  LEGACY_AUTH_TOKEN: 'auth_token',
  LEGACY_USER_EMAIL: 'user_email',
  LEGACY_ORGANIZATION_ID: 'organization_id'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rememberedOrganizationId, setRememberedOrganizationId] = useState<string | null>(null);
  const [rememberedEmail, setRememberedEmail] = useState<string | null>(null);

  // Fetch user info from the server (validates JWT cookie server-side)
  const fetchUserInfo = useCallback(async (): Promise<UserInfo | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include' // Include cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        return data as UserInfo;
      }
      return null;
    } catch (error) {
      return null;
    }
  }, []);

  // Check if the user is already authenticated and load remembered organization ID and email
  useEffect(() => {
    const checkAuth = async () => {
      // Clean up legacy localStorage keys (migration from old cookie-based auth)
      localStorage.removeItem(STORAGE_KEYS.LEGACY_AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_USER_EMAIL);
      localStorage.removeItem(STORAGE_KEYS.LEGACY_ORGANIZATION_ID);
      
      // Load remembered values for convenience
      const storedOrgId = localStorage.getItem(STORAGE_KEYS.REMEMBERED_ORG_ID);
      const storedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
      
      setRememberedOrganizationId(storedOrgId);
      setRememberedEmail(storedEmail);
      
      // Check authentication by calling the server (JWT is in httpOnly cookie)
      const userInfo = await fetchUserInfo();
      
      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
        
        // Update remembered values from authenticated user
        if (userInfo.email) {
          localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, userInfo.email);
          setRememberedEmail(userInfo.email);
        }
        if (userInfo.organizationId) {
          localStorage.setItem(STORAGE_KEYS.REMEMBERED_ORG_ID, userInfo.organizationId);
          setRememberedOrganizationId(userInfo.organizationId);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [fetchUserInfo]);

  const login = async (username: string, password: string): Promise<boolean> => {
    // In a real application, you would make an API call to authenticate the user
    // For this demo, we'll use hardcoded credentials
    if (username === 'admin' && password === 'abc123') {
      // Set demo user info (in production, this would come from the server)
      setUser({ email: 'admin@demo.local', organizationId: 'demo' });
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
      // Call our backend API to handle the SSO callback
      // The server will set an httpOnly JWT cookie
      const response = await fetch('/api/ssoready-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify({ samlAccessCode }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process SSO callback');
      }
      
      // Set user info from response
      setUser({
        email: data.email,
        organizationId: data.organizationExternalId
      });
      
      // Remember org ID and email for future logins
      if (data.organizationExternalId) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_ORG_ID, data.organizationExternalId);
        setRememberedOrganizationId(data.organizationExternalId);
      }
      
      if (data.email) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, data.email);
        setRememberedEmail(data.email);
      }
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    // Call server to clear the httpOnly cookie
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      // Continue with local logout even if server call fails
    }
    
    // We intentionally keep REMEMBERED_ORG_ID and REMEMBERED_EMAIL for next login
    setUser(null);
    setIsAuthenticated(false);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
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