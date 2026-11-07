import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();
const registerSchema = z.object({ body: z.object({ name: z.string().min(2), username: z.string().min(3), email: z.string().email(), password: z.string().min(6), phone: z.string().optional(), avatar: z.string().optional() }) });
const loginSchema = z.object({ body: z.object({ identifier: z.string(), password: z.string() }) });

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', requireAuth, authController.logoutAll);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
