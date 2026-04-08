import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { GapProvider } from '../context/GapContext';
import GapDashboard from '../components/GapDashboard';
import { loadAuthSession } from '../lib/auth';

// Logical proxy simulating the useAuth context cleanly referencing native logic checks
const useAuth = () => {
    const session = loadAuthSession();
    return {
        isAuthenticated: !!session?.token,
        userRole: session?.user?.role || null, 
    };
};

const GapAnalysisPage = () => {
  const { isAuthenticated, userRole } = useAuth();

  // Authentication Gatekeeper Rules explicitly handling stateless JWT routing skips gracefully
  if (!isAuthenticated) {
     return <Navigate to="/login" replace />;
  }

  // Identity Bounds Restrictor: Locking out standard citizen loops cleanly mapping UI feedback 
  if (userRole === 'citizen' || userRole === 'user') {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
         <div className="max-w-md w-full text-center space-y-6 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
           
           <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
           
           <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Access Restricted</h2>
           <p className="text-gray-600 font-medium pb-2">Transportation Gap Analysis tracking mechanisms require high-level administrative or planner clearance constraints.</p>
           
           <div className="pt-4 border-t border-gray-100">
              <Link to="/feedback" className="block w-full text-center py-2.5 px-4 shadow-sm text-sm font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                 Return to Personal Dashboard
              </Link>
           </div>
         </div>
       </div>
     );
  }

  // Generic explicit fallback mapping ensuring ghost roles bypass checks 
  const allowedRoles = ['admin', 'planner', 'tOfficer', 'iOfficer'];
  if (!allowedRoles.includes(userRole)) {
     return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50/50 pt-8 pb-12 w-full flex flex-col">
      
      {/* Structural Master Breadcrumbs Map */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full mb-2">
        <nav className="flex items-center text-sm font-semibold text-gray-500 space-x-2">
          
          <Link to="/" className="text-gray-400 hover:text-blue-600 transition-colors">Admin Portal</Link>
          
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          
          <Link to="/analytics" className="text-gray-400 hover:text-blue-600 transition-colors">Analytics Systems</Link>
          
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          
          <span className="text-gray-800 font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-gray-200 cursor-default">
             Gap Infrastructure Topography
          </span>
          
        </nav>
      </div>

      {/* Target Application Injected Securely Nested via API Providers */}
      <div className="flex-grow">
          <GapProvider>
            <GapDashboard />
          </GapProvider>
      </div>

    </div>
  );
};

export default GapAnalysisPage;
