import { Router, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { requireAuth } from './auth.middleware';
import { getAllUsers } from '../database';

const router = Router();
const authService = new AuthService();

// Auth routes
router.post('/send-code', async (req: Request, res: Response): Promise<void> => {
  const { phone } = req.body;
  
  if (!phone) {
    res.status(400).json({ error: 'Phone number required' });
    return;
  }
  
  try {
    const code = await authService.storeOTP(phone);
    console.log(`Sending code ${code} to ${phone}`);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send code' });
  }
});

router.post('/verify-code', async (req: Request, res: Response): Promise<void> => {
  const { phone, code } = req.body;
  
  if (!phone || !code) {
    console.error(`Error: /verify-code called with missing phone (${phone}) or code (${code})`);
    res.status(400).json({ error: 'Phone and code required' });
    return;
  }
  
  console.log(`Verifying code ${code} for ${phone}`);
  
  try {
    const valid = await authService.verifyOTP(phone, code);
    
    if (!valid) {
      res.status(422).json({ error: 'Invalid or expired code' });
      return;
    }
    
    const token = await authService.createSession(phone);
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.json({ success: true });
  } catch (error) {
    console.log(`Database lookup error: ${error}`);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// User routes
router.get('/users', requireAuth, async (req: Request, res: Response): Promise<void> => {
  console.info(`API Route called, getting users`);
  try {
    const result = await getAllUsers();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: `Error: ${error}` });
  }
});

export default router;
