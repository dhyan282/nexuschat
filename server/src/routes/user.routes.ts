import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/me', requireAuth, userController.me);
router.patch('/me', requireAuth, userController.updateMe);
router.get('/search', requireAuth, userController.search);
router.get('/:id', requireAuth, userController.get);
router.post('/:id/block', requireAuth, userController.block);
router.delete('/:id/block', requireAuth, userController.unblock);
router.get('/me/blocked', requireAuth, userController.blocked);
export default router;
