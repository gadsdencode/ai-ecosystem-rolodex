import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function SSOCallback() {
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { handleSSOCallback } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Log the full URL for debugging
        const fullUrl = window.location.href;
        const searchString = window.location.search;
        const hashString = window.location.hash;
        
        console.log('SSO callback URL:', fullUrl);
        console.log('Search params:', searchString);
        console.log('Hash fragment:', hashString);
        
        // Debug information
        setDebugInfo(`Full URL: ${fullUrl}\nSearch params: ${searchString}\nHash: ${hashString}`);
        
        // Extract the code from the URL query parameters
        const searchParams = new URLSearchParams(window.location.search);
        
        // Get all URL parameters for debugging
        const allParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          allParams[key] = value;
        });
        console.log('All URL parameters:', allParams);
        setDebugInfo(prev => `${prev}\n\nAll URL parameters: ${JSON.stringify(allParams, null, 2)}`);
        
        // Try different possible parameter names
        let samlAccessCode = searchParams.get('code') || 
                             searchParams.get('saml_access_code') || 
                             searchParams.get('samlAccessCode') ||
                             searchParams.get('access_token') ||
                             searchParams.get('accessToken');
        
        // Also check for code in the hash fragment
        if (!samlAccessCode && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          
          // Get all hash parameters for debugging
          const allHashParams: Record<string, string> = {};
          hashParams.forEach((value, key) => {
            allHashParams[key] = value;
          });
          console.log('All hash parameters:', allHashParams);
          setDebugInfo(prev => `${prev}\n\nAll hash parameters: ${JSON.stringify(allHashParams, null, 2)}`);
          
          samlAccessCode = hashParams.get('code') || 
                           hashParams.get('saml_access_code') || 
                           hashParams.get('samlAccessCode') ||
                           hashParams.get('access_token') ||
                           hashParams.get('accessToken');
        }
        
        if (!samlAccessCode) {
          console.error('No SAML access code found in URL');
          setError('No SAML access code found in the callback URL');
          
          // Add more info to debug output
          setDebugInfo(prev => `${prev}\n\nNo SAML access code found in URL parameters or hash fragment`);
          return;
        }
        
        console.log('Found SAML access code:', samlAccessCode.substring(0, 10) + '...');
        setDebugInfo(prev => `${prev}\n\nFound SAML access code: ${samlAccessCode.substring(0, 10)}...`);
        
        // Handle the SSO callback
        const success = await handleSSOCallback(samlAccessCode);
        
        if (success) {
          // Redirect to the admin dashboard on successful login
          setLocation('/admin');
        } else {
          setError('Failed to authenticate with SSO');
          setDebugInfo(prev => `${prev}\n\nSSO authentication failed - see console for details`);
        }
      } catch (error) {
        console.error('Error processing SSO callback:', error);
        setError(`An error occurred while processing the SSO callback: ${error instanceof Error ? error.message : String(error)}`);
      }
    };
    
    processCallback();
  }, [handleSSOCallback, setLocation]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {error ? (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          
          {debugInfo && (
            <div className="mb-6 text-left bg-gray-100 p-4 rounded overflow-auto max-h-40 text-xs">
              <h3 className="font-bold mb-2">Debug Information:</h3>
              <pre>{debugInfo}</pre>
            </div>
          )}
          
          <button
            className="px-4 py-2 bg-apple-blue text-white rounded-lg font-medium hover:bg-blue-600"
            onClick={() => setLocation('/login')}
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <Loader2 className="h-12 w-12 text-apple-blue animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Processing SSO Login...</h2>
          <p className="text-gray-500 mt-2">Please wait while we authenticate you</p>
        </div>
      )}
    </div>
  );
} 