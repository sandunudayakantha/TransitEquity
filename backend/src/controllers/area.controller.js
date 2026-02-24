import Area from '../models/Area.model.js';

export const createArea = async (req, res) => {
    try {
        const area = new Area(req.body);
        await area.save();
        res.status(201).json(area);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllAreas = async (req, res) => {
    try {
        const areas = await Area.find();
        res.status(200).json(areas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAreaById = async (req, res) => {
    try {
        const area = await Area.findById(req.params.id);
        if (!area) return res.status(404).json({ error: 'Area not found' });
        res.status(200).json(area);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateArea = async (req, res) => {
    try {
        const { population, areaSize } = req.body;

        // If population or areaSize is updated, we need to recalculate density.
        // Since we're using findByIdAndUpdate, the 'save' hook won't trigger easily for density calculation.
        // We'll calculate it here if needed.

        let updateData = { ...req.body };

        if (population !== undefined || areaSize !== undefined) {
            const currentArea = await Area.findById(req.params.id);
            if (currentArea) {
                const newPopulation = population !== undefined ? population : currentArea.population;
                const newAreaSize = areaSize !== undefined ? areaSize : currentArea.areaSize;
                updateData.density = newPopulation / newAreaSize;
            }
        }

        const area = await Area.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!area) return res.status(404).json({ error: 'Area not found' });
        res.status(200).json(area);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteArea = async (req, res) => {
    try {
        const area = await Area.findByIdAndDelete(req.params.id);
        if (!area) return res.status(404).json({ error: 'Area not found' });
        res.status(200).json({ message: 'Area deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
