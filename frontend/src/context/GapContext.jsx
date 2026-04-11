import React, { createContext, useState, useContext, useCallback } from 'react';
import * as gapService from '../services/gapService';

const GapContext = createContext();

export const useGap = () => {
  const context = useContext(GapContext);
  if (!context) {
    throw new Error('useGap must be used within a GapProvider');
  }
  return context;
};

export const GapProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const clearError = useCallback(() => setError(null), []);

  const fetchReports = useCallback(async (filters = {}) => {
    setLoading(true);
    clearError();
    try {
      const response = await gapService.getReports(filters);
      // ✅ Fix: Extract reports from the 'data' field as defined in the backend controller
      const reportsArray = Array.isArray(response) ? response : (response?.data || []);
      setReports(reportsArray);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching reports');
    } finally {
      setLoading(false);
    }
  }, [clearError]);

  const triggerAnalysis = useCallback(async (areaId) => {
    setLoading(true);
    clearError();
    try {
      await gapService.analyzeGap(areaId);
      // Wait for analysis to finish then refresh reports
      await fetchReports();
    } catch (err) {
      setError(err.message || 'An error occurred during analysis');
    } finally {
      setLoading(false);
    }
  }, [clearError, fetchReports]);

  const deleteReport = useCallback(async (id) => {
    setLoading(true);
    clearError();
    try {
      await gapService.deleteReport(id);
      // Optimistically remove from state or update based on the deleted ID
      setReports((prevReports) => prevReports.filter(report => report.id !== id && report._id !== id));
      
      // If the deleted report was currently selected, clear the selection
      if (selectedReport && (selectedReport.id === id || selectedReport._id === id)) {
        setSelectedReport(null);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the report');
    } finally {
      setLoading(false);
    }
  }, [clearError, selectedReport]);

  const value = {
    reports,
    loading,
    error,
    selectedReport,
    setSelectedReport, // Making this accessible so components can set the detailed report
    fetchReports,
    triggerAnalysis,
    deleteReport,
    clearError,
  };

  return (
    <GapContext.Provider value={value}>
      {children}
    </GapContext.Provider>
  );
};
