import rateLimit from 'express-rate-limit';

// Rate limiter for authentication endpoints: 20 requests per 15 minutes window
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: 'Too many authentication attempts. Please try again in a few minutes.'
  },
  skip: (req) => process.env.NODE_ENV === 'test' // Skip in test mode for automated test suites
});

// General API rate limiter: 300 requests per 15 minutes window
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please slow down.'
  },
  skip: (req) => process.env.NODE_ENV === 'test'
});
