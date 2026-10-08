import express from 'express';
import {
  createSession,
  getSessions,
  getSessionById,
  submitAnswers,
  toggleActionItem,
  resolveSession,
  abandonSession,
  deleteSession,
  createSessionSchema,
  submitAnswersSchema,
  resolveSessionSchema,
  rediagnoseSession,
  rediagnoseSessionSchema,
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// All session routes require authentication
router.use(protect);

router.route('/')
  .post(aiLimiter, validate(createSessionSchema), createSession)
  .get(getSessions);

router.route('/:id')
  .get(getSessionById)
  .delete(deleteSession);

router.post('/:id/answers', aiLimiter, validate(submitAnswersSchema), submitAnswers);
router.patch('/:id/actions/:actionIndex', toggleActionItem);
router.post('/:id/resolve', validate(resolveSessionSchema), resolveSession);
router.post('/:id/rediagnose', aiLimiter, validate(rediagnoseSessionSchema), rediagnoseSession);
router.patch('/:id/abandon', abandonSession);

export default router;
