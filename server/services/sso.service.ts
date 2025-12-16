import { SSOReadyClient } from 'ssoready';
import { generateToken } from '../middleware/auth';

interface SSOReadyOptions {
  apiKey?: string;
}

const ssoreadyOptions: SSOReadyOptions = {
  apiKey: process.env.SSOREADY_API_KEY
};

const ssoready = new SSOReadyClient(ssoreadyOptions);

export interface SAMLInitiateOptions {
  organizationExternalId: string;
  loginHint?: string;
}

export interface SAMLInitiateResult {
  redirectUrl: string;
}

export interface SAMLRedeemResult {
  email: string;
  organizationExternalId: string;
  token: string;
}

export async function initiateSAMLLogin(options: SAMLInitiateOptions): Promise<SAMLInitiateResult> {
  const samlOptions: { organizationExternalId: string; loginHint?: string } = { 
    organizationExternalId: options.organizationExternalId 
  };
  
  if (options.loginHint) {
    samlOptions.loginHint = options.loginHint;
  }
  
  const { redirectUrl } = await ssoready.saml.getSamlRedirectUrl(samlOptions);
  
  if (!redirectUrl) {
    throw new Error('No redirect URL returned from SSOReady');
  }
  
  return { redirectUrl };
}

export async function redeemSAMLAccessCode(samlAccessCode: string): Promise<SAMLRedeemResult> {
  console.log('Attempting to redeem SAML access code:', samlAccessCode.substring(0, 10) + '...');
  
  const result = await ssoready.saml.redeemSamlAccessCode({
    samlAccessCode
  });
  
  console.log('SSOReady redemption result:', result);
  
  if (!result || !result.email || !result.organizationExternalId) {
    console.error('Invalid SAML response data:', result);
    throw new Error('Invalid SAML response: missing required fields');
  }
  
  const authToken = generateToken({
    userId: 0,
    username: result.email,
    email: result.email,
    organizationId: result.organizationExternalId
  });
  
  return {
    email: result.email,
    organizationExternalId: result.organizationExternalId,
    token: authToken
  };
}

export async function resolveDomainToOrganization(email: string, domain: string): Promise<string> {
  console.log(`Resolving domain ${domain} for email ${email}`);
  return 'K01';
}
