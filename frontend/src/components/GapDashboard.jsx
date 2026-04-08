import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import { useGap } from '../context/GapContext';
import GapHeatmap from './GapHeatmap';
import AreaSelector from './AreaSelector';
import SeverityFilter from './SeverityFilter';
import GapReportTable from './GapReportTable';
import ExportButton from './ExportButton';

// Safe proxy mock mapping auth dynamically if useAuth hook context shifts
import { loadAuthSession } from '../lib/auth';
const useAuth = () => {
   const session = loadAuthSession();
   return {
      userRole: session?.user?.role || 'admin', 
   };
};

const GapDashboard = () => {
   const {
      reports,
      loading,
      error,
      fetchReports,
      triggerAnalysis,
      deleteReport,
      clearError
   } = useGap();

   const { userRole } = useAuth();

   // Local Control States
   const [selectedArea, setSelectedArea] = useState(null);
   const [severityFilter, setSeverityFilter] = useState('all');
   const [isAnalyzing, setIsAnalyzing] = useState(false);

   useEffect(() => {
      // Primary Fetch Routine Mount
      fetchReports().catch(err => {
          toast.error("Failed to fetch initial reports. Please refresh.");
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   // Client-Side List Filtering Optimization
   const filteredReports = useMemo(() => {
      if (severityFilter === 'all') return reports;
      return reports.filter(r => r.severity?.toLowerCase() === severityFilter.toLowerCase());
   }, [reports, severityFilter]);

   const handleAnalyze = async () => {
      if (!selectedArea) return;
      
      const id = selectedArea._id || selectedArea.id;
      setIsAnalyzing(true);
      const toastId = toast.loading(`Analyzing gaps in ${selectedArea.name}...`);
      
      try {
         await triggerAnalysis(id);
         toast.success(`Analysis for ${selectedArea.name} completed successfully!`, { id: toastId });
         setSelectedArea(null); // Return UX to empty state securely post-success
      } catch (err) {
         toast.error(err.message || 'Analysis framework engine failed.', { id: toastId });
      } finally {
         setIsAnalyzing(false);
      }
   };

   const handleDeleteReport = async (reportId) => {
      if (window.confirm("Are you securely authorized to completely remove this analysis from the server record?")) {
         try {
            await deleteReport(reportId);
            toast.success("Report successfully purged.");
         } catch (err) {
            toast.error(err.message || "Engine failed to delete target payload record.");
         }
      }
   };

   // Secure logical checking mapping roles dynamically
   const canAnalyze = userRole === 'admin' || userRole === 'planner';

   return (
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 bg-gray-50/50 min-h-screen">
         <Toaster position="top-center" reverseOrder={false} />

         {/* Header Identity Row */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
               <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Transportation Gap Analysis</h1>
               <p className="mt-2 text-sm font-medium text-gray-500">Visualize transit infrastructure deserts and optimize system efficiency.</p>
            </div>
            
            <div className="flex items-center gap-3">
               <ExportButton 
                  data={filteredReports} 
                  filename={`gap-export-${new Date().toISOString().split('T')[0]}.csv`} 
               />
               
               <button 
                  onClick={() => fetchReports()} 
                  disabled={loading || isAnalyzing}
                  className="inline-flex items-center justify-center p-2.5 text-gray-500 hover:text-blue-600 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  title="Force Refresh Data Frame"
               >
                  <svg className={`w-5 h-5 ${loading ? 'animate-spin cursor-wait text-blue-500' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
               </button>
            </div>
         </div>

         {/* Context API Sticky Error Banner Hook */}
         {error && (
            <div className="bg-red-50 relative border-l-4 border-red-500 p-4 rounded-lg shadow-sm flex items-start justify-between">
               <div className="flex items-center">
                  <svg className="h-6 w-6 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold text-red-800">{String(error)}</p>
               </div>
               <button onClick={clearError} className="p-1 text-red-400 hover:bg-red-100 hover:text-red-700 rounded-md transition-colors">
                 <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>
         )}

         {/* Core Interactive Layout Grid Window */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Left Operational UI Panel (1/3 Base Width) */}
            <div className="lg:col-span-1 space-y-6">
               
               {/* Compute Matrix Box */}
               {canAnalyze && (
                  <div className="bg-white p-6 rounded-2xl shadow border border-gray-200">
                     <h3 className="text-xl font-bold text-gray-800 mb-5 tracking-tight flex items-center">
                       <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                       Execute Analysis
                     </h3>
                     
                     <div className="space-y-4">
                        <div className="space-y-2">
                           <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Target Region Frame</label>
                           <AreaSelector 
                              onSelect={setSelectedArea} 
                              placeholder="Select boundary constraints..." 
                              disabled={isAnalyzing || loading} 
                           />
                        </div>
                        
                        <button
                           onClick={handleAnalyze}
                           disabled={!selectedArea || isAnalyzing}
                           className={`w-full py-3 px-4 rounded-xl flex items-center justify-center font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm ${
                              !selectedArea || isAnalyzing 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-transparent' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                           }`}
                        >
                           {isAnalyzing ? (
                              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                           ) : (
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                           )}
                           {isAnalyzing ? 'Computing Topography...' : 'Compute Gap Scores'}
                        </button>
                     </div>
                  </div>
               )}

               {/* Filters Control Box */}
               <div className="bg-white p-6 rounded-2xl shadow border border-gray-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-5">
                     <h3 className="text-xl font-bold text-gray-800 tracking-tight">Active Filters</h3>
                     <span className="bg-blue-50 text-blue-700 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-blue-200/60 shadow-sm">
                        {filteredReports.length} Hit{filteredReports.length !== 1 && 's'}
                     </span>
                  </div>
                  <div className="space-y-2 flex-grow">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Severity Layer</label>
                     <SeverityFilter value={severityFilter} onChange={setSeverityFilter} />
                  </div>
               </div>
            </div>

            {/* Geographic Heatmap Render Array (2/3 Base Width) */}
            <div className="lg:col-span-2">
               <div className="bg-white p-2 rounded-2xl shadow border border-gray-200">
                  <GapHeatmap reports={filteredReports} />
               </div>
            </div>

         </div>

         {/* Bottom Data Record Container */}
         <div>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-5 px-1 tracking-tight flex items-center">
              <svg className="w-6 h-6 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              Report Database Log
            </h3>
            <GapReportTable 
               reports={filteredReports} 
               loading={loading} 
               onDelete={handleDeleteReport} 
               userRole={userRole} 
            />
         </div>

      </div>
   );
};

export default GapDashboard;
