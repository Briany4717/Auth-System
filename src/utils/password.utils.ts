import bcrypt from 'bcrypt';
import { config } from '../config/env';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.security.bcrypt_rounds);
};

/**
 * Compare a plain text password with a hashed password
 */
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Generate a secure random token
 */
export const generateSecureToken = (): string => {
  return require('crypto').randomBytes(32).toString('hex');
};
