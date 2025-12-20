import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for AI/Gemini endpoints
 * 5 requests per minute per IP
 */
export const xaiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    error: 'Too many AI requests. Please wait a moment before trying again.',
    retryAfter: 60
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Default keyGenerator uses IP address with proper IPv6 handling
});

/**
 * General API rate limiter
 * 100 requests per minute per IP
 */
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'Too many requests. Please slow down.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting for certain paths if needed
  skip: (req) => {
    // Skip rate limiting for static assets and health checks
    return req.path.startsWith('/assets') || req.path === '/health';
  }
  // Default keyGenerator uses IP address with proper IPv6 handling
});

/**
 * Auth endpoint rate limiter (stricter to prevent brute force)
 * 10 requests per minute per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    error: 'Too many authentication attempts. Please wait before trying again.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Default keyGenerator uses IP address with proper IPv6 handling
});
