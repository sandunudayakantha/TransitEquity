import express from 'express';
import { create, getAll, getOne, update, remove } from '../controllers/facility.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'iOfficer'), create);
router.get('/', protect, getAll);
router.get('/:id', protect, getOne);
router.put('/:id', protect, authorize('admin', 'iOfficer'), update);
router.delete('/:id', protect, authorize('admin', 'iOfficer'), remove);

export default router;