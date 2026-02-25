

import ServiceStatus from '../models/ServiceStatus.model.js';
import mongoose from 'mongoose';

export const createServiceStatus = async (req, res) => {
  try {
    const { routeId, vehicleNumber, currentLocation, status } = req.body;
    if (!routeId || !vehicleNumber || !currentLocation || currentLocation.lat === undefined || currentLocation.lng === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (status && !['Active', 'Delayed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    if (!mongoose.Types.ObjectId.isValid(routeId)) {
      return res.status(400).json({ error: 'Invalid routeId' });
    }
    const service = new ServiceStatus(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getAllServices = async (req, res) => {
  try {
    const services = await ServiceStatus.find().populate('routeId');
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getActiveServices = async (req, res) => {
  try {
    const services = await ServiceStatus.find({ status: 'Active' }).populate('routeId');
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDelayedServices = async (req, res) => {
  try {
    const services = await ServiceStatus.find({ status: 'Delayed' }).populate('routeId');
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateServiceStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    if (req.body.status && !['Active', 'Delayed', 'Completed', 'Cancelled'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    if (req.body.routeId && !mongoose.Types.ObjectId.isValid(req.body.routeId)) {
      return res.status(400).json({ error: 'Invalid routeId' });
    }
    const service = await ServiceStatus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json(service);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

export const deleteServiceStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }
    const service = await ServiceStatus.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
