import { Router } from 'express';
import { fileController } from '../controllers/file.controller';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
router.post('/upload', requireAuth, upload.array('files', 10), fileController.upload);
router.delete('/:id', requireAuth, fileController.delete);
export default router;
