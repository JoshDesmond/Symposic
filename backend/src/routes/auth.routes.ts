import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Auth routes
router.post('/send-code', authController.sendCode.bind(authController));
router.post('/verify-code', authController.verifyCode.bind(authController));

// User routes
router.get('/users', requireAuth, authController.getUsers.bind(authController));

export default router;
