/**
 * Safe Space Monitoring Dashboard - Main Application Component
 *
 * Root routing with:
 * - React.lazy code splitting for all pages
 * - AppLayout wrapper providing role-based sidebar
 * - RoleRedirect for default landing per role
 * - ProtectedRoute with allowedRoles per route
 *
 * @module App
 */

import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import { getDefaultPath } from './config/navigation';
import { useNodeHeartbeat } from './hooks/useNodeHeartbeat';
import { useHeartbeatTimeout } from './hooks/useHeartbeatTimeout';
import { fetchCurrentUser } from './features/auth/authSlice';

// -- Lazy-loaded pages --------------------------------------------------------
const MapOverviewPage = lazy(() => import('./features/map/pages/MapOverviewPage.jsx'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage.jsx'));
const UserManagementPage = lazy(() => import('./features/admin/pages/UserManagementPage.jsx'));
const ActivityLogsPage = lazy(() => import('./features/admin/pages/ActivityLogsPage.jsx'));
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage.jsx'));
const NodeMaintainerPage = lazy(() => import('./features/nodeMaintainer/pages/NodeMaintainerPage.jsx'));
const SystemTestPage = lazy(() => import('./features/systemTest/pages/SystemTestPage.jsx'));

// Auth pages
const SignInPage = lazy(() => import('./features/auth/pages/SignInPage.jsx'));
const TwoFactorAuthPage = lazy(() => import('./features/auth/pages/TwoFactorAuthPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./features/auth/pages/ForgotPasswordPage.jsx'));
const CheckYourEmailPage = lazy(() => import('./features/auth/pages/CheckYourEmailPage.jsx'));
const ResetPasswordPage = lazy(() => import('./features/auth/pages/ResetPasswordPage.jsx'));
const YouAreAllSetPage = lazy(() => import('./features/auth/pages/YouAreAllSetPage.jsx'));

// Placeholder pages
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage.jsx'));
const AlertsPage = lazy(() => import('./features/alerts/pages/AlertsPage.jsx'));
const ReportsPage = lazy(() => import('./features/reports/pages/ReportsPage.jsx'));
const MessagesPage = lazy(() => import('./features/messages/pages/MessagesPage.jsx'));
const CameraFeedsPage = lazy(() => import('./features/cameras/pages/CameraFeedsPage.jsx'));

// -- Loading fallback ---------------------------------------------------------
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-safe-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-safe-blue mx-auto mb-3" />
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// -- Role-based redirect ------------------------------------------------------
function RoleRedirect() {
  const { user } = useSelector((state) => state.auth);
  const defaultPath = getDefaultPath(user?.role?.name);
  return <Navigate to={defaultPath} replace />;
}

// -- App ----------------------------------------------------------------------
const ALL_ROLES = ['admin', 'emergency_dispatcher', 'road_observer', 'node_maintenance_crew'];

function App() {
  useNodeHeartbeat();
  useHeartbeatTimeout();

  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  // On every page load/refresh, silently re-validate the session cookie.
  // If the cookie is still valid, this refreshes the user object in Redux.
  // If not, fetchCurrentUser.rejected clears isAuthenticated → redirect to /sign-in.
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCurrentUser());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Auth routes (no layout) ──────────────────────────── */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/two-factor" element={<TwoFactorAuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/check-email" element={<CheckYourEmailPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/all-set" element={<YouAreAllSetPage />} />

          {/* ── Authenticated routes (with AppLayout) ────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect based on role */}
            <Route
              index
              element={isAuthenticated ? <RoleRedirect /> : <Navigate to="/sign-in" replace />}
            />

            {/* Map — all roles */}
            <Route
              path="map"
              element={
                <ProtectedRoute allowedRoles={ALL_ROLES}>
                  <MapOverviewPage />
                </ProtectedRoute>
              }
            />

            {/* Dashboard — admin + dispatcher */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin', 'emergency_dispatcher']}>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Admin pages */}
            <Route
              path="user-management"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="activity-logs"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ActivityLogsPage />
                </ProtectedRoute>
              }
            />

            {/* Node Maintainer */}
            <Route
              path="node-maintainer"
              element={
                <ProtectedRoute allowedRoles={['admin', 'node_maintenance_crew']}>
                  <NodeMaintainerPage />
                </ProtectedRoute>
              }
            />

            {/* Profile — all roles */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* System Test — admin only */}
            <Route
              path="system-test"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SystemTestPage />
                </ProtectedRoute>
              }
            />

            {/* ── Placeholder pages ────────────────────────────── */}
            <Route
              path="settings"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="alerts"
              element={
                <ProtectedRoute allowedRoles={['admin', 'emergency_dispatcher']}>
                  <AlertsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'road_observer']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages"
              element={
                <ProtectedRoute allowedRoles={['admin', 'emergency_dispatcher']}>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="cameras"
              element={
                <ProtectedRoute allowedRoles={ALL_ROLES}>
                  <CameraFeedsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* ── Fallback ──────────────────────────────────────── */}
          <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/sign-in'} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;