import express from 'express';
import { createServiceStatus, getAllServices, getActiveServices, getDelayedServices, updateServiceStatus, deleteServiceStatus } from '../controllers/service.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'tOfficer'), createServiceStatus);
router.get('/', protect, getAllServices);
router.get('/active', protect, getActiveServices);
router.get('/delayed', protect, getDelayedServices);
router.put('/:id', protect, authorize('admin', 'tOfficer'), updateServiceStatus);
router.delete('/:id', protect, authorize('admin', 'tOfficer'), deleteServiceStatus);

export default router;
