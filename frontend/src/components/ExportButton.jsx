import React from 'react';

const ExportButton = ({ data = [], filename = 'gap-reports.csv' }) => {
  const isDataEmpty = !data || data.length === 0;

  const handleExport = () => {
    if (isDataEmpty) return;

    // Build the CSV headers securely mapped to columns
    const headers = [
      'Area', 
      'Population', 
      'Frequency', 
      'Avg Distance (km)', 
      'Gap Score', 
      'Severity', 
      'Date'
    ];

    // Helper ensuring no breaking commas or quotes silently inject into rows causing parsing failures locally
    const escapeCSV = (val) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Construct array matrix linking the mapped dataset explicitly formatting numbers gracefully
    const rows = data.map(report => {
       const areaName = report.areaId?.name || '';
       const pop = report.areaId?.population || '';
       const freq = report.transportFrequency || '';
       const dist = typeof report.avgDistance === 'number' ? report.avgDistance.toFixed(1) : '';
       const score = typeof report.gapScore === 'number' ? report.gapScore.toFixed(2) : '';
       const sev = report.severity || '';
       const dateFull = report.createdAt ? new Date(report.createdAt).toISOString().split('T')[0] : '';
       
       return [
         escapeCSV(areaName),
         escapeCSV(pop),
         escapeCSV(freq),
         escapeCSV(dist),
         escapeCSV(score),
         escapeCSV(sev),
         escapeCSV(dateFull),
       ].join(',');
    });

    // Merge everything separated dynamically correctly
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Create Blob memory space linking standard text/csv MIME-schemas natively
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Auto-trigger Download safely mimicking User DOM Anchors securely
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    
    // Memory Cleanup natively deleting elements avoiding DOM ghosting footprints properly
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isDataEmpty}
      className={`inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm ${
        isDataEmpty 
          ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
          : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 cursor-pointer hover:border-blue-300'
      }`}
    >
      <svg 
         className={`w-5 h-5 mr-2 ${isDataEmpty ? 'text-gray-400' : 'text-blue-600'}`} 
         fill="none" 
         stroke="currentColor" 
         viewBox="0 0 24 24" 
       >
         <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
         />
      </svg>
      Export CSV
    </button>
  );
};

export default ExportButton;
