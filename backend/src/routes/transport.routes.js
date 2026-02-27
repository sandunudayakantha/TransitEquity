import express from 'express';
import { createTransport, getAllTransports, getTransportById, updateTransport, deleteTransport } from '../controllers/transport.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'tOfficer'), createTransport);
router.get('/', protect, getAllTransports);
router.get('/:id', protect, getTransportById);
router.put('/:id', protect, authorize('admin', 'tOfficer'), updateTransport);
router.delete('/:id', protect, authorize('admin', 'tOfficer'), deleteTransport);

export default router;
