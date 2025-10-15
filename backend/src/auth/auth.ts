import { Router, Request, Response, NextFunction } from 'express';
import { db, getAllUsers } from '../database';
import crypto from 'crypto';

const router = Router();

router.get('/users', async (req, res) => {
  console.info(`API Route called, getting users`)
  try {
    const result = await getAllUsers();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: `Error: ${error}` });
  }
});

// --- OTP Management ---
function generateRandomCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function storeOTP(phone: string): Promise<string> {
  const code = generateRandomCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  await db.none(
    'INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1, $2, $3) ON CONFLICT (phone) DO UPDATE SET code = $2, expires_at = $3',
    [phone, code, expiresAt]
  );
  
  return code;
}

async function verifyOTP(phone: string, code: string): Promise<boolean> {
  const result = await db.oneOrNone(
    'SELECT * FROM otp_codes WHERE phone = $1 AND code = $2 AND expires_at > NOW()',
    [phone, code]
  );
  
  if (result) {
    await db.none('DELETE FROM otp_codes WHERE phone = $1', [phone]);
    return true;
  }
  
  return false;
}

// --- Session Management ---
async function createSession(phone: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await db.none(
    'INSERT INTO sessions (session_token, phone, expires_at) VALUES ($1, $2, $3)',
    [token, phone, expiresAt]
  );
  
  return token;
}

async function verifySession(token: string): Promise<{ phone: string } | null> {
  const result = await db.oneOrNone(
    'SELECT phone FROM sessions WHERE session_token = $1 AND expires_at > NOW()',
    [token]
  );
  
  return result;
}

// --- Express Endpoints ---
router.post('/send-code', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body;
  
  if (!phone) {
    res.status(400).json({ error: 'Phone number required' });
    return;
  }
  
  try {
    const code = await storeOTP(phone);
    console.log(`Sending code ${code} to ${phone}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send code' });
  }
});

router.post('/verify-code', async (req: Request, res: Response): Promise<void> => {
  const { phone, code } = req.body;
  
  if (!phone || !code) {
    res.status(400).json({ error: 'Phone and code required' });
    return;
  }
  
  try {
    const valid = await verifyOTP(phone, code);
    
    if (!valid) {
      res.status(401).json({ error: 'Invalid or expired code' });
      return;
    }
    
    const token = await createSession(phone);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// --- Middleware ---
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  const token = authHeader.substring(7);
  const session = await verifySession(token);
  
  if (!session) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  
  (req as any).userPhone = session.phone;
  next();
}

export default router;

