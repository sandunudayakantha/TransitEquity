import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Bus, 
  MapPin, 
  Activity, 
  MessageSquare, 
  Flame, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Clock,
  LayoutGrid
} from 'lucide-react';

const GapReportTable = ({ reports = [], loading = false, onDelete, userRole }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'gapScore', direction: 'desc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedReports = useMemo(() => {
    const sortableReports = Array.isArray(reports) ? [...reports] : [];
    if (sortConfig !== null) {
      sortableReports.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === 'areaName') {
           aValue = (a.areaDetails?.name || a.areaId?.name || '');
           bValue = (b.areaDetails?.name || b.areaId?.name || '');
        } else if (sortConfig.key === 'population') {
           aValue = (a.areaDetails?.population || a.areaId?.population || 0);
           bValue = (b.areaDetails?.population || b.areaId?.population || 0);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableReports;
  }, [reports, sortConfig]);

  if (loading) {
     return (
       <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-blue-100 p-8 space-y-4 animate-pulse">
          <Activity className="w-12 h-12 text-blue-200 animate-bounce" />
          <span className="text-blue-400 font-black uppercase text-xs tracking-widest">Aggregating Regional Insights...</span>
       </div>
     );
  }

  if (!reports || reports.length === 0) {
     return (
       <div className="w-full h-96 flex flex-col items-center justify-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200 p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
             <LayoutGrid className="w-10 h-10 text-gray-300" />
          </div>
          <span className="text-gray-900 font-black text-xl tracking-tight">Infrastructure Void</span>
          <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Analyze a district on the map to generate equity analytics and gap reports.</p>
       </div>
     );
  }

  const getSeverityBadge = (severity) => {
    const s = (severity || 'Low').toLowerCase();
    const config = {
      high: "bg-red-500 text-white border-red-400 ring-4 ring-red-500/10 animate-pulse",
      medium: "bg-amber-400 text-white border-amber-300 ring-4 ring-amber-500/5",
      low: "bg-emerald-500 text-white border-emerald-400 ring-4 ring-emerald-500/5"
    };

    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${config[s] || config.low}`}>
        {severity}
      </span>
    );
  }

  const HealthBar = ({ value, max = 200 }) => {
     // Frequency health: Higher is better
     const percentage = Math.min(100, (value / max) * 100);
     const color = percentage > 60 ? 'bg-emerald-500' : percentage > 30 ? 'bg-amber-400' : 'bg-red-500';
     return (
        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
           <div 
             className={`h-full ${color} transition-all duration-1000`} 
             style={{ width: `${percentage}%` }}
           />
        </div>
     );
  };

  const ColumnHeader = ({ label, sortKey, icon: Icon }) => (
    <th 
      onClick={() => handleSort(sortKey)} 
      className="group px-6 py-5 text-left cursor-pointer transition-colors hover:bg-white relative overflow-hidden"
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />}
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-900 transition-colors">{label}</span>
        {sortConfig.key === sortKey ? (
           sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />
        ) : (
           <ChevronDown className="w-3 h-3 text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      {sortConfig.key === sortKey && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 animate-in slide-in-from-left duration-300" />}
    </th>
  );

  const isAdmin = userRole === 'admin';

  return (
    <div className="w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <ColumnHeader label="Region Name" sortKey="areaName" icon={MapPin} />
              <ColumnHeader label="Population" sortKey="population" icon={Users} />
              <ColumnHeader label="Transit Health" sortKey="transportFrequency" icon={Bus} />
              <ColumnHeader label="Gap Analytics" sortKey="gapScore" icon={Activity} />
              <ColumnHeader label="Severity" sortKey="severity" />
              <ColumnHeader label="Community" sortKey="unresolvedFeedbackCount" icon={MessageSquare} />
              <ColumnHeader label="Impact Pulse" sortKey="totalPriorityScore" icon={Flame} />
              {isAdmin && <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedReports.map((report, idx) => {
              const area = report.areaDetails || report.areaId;
              const areaName = area?.name || 'Unknown Zone';
              const population = area?.population || 0;
              const score = typeof report.gapScore === 'number' ? report.gapScore.toFixed(0) : '0';
              const impact = report.totalPriorityScore || 0;
              const freq = report.transportFrequency || 0;

              return (
                <tr 
                  key={report._id || idx} 
                  className="group hover:bg-gray-50/80 transition-all duration-300"
                >
                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                       <span className="text-base font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{areaName}</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Digital ID: {report._id?.slice(-8)}</span>
                    </div>
                  </td>

                  <td className="px-6 py-6 font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-100" />
                       {Number(population).toLocaleString()}
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex flex-col gap-1.5">
                       <div className="flex items-center justify-between w-24">
                          <span className="text-[10px] font-black text-gray-400">{freq} Trips</span>
                       </div>
                       <HealthBar value={freq} max={150} />
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex flex-col">
                       <span className="text-xl font-black text-slate-800 tracking-tighter">{Number(score).toLocaleString()}</span>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Equity Deficit</span>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    {getSeverityBadge(report.severity)}
                  </td>

                  <td className="px-6 py-6">
                    <div className="relative inline-block">
                       <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border ${report.unresolvedFeedbackCount > 0 ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                          <MessageSquare className={`w-3.5 h-3.5 ${report.unresolvedFeedbackCount > 0 ? 'fill-current opacity-20' : ''}`} />
                          <span className="text-xs font-black">{report.unresolvedFeedbackCount || 0}</span>
                       </div>
                    </div>
                  </td>

                  <td className="px-6 py-6">
                    <div className="flex items-center gap-2">
                       <Flame className={`w-5 h-5 ${impact > 100 ? 'text-orange-500 fill-orange-500' : 'text-gray-300'} transition-colors`} />
                       <span className={`text-lg font-black tracking-tighter ${impact > 100 ? 'text-orange-600' : 'text-gray-400'}`}>
                          {impact.toFixed(0)}
                       </span>
                    </div>
                  </td>

                  {isAdmin && (
                    <td className="px-6 py-6 text-right">
                      <button
                        onClick={() => onDelete && onDelete(report._id || report.id)}
                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all duration-200 group/delete opacity-0 group-hover:opacity-100"
                        title="Purge Analysis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Table Footer / Pagination Placeholder */}
      <div className="bg-gray-50/50 p-6 border-t border-gray-100 flex items-center justify-between text-gray-400">
         <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" />
            Live Database Sync Active
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest">Total Regions: {reports.length}</span>
      </div>
    </div>
  );
};

export default GapReportTable;
