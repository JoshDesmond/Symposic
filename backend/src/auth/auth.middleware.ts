import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

const authService = new AuthService();

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  
  const token = authHeader.substring(7);
  const session = await authService.verifySession(token);
  
  if (!session) {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
  
  (req as any).userPhone = session.phone;
  next();
}
