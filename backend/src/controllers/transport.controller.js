
import Transport from '../models/Transport.model.js';


import mongoose from 'mongoose';

export const createTransport = async (req, res) => {
  try {
    const { routeNumber, serviceType, frequency, capacity, coveredAreas, startPoint, endPoint } = req.body;
    // Check for missing fields
    if (!routeNumber || !serviceType || !frequency || !capacity || !startPoint || !endPoint) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Validate enum
    if (!['Bus', 'Train'].includes(serviceType)) {
      return res.status(400).json({ error: 'Invalid serviceType. Must be Bus or Train' });
    }
    const transport = new Transport(req.body);
    await transport.save();
    res.status(201).json(transport);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getAllTransports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Transport.countDocuments();
    const transports = await Transport.find()
      .populate('coveredAreas')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: transports.length,
      total,
      pages: Math.ceil(total / limit),
      page,
      data: transports
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransportById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const transport = await Transport.findById(req.params.id).populate('coveredAreas');
    if (!transport) return res.status(404).json({ error: 'Transport not found' });
    res.status(200).json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTransport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    if (req.body.serviceType && !['Bus', 'Train'].includes(req.body.serviceType)) {
      return res.status(400).json({ error: 'Invalid serviceType. Must be Bus or Train' });
    }
    const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!transport) return res.status(404).json({ error: 'Transport not found' });
    res.status(200).json(transport);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteTransport = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const transport = await Transport.findByIdAndDelete(req.params.id);
    if (!transport) return res.status(404).json({ error: 'Transport not found' });
    res.status(200).json({ message: 'Transport deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
