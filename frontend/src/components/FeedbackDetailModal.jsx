import React, { useEffect, useState } from 'react';
import { 
  X, 
  MapPin, 
  ThumbsUp, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck,
  ExternalLink,
  Calendar
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const FeedbackDetailModal = ({ feedback, isOpen, onClose }) => {
  const [map, setMap] = useState(null);

  useEffect(() => {
    if (isOpen && feedback?.coordinates && !map) {
      // Small Delay to ensure DOM is ready for Leaflet
      const timer = setTimeout(() => {
         const m = L.map(`detail-map-${feedback._id}`).setView([feedback.coordinates.lat, feedback.coordinates.lng], 15);
         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(m);
         
         // Mark the location
         L.marker([feedback.coordinates.lat, feedback.coordinates.lng]).addTo(m)
           .bindPopup("Reported Location")
           .openPopup();
         
         setMap(m);
      }, 100);
      return () => clearTimeout(timer);
    }
    
    return () => {
      if (map) {
        map.remove();
        setMap(null);
      }
    };
  }, [isOpen, feedback]);

  if (!isOpen || !feedback) return null;

  const getUrgencyStyles = (urgency) => {
    switch(urgency) {
      case 'High': return 'text-red-600 bg-red-50 border-red-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    }
  };

  const statusColors = {
    Pending: 'bg-gray-100 text-gray-500',
    Reviewed: 'bg-blue-100 text-blue-700',
    Approved: 'bg-purple-100 text-purple-700',
    Resolved: 'bg-emerald-100 text-emerald-700'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* Left Side: Map & Location */}
        <div className="w-full md:w-1/2 bg-gray-50 flex flex-col border-r border-gray-100">
           <div className="relative h-64 md:h-full">
              <div id={`detail-map-${feedback._id}`} className="w-full h-full z-10" />
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-2xl border border-white/50 shadow-lg flex items-center gap-2">
                 <MapPin className="w-4 h-4 text-blue-600" />
                 <span className="text-xs font-black uppercase text-gray-800">Geographic Context</span>
              </div>
           </div>
           
           <div className="p-6 bg-white border-t border-gray-100">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Reported Address</p>
              <div className="flex items-center gap-2 text-gray-800 font-bold">
                 <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-blue-500" />
                 </div>
                 <p className="text-sm line-clamp-2">{feedback.areaDetails?.name || feedback.submittedAddress || "Coordinate-based link"}</p>
              </div>
           </div>
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col gap-8 overflow-y-auto">
           {/* Header */}
           <div className="flex items-start justify-between">
              <div>
                 <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getUrgencyStyles(feedback.urgency)}`}>
                       {feedback.urgency} Urgency
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${statusColors[feedback.status]}`}>
                       {feedback.status}
                    </span>
                 </div>
                 <h2 className="text-3xl font-black text-gray-900 leading-tight">{feedback.issueType}</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
              >
                 <X className="w-6 h-6" />
              </button>
           </div>

           {/* Description Section */}
           <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Issue Insight</p>
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                 <p className="text-gray-700 leading-relaxed font-medium">
                    "{feedback.description}"
                 </p>
              </div>
           </div>

           {/* Stats & Priority */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50/50 rounded-3xl p-5 border border-blue-100/50">
                 <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Priority Score</span>
                 </div>
                 <p className="text-3xl font-black text-blue-700">{feedback.priorityScore?.toFixed(0) || 0}</p>
                 <p className="text-[9px] font-bold text-blue-400 mt-1 uppercase">Engagement Weighted</p>
              </div>

              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-200/50">
                 <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Community Votes</span>
                 </div>
                 <p className="text-3xl font-black text-slate-800">{feedback.votes || 0}</p>
                 <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Verified Citizens</p>
              </div>
           </div>

           {/* Footer Details */}
           <div className="mt-auto pt-6 border-t border-gray-100 flex items-center justify-between text-gray-400">
              <div className="flex items-center gap-2">
                 <Calendar className="w-4 h-4" />
                 <span className="text-xs font-bold">Submitted {new Date(feedback.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-blue-600 font-bold hover:underline cursor-pointer text-xs">
                 <ShieldCheck className="w-4 h-4" />
                 <span>Verified Auth System</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default FeedbackDetailModal;
