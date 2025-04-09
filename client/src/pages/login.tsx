import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, User, Globe, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [showSSOForm, setShowSSOForm] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitiatingSSO, setIsInitiatingSSO] = useState(false);
  const { login, loginWithSSO, rememberedOrganizationId, rememberedEmail } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Set the organization ID and email if we have remembered values
  useEffect(() => {
    if (rememberedOrganizationId) {
      setOrganizationId(rememberedOrganizationId);
      // Pre-select the SSO form since we have a remembered organization
      setShowSSOForm(true);
    }
    
    if (rememberedEmail) {
      setUserEmail(rememberedEmail);
    }
  }, [rememberedOrganizationId, rememberedEmail]);

  // Auto-initiate SSO if we have both remembered org ID and email
  useEffect(() => {
    // If we have both remembered values and the page has just loaded, we could auto-initiate
    // Uncomment this section to enable auto-login
    /*
    if (rememberedOrganizationId && rememberedEmail && showSSOForm) {
      const timer = setTimeout(() => {
        loginWithSSO(rememberedOrganizationId, rememberedEmail)
          .catch(error => {
            toast({
              title: "Auto SSO Error",
              description: "Automatic SSO login failed. Please try manually.",
              variant: "destructive",
            });
          });
      }, 1000);
      return () => clearTimeout(timer);
    }
    */
  }, [rememberedOrganizationId, rememberedEmail, showSSOForm, loginWithSSO]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Input Required",
        description: "Please enter both username and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoggingIn(true);
    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the admin dashboard",
        });
        setLocation('/admin');
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid username or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleOrgSSOLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationId) {
      toast({
        title: "Organization ID Required",
        description: "Please enter your organization ID",
        variant: "destructive",
      });
      return;
    }
    
    setIsInitiatingSSO(true);
    try {
      await loginWithSSO(organizationId, userEmail || undefined);
      // Note: No success handling here as the user will be redirected to the identity provider
    } catch (error) {
      toast({
        title: "SSO Error",
        description: "Failed to initiate SSO login. Please try again.",
        variant: "destructive",
      });
      setIsInitiatingSSO(false);
    }
  };

  const handleEmailSSOLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userEmail || !userEmail.includes('@')) {
      toast({
        title: "Valid Email Required",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsInitiatingSSO(true);
    try {
      // Extract the domain part of the email to identify the organization
      const emailDomain = userEmail.split('@')[1];
      
      // If we have a remembered organization ID, use that
      let resolvedOrgId = rememberedOrganizationId;
      
      if (!resolvedOrgId) {
        // Call our backend to resolve the domain to an organization ID
        const response = await fetch('/api/resolve-domain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain: emailDomain, email: userEmail })
        });
        
        if (!response.ok) {
          throw new Error('Failed to resolve email domain to organization');
        }
        
        const data = await response.json();
        resolvedOrgId = data.organizationId;
        
        if (!resolvedOrgId) {
          throw new Error('No organization found for this email domain');
        }
      }
      
      // Now use the resolved org ID to initiate SSO, passing the email
      await loginWithSSO(resolvedOrgId, userEmail);
    } catch (error) {
      toast({
        title: "SSO Error",
        description: error instanceof Error ? error.message : "Failed to initiate SSO login. Please try again.",
        variant: "destructive",
      });
      setIsInitiatingSSO(false);
    }
  };

  const toggleSSOForm = () => {
    setShowSSOForm(!showSSOForm);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {showSSOForm ? "Enterprise SSO Login" : "Admin Login"}
          </CardTitle>
          <CardDescription className="text-center">
            {showSSOForm 
              ? "Sign in with your organization's identity provider" 
              : "Enter your credentials to access the admin dashboard"}
          </CardDescription>
        </CardHeader>
        
        {showSSOForm ? (
          <form onSubmit={handleEmailSSOLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userEmail">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="Enter your work email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                {rememberedEmail && (
                  <p className="text-xs text-gray-500">
                    Using your previously saved email. You can change it if needed.
                  </p>
                )}
                {!rememberedEmail && (
                  <p className="text-xs text-gray-500">
                    We'll use your email domain to identify your organization
                  </p>
                )}
              </div>
              
              {rememberedOrganizationId && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-700">
                    Using your saved organization settings. If this isn't correct, you can also:
                  </p>
                  <Button 
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-blue-700 font-medium"
                    onClick={() => {
                      const orgForm = document.getElementById('orgIdForm');
                      if (orgForm) {
                        orgForm.style.display = orgForm.style.display === 'none' ? 'block' : 'none';
                      }
                    }}
                  >
                    Enter Organization ID manually
                  </Button>
                </div>
              )}
              
              <div id="orgIdForm" style={{ display: 'none' }}>
                <Label htmlFor="organizationId">Organization ID (manual entry)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="organizationId"
                    placeholder="Enter your organization ID"
                    value={organizationId}
                    onChange={(e) => setOrganizationId(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isInitiatingSSO}
              >
                {isInitiatingSSO ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Initiating SSO...
                  </>
                ) : (
                  'Continue with SSO'
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={toggleSSOForm}
              >
                Back to Username/Password
              </Button>
            </CardFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    autoComplete="username"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    autoComplete="current-password"
                  />
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
              
              <div className="relative w-full py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={toggleSSOForm}
              >
                Continue with Enterprise SSO
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setLocation('/')}
              >
                Back to Public Site
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}