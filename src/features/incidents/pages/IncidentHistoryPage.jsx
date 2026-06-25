/**
 * IncidentHistoryPage — paginated, filterable list of past observer incidents.
 *
 * Reachable from: sidebar nav "Incident History" + notification panel "View all" link.
 * Roles: road_observer, admin.
 *
 * Gracefully degrades when the backend endpoint is not yet available:
 * shows an empty/error state rather than mock data.
 *
 * @module features/incidents/pages/IncidentHistoryPage
 */

import { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { observerAPI } from '@/services/api.js';
import AiAnalysisCard from '../components/cards/AiAnalysisCard.jsx';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'modified', label: 'Modified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'pending', label: 'Pending' },
];

const SEVERITY_OPTIONS = [
  { value: '', label: 'All Severity' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const STATUS_STYLE = {
  confirmed: { label: 'Confirmed', bg: 'bg-safe-green/15', text: 'text-safe-green' },
  modified:  { label: 'Modified',  bg: 'bg-safe-blue/15',  text: 'text-safe-blue' },
  rejected:  { label: 'Rejected',  bg: 'bg-safe-danger/15', text: 'text-safe-danger' },
  pending:   { label: 'Pending',   bg: 'bg-safe-accent/15', text: 'text-safe-accent' },
};

const SEVERITY_STYLE = {
  HIGH:   'text-safe-danger',
  MEDIUM: 'text-safe-accent',
  LOW:    'text-safe-info',
};

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterBar({ statusFilter, severityFilter, onStatusChange, onSeverityChange }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon="filter" className="text-safe-text-muted text-sm" />
        <span className="text-xs text-safe-text-muted">Filter:</span>
      </div>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-safe-gray border border-safe-gray-light text-safe-text-primary text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-safe-blue transition-colors"
      >
        {STATUS_FILTER_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        value={severityFilter}
        onChange={(e) => onSeverityChange(e.target.value)}
        className="bg-safe-gray border border-safe-gray-light text-safe-text-primary text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-safe-blue transition-colors"
      >
        {SEVERITY_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function IncidentRow({ incident, onSelect }) {
  const status = STATUS_STYLE[incident.status] ?? { label: incident.status, bg: 'bg-safe-gray-light/40', text: 'text-safe-text-muted' };
  return (
    <button
      type="button"
      onClick={() => onSelect(incident)}
      className="w-full flex items-center gap-4 px-5 py-3.5 border-b border-safe-gray-light hover:bg-safe-gray-light/30 transition-colors text-left"
    >
      {/* Status pill */}
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${status.bg} ${status.text}`}>
        {status.label}
      </span>

      {/* Node + incident type */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-safe-text-primary truncate">{incident.nodeLabel ?? incident.nodeId ?? 'Unknown node'}</p>
        <p className="text-[11px] text-safe-text-muted truncate">
          {incident.location?.address ?? 'Location unavailable'}
        </p>
      </div>

      {/* Severity */}
      <span className={`text-xs font-bold flex-shrink-0 ${SEVERITY_STYLE[incident.severity] ?? 'text-safe-text-muted'}`}>
        {incident.severity ?? '—'}
      </span>

      {/* AI confidence */}
      <span className="text-xs text-safe-text-muted flex-shrink-0 w-14 text-right">
        {incident.aiConfidence != null ? `${(incident.aiConfidence * 100).toFixed(0)}%` : '—'}
      </span>

      {/* Occurred at */}
      <span className="text-[11px] font-mono text-safe-text-muted/70 flex-shrink-0 w-28 text-right">
        {formatDate(incident.occurredAt)}
      </span>

      <FontAwesomeIcon icon="chevron-right" className="text-safe-text-muted/40 text-xs flex-shrink-0" />
    </button>
  );
}

function IncidentDetailModal({ incident, onClose }) {
  if (!incident) return null;
  const aiData = incident.ai ?? {};
  const status = STATUS_STYLE[incident.status] ?? { label: incident.status, bg: 'bg-safe-gray-light/40', text: 'text-safe-text-muted' };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-16 bottom-4 z-50 max-w-2xl mx-auto bg-safe-gray border border-safe-gray-light rounded-2xl flex flex-col shadow-xl overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-safe-gray-light flex-shrink-0">
          <div>
            <h2 className="font-display text-base font-semibold text-safe-text-primary">
              {incident.nodeLabel ?? incident.nodeId ?? 'Incident'}
            </h2>
            <p className="text-[11px] text-safe-text-muted mt-0.5">{formatDate(incident.occurredAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}>
              {status.label}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-safe-gray-light flex items-center justify-center text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/30 transition-colors"
              aria-label="Close"
            >
              <FontAwesomeIcon icon="xmark" className="text-sm" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-safe-sidebar rounded-lg p-3">
              <p className="text-[10px] text-safe-text-muted uppercase tracking-wider mb-1">Severity</p>
              <p className={`text-sm font-bold ${SEVERITY_STYLE[incident.severity] ?? 'text-safe-text-primary'}`}>
                {incident.severity ?? '—'}
              </p>
            </div>
            <div className="bg-safe-sidebar rounded-lg p-3">
              <p className="text-[10px] text-safe-text-muted uppercase tracking-wider mb-1">Reviewed at</p>
              <p className="text-sm font-medium text-safe-text-primary">{formatDate(incident.reviewedAt) ?? '—'}</p>
            </div>
            <div className="bg-safe-sidebar rounded-lg p-3">
              <p className="text-[10px] text-safe-text-muted uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm text-safe-text-primary">{incident.location?.address ?? '—'}</p>
            </div>
            <div className="bg-safe-sidebar rounded-lg p-3">
              <p className="text-[10px] text-safe-text-muted uppercase tracking-wider mb-1">AI Confidence</p>
              <p className="text-sm font-bold text-safe-text-primary">
                {incident.aiConfidence != null ? `${(incident.aiConfidence * 100).toFixed(0)}%` : '—'}
              </p>
            </div>
          </div>

          {/* AI Analysis (read-only) — reuses the existing card */}
          <AiAnalysisCard aiData={aiData} />

          {/* Decision details */}
          {incident.decision && (
            <div className="bg-safe-sidebar rounded-lg p-4">
              <p className="text-[10px] text-safe-text-muted uppercase tracking-wider mb-3">Final Decision</p>
              <pre className="text-xs text-safe-text-muted whitespace-pre-wrap break-words">
                {JSON.stringify(incident.decision, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function IncidentHistoryPage() {
  const [incidents, setIncidents] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedIncident, setSelectedIncident] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (severityFilter) params.severity = severityFilter;
      const result = await observerAPI.getIncidentHistory(params);
      setIncidents(result.incidents ?? []);
      setMeta(result.meta ?? { total: 0, page: 1, limit: 20, pages: 0 });
    } catch (err) {
      setError('Incident history is not yet available. The backend endpoint is pending implementation.');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [statusFilter, severityFilter]);

  return (
    <div className="min-h-full bg-safe-dark text-safe-text-primary">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Sub-header: description + total count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-safe-gray-light">
          <p className="text-sm text-safe-text-muted">
            Incidents reviewed and decisions made during your sessions
          </p>
          {meta.total > 0 && (
            <span className="text-xs text-safe-text-muted font-mono flex-shrink-0">
              {meta.total} total
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="mb-5">
          <FilterBar
            statusFilter={statusFilter}
            severityFilter={severityFilter}
            onStatusChange={setStatusFilter}
            onSeverityChange={setSeverityFilter}
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-safe-danger/10 border border-safe-danger/25 text-safe-danger text-sm mb-5">
            <FontAwesomeIcon icon="circle-exclamation" className="flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="bg-safe-gray border border-safe-gray-light rounded-xl overflow-hidden">
          {/* Column headers */}
          <div className="flex items-center gap-4 px-5 py-2.5 border-b border-safe-gray-light bg-safe-dark/30">
            <span className="text-[10px] font-bold text-safe-text-muted uppercase tracking-wider w-20 flex-shrink-0">Status</span>
            <span className="text-[10px] font-bold text-safe-text-muted uppercase tracking-wider flex-1">Node / Location</span>
            <span className="text-[10px] font-bold text-safe-text-muted uppercase tracking-wider w-16 flex-shrink-0">Severity</span>
            <span className="text-[10px] font-bold text-safe-text-muted uppercase tracking-wider w-14 flex-shrink-0 text-right">Confidence</span>
            <span className="text-[10px] font-bold text-safe-text-muted uppercase tracking-wider w-28 flex-shrink-0 text-right">Date</span>
            <span className="w-4 flex-shrink-0" />
          </div>

          {/* Loading skeletons */}
          {loading && (
            <div className="divide-y divide-safe-gray-light">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-4 w-20 bg-safe-gray-light/40 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-safe-gray-light/50 rounded animate-pulse" />
                    <div className="h-2.5 w-1/2 bg-safe-gray-light/40 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-10 bg-safe-gray-light/40 rounded animate-pulse" />
                  <div className="h-3 w-10 bg-safe-gray-light/40 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-safe-gray-light/40 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && incidents.length === 0 && (
            <div className="py-20 text-center">
              <FontAwesomeIcon icon="clipboard-list" className="text-safe-text-muted text-3xl mb-4" />
              <p className="text-sm text-safe-text-muted">No incidents recorded yet</p>
              <p className="text-[11px] text-safe-text-muted/60 mt-1">
                Incidents assigned and reviewed during your sessions will appear here
              </p>
            </div>
          )}

          {/* Incident rows */}
          {!loading && incidents.map((incident) => (
            <IncidentRow key={incident.id} incident={incident} onSelect={setSelectedIncident} />
          ))}
        </div>

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="flex items-center justify-between mt-5">
            <span className="text-xs text-safe-text-muted">
              Page {meta.page} of {meta.pages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 text-xs rounded-lg border border-safe-gray-light text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>
              <button
                type="button"
                disabled={page >= meta.pages}
                onClick={() => setPage((p) => Math.min(meta.pages, p + 1))}
                className="px-3 py-1.5 text-xs rounded-lg border border-safe-gray-light text-safe-text-muted hover:text-safe-text-primary hover:bg-safe-gray-light/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Incident detail modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  );
}
