import * as feedbackService from '../services/feedback.Service.js';
import { validateFeedback } from '../utils/feedbackValidation.js';

export const createFeedback = async (req, res, next) => {
  try {
    console.log('Received feedback request:', req.body);
    
    const validation = validateFeedback(req.body);
    if (!validation.isValid) {
      console.log('Validation failed:', validation.message);
      return res.status(400).json({ 
        success: false, 
        message: validation.message 
      });
    }

    const feedback = await feedbackService.createFeedback(req.body);
    
    // Customize message based on whether address was used
    const message = req.body.address && !req.body.coordinates 
      ? 'Feedback submitted with geocoded address'
      : 'Feedback submitted successfully';
    
    res.status(201).json({
      success: true,
      message: message,
      data: feedback
    });
  } catch (error) {
    console.error('Error in createFeedback:', error);
    
    // Handle geocoding errors specially
    if (error.message.includes('geocode') || error.message.includes('Could not geocode')) {
      return res.status(400).json({
        success: false,
        message: 'Unable to process the provided address. Please check or provide coordinates directly.',
        error: error.message
      });
    }
    
    next(error);
  }
};

// Rest of your controller functions remain exactly the same...
export const getAllFeedback = async (req, res, next) => {
  try {
    const feedbacks = await feedbackService.getAllFeedback(req.query);
    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    next(error);
  }
};

export const getFeedbackById = async (req, res, next) => {
  try {
    const feedback = await feedbackService.getFeedbackById(req.params.id);
    if (!feedback) {
      res.status(404);
      throw new Error('Feedback not found');
    }
    res.json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

export const updateFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.updateFeedback(req.params.id, req.body);
    if (!feedback) {
      res.status(404);
      throw new Error('Feedback not found');
    }
    res.json({
      success: true,
      message: 'Feedback updated',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

export const voteFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.voteFeedback(req.params.id);
    if (!feedback) {
      res.status(404);
      throw new Error('Feedback not found');
    }
    res.json({
      success: true,
      message: 'Vote recorded',
      data: feedback
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await feedbackService.deleteFeedback(req.params.id);
    if (!feedback) {
      res.status(404);
      throw new Error('Feedback not found');
    }
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    next(error);
  }
};