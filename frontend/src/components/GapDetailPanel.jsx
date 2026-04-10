import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Info, MessageSquarePlus, MessageSquare, AlertCircle } from 'lucide-react';
import { getFeedbacks } from '../lib/feedback';

const GapDetailPanel = ({ report, onClose }) => {
  const [localFeedback, setLocalFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Extract metadata from aggregated areaDetails or populated areaId
  const area = report?.areaDetails || report?.areaId;
  const areaId = report?.areaId?._id || report?.areaId;
  const areaName = area?.name || 'Selected Area';
  const cityName = area?.city || 'Unknown City';
  const coordinates = area?.coordinates;

  useEffect(() => {
    if (areaId) {
      setLoading(true);
      getFeedbacks({ areaId, status: 'Pending' })
        .then(data => setLocalFeedback(data.slice(0, 3)))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [areaId]);

  if (!report) return null;

  const severityColor = 
    report.severity === 'High' ? 'text-red-600 bg-red-50 border-red-200' :
    report.severity === 'Medium' ? 'text-yellow-700 bg-yellow-50 border-yellow-200' :
    'text-green-700 bg-green-50 border-green-200';

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300 max-h-[85vh] overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{areaName}</h3>
          <p className="text-sm text-gray-500">{cityName}</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
           <div className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider ${severityColor}`}>
             {report.severity} Gap Severity
           </div>
           {report.unresolvedFeedbackCount > 0 && (
             <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-black uppercase anime-pulse">
               <AlertCircle className="w-3 h-3" />
               {report.unresolvedFeedbackCount} Unresolved Issues
             </div>
           )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Population</p>
            <p className="text-lg font-extrabold text-gray-800">{report.population?.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase mb-1">Transit Units</p>
            <p className="text-lg font-extrabold text-gray-800">{report.transportFrequency}</p>
          </div>
        </div>

        {/* Community Pulse (Feedback Integration) */}
        <div className="space-y-3">
           <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
             <MessageSquare className="w-4 h-4 text-blue-500" />
             Community Pulse
           </h4>
           
           {loading ? (
             <div className="animate-pulse space-y-2">
               <div className="h-10 bg-gray-100 rounded-lg w-full"></div>
               <div className="h-10 bg-gray-100 rounded-lg w-3/4"></div>
             </div>
           ) : localFeedback.length > 0 ? (
             <div className="space-y-2">
               {localFeedback.map(f => (
                 <div key={f._id} className="p-3 bg-blue-50/50 rounded-xl border border-blue-100/50 text-xs">
                    <p className="font-bold text-blue-800 mb-1">{f.issueType}</p>
                    <p className="text-gray-600 line-clamp-1 italic">"{f.description}"</p>
                 </div>
               ))}
               <Link to="/feedback" className="block text-center text-[10px] font-bold text-blue-600 hover:underline">View all community reports</Link>
             </div>
           ) : (
             <p className="text-xs text-gray-400 italic">No public reports for this area yet.</p>
           )}
        </div>

        {/* Insight Box */}
        <div className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 italic text-xs text-gray-600">
          <Info className="w-5 h-5 flex-shrink-0 text-gray-400" />
          <p>
            {report.severity === 'High' 
              ? "Critical gap Score detected. Immediate expansion of Transit routes is recommended."
              : "Ongoing monitoring advised. Feedback trends may signal early service deserts."}
          </p>
        </div>

        {/* Feedback Action */}
        <div className="pt-4 border-t border-gray-100">
          <Link
            to={`/feedback/new?areaId=${areaId}&areaName=${encodeURIComponent(areaName)}&lat=${coordinates?.lat}&lng=${coordinates?.lng}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95"
          >
            <MessageSquarePlus className="w-5 h-5" />
            Report Issue for {areaName}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GapDetailPanel;
