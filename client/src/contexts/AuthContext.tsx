import { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: Checking authentication state');
      
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const cookieEmail = getCookie('user_email');
      const cookieOrgId = getCookie('organization_id');
      
      if (cookieEmail) {
        localStorage.setItem(STORAGE_KEYS.USER_EMAIL, cookieEmail);
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, cookieEmail);
      }
      
      if (cookieOrgId) {
        localStorage.setItem(STORAGE_KEYS.ORGANIZATION_ID, cookieOrgId);
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_ORG_ID, cookieOrgId);
      }
      
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verifying auth:', error);
        setIsAuthenticated(false);
      }
      
      const storedOrgId = localStorage.getItem(STORAGE_KEYS.REMEMBERED_ORG_ID);
      const storedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
      
      console.log('AuthContext: Final auth state check:', { 
        isAuthenticated,
        hasRememberedOrgId: !!storedOrgId,
        hasRememberedEmail: !!storedEmail 
      });
      
      setRememberedOrganizationId(storedOrgId);
      setRememberedEmail(storedEmail);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

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
      
      const response = await fetch('/api/ssoready-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ samlAccessCode }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('SSO callback error response:', data);
        throw new Error(data.details || data.error || 'Failed to process SSO callback');
      }

      console.log('SSO callback successful response:', data);
      
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, data.email);
      localStorage.setItem(STORAGE_KEYS.ORGANIZATION_ID, data.organizationExternalId);
      
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
      console.error('Error handling SSO callback:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem(STORAGE_KEYS.USER_EMAIL);
    localStorage.removeItem(STORAGE_KEYS.ORGANIZATION_ID);
    
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
