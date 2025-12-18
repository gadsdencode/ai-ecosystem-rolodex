import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
      console.error('Error fetching user info:', error);
      return null;
    }
  }, []);

  // Check if the user is already authenticated and load remembered organization ID and email
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: Checking authentication state');
      
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
      
      console.log('AuthContext: Final auth state check:', { 
        isAuthenticated: !!userInfo,
        hasRememberedOrgId: !!storedOrgId,
        hasRememberedEmail: !!storedEmail 
      });
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [fetchUserInfo]);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const data = await response.json();
        console.error('Login failed:', data.message);
        return false;
      }
      
      // Refresh user info after successful login
      const userInfo = await fetchUserInfo();
      if (userInfo) {
        setUser(userInfo);
      }
      
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const loginWithSSO = async (organizationId: string, email?: string): Promise<void> => {
    try {
      localStorage.setItem(STORAGE_KEYS.REMEMBERED_ORG_ID, organizationId);
      setRememberedOrganizationId(organizationId);
      
      if (email) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
        setRememberedEmail(email);
      }
      
      const response = await fetch('/api/saml/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          organizationExternalId: organizationId,
          email: email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate SAML login');
      }

      const data = await response.json();
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
      console.error('SSO callback error:', error);
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
      console.error('Logout error:', error);
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
