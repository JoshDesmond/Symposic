import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { getAllUsers } from '../database';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async getUsers(req: Request, res: Response): Promise<void> {
    console.info(`API Route called, getting users`);
    try {
      const result = await getAllUsers();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: `Error: ${error}` });
    }
  }

  async sendCode(req: Request, res: Response): Promise<void> {
    const { phone } = req.body;
    
    if (!phone) {
      res.status(400).json({ error: 'Phone number required' });
      return;
    }
    
    try {
      const code = await this.authService.storeOTP(phone);
      console.log(`Sending code ${code} to ${phone}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send code' });
    }
  }

  async verifyCode(req: Request, res: Response): Promise<void> {
    const { phone, code } = req.body;
    
    if (!phone || !code) {
      res.status(400).json({ error: 'Phone and code required' });
      return;
    }
    
    console.log(`Verifying code ${code} for ${phone}`);
    
    try {
      const valid = await this.authService.verifyOTP(phone, code);
      
      if (!valid) {
        res.status(422).json({ error: 'Invalid or expired code' });
        return;
      }
      
      const token = await this.authService.createSession(phone);
      res.json({ token });
    } catch (error) {
      console.log(`Database lookup error: ${error}`);
      res.status(500).json({ error: 'Failed to verify code' });
    }
  }
}
