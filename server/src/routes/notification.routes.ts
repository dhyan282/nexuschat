import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/', requireAuth, notificationController.list);
router.get('/unread-count', requireAuth, notificationController.unreadCount);
router.patch('/:id/read', requireAuth, notificationController.read);
router.post('/read-all', requireAuth, notificationController.readAll);
router.delete('/:id', requireAuth, notificationController.delete);
export default router;
