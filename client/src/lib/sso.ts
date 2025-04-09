import { SSOReadyClient } from 'ssoready';

// NOTE: We no longer need to create a client-side SSOReady instance
// because we're proxying all requests through our backend
// The SSOReady client is still imported for type definitions

// Initiate a SAML login by getting a redirect URL through our backend proxy
export async function initiateSAMLLogin(organizationExternalId: string): Promise<string> {
  try {
    const response = await fetch('/api/saml/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ organizationExternalId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initiate SAML login');
    }

    const data = await response.json();
    
    if (!data.redirectUrl) {
      throw new Error('No redirect URL returned from server');
    }
    
    return data.redirectUrl;
  } catch (error) {
    console.error('Error initiating SAML login:', error);
    throw error;
  }
}

// The callback handling is already properly implemented through our backend
export async function handleSAMLCallback(samlAccessCode: string): Promise<{ 
  email: string; 
  organizationExternalId: string;
}> {
  try {
    const response = await fetch('/api/ssoready-callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ samlAccessCode }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process SAML callback');
    }

    const data = await response.json();
    
    if (!data.email || !data.organizationExternalId) {
      throw new Error('Invalid response from server: missing email or organizationExternalId');
    }
    
    return {
      email: data.email,
      organizationExternalId: data.organizationExternalId
    };
  } catch (error) {
    console.error('Error handling SAML callback:', error);
    throw error;
  }
} 