import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Users, LineChart, ChevronLeft, LayoutGrid } from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';
import FeedbackList from '../components/FeedbackList';
import { loadAuthSession } from '../lib/auth';

const useAuth = () => {
    const session = loadAuthSession();
    return {
        user: session?.user || null,
        userRole: session?.user?.role || 'user'
    };
};

const FeedbackPage = () => {
  const { user, userRole } = useAuth();
  const location = useLocation();
  
  // ✅ Dynamically set initial tab based on route
  const [activeTab, setActiveTab] = useState(location.pathname.endsWith('/new') ? 'new' : 'list');
  const [statusFilter, setStatusFilter] = useState(''); // '' for all
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sync tab if user navigates via browser buttons
  useEffect(() => {
    setActiveTab(location.pathname.endsWith('/new') ? 'new' : 'list');
  }, [location.pathname]);

  const statusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Reviewed', value: 'Reviewed' },
    { label: 'Approved', value: 'Approved' },
    { label: 'Resolved', value: 'Resolved' }
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <Link 
                to={userRole === 'admin' ? '/admin' : '/'} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-600"
              >
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                  Community Feedback
                </h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Help fix transit infrastructure gaps</p>
              </div>
            </div>

            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveTab('mine')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'mine' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Feedback
              </button>
              <button
                onClick={() => setActiveTab('new')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  activeTab === 'new' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Report
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Social Proof / Navigation */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
               <h3 className="text-lg font-black text-gray-800">Why your voice matters</h3>
               <p className="text-sm text-gray-500 leading-relaxed">
                 Infrastructure planning is often data-heavy. Your feedback provides the <span className="font-bold text-blue-600">human context</span> needed to prioritize areas with high "Impact Scores".
               </p>
               <div className="flex items-center gap-3 py-4 border-y border-gray-50 text-blue-600">
                  <LineChart className="w-10 h-10 p-2 bg-blue-50 rounded-lg" />
                  <div>
                    <p className="text-sm font-black">Data Integration</p>
                    <p className="text-xs text-blue-400 font-bold">Linked to Gap Analysis</p>
                  </div>
               </div>
               <Link to="/gap-analysis" className="block text-center py-3 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors">
                  View Gap Heatmap
               </Link>
            </div>

            {/* Role indicator */}
            <div className="bg-sky-900 rounded-2xl p-6 text-white shadow-xl shadow-sky-900/10">
               <Users className="w-8 h-8 opacity-20 mb-4" />
               <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Verified Identity</p>
               <h4 className="text-xl font-bold mt-1 capitalize">{user?.name || 'Guest Citizen'}</h4>
               <div className="inline-block mt-4 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-bold uppercase">
                  Role: {userRole}
               </div>
            </div>
          </div>

          {/* Right Column: Main Interaction Area */}
          <div className="lg:col-span-8">
            {activeTab === 'new' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <FeedbackForm 
                  onSuccess={() => {
                    setActiveTab('mine');
                    setRefreshTrigger(prev => prev + 1);
                  }} 
                />
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6 px-1">
                  <h3 className="text-xl font-black text-gray-800 tracking-tight">
                    {activeTab === 'mine' ? 'My Submissions' : 'Community Issues'}
                  </h3>
                  <div className="flex bg-white border border-gray-100 p-1 rounded-xl shadow-sm overflow-x-auto no-scrollbar max-w-full">
                    {statusOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setStatusFilter(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                          statusFilter === opt.value
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <FeedbackList 
                  refreshTrigger={refreshTrigger} 
                  filters={{ 
                    status: statusFilter,
                    submittedBy: activeTab === 'mine' ? user?.id || user?._id : undefined 
                  }}
                  userRole={userRole} 
                  user={user}
                />
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default FeedbackPage;
