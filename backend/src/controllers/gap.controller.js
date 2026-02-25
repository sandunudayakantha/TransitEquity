import * as gapService from '../services/gap.Service.js';
import { validateGapAnalysis } from '../utils/gapValidation.js';

export const analyzeGap = async (req, res, next) => {
  try {
    const { areaId } = req.body;
    const validation = validateGapAnalysis({ areaId });
    if (!validation.isValid) {
      res.status(400);
      throw new Error(validation.message);
    }

    const report = await gapService.analyzeGapForArea(areaId);
    res.status(201).json({
      success: true,
      message: 'Gap analysis report generated',
      data: report
    });
  } catch (error) {
    if (error.message === 'Area not found') res.status(404);
    else res.status(500);
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await gapService.getAllReports(req.query);
    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

export const getReportById = async (req, res, next) => {
  try {
    const report = await gapService.getReportById(req.params.id);
    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req, res, next) => {
  try {
    const report = await gapService.deleteReport(req.params.id);
    if (!report) {
      res.status(404);
      throw new Error('Report not found');
    }
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    next(error);
  }
};