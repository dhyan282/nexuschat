import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
router.get('/stats', requireAuth, requireAdmin, adminController.stats);
router.get('/users', requireAuth, requireAdmin, adminController.users);
router.patch('/users/:id/suspend', requireAuth, requireAdmin, adminController.suspend);
router.patch('/users/:id/activate', requireAuth, requireAdmin, adminController.activate);
router.delete('/users/:id', requireAuth, requireAdmin, adminController.delete);
export default router;
