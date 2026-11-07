import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/search', requireAuth, messageController.search);
router.get('/:conversationId', requireAuth, messageController.list);
router.post('/', requireAuth, messageController.create);
router.patch('/:id', requireAuth, messageController.edit);
router.delete('/:id', requireAuth, messageController.delete);
router.post('/:id/reactions', requireAuth, messageController.react);
router.post('/:conversationId/read', requireAuth, messageController.read);
export default router;
