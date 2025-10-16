import crypto from 'crypto';
import { db } from '../database';

export class AuthService {
  // --- OTP Management ---
  private generateRandomCode(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }

  async storeOTP(phone: string): Promise<number> {
    const code = this.generateRandomCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await db.none(
      'INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (phone) DO UPDATE SET code = $2, expires_at = $3',
      [phone, code, expiresAt]
    );
    
    return code;
  }

  async verifyOTP(phone: string, code: number): Promise<boolean> {
    console.log(`Performing DB Lookup`);

    const result = await db.oneOrNone(
      'SELECT * FROM otp_codes WHERE phone = $1 AND code = $2 AND expires_at > NOW()',
      [phone, code]
    );
    
    console.log(`Database OTP lookup result: ${JSON.stringify(result)}`);
    
    if (result) {
      await db.none('DELETE FROM otp_codes WHERE phone = $1', [phone]);
      return true;
    }
    
    return false;
  }

  // --- Session Management ---
  async createSession(phone: string): Promise<string> {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    await db.none(
      'INSERT INTO sessions (session_token, phone, expires_at) VALUES ($1, $2, $3)',
      [token, phone, expiresAt]
    );
    
    return token;
  }

  async verifySession(token: string): Promise<{ phone: string } | null> {
    const result = await db.oneOrNone(
      'SELECT phone FROM sessions WHERE session_token = $1 AND expires_at > NOW()',
      [token]
    );
    
    return result;
  }
}
