import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

class TotpService {
  /**
   * Generate a TOTP secret for a user
   */
  generateSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Generate a QR code URL for the user to scan with an authenticator app
   */
  async generateQRCode(email: string, secret: string): Promise<string> {
    const otpauth = authenticator.keyuri(email, 'Identity Provider', secret);
    return QRCode.toDataURL(otpauth);
  }

  /**
   * Verify a TOTP code
   */
  verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate backup codes for account recovery
   */
  generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  /**
   * Hash backup codes for secure storage
   */
  hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }
}

export default new TotpService();
