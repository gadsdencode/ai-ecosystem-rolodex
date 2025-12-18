import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';

// JWT payload interface
export interface AuthTokenPayload {
  email: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}

// Get JWT secret from environment or use a default for development
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  return secret || 'dev-jwt-secret-change-in-production';
};

// Token expiration time (24 hours)
const TOKEN_EXPIRATION = '24h';

/**
 * Sign a JWT token with user data
 */
export function signToken(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
  const options: SignOptions = {
    expiresIn: TOKEN_EXPIRATION,
  };
  
  return jwt.sign(payload, getJwtSecret(), options);
}

/**
 * Verify and decode a JWT token
 * Returns the decoded payload or null if invalid
 */
export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthTokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Decode a JWT token without verification (for client-side use)
 * The payload is base64 encoded and publicly readable
 * Only use this when you just need to read the payload - verification happens server-side
 */
export function decodeToken(token: string): AuthTokenPayload | null {
  try {
    const decoded = jwt.decode(token) as AuthTokenPayload | null;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Cookie configuration for the auth token
 */
export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,  // Prevent XSS attacks - JS cannot read this cookie
  secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
  maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  path: '/',
  sameSite: 'lax' as const
};

export const AUTH_COOKIE_NAME = 'auth_token';

