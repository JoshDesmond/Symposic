import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies.authToken;
  
  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  const session = await authService.verifySession(token);
  
  if (!session) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  
  (req as any).userPhone = session.phone;
  next();
}
