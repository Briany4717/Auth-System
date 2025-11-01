import prisma from '../config/database';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  generateSecureToken,
  verifyRefreshToken,
} from '../utils/jwt.strategy';
import { hashPassword, comparePassword } from '../utils/password.utils';
import emailService from './email.service';
import totpService from './totp.service';
import { User } from '@prisma/client';

interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginInput {
  email: string;
  password: string;
  totpCode?: string;
}

interface AuthResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken?: string;
  requiresMfa?: boolean;
  tempToken?: string;
}

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<{ user: Partial<User>; message: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Generate email verification token
    const verificationToken = generateSecureToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
      },
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, verificationToken);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        resource: 'USER',
        success: true,
      },
    });

    return {
      user: this.sanitizeUser(user),
      message: 'Registration successful. Please check your email to verify your account.',
    };
  }

  /**
   * Login user
   */
  async login(
    data: LoginInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      throw new Error('Account has been deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(data.password, user.password);
    if (!isPasswordValid) {
      // Log failed attempt
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_FAILED',
          resource: 'AUTH',
          ipAddress,
          userAgent,
          success: false,
        },
      });
      throw new Error('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in');
    }

    // Check if MFA is enabled
    if (user.isMfaEnabled) {
      if (!data.totpCode) {
        // Generate temporary token for MFA step
        const tempToken = generateSecureToken();
        return {
          user: this.sanitizeUser(user),
          accessToken: '',
          requiresMfa: true,
          tempToken,
        };
      }

      // Verify TOTP code
      const isValidTotp = totpService.verifyToken(data.totpCode, user.mfaSecret!);
      if (!isValidTotp) {
        throw new Error('Invalid MFA code');
      }
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    // Store hashed refresh token
    const hashedRefreshToken = hashToken(refreshToken);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        hashedToken: hashedRefreshToken,
        userId: user.id,
        expiresAt: refreshExpiry,
        deviceInfo: userAgent,
        ipAddress,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        resource: 'AUTH',
        ipAddress,
        userAgent,
        success: true,
      },
    });

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }

    // Check if token exists in database
    const hashedToken = hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { hashedToken },
    });

    if (!storedToken || storedToken.isRevoked) {
      throw new Error('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new Error('Refresh token has expired');
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      roles: user.roles,
    });

    return { accessToken };
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    const hashedToken = hashToken(refreshToken);
    
    await prisma.refreshToken.updateMany({
      where: { hashedToken },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    });
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    // Generate reset token
    const resetToken = generateSecureToken();
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpiry: resetExpiry,
      },
    });

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true, revokedAt: new Date() },
    });

    return { message: 'Password reset successfully' };
  }

  /**
   * Enable MFA
   */
  async enableMfa(userId: string): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isMfaEnabled) {
      throw new Error('MFA is already enabled');
    }

    // Generate TOTP secret
    const secret = totpService.generateSecret();
    const qrCode = await totpService.generateQRCode(user.email, secret);
    const backupCodes = totpService.generateBackupCodes();

    // Hash backup codes before storing
    const hashedBackupCodes = backupCodes.map(code => totpService.hashBackupCode(code));

    // Store secret (not activated yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaSecret: secret,
        mfaBackupCodes: hashedBackupCodes,
      },
    });

    return { secret, qrCode, backupCodes };
  }

  /**
   * Verify and activate MFA
   */
  async verifyMfa(userId: string, totpCode: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.mfaSecret) {
      throw new Error('MFA setup not initiated');
    }

    const isValid = totpService.verifyToken(totpCode, user.mfaSecret);
    if (!isValid) {
      throw new Error('Invalid MFA code');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isMfaEnabled: true },
    });

    return { message: 'MFA enabled successfully' };
  }

  /**
   * Disable MFA
   */
  async disableMfa(userId: string, totpCode: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isMfaEnabled) {
      throw new Error('MFA is not enabled');
    }

    const isValid = totpService.verifyToken(totpCode, user.mfaSecret!);
    if (!isValid) {
      throw new Error('Invalid MFA code');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isMfaEnabled: false,
        mfaSecret: null,
        mfaBackupCodes: [],
      },
    });

    return { message: 'MFA disabled successfully' };
  }

  /**
   * Sanitize user data (remove sensitive fields)
   */
  private sanitizeUser(user: User): Partial<User> {
    const { password, mfaSecret, emailVerificationToken, passwordResetToken, ...sanitized } = user;
    return sanitized;
  }
}

export default new AuthService();
