import Area from '../models/Area.model.js';           // adjust path
import Transport from '../models/Transport.model.js'; // adjust path
import Facility from '../models/Facility.model.js';   // adjust path
import GapReport from '../models/GapReport.model.js';
import { calculateDrivingDistance } from '../utils/distanceApi.js';

/**
 * Calculate average REAL driving distance from area center to all facilities
 */
const calculateAvgDistance = async (areaId, areaCoordinates) => {
  const facilities = await Facility.find({ areaId });
  
  if (facilities.length === 0) return 5.0; // default if no facilities

  let totalDistance = 0;
  let successCount = 0;

  for (const facility of facilities) {
    try {
      const distance = await calculateDrivingDistance(
        areaCoordinates,
        facility.coordinates
      );
      totalDistance += distance;
      successCount++;
    } catch (error) {
      console.error(`Error calculating distance for facility ${facility._id}:`, error);
      // Fallback to rough estimate if API fails
      const fallback = Math.sqrt(
        Math.pow(facility.coordinates.lat - areaCoordinates.lat, 2) +
        Math.pow(facility.coordinates.lng - areaCoordinates.lng, 2)
      ) * 111;
      totalDistance += fallback;
      successCount++;
    }
  }

  return successCount > 0 ? totalDistance / successCount : 5.0;
};

export const analyzeGapForArea = async (areaId) => {
  const area = await Area.findById(areaId);
  if (!area) throw new Error('Area not found');

  const transports = await Transport.find({ coveredAreas: areaId });
  const totalFrequency = transports.reduce((sum, t) => sum + t.frequency, 0) || 1;

  const avgDist = await calculateAvgDistance(areaId, area.coordinates);

  const report = new GapReport({
    areaId: area._id,
    population: area.population,
    transportFrequency: totalFrequency,
    avgDistance: parseFloat(avgDist.toFixed(2))
  });

  await report.save();
  return report;
};

export const getAllReports = async (filters = {}) => {
  const query = {};
  if (filters.severity) query.severity = filters.severity;
  if (filters.areaId) query.areaId = filters.areaId;

  return await GapReport.find(query)
    .populate('areaId', 'name city')
    .sort({ gapScore: -1 });
};

export const getReportById = async (id) => {
  return await GapReport.findById(id).populate('areaId', 'name city');
};

export const deleteReport = async (id) => {
  return await GapReport.findByIdAndDelete(id);
};