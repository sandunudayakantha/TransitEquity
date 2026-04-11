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

  // Allowed roles for this page
  const allowedRoles = ['admin', 'planner', 'tOfficer', 'iOfficer', 'citizen', 'user'];
  
  if (!allowedRoles.includes(userRole)) {
     return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50/50 pt-8 pb-12 w-full flex flex-col">
      
      {/* Structural Master Breadcrumbs Map */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 w-full mb-2">
        <nav className="flex items-center text-sm font-semibold text-gray-500 space-x-2">
          
          <Link to="/" className="text-gray-400 hover:text-blue-600 transition-colors">
            {userRole === 'admin' || userRole === 'planner' ? 'Admin Portal' : 'Home'}
          </Link>
          
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          
          {userRole !== 'user' && userRole !== 'citizen' && (
            <>
              <Link to="/analytics" className="text-gray-400 hover:text-blue-600 transition-colors">Analytics Systems</Link>
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
          
          <span className="text-gray-800 font-bold bg-white px-2 py-0.5 rounded shadow-sm border border-gray-200 cursor-default">
             Gap Analysis
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
