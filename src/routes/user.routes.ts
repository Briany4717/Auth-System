import { Router } from 'express';
import userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { isAdmin } from '../middlewares/roleCheck.middleware';

const router = Router();

// Protected routes
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.delete('/account', authenticate, userController.deleteAccount);

// Admin only routes
router.get('/', authenticate, isAdmin, userController.getAllUsers);

export default router;
