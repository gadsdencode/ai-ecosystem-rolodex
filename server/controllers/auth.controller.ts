import { Request, Response } from "express";
import { SSOReadyClient } from 'ssoready';
import { signToken, verifyToken, AUTH_COOKIE_OPTIONS, AUTH_COOKIE_NAME } from "../lib/jwt";
import { log } from "../lib/logger";

// Initialize SSOReady client
const ssoreadyOptions: any = {
  apiKey: process.env.SSOREADY_API_KEY
};

const ssoready = new SSOReadyClient(ssoreadyOptions);

/**
 * POST /api/saml/initiate - Initiate SAML login
 */
export async function initiateSaml(req: Request, res: Response) {
  try {
    const { organizationExternalId, email } = req.body;
    
    if (!organizationExternalId) {
      return res.status(400).json({ error: 'Organization external ID is required' });
    }
    
    const options: any = { organizationExternalId };
    if (email) {
      options.loginHint = email;
    }
    
    const { redirectUrl } = await ssoready.saml.getSamlRedirectUrl(options);
    
    if (!redirectUrl) {
      return res.status(500).json({ error: 'No redirect URL returned from SSOReady' });
    }
    
    res.json({ redirectUrl });
  } catch (error) {
    log.error('Error initiating SAML login', error as Error);
    res.status(500).json({ error: 'Failed to initiate SAML login' });
  }
}

/**
 * POST /api/ssoready-callback - Handle SSO callback (API endpoint)
 */
export async function handleSsoCallbackPost(req: Request, res: Response) {
  try {
    const { samlAccessCode } = req.body;
    
    if (!samlAccessCode) {
      return res.status(400).json({ error: 'SAML access code is required' });
    }
    
    log.debug('Attempting to redeem SAML access code', { codePrefix: samlAccessCode.substring(0, 10) });
    
    try {
      const result = await ssoready.saml.redeemSamlAccessCode({
        samlAccessCode
      });
      
      log.info('SSOReady redemption successful', { email: result.email });
      
      if (!result || !result.email || !result.organizationExternalId) {
        log.error('Invalid SAML response data - missing required fields');
        return res.status(401).json({ error: 'Invalid SAML response: missing required fields' });
      }
      
      // Create a signed JWT containing user information
      const authToken = signToken({
        email: result.email,
        organizationId: result.organizationExternalId
      });
      
      // Set single httpOnly JWT cookie - no PII in separate cookies
      res.cookie(AUTH_COOKIE_NAME, authToken, AUTH_COOKIE_OPTIONS);

      log.info('Setting JWT auth cookie for user', { email: result.email });
      
      // Return user information and token
      res.json({
        email: result.email,
        organizationExternalId: result.organizationExternalId,
        token: authToken
      });
    } catch (samlError: any) {
      log.error('SSOReady SAML redemption error', samlError);
      return res.status(500).json({ error: 'SAML redemption failed' });
    }
  } catch (error: any) {
    log.error('Error processing SSO callback', error);
    res.status(500).json({ error: 'Failed to process SSO callback' });
  }
}

/**
 * GET /api/ssoready-callback - Handle direct SSO callback from browser redirect
 */
export async function handleSsoCallbackGet(req: Request, res: Response) {
  log.info('Received direct SAML callback via GET request');
  
  const samlAccessCode = req.query.saml_access_code || req.query.code;
  
  if (!samlAccessCode) {
    log.error('No SAML access code found in query parameters');
    return res.redirect('/login?error=missing_code');
  }
  
  try {
    const result = await ssoready.saml.redeemSamlAccessCode({
      samlAccessCode: samlAccessCode.toString()
    });
    
    log.info('Successfully redeemed SAML code on server', { email: result.email });
    
    if (!result || !result.email || !result.organizationExternalId) {
      log.error('Invalid SAML response data');
      return res.redirect('/login?error=invalid_response');
    }
    
    // Create a signed JWT containing user information
    const authToken = signToken({
      email: result.email,
      organizationId: result.organizationExternalId
    });
    
    // Set single httpOnly JWT cookie
    res.cookie(AUTH_COOKIE_NAME, authToken, AUTH_COOKIE_OPTIONS);

    log.info('Setting JWT auth cookie for user', { email: result.email });
    
    return res.redirect('/admin');
  } catch (error: any) {
    log.error('Error processing direct SAML callback', error);
    return res.redirect('/login?error=auth_failed');
  }
}

/**
 * GET /api/auth/me - Get current user info from JWT
 */
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const token = req.cookies[AUTH_COOKIE_NAME];
    
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const payload = verifyToken(token);
    
    if (!payload) {
      res.clearCookie(AUTH_COOKIE_NAME);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.json({
      email: payload.email,
      organizationId: payload.organizationId
    });
  } catch (error) {
    log.error('Error fetching user info', error as Error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
}

/**
 * POST /api/auth/logout - Logout user by clearing auth cookie
 */
export async function logout(req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME);
  res.json({ success: true });
}

/**
 * POST /api/resolve-domain - Resolve email domain to organization ID
 */
export async function resolveDomain(req: Request, res: Response) {
  try {
    const { email, domain } = req.body;
    
    if (!email || !domain) {
      return res.status(400).json({ error: 'Email and domain are required' });
    }
    
    // In a real implementation, you would look up the domain in your database
    // For this demo, we'll just return K01
    const organizationId = 'K01';
    
    res.json({ organizationId });
  } catch (error) {
    log.error('Error resolving domain', error as Error);
    res.status(500).json({ error: 'Failed to resolve domain to organization' });
  }
}

