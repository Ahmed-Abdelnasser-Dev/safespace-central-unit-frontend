/**
 * DashboardPage — admin overview with real KPI data.
 *
 * Data sources:
 *   - users:   userAPI.listUsers({ limit: 1000 }) — total / active users
 *   - nodes:   state.nodes (Redux, refreshed by NodeHeartbeat hook on app level)
 *   - cameras: state.cameras (Redux, dispatched here)
 *
 * NOTE(Phase 5): When /dashboard/summary is available, replace per-source calls
 *   with a single summarised endpoint.  See docs/backend-integration-dashboard.md
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageActions from '@/components/ui/PageActions';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import ChartWrapper from '../components/ChartWrapper.jsx';
import { userAPI, alertsAPI } from '@/services/api';
import { onAlertNew, offAlertNew } from '@/services/socketService';
import { fetchNodes } from '@/features/nodeMaintainer/nodesSlice.js';
import { fetchCameras } from '@/features/cameras/cameraSlice.js';

// ── helpers ───────────────────────────────────────────────────────────────────

function formatPct(numerator, denominator) {
  if (!denominator) return '—';
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function ofLabel(num, total) {
  if (num == null || total == null) return null;
  return `${num} of ${total}`;
}

// ── component ─────────────────────────────────────────────────────────────────

function DashboardPage() {
  const dispatch = useDispatch();
  const { nodes } = useSelector((s) => s.nodes);
  // cameras might be null/non-array if the stream service returns unexpected data
  const cameras = useSelector((s) => Array.isArray(s.cameras.cameras) ? s.cameras.cameras : []);

  const [refreshKey, setRefreshKey] = useState(0);
  const [userStats, setUserStats] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const MAX_RECENT_ALERTS = 5;
  const alertsLoadedRef = useRef(false);

  // ── fetch users ─────────────────────────────────────────────────────────
  const fetchUserStats = useCallback(async () => {
    try {
      setUserLoading(true);
      const data = await userAPI.listUsers({ page: 1, limit: 1000 });
      const users = data.users || [];
      const uniqueRoles = [...new Set(users.map((u) => u.role?.name).filter(Boolean))];
      const ROLE_SHORT = {
        admin: 'admin',
        emergency_dispatcher: 'dispatcher',
        road_observer: 'observer',
        node_maintenance_crew: 'maintainer',
        data_analyst: 'analyst',
      };
      setUserStats({
        total: data.total ?? users.length,
        active: users.filter((u) => u.isActive).length,
        todayLogins: users.filter((u) => {
          if (!u.lastLoginAt) return false;
          return new Date(u.lastLoginAt).toDateString() === new Date().toDateString();
        }).length,
        roleCount: uniqueRoles.length,
        roleNames: uniqueRoles.map((r) => ROLE_SHORT[r] ?? r).join(' · '),
      });
    } catch (err) {
      console.error('Dashboard: failed to fetch users', err);
    } finally {
      setUserLoading(false);
    }
  }, []);

  // ── fetch nodes + cameras ─────────────────────────────────────────────
  const fetchInfrastructure = useCallback(async () => {
    try {
      await dispatch(fetchNodes());
    } catch (_) { /* handled in slice */ }
    try {
      await dispatch(fetchCameras());
    } catch (_) { /* handled in slice */ }
  }, [dispatch]);

  // ── fetch recent alerts ──────────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      const result = await alertsAPI.list({ limit: MAX_RECENT_ALERTS });
      setRecentAlerts(result.data ?? []);
      alertsLoadedRef.current = true;
    } catch (err) {
      console.error('Dashboard: failed to fetch alerts', err);
    }
  }, []);

  // initial + refresh
  useEffect(() => {
    fetchUserStats();
    fetchInfrastructure();
    fetchAlerts();
  }, [fetchUserStats, fetchInfrastructure, fetchAlerts]);

  // ── live alert socket subscription ────────────────────────────────────────
  useEffect(() => {
    const handleAlertNew = (alert) => {
      setRecentAlerts((prev) => {
        const updated = [alert, ...prev];
        return updated.slice(0, MAX_RECENT_ALERTS);
      });
    };

    onAlertNew(handleAlertNew);
    return () => offAlertNew(handleAlertNew);
  }, []);

  // ── derived values ────────────────────────────────────────────────────
  const nodesOnline  = nodes.filter((n) => n.status === 'online').length;
  const nodesOffline = nodes.length - nodesOnline;

  const camerasOnline  = cameras.filter((c) => c.status === 'ONLINE').length;
  const camerasOffline = cameras.length - camerasOnline;

  const loading = userLoading;

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
    fetchUserStats();
    fetchInfrastructure();
    fetchAlerts();
  };

  // ── KPI rows ──────────────────────────────────────────────────────────

  const primaryKPIs = [
    {
      id: 'total-users',
      icon: 'users',
      iconColor: 'text-safe-blue-btn',
      label: 'Total Users',
      value: loading ? '...' : String(userStats?.total ?? '—'),
      trend: loading ? null : `${userStats?.total ?? 0} registered`,
    },
    {
      id: 'active-users',
      icon: 'chart-line',
      iconColor: 'text-safe-green',
      label: 'Active Users',
      value: loading ? '...' : String(userStats?.active ?? '—'),
      trend: loading ? null : `${formatPct(userStats?.active, userStats?.total)} of total`,
    },
    {
      id: 'nodes-online',
      icon: 'server',
      iconColor: 'text-safe-blue-btn',
      label: 'Nodes Online',
      value: nodes.length === 0 ? '—' : String(nodesOnline),
      trend: ofLabel(nodesOnline, nodes.length),
    },
    {
      id: 'cameras-online',
      icon: 'video',
      iconColor: 'text-safe-teal',
      label: 'Cameras Online',
      value: cameras.length === 0 ? '—' : String(camerasOnline),
      trend: ofLabel(camerasOnline, cameras.length),
    },
  ];

  const secondaryKPIs = [
    {
      id: 'today-logins',
      icon: 'right-to-bracket',
      iconColor: 'text-safe-purple',
      label: "Today's Logins",
      value: loading ? '...' : String(userStats?.todayLogins ?? '—'),
      trend: 'operator sessions today',
    },
    {
      id: 'nodes-offline',
      icon: 'triangle-exclamation',
      iconColor: 'text-safe-danger',
      label: 'Nodes Offline',
      value: nodes.length === 0 ? '—' : String(nodesOffline),
      trend: nodesOffline > 0 ? 'require attention' : 'all nodes healthy',
    },
    {
      id: 'cameras-offline',
      icon: 'video-slash',
      iconColor: 'text-safe-orange',
      label: 'Cameras Offline',
      value: cameras.length === 0 ? '—' : String(camerasOffline),
      trend: camerasOffline > 0 ? 'require attention' : 'all feeds live',
    },
    {
      id: 'roles',
      icon: 'shield',
      iconColor: 'text-safe-accent',
      label: 'Operator Roles',
      value: loading ? '...' : String(userStats?.roleCount ?? '—'),
      trend: loading ? null : (userStats?.roleNames || 'loading…'),
    },
  ];

  // ── render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-safe-bg overflow-hidden">
      {/* Page actions → AppTopBar slot */}
      <PageActions>
        <span className="flex items-center gap-1.5 text-xs text-safe-success">
          <FontAwesomeIcon icon="circle" className="text-[8px]" />
          Live
        </span>
        <Button size="sm" variant="secondary" icon="rotate" onClick={handleRefresh}>
          Refresh
        </Button>
      </PageActions>

      {/* Scrollable content — full width, matches admin layout */}
      <div className="flex-1 overflow-y-auto mt-6 mx-7">

        {/* ── Primary KPIs ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-7 mb-7">
          {primaryKPIs.map((kpi) => (
            <StatCard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              icon={kpi.icon}
              iconColor={kpi.iconColor}
            />
          ))}
        </div>

        {/* ── Secondary KPIs ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-7 mb-7">
          {secondaryKPIs.map((kpi) => (
            <StatCard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              icon={kpi.icon}
              iconColor={kpi.iconColor}
            />
          ))}
        </div>

        {/* ── Charts + Alerts ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 mb-7">
          {/* User Activity chart — col-span 2 */}
          <div className="lg:col-span-2">
            <div className="bg-safe-sidebar rounded-xl p-6 border border-safe-border h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="text-sm font-semibold text-safe-text-gray">User Activity</div>
                <FontAwesomeIcon icon="chart-line" className="text-safe-blue-btn text-2xl px-2 py-1" />
              </div>
              {/* NOTE(Phase 5): Replace with live activity once /dashboard/summary available */}
              <ChartWrapper
                type="user_activity"
                refreshKey={refreshKey}
                emptyLabel="No user activity data in the last 24 hours"
              />
            </div>
          </div>

          {/* Recent Alerts — live from /api/alerts + alert:new socket */}
          <div className="bg-safe-sidebar rounded-xl p-6 border border-safe-border">
            <div className="flex items-start justify-between mb-3">
              <div className="text-sm font-semibold text-safe-text-gray">Recent Alerts</div>
              <FontAwesomeIcon icon="bell" className="text-safe-accent text-2xl px-2 py-1" />
            </div>
            <ul className="space-y-3 mt-2">
              {recentAlerts.length === 0 ? (
                <li className="text-xs text-safe-text-muted py-4 text-center">
                  {alertsLoadedRef.current ? 'No recent alerts' : 'Loading…'}
                </li>
              ) : (
                recentAlerts.map((alert) => {
                  const severityMeta = {
                    critical: { label: 'Critical', color: 'text-safe-danger' },
                    warning:  { label: 'Warning',  color: 'text-safe-orange' },
                    info:     { label: 'Info',     color: 'text-safe-info'   },
                  }[alert.severity] ?? { label: alert.severity, color: 'text-safe-text-muted' };

                  return (
                    <li
                      key={alert.id}
                      className="flex items-center justify-between gap-3 py-2 border-b border-safe-border last:border-0"
                    >
                      <span className="text-xs text-safe-text-primary truncate">{alert.title}</span>
                      <span className={`text-[10px] font-semibold whitespace-nowrap ${severityMeta.color}`}>
                        {severityMeta.label}
                      </span>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>

        {/* ── Alert Frequency chart ─────────────────────────────────── */}
        <div className="bg-safe-sidebar rounded-xl p-6 border border-safe-border mb-7">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm font-semibold text-safe-text-gray">Alert Frequency (24 h)</div>
            <FontAwesomeIcon icon="chart-bar" className="text-safe-blue-btn text-2xl px-2 py-1" />
          </div>
          {/* NOTE(Phase 5): Replace with live data once /dashboard/summary available */}
          <ChartWrapper
            type="alerts"
            refreshKey={refreshKey}
            emptyLabel="No alert data in the last 24 hours"
          />
        </div>

      </div>
    </div>
  );
}

export default DashboardPage;