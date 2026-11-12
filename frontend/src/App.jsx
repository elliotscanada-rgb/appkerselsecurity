import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/common/ProtectedRoute';

// Client Pages (will be created next)
import ClientDashboard from './pages/client/ClientDashboard';
import ClientTrackingDashboard from './pages/client/ClientTrackingDashboard';
import MyConsignments from './pages/client/MyConsignments';
import TrackingPage from './pages/client/TrackingPage';
import DocumentsPage from './pages/client/DocumentsPage';
import NotificationsPage from './pages/client/NotificationsPage';
import ProfilePage from './pages/client/ProfilePage';

// Admin Pages (will be created next)
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminManagementDashboard from './pages/admin/AdminManagementDashboard';
import AssetTrackingDashboard from './pages/admin/AssetTrackingDashboard';
import AdminEditAssetsPage from './pages/admin/AdminEditAssetsPage';
import ClientsPage from './pages/admin/ClientsPage';
import StaffPage from './pages/admin/StaffPage';
import ConsignmentsPage from './pages/admin/ConsignmentsPage';
import ValuationsPage from './pages/admin/ValuationsPage';
import LogisticsPage from './pages/admin/LogisticsPage';
import CustodyPage from './pages/admin/CustodyPage';
import StoragePage from './pages/admin/StoragePage';
import ReportsPage from './pages/admin/ReportsPage';
import AuditPage from './pages/admin/AuditPage';

// Staff Pages (will be created next)
import StaffDashboard from './pages/staff/StaffDashboard';
import ReceivingPage from './pages/staff/ReceivingPage';
import ValuationPage from './pages/staff/ValuationPage';
import StaffCustodyPage from './pages/staff/CustodyPage';
import StaffLogisticsPage from './pages/staff/LogisticsPage';
import DispatchPage from './pages/staff/DispatchPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Client Routes */}
          <Route
            path="/client/dashboard"
            element={
              <ProtectedRoute role="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/tracking-dashboard"
            element={
              <ProtectedRoute role="client">
                <AssetTrackingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/consignments"
            element={
              <ProtectedRoute role="client">
                <MyConsignments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/tracking"
            element={
              <ProtectedRoute role="client">
                <TrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/documents"
            element={
              <ProtectedRoute role="client">
                <DocumentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/notifications"
            element={
              <ProtectedRoute role="client">
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/profile"
            element={
              <ProtectedRoute role="client">
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/management"
            element={
              <ProtectedRoute role="admin">
                <AdminManagementDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tracking"
            element={
              <ProtectedRoute role="admin">
                <AssetTrackingDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute role="admin">
                <ClientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <ProtectedRoute role="admin">
                <StaffPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/consignments"
            element={
              <ProtectedRoute role="admin">
                <ConsignmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/edit-assets"
            element={
              <ProtectedRoute role="admin">
                <AdminEditAssetsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/valuations"
            element={
              <ProtectedRoute role="admin">
                <ValuationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/logistics"
            element={
              <ProtectedRoute role="admin">
                <LogisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/custody"
            element={
              <ProtectedRoute role="admin">
                <CustodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/storage"
            element={
              <ProtectedRoute role="admin">
                <StoragePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute role="admin">
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute role="admin">
                <AuditPage />
              </ProtectedRoute>
            }
          />

          {/* Staff Routes */}
          <Route
            path="/staff/dashboard"
            element={
              <ProtectedRoute role="staff">
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/receiving"
            element={
              <ProtectedRoute role="staff">
                <ReceivingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/valuation"
            element={
              <ProtectedRoute role="staff">
                <ValuationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/custody"
            element={
              <ProtectedRoute role="staff">
                <StaffCustodyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/logistics"
            element={
              <ProtectedRoute role="staff">
                <StaffLogisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/dispatch"
            element={
              <ProtectedRoute role="staff">
                <DispatchPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
