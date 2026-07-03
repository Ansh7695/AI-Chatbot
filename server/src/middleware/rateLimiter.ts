import rateLimit from 'express-rate-limit';

// Rate limiter for AI routes (summarize and search)
export const aiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: {
      message: 'Too many requests to AI services. Please try again after 15 minutes.',
      status: 429,
    },
  },
});
