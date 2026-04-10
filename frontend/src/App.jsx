import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import { clearAuthSession, loadAuthSession, saveAuthSession } from './lib/auth';
import AdminPanel from './pages/AdminPanel';
import AreaFormPage from './pages/AreaFormPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ManageAreasPage from './pages/ManageAreasPage';
import RegisterPage from './pages/RegisterPage';
import UsersPage from './pages/UsersPage';
import TransportRoutesPage from './pages/TransportRoutesPage';
import TransportFormPage from './pages/TransportFormPage';
import GapAnalysisPage from './pages/GapAnalysisPage';
import FeedbackPage from './pages/FeedbackPage';

function App() {
  const [session, setSession] = useState(() => loadAuthSession());

  const handleLogin = (nextSession) => {
    saveAuthSession(nextSession);
    setSession(nextSession);
  };

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage user={session?.user ?? null} onLogout={handleLogout} />}
      />
      <Route
        path="/login"
        element={
          session?.user ? (
            <Navigate to={session.user.role === 'admin' ? '/admin' : '/'} replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/register"
        element={
          session?.user ? (
            <Navigate to={session.user.role === 'admin' ? '/admin' : '/'} replace />
          ) : (
            <RegisterPage onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/admin"
        element={(
          <AdminRoute user={session?.user ?? null}>
            <AdminPanel user={session?.user ?? null} onLogout={handleLogout} />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/users"
        element={(
          <AdminRoute user={session?.user ?? null}>
            <UsersPage user={session?.user ?? null} onLogout={handleLogout} />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/areas"
        element={(
          <AdminRoute user={session?.user ?? null}>
            <ManageAreasPage user={session?.user ?? null} onLogout={handleLogout} />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/areas/new"
        element={(
          <AdminRoute user={session?.user ?? null}>
            <AreaFormPage user={session?.user ?? null} onLogout={handleLogout} mode="create" />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/areas/:areaId/edit"
        element={(
          <AdminRoute user={session?.user ?? null}>
            <AreaFormPage user={session?.user ?? null} onLogout={handleLogout} mode="edit" />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/transports"
        element={(
          <AdminRoute user={session?.user ?? null}>
            <TransportRoutesPage user={session?.user ?? null} onLogout={handleLogout} />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/transports/new"
        element={(
          <AdminRoute user={session?.user ?? null}>
            <TransportFormPage user={session?.user ?? null} onLogout={handleLogout} mode="create" />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/transports/:transportId/edit"
        element={(
          <AdminRoute user={session?.user ?? null}>
            <TransportFormPage user={session?.user ?? null} onLogout={handleLogout} mode="edit" />
          </AdminRoute>
        )}
      />
      <Route
        path="/admin/gap-reports"
        element={(
          <AdminRoute user={session?.user ?? null}>
            <GapAnalysisPage />
          </AdminRoute>
        )}
      />
      
      {/* Community Context Routes */}
      <Route
        path="/gap-analysis"
        element={session?.user ? <GapAnalysisPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/feedback"
        element={session?.user ? <FeedbackPage /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;
