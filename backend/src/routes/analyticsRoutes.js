import express from 'express';
import { getUserPatterns, refreshUserPatterns } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/patterns', getUserPatterns);
router.post('/refresh', refreshUserPatterns);

export default router;
