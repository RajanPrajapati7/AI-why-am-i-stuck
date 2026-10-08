import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updateSettings,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  updateSettingsSchema,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.put('/settings', protect, validate(updateSettingsSchema), updateSettings);

export default router;
