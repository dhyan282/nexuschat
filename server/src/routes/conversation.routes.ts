import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();
router.get('/', requireAuth, conversationController.list);
router.post('/', requireAuth, conversationController.create);
router.get('/:id', requireAuth, conversationController.get);
router.patch('/:id', requireAuth, conversationController.update);
router.delete('/:id', requireAuth, conversationController.delete);
router.post('/:id/members', requireAuth, conversationController.addMember);
router.delete('/:id/members/:userId', requireAuth, conversationController.removeMember);
export default router;
