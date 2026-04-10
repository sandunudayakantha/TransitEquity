import React, { useState, useEffect } from 'react';
import { ThumbsUp, MapPin, Clock, AlertTriangle, Trash2, TrendingUp } from 'lucide-react';
import { getFeedbacks, voteFeedback, deleteFeedback, updateFeedbackStatus } from '../lib/feedback';
import toast from 'react-hot-toast';
import FeedbackDetailModal from './FeedbackDetailModal';

const STATUS_OPTIONS = ['Pending', 'Reviewed', 'Approved', 'Resolved'];

const FeedbackList = ({ filters = {}, userRole, refreshTrigger, user }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      // Only show full-screen loader if we have no data yet
      if (feedbacks.length === 0) setLoading(true);
      const data = await getFeedbacks(filters);
      setFeedbacks(data);
    } catch (err) {
      toast.error("Failed to load community feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filters, refreshTrigger]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateFeedbackStatus(id, { status: newStatus });
      setFeedbacks(prev => prev.map(f => f._id === id ? updated : f));
      toast.success(`Feedback marked as ${newStatus}`);
    } catch (err) {
      toast.error("Status update failed.");
    }
  };

  const handleVote = async (id) => {
    if (!user) {
      toast.error("Please login to upvote issues.");
      return;
    }

    const feedback = feedbacks.find(f => f._id === id);
    const wasVoted = feedback?.voters?.includes(user.id || user._id);

    try {
      const updated = await voteFeedback(id);
      setFeedbacks(prev => prev.map(f => f._id === id ? updated : f));
      toast.success(wasVoted ? "Vote removed" : "Vote recorded!");
    } catch (err) {
      toast.error("Failed to update vote.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Permanent delete?")) {
      try {
        await deleteFeedback(id);
        setFeedbacks(prev => prev.filter(f => f._id !== id));
        toast.success("Feedback removed.");
      } catch (err) {
        toast.error("Delete failed.");
      }
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch(urgency) {
      case 'High': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Medium': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Pending: "bg-gray-100 text-gray-500",
      Reviewed: "bg-blue-50 text-blue-600 border-blue-100",
      Approved: "bg-purple-50 text-purple-600 border-purple-100",
      Resolved: "bg-green-50 text-green-600 border-green-100"
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) return <div className="text-center py-12 text-gray-500 font-medium">Loading feedback records...</div>;

  if (feedbacks.length === 0) return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      <p className="text-gray-400">No feedback reported in this category yet.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {feedbacks.map((f) => (
        <div key={f._id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative group">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-grow space-y-3">
              <div className="flex items-center gap-2">
                {getStatusBadge(f.status)}
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{f.issueType}</span>
                
                {(userRole === 'admin' || userRole === 'planner') && (
                  <select
                    value={f.status}
                    onChange={(e) => handleStatusChange(f._id, e.target.value)}
                    className="ml-auto text-[10px] bg-white border border-gray-200 rounded-md py-0.5 px-2 font-bold text-gray-400 focus:text-blue-600 focus:border-blue-500 outline-none"
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}
              </div>

              <h4 className="text-lg font-bold text-gray-800 leading-snug">{f.description}</h4>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  {f.areaDetails?.name || f.address || f.submittedAddress || 'Unknown Location'}
                </div>
                
                {f.latestGap && (
                   <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase ${
                     f.latestGap.severity === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                     f.latestGap.severity === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                     'bg-green-50 text-green-600 border-green-100'
                   }`}>
                      {f.latestGap.severity} Gap Area
                   </div>
                )}

                <div className="flex items-center gap-1.5 font-medium">
                  {getUrgencyIcon(f.urgency)}
                  {f.urgency} Priority
                </div>

                <button 
                  onClick={() => setSelectedFeedback(f)}
                  className="mt-2 flex items-center gap-1.5 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:text-blue-700 transition-colors group/details"
                >
                  View Details
                  <span className="w-4 h-4 rounded-full bg-blue-50 flex items-center justify-center group-hover/details:translate-x-1 transition-transform">
                     <TrendingUp className="w-2.5 h-2.5" />
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 pt-1">
              {(() => {
                const hasVoted = user && f.voters?.includes(user.id || user._id);
                return (
                  <button 
                    onClick={() => handleVote(f._id)}
                    className={`p-3 rounded-xl transition-all duration-300 flex flex-col items-center group/vote relative overflow-hidden ${
                      hasVoted 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <ThumbsUp className={`w-5 h-5 transition-transform ${hasVoted ? 'fill-current' : 'group-hover/vote:scale-110'}`} />
                    <span className={`text-xs font-black mt-1 ${hasVoted ? 'text-white' : 'text-blue-600'}`}>
                      {f.votes}
                    </span>
                    {hasVoted && (
                      <div className="absolute top-0 right-0 p-0.5">
                         <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-sm" />
                      </div>
                    )}
                  </button>
                );
              })()}
              
              {userRole === 'admin' && (
                 <div className="mt-2 text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">Impact</p>
                    <p className="text-sm font-black text-blue-600">{f.priorityScore?.toFixed(0) || 0}</p>
                 </div>
              )}

              {userRole === 'admin' && (
                 <button 
                   onClick={() => handleDelete(f._id)}
                   className="p-2 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 rounded-lg transition-all mt-2"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              )}
            </div>
          </div>
        </div>
      ))}

      <FeedbackDetailModal 
        isOpen={!!selectedFeedback}
        feedback={selectedFeedback}
        onClose={() => setSelectedFeedback(null)}
      />
    </div>
  );
};

export default FeedbackList;
