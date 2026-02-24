import express from 'express';
import {
    createArea,
    getAllAreas,
    getAreaById,
    updateArea,
    deleteArea
} from '../controllers/area.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), createArea);
router.get('/', protect, getAllAreas);
router.get('/:id', protect, getAreaById);
router.put('/:id', protect, authorize('admin'), updateArea);
router.delete('/:id', protect, authorize('admin'), deleteArea);

export default router;
