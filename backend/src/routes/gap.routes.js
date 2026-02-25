import express from 'express';
import {
  analyzeGap,
  getReports,
  getReportById,
  deleteReport
} from '../controllers/gap.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All gap routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/gap/analyze:
 *   post:
 *     summary: Trigger gap analysis for an area
 *     tags: [Gap Analysis]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [areaId]
 *             properties:
 *               areaId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Gap analysis report generated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - insufficient role
 *       404:
 *         description: Area not found
 */
router.post('/analyze', authorize('admin', 'planner'), analyzeGap);

/**
 * @swagger
 * /api/gap/reports:
 *   get:
 *     summary: Get all gap reports
 *     tags: [Gap Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *       - in: query
 *         name: areaId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of gap reports
 */
router.get('/reports', getReports);

/**
 * @swagger
 * /api/gap/reports/{id}:
 *   get:
 *     summary: Get a single gap report by ID
 *     tags: [Gap Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Gap report details
 *       404:
 *         description: Report not found
 */
router.get('/reports/:id', getReportById);

/**
 * @swagger
 * /api/gap/reports/{id}:
 *   delete:
 *     summary: Delete a gap report
 *     tags: [Gap Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Report not found
 */
router.delete('/reports/:id', authorize('admin'), deleteReport);

export default router;