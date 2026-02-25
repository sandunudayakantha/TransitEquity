import express from 'express';
import {
  createFeedback,
  getAllFeedback,
  getFeedbackById,
  updateFeedback,
  voteFeedback,
  deleteFeedback
} from '../controllers/feedback.controller.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       required:
 *         - areaId
 *         - issueType
 *         - description
 *         - coordinates
 *         - urgency
 *       properties:
 *         areaId:
 *           type: string
 *         issueType:
 *           type: string
 *           enum: [New Route, New Bus Stop, Increase Frequency, Accessibility]
 *         description:
 *           type: string
 *         coordinates:
 *           type: object
 *           properties:
 *             lat:
 *               type: number
 *             lng:
 *               type: number
 *         urgency:
 *           type: string
 *           enum: [Low, Medium, High]
 *         votes:
 *           type: number
 *         priorityScore:
 *           type: number
 *         status:
 *           type: string
 *           enum: [Pending, Reviewed, Approved, Resolved]
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Submit new feedback (public)
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Feedback'
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Validation error
 */
router.post('/', createFeedback);

/**
 * @swagger
 * /api/feedback:
 *   get:
 *     summary: Get all feedback with optional filters
 *     tags: [Feedback]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, Reviewed, Approved, Resolved]
 *       - in: query
 *         name: urgency
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High]
 *       - in: query
 *         name: areaId
 *         schema:
 *           type: string
 *       - in: query
 *         name: issueType
 *         schema:
 *           type: string
 *           enum: [New Route, New Bus Stop, Increase Frequency, Accessibility]
 *     responses:
 *       200:
 *         description: List of feedback sorted by priority
 */
router.get('/', getAllFeedback);

/**
 * @swagger
 * /api/feedback/{id}:
 *   get:
 *     summary: Get single feedback by ID
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback details
 *       404:
 *         description: Feedback not found
 */
router.get('/:id', getFeedbackById);

/**
 * @swagger
 * /api/feedback/{id}/vote:
 *   put:
 *     summary: Upvote feedback (public)
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vote recorded, priorityScore updated
 *       404:
 *         description: Feedback not found
 */
router.put('/:id/vote', voteFeedback);

/**
 * @swagger
 * /api/feedback/{id}:
 *   put:
 *     summary: Update feedback (admin/officer only)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Reviewed, Approved, Resolved]
 *     responses:
 *       200:
 *         description: Feedback updated
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - insufficient role
 *       404:
 *         description: Feedback not found
 */
router.put('/:id', protect, authorize('admin', 'officer'), updateFeedback);

/**
 * @swagger
 * /api/feedback/{id}:
 *   delete:
 *     summary: Delete feedback (admin only)
 *     tags: [Feedback]
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
 *         description: Feedback deleted
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - admin only
 *       404:
 *         description: Feedback not found
 */
router.delete('/:id', protect, authorize('admin'), deleteFeedback);

export default router;