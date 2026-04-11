import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  ThumbsUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import { getFeedbacks, updateFeedbackStatus } from '../lib/feedback';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['Pending', 'Reviewed', 'Approved', 'Resolved'];

const AdminFeedbackPage = ({ user, onLogout }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [globalStats, setGlobalStats] = useState({ total: 0, pending: 0, resolved: 0, highUrgency: 0 });

  const fetchAllFeedbacks = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getFeedbacks({ 
        page, 
        limit: 10, 
        status: statusFilter,
        search: searchQuery 
      });
      
      setFeedbacks(response.data || []);
      setTotalPages(response.pages || 1);
      setTotalReports(response.total || 0);
      setCurrentPage(response.page || 1);

      // We still need global stats for the cards. 
      // If we are filtered, the stats should ideally stay global or reflect the filtered set?
      // Usually, global stats stay global. Let's fetch them once or adjust the backend to return them.
      // For now, let's just use the current total as a simple stat.
      if (statusFilter === 'All' && !searchQuery) {
        setGlobalStats({
          total: response.total,
          pending: (response.data || []).filter(f => f.status === 'Pending').length, // This is only for the page, not good.
          resolved: (response.data || []).filter(f => f.status === 'Resolved').length,
          highUrgency: (response.data || []).filter(f => f.urgency === 'High').length
        });
      }
    } catch (err) {
      toast.error("Failed to fetch community reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFeedbacks(currentPage);
  }, [currentPage, statusFilter, searchQuery]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updated = await updateFeedbackStatus(id, { status: newStatus });
      setFeedbacks(prev => prev.map(f => f._id === id ? updated : f));
      toast.success(`Issue marked as ${newStatus}`);
    } catch (err) {
      toast.error("Status update failed.");
    }
  };

  // Filtering is now handled on the server side
  const feedbacksToDisplay = feedbacks;

  const getUrgencyColor = (urgency) => {
    switch(urgency) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Medium': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      default: return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
      case 'Reviewed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Approved': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'Resolved': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default: return 'text-slate-400';
    }
  };

  return (
    <AdminLayout 
      user={user} 
      onLogout={onLogout} 
      eyebrow="Community Voice" 
      title="Feedback Management"
    >
      <div className="space-y-6">
        {/* Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: 'Total Reports', val: totalReports, icon: MessageSquare, color: 'text-blue-400' },
             { label: 'Current Filter', val: feedbacks.length, icon: Clock, color: 'text-amber-400' },
             { label: 'Impact Score', val: feedbacks.reduce((acc, f) => acc + (f.votes || 0), 0), icon: ThumbsUp, color: 'text-emerald-400' },
             { label: 'Page Focus', val: `Page ${currentPage}`, icon: CheckCircle2, color: 'text-sky-400' },
           ].map((stat) => (
             <div key={stat.label} className="bg-slate-900 border border-white/10 rounded-3xl p-5 flex items-center justify-between shadow-lg">
                <div>
                   <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{stat.label}</p>
                   <p className="text-2xl font-bold">{stat.val}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color} opacity-20`} />
             </div>
           ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-3xl border border-white/5">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search descriptions, areas, or issue types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
            {['All', ...STATUS_OPTIONS].map(opt => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === opt 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Issue & Description</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Impact</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Urgency</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center">
                       <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-sm text-slate-500 font-medium">Synchronizing reports...</p>
                       </div>
                    </td>
                  </tr>
                ) : feedbacksToDisplay.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-slate-500">
                      No community reports found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  feedbacksToDisplay.map((f) => (
                    <tr key={f._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                         <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{f.issueType}</span>
                            <p className="text-sm font-semibold line-clamp-2 max-w-md">{f.description}</p>
                         </div>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2 text-white">
                            <div className="w-8 h-8 rounded-lg bg-sky-400/10 flex items-center justify-center shrink-0">
                               <MapPin className="w-4 h-4 text-sky-400" />
                            </div>
                            <div className="text-xs">
                               <p className="font-bold text-white">{f.areaDetails?.name || 'Manual Address'}</p>
                               <p className="text-slate-500">{f.areaDetails?.city || f.submittedAddress || 'No City context'}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 text-blue-400 font-black text-lg">
                               <ThumbsUp className="w-4 h-4" />
                               {f.votes}
                            </div>
                            <span className="text-[9px] font-black uppercase text-slate-600 tracking-tighter">Impact Score: {f.priorityScore?.toFixed(0)}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getUrgencyColor(f.urgency)}`}>
                            {f.urgency}
                         </span>
                      </td>
                      <td className="px-6 py-5">
                         <select 
                           value={f.status}
                           onChange={(e) => handleStatusUpdate(f._id, e.target.value)}
                           className={`bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all ${getStatusColor(f.status)}`}
                         >
                           {STATUS_OPTIONS.map(opt => (
                             <option key={opt} value={opt}>{opt}</option>
                           ))}
                         </select>
                      </td>
                      <td className="px-6 py-5 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <a 
                             href={`/gap-analysis?areaId=${f.areaId}`}
                             className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all shadow-sm"
                             title="View on Map"
                           >
                             <ExternalLink className="w-4 h-4" />
                           </a>
                           <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-all">
                              <MoreVertical className="w-4 h-4" />
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!loading && feedbacks.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 bg-white/5 px-6 py-4 sm:flex-row">
              <p className="text-sm text-white/60 font-medium">
                Showing <span className="font-semibold text-white">{Math.min((currentPage - 1) * 10 + 1, totalReports)}</span> to{' '}
                <span className="font-semibold text-white">{Math.min(currentPage * 10, totalReports)}</span> of{' '}
                <span className="font-semibold text-white">{totalReports}</span> reports
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || loading}
                  className="btn btn-secondary h-9 px-3 text-xs disabled:opacity-30 border-white/10"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                        currentPage === i + 1 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                          : 'text-slate-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="btn btn-secondary h-9 px-3 text-xs disabled:opacity-30 border-white/10"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// Internal MapPin helper as I forgot to import it 
const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default AdminFeedbackPage;
