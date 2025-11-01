import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';
import { Role } from '@prisma/client';

export interface TokenPayload {
  userId: string;
  email: string;
  roles: Role[];
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Generate JWT Access Token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.access_secret, {
    expiresIn: config.jwt.access_expiry,
    issuer: config.app_name,
    audience: 'access',
  } as jwt.SignOptions);
};

/**
 * Generate JWT Refresh Token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, config.jwt.refresh_secret, {
    expiresIn: config.jwt.refresh_expiry,
    issuer: config.app_name,
    audience: 'refresh',
  } as jwt.SignOptions);
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): DecodedToken => {
  try {
    return jwt.verify(token, config.jwt.access_secret, {
      issuer: config.app_name,
      audience: 'access',
    }) as DecodedToken;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): DecodedToken => {
  try {
    return jwt.verify(token, config.jwt.refresh_secret, {
      issuer: config.app_name,
      audience: 'refresh',
    }) as DecodedToken;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Hash token for storage (prevents token theft if DB is compromised)
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
