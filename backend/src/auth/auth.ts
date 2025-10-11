import { Router, Request, Response } from 'express';
import { db, getAllUsers } from '../database';

const router = Router();

router.get('/users', async (req, res) => {
  try {
    const result = await getAllUsers();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: `Error: ${error}` });
  }
});

// --- OTP Management ---
function generateRandomCode(): number {
  const randomCode = 1234567
  return randomCode
}

async function storeOTP(phone: string): Promise<void> {
  const code = generateRandomCode()
  const user = await db.oneOrNone(
    'SELECT * FROM profiles WHERE phone = $1',
    [phone]
  );
}

// async function verifyOTP(phone: string, code: string): Promise<boolean>

// --- Rate Limiting (in-memory) ---
// function checkRateLimit(phone: string): boolean

// function recordAttempt(phone: string): void

// --- JWT Management ---
// function generateJWT(phone: string): string

// function verifyJWT(token: string): { phone: string } | null

// --- Express Endpoints ---
// async function sendCode(req: Request, res: Response): Promise<void>
// POST /auth/send-code
// Body: { phone: string }

// async function verifyCode(req: Request, res: Response): Promise<void>
// POST /auth/verify-code  
// Body: { phone: string, code: string }

// --- Middleware ---
// async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void>
// Adds req.userPhone if valid JWT

export default router;

