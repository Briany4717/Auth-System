import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
  authLimiter,
  passwordResetLimiter,
  mfaLimiter,
} from '../middlewares/rateLimiter.middleware';
import {
  registerValidation,
  loginValidation,
  resetPasswordValidation,
  emailValidation,
  totpValidation,
} from '../utils/validators';

const router = Router();

// Public routes with rate limiting
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/verify-email', authController.verifyEmail);
router.post(
  '/forgot-password',
  passwordResetLimiter,
  emailValidation,
  authController.forgotPassword
);
router.post(
  '/reset-password',
  passwordResetLimiter,
  resetPasswordValidation,
  authController.resetPassword
);

// Protected routes for MFA
router.post('/mfa/enable', authenticate, authController.enableMfa);
router.post(
  '/mfa/verify',
  authenticate,
  mfaLimiter,
  totpValidation,
  authController.verifyMfa
);
router.post('/mfa/disable', authenticate, mfaLimiter, authController.disableMfa);

export default router;
