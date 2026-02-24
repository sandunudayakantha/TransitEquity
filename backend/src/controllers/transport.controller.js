
import Transport from '../models/Transport.model.js';

export const createTransport = async (req, res) => {
  try {
    const transport = new Transport(req.body);
    await transport.save();
    res.status(201).json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllTransports = async (req, res) => {
  try {
    const transports = await Transport.find().populate('coveredAreas');
    res.status(200).json(transports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getTransportById = async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id).populate('coveredAreas');
    if (!transport) return res.status(404).json({ error: 'Transport not found' });
    res.status(200).json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTransport = async (req, res) => {
  try {
    const transport = await Transport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!transport) return res.status(404).json({ error: 'Transport not found' });
    res.status(200).json(transport);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTransport = async (req, res) => {
  try {
    const transport = await Transport.findByIdAndDelete(req.params.id);
    if (!transport) return res.status(404).json({ error: 'Transport not found' });
    res.status(200).json({ message: 'Transport deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
