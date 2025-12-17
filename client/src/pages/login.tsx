import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, User, Globe, Mail, Sparkles, ArrowLeft, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '../contexts/ThemeContext';
import { motion } from 'framer-motion';

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
  const { theme } = useTheme();

  // Set the organization ID and email if we have remembered values
  useEffect(() => {
    if (rememberedOrganizationId) {
      setOrganizationId(rememberedOrganizationId);
      setShowSSOForm(true);
    }
    
    if (rememberedEmail) {
      setUserEmail(rememberedEmail);
    }
  }, [rememberedOrganizationId, rememberedEmail]);

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
        window.location.href = '/admin';
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
      const emailDomain = userEmail.split('@')[1];
      let resolvedOrgId = rememberedOrganizationId;
      
      if (!resolvedOrgId) {
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
    <div className={`flex items-center justify-center min-h-screen px-4 transition-colors duration-300 ${
      theme === 'light'
        ? 'bg-gradient-to-br from-slate-50 via-white to-primary-50'
        : 'bg-gradient-to-br from-slate-950 via-slate-900 to-primary-950'
    }`}>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card variant="glass" className="backdrop-blur-xl border-white/20 dark:border-white/10">
          <CardHeader className="space-y-1 text-center pb-2">
            {/* Logo */}
            <motion.div 
              className="flex justify-center mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <div className="relative">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-brand">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-500 blur-xl opacity-50" />
              </div>
            </motion.div>

            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent">
              {showSSOForm ? "Enterprise SSO" : "Admin Login"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {showSSOForm 
                ? "Sign in with your organization's identity provider" 
                : "Enter your credentials to access the dashboard"}
            </CardDescription>
          </CardHeader>
          
          {showSSOForm ? (
            <form onSubmit={handleEmailSSOLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userEmail" className="text-foreground">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="userEmail"
                      type="email"
                      placeholder="Enter your work email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary-500/50 focus:ring-primary-500/20"
                      autoComplete="email"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {rememberedEmail 
                      ? "Using your previously saved email. You can change it if needed."
                      : "We'll use your email domain to identify your organization"}
                  </p>
                </div>
                
                {rememberedOrganizationId && (
                  <motion.div 
                    className="p-3 bg-primary-500/10 border border-primary-500/20 rounded-lg"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <p className="text-sm text-primary-600 dark:text-primary-400">
                      Using your saved organization settings.
                    </p>
                    <Button 
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm text-primary-600 dark:text-primary-400 font-medium"
                      onClick={() => {
                        const orgForm = document.getElementById('orgIdForm');
                        if (orgForm) {
                          orgForm.style.display = orgForm.style.display === 'none' ? 'block' : 'none';
                        }
                      }}
                    >
                      Enter Organization ID manually →
                    </Button>
                  </motion.div>
                )}
                
                <div id="orgIdForm" style={{ display: 'none' }} className="space-y-2">
                  <Label htmlFor="organizationId">Organization ID (manual entry)</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="organizationId"
                      placeholder="Enter your organization ID"
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50"
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  variant="brand"
                  className="w-full"
                  disabled={isInitiatingSSO}
                >
                  {isInitiatingSSO ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Initiating SSO...
                    </>
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Continue with SSO
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={toggleSSOForm}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Username/Password
                </Button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary-500/50 focus:ring-primary-500/20"
                      autoComplete="username"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50 focus:border-primary-500/50 focus:ring-primary-500/20"
                      autoComplete="current-password"
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  variant="brand"
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
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className={`px-2 text-muted-foreground ${
                      theme === 'light' ? 'bg-white/80' : 'bg-slate-900/80'
                    }`}>Or</span>
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="brand-outline" 
                  className="w-full"
                  onClick={toggleSSOForm}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Continue with Enterprise SSO
                </Button>
                
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => setLocation('/')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Public Site
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>

        {/* Branding footer */}
        <motion.p 
          className="text-center mt-6 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="font-mono tracking-tight">OVERTURE SYSTEMS</span> · AI Ecosystem Rolodex
        </motion.p>
      </motion.div>
    </div>
  );
}
