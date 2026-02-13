import express from 'express';
import { getUsers, approveUser, getPendingUsers } from '../controllers/user.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getUsers);
router.get('/pending', protect, authorize('admin'), getPendingUsers);
router.put('/:id/approve', protect, authorize('admin'), approveUser);

export default router;
