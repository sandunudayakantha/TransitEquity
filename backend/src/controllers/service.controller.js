
import ServiceStatus from '../models/ServiceStatus.model.js';

export const createServiceStatus = async (req, res) => {
  try {
    const service = new ServiceStatus(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
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
    const service = await ServiceStatus.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteServiceStatus = async (req, res) => {
  try {
    const service = await ServiceStatus.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found' });
    res.status(200).json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
