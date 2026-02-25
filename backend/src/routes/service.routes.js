
import express from 'express';
import { createServiceStatus, getAllServices, getActiveServices, getDelayedServices, updateServiceStatus, deleteServiceStatus } from '../controllers/service.controller.js';
const router = express.Router();


router.post('/', createServiceStatus);
router.get('/', getAllServices);
router.get('/active', getActiveServices);
router.get('/delayed', getDelayedServices);
router.put('/:id', updateServiceStatus);
router.delete('/:id', deleteServiceStatus);

export default router;
