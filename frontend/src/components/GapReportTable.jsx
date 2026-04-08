import React, { useState, useMemo } from 'react';

const GapReportTable = ({ reports = [], loading = false, onDelete, userRole }) => {
  // Setup default state descending by 'gapScore'
  const [sortConfig, setSortConfig] = useState({ key: 'gapScore', direction: 'desc' });

  // Handle clicking column headers
  const handleSort = (key) => {
    let direction = 'asc';
    // Toggle direction if already sorting on this key
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Memoize sorted reports directly so it only recalculates when dependencies change natively
  const sortedReports = useMemo(() => {
    const sortableReports = [...reports];
    if (sortConfig !== null) {
      sortableReports.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Specific Object Extractors dynamically capturing nested values cleanly 
        if (sortConfig.key === 'areaName') {
           aValue = a.areaId?.name || '';
           bValue = b.areaId?.name || '';
        } else if (sortConfig.key === 'population') {
           aValue = a.areaId?.population || 0;
           bValue = b.areaId?.population || 0;
        }

        // Basic alphanumeric sorting pipeline correctly scaled globally
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableReports;
  }, [reports, sortConfig]);

  // Handle visual rendering logic checking Loading States strictly prioritizing UX natively
  if (loading) {
     return (
       <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-4">
          <svg className="animate-spin h-10 w-10 text-blue-600" viewBox="0 0 24 24" fill="none">
             <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500 font-medium">Loading Gap Reports...</span>
       </div>
     );
  }

  // Gracefully handle UI empty states ensuring smooth visual integrity 
  if (!reports || reports.length === 0) {
     return (
       <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-50 rounded-xl shadow-sm border border-gray-200 border-dashed p-8">
          <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <span className="text-gray-500 font-medium text-lg tracking-tight">No gap reports available</span>
          <p className="text-gray-400 text-sm mt-1">Try to analyze a new area or adjust filters to view data.</p>
       </div>
     );
  }

  const renderSortArrow = (key) => {
    if (sortConfig.key !== key) return null;
    return (
       <span className="ml-1 inline-block text-blue-500 font-bold">
           {sortConfig.direction === 'asc' ? '↑' : '↓'}
       </span>
    );
  };

  const getSeverityBadge = (severity) => {
     let defaultStyles = "bg-gray-100 text-gray-800 border-gray-200"; // Universal fallback
     if (!severity) return defaultStyles;

     // Assign matching tailwind pills perfectly natively
     switch(severity.toLowerCase()) {
         case 'high':
            defaultStyles = "bg-red-50 text-red-700 border-red-200";
            break;
         case 'medium':
            defaultStyles = "bg-yellow-50 text-yellow-700 border-yellow-300";
            break;
         case 'low':
            defaultStyles = "bg-green-50 text-green-700 border-green-200";
            break;
     }

     return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border shadow-sm ${defaultStyles}`}>
           {severity.charAt(0).toUpperCase() + severity.slice(1)}
        </span>
     );
  }

  const isAdmin = userRole === 'admin';

  return (
    <div className="overflow-x-auto w-full rounded-xl shadow-lg border border-gray-200 bg-white">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50/80 text-gray-600 border-b border-gray-200">
          <tr>
            <th onClick={() => handleSort('areaName')} className="cursor-pointer px-6 py-4 text-left font-semibold uppercase tracking-wider hover:bg-gray-100 transition whitespace-nowrap">
               Area {renderSortArrow('areaName')}
            </th>
            <th onClick={() => handleSort('population')} className="cursor-pointer px-6 py-4 text-left font-semibold uppercase tracking-wider hover:bg-gray-100 transition whitespace-nowrap">
               Population {renderSortArrow('population')}
            </th>
            <th onClick={() => handleSort('transportFrequency')} className="cursor-pointer px-6 py-4 text-left font-semibold uppercase tracking-wider hover:bg-gray-100 transition whitespace-nowrap">
               Transport Freq {renderSortArrow('transportFrequency')}
            </th>
            <th onClick={() => handleSort('avgDistance')} className="cursor-pointer px-6 py-4 text-left font-semibold uppercase tracking-wider hover:bg-gray-100 transition whitespace-nowrap">
               Avg Dist (km) {renderSortArrow('avgDistance')}
            </th>
            <th onClick={() => handleSort('gapScore')} className="cursor-pointer px-6 py-4 text-left font-semibold uppercase tracking-wider hover:bg-gray-100 transition whitespace-nowrap">
               Gap Score {renderSortArrow('gapScore')}
            </th>
            <th onClick={() => handleSort('severity')} className="cursor-pointer px-6 py-4 text-left font-semibold uppercase tracking-wider hover:bg-gray-100 transition whitespace-nowrap">
               Severity {renderSortArrow('severity')}
            </th>
            <th onClick={() => handleSort('createdAt')} className="cursor-pointer px-6 py-4 text-left font-semibold uppercase tracking-wider hover:bg-gray-100 transition whitespace-nowrap">
               Date {renderSortArrow('createdAt')}
            </th>
            {isAdmin && <th className="px-6 py-4 text-right font-semibold uppercase tracking-wider whitespace-nowrap">Actions</th>}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sortedReports.map((report, idx) => {
            const reportId = report._id || report.id;
            const areaName = report.areaId?.name || 'Unknown';
            const population = report.areaId?.population || 0;
            const dateParsed = report.createdAt ? new Date(report.createdAt).toISOString().split('T')[0] : 'N/A';
            const distance = typeof report.avgDistance === 'number' ? report.avgDistance.toFixed(1) : 'N/A';
            const score = typeof report.gapScore === 'number' ? report.gapScore.toFixed(2) : 'N/A';

            return (
              <tr 
                key={reportId} 
                className={`hover:bg-gray-50/80 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{areaName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{Number(population).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{report.transportFrequency || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">{distance}</td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800">{score}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                   {getSeverityBadge(report.severity)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{dateParsed}</td>
                
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => onDelete && onDelete(reportId)}
                      className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors duration-200 border border-transparent shadow-sm hover:border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default GapReportTable;
