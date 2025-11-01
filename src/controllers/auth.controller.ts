import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import authService from '../services/auth.service';
import { config } from '../config/env';

class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, firstName, lastName } = req.body;

      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        res.status(409).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, totpCode } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(
        { email, password, totpCode },
        ipAddress,
        userAgent
      );

      // If MFA is required, return without setting refresh token cookie
      if (result.requiresMfa) {
        res.status(200).json({
          requiresMfa: true,
          tempToken: result.tempToken,
          message: 'MFA code required',
        });
        return;
      }

      // Set refresh token in HTTP-only cookie
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          secure: config.cookie.secure, // true in production
          sameSite: config.cookie.same_site,
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          domain: config.cookie.domain,
        });
      }

      res.status(200).json({
        user: result.user,
        accessToken: result.accessToken,
        message: 'Login successful',
      });
    } catch (error: any) {
      if (
        error.message === 'Invalid credentials' ||
        error.message === 'Account has been deactivated' ||
        error.message === 'Please verify your email before logging in' ||
        error.message === 'Invalid MFA code'
      ) {
        res.status(401).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * Refresh access token
   */
  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token not found' });
        return;
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.status(200).json(result);
    } catch (error: any) {
      if (
        error.message === 'Invalid refresh token' ||
        error.message === 'Refresh token has been revoked' ||
        error.message === 'Refresh token has expired'
      ) {
        // Clear invalid cookie
        res.clearCookie('refreshToken');
        res.status(401).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.status(400).json({ error: 'Verification token is required' });
        return;
      }

      const result = await authService.verifyEmail(token);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Invalid or expired verification token') {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { token, password } = req.body;
      const result = await authService.resetPassword(token, password);
      
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Invalid or expired reset token') {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * Enable MFA
   */
  async enableMfa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const result = await authService.enableMfa(req.user.userId);
      
      res.status(200).json({
        qrCode: result.qrCode,
        secret: result.secret,
        backupCodes: result.backupCodes,
        message: 'Scan the QR code with your authenticator app and verify with a code',
      });
    } catch (error: any) {
      if (error.message === 'MFA is already enabled') {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * Verify and activate MFA
   */
  async verifyMfa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { code } = req.body;
      const result = await authService.verifyMfa(req.user.userId, code);
      
      res.status(200).json(result);
    } catch (error: any) {
      if (
        error.message === 'MFA setup not initiated' ||
        error.message === 'Invalid MFA code'
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  /**
   * Disable MFA
   */
  async disableMfa(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      const { code } = req.body;
      
      if (!code) {
        res.status(400).json({ error: 'MFA code is required' });
        return;
      }

      const result = await authService.disableMfa(req.user.userId, code);
      
      res.status(200).json(result);
    } catch (error: any) {
      if (
        error.message === 'MFA is not enabled' ||
        error.message === 'Invalid MFA code'
      ) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}

export default new AuthController();
