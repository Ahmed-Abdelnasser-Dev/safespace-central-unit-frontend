import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { activityLogsAPI } from '@/services/api';
import UsersTable from '@/components/ui/UsersTable';

/**
 * Activity Logs Table
 * Displays real audit log data from the backend
 */
function ActivityLogsTable() {
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    eventType: undefined,
    success: undefined,
  });
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        page:  filters.page,
        limit: filters.limit,
        ...(filters.eventType !== undefined && { eventType: filters.eventType }),
        ...(filters.success   !== undefined && { success:   filters.success }),
      };
      const data = await activityLogsAPI.getLogs(params);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'timestamp', label: 'Timestamp',  sortable: true  },
    { key: 'user',      label: 'User',        sortable: true  },
    { key: 'eventType', label: 'Event',       sortable: true  },
    { key: 'action',    label: 'Action',      sortable: true  },
    { key: 'details',   label: 'Details',     sortable: false },
    { key: 'ip',        label: 'IP Address',  sortable: false },
  ];

  // Map eventType → badge style
  const getBadgeStyle = (eventType, success) => {
    if (success === false || eventType?.includes('failure') || eventType?.includes('locked')) {
      return 'text-safe-danger bg-safe-danger/10';
    }
    if (eventType === 'auth_success' || eventType === 'password_change') {
      return 'text-safe-blue-btn bg-safe-blue-btn/10';
    }
    if (eventType === 'auth_partial') {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-safe-text-gray bg-safe-text-gray/10';
  };

  // Human-readable event type label
  const getEventLabel = (eventType) => {
    const labels = {
      auth_success:    'Login',
      auth_failure:    'Login Failed',
      auth_partial:    'MFA Required',
      account_locked:  'Account Locked',
      password_change: 'Password Changed',
    };
    return labels[eventType] || eventType?.replace(/_/g, ' ') || '—';
  };

  // Build details string from available fields
  const buildDetails = (log) => {
    const parts = [];
    if (log.resource) parts.push(`Resource: ${log.resource}`);
    if (log.failureReason) parts.push(`Reason: ${log.failureReason.replace(/_/g, ' ')}`);
    if (log.role) parts.push(`Role: ${log.role.replace(/_/g, ' ')}`);
    return parts.join(' • ') || '—';
  };

  const renderCell = (log, column) => {
    switch (column.key) {
      case 'timestamp':
        return (
          <span className="text-xs font-mono text-safe-text-gray whitespace-nowrap">
            {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
          </span>
        );

      case 'user':
        return (
          <div>
            <p className="text-sm font-medium text-safe-text-dark">
              {log.user?.fullName || log.user?.email || 'Anonymous'}
            </p>
            {log.user?.email && log.user?.fullName && (
              <p className="text-xs text-safe-text-gray">{log.user.email}</p>
            )}
          </div>
        );

      case 'eventType':
        return (
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md ${getBadgeStyle(log.eventType, log.success)}`}>
            {getEventLabel(log.eventType)}
          </span>
        );

      case 'action':
        return (
          <span className="text-sm text-safe-text-dark capitalize">
            {log.action?.replace(/_/g, ' ') || '—'}
          </span>
        );

      case 'details':
        return (
          <span className="text-xs text-safe-text-gray max-w-xs block truncate" title={buildDetails(log)}>
            {buildDetails(log)}
          </span>
        );

      case 'ip':
        return (
          <code className="text-xs font-mono text-safe-text-gray">
            {log.ipAddress || '—'}
          </code>
        );

      default:
        return log[column.key];
    }
  };

  if (loading) {
    return (
      <div className="mt-6 bg-white rounded-xl border border-safe-border p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-safe-blue-btn mx-auto mb-3"></div>
          <p className="text-safe-text-gray text-sm">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <UsersTable
        columns={columns}
        data={logs}
        renderCell={renderCell}
      />
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-safe-text-gray">
            Showing {((filters.page - 1) * filters.limit) + 1}–{Math.min(filters.page * filters.limit, total)} of {total} logs
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
              className="px-3 py-1.5 text-xs font-medium border border-safe-border rounded-lg disabled:opacity-40 hover:bg-safe-bg transition-colors"
            >
              Previous
            </button>
            <span className="text-xs text-safe-text-gray">Page {filters.page} of {totalPages}</span>
            <button
              disabled={filters.page >= totalPages}
              onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
              className="px-3 py-1.5 text-xs font-medium border border-safe-border rounded-lg disabled:opacity-40 hover:bg-safe-bg transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityLogsTable;
