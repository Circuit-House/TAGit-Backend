import express from 'express';
import { login, getMe, refreshToken } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/refresh', refreshToken);

export default router;
