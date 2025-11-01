import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/**
 * Rate limiter for authentication endpoints (login, register)
 */
export const authLimiter = rateLimit({
  windowMs: config.security.rate_limit_window_ms, // 15 minutes by default
  max: config.security.rate_limit_max_requests, // 5 requests per window by default
  message: 'Too many attempts from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (_req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the maximum number of requests. Please try again later.',
      retryAfter: Math.ceil(config.security.rate_limit_window_ms / 1000 / 60), // minutes
    });
  },
});

/**
 * Stricter rate limiter for password reset endpoints
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many password reset attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * Rate limiter for MFA verification
 */
export const mfaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  message: 'Too many MFA verification attempts',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});
