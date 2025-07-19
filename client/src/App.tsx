import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import RequestAdmin from './pages/RequestAdmin';
import AdminRequests from './pages/AdminRequests';
import ReportIncident from './pages/ReportIncident';
import MyReports from './pages/MyReports';
import AdminDashboard from './pages/AdminDashboard';
import Chat from './pages/Chat';
import LoadingSpinner from './components/common/LoadingSpinner';
import ModeratorDashboard from './pages/ModeratorDashboard';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationBar from './components/common/NotificationBar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean; moderatorOnly?: boolean }> = ({
  children,
  adminOnly = false,
  moderatorOnly = false
}) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  if (moderatorOnly && user.role !== 'moderator') return <Navigate to="/" replace />;
  return <>{children}</>;
};

// Main App Component
const AppContent: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/admin-login" element={!user ? <AdminLogin /> : <Navigate to="/admin" replace />} />
          <Route
            path="/request-admin"
            element={
              <ProtectedRoute>
                <RequestAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <ReportIncident />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-reports"
            element={
              <ProtectedRoute>
                <MyReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute moderatorOnly>
                <AdminRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/moderator"
            element={
              <ProtectedRoute moderatorOnly>
                <ModeratorDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// Root App Component with Providers
const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
