/**
 * AnalyticsReportsPage — /analytics/reports
 *
 * Simple report builder: pick type, date range, filters → preview table → export CSV or print.
 * FIX: endDate now converted to end-of-day so the full selected day is included.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { analyticsAPI } from '@/services/api';
import { API_URL } from '@/lib/apiConfig';
import ChartCard from '../components/ChartCard.jsx';

const REPORT_TYPES = [
  { value: 'incidents',   label: 'Incident Summary' },
  { value: 'node_health', label: 'Node Health Report' },
  { value: 'dispatch',    label: 'Dispatch Performance' },
];

function formatCell(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'number') return val;
  const asDate = new Date(val);
  if (typeof val === 'string' && val.includes('T') && !isNaN(asDate)) {
    return asDate.toLocaleString('en-EG', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
  return String(val);
}

// ── Preview Table ─────────────────────────────────────────────────────────────

function PreviewTable({ rows, loading }) {
  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 rounded-full border-2 border-safe-blue-btn border-t-transparent animate-spin" />
    </div>
  );
  if (!rows || rows.length === 0) return (
    <div className="text-center py-16 text-safe-text-muted text-sm">
      <FontAwesomeIcon icon="table" className="text-3xl mb-3 opacity-30 block mx-auto" />
      No data for selected filters
    </div>
  );

  const headers = Object.keys(Array.isArray(rows) ? rows[0] : rows.byType?.[0] ?? {});
  if (!headers.length) return <p className="text-center py-8 text-safe-text-muted text-sm">Non-tabular report type — use CSV export.</p>;
  const data = Array.isArray(rows) ? rows : [];

  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full text-xs print:text-[10px] print:border-collapse">
        <thead>
          <tr className="border-b border-safe-border print:border-gray-400 print:bg-gray-100">
            {headers.map((h) => (
              <th key={h} className="text-left pb-2 pt-1 pr-4 font-semibold text-safe-text-gray print:text-gray-700 uppercase tracking-wider print:px-2 print:py-1.5 print:border print:border-gray-300">{h.replace(/_/g, ' ')}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 50).map((row, i) => (
            <tr key={i} className={`border-b border-safe-border/40 hover:bg-safe-gray/20 print:border-gray-200 ${i % 2 === 0 ? 'print:bg-white' : 'print:bg-gray-50'}`}>
              {headers.map((h) => (
                <td key={h} className="py-2 pr-4 text-safe-text-primary print:text-gray-800 print:px-2 print:py-1.5 print:border print:border-gray-200">{formatCell(row[h])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 50 && (
        <p className="text-center text-safe-text-muted text-xs mt-3 print:text-gray-500 print:text-[9px]">Showing first 50 rows. Export CSV for full dataset.</p>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Convert a YYYY-MM-DD date string to an ISO timestamp.
 * endOfDay=true sets time to 23:59:59.999 so the full selected day is included.
 */
function toISO(dateStr, endOfDay = false) {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  if (isNaN(d)) return undefined;
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AnalyticsReportsPage() {
  const [reportType, setReportType] = useState('incidents');
  const [startDate, setStartDate]   = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Inject print-specific CSS once on mount
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'report-print-styles';
    style.textContent = `
      @media print {
        @page { margin: 1.2cm 1.5cm; size: A4 landscape; }

        /* Hide sidebar, topbar, filter panel */
        aside,
        nav,
        [class*="print:hidden"] { display: none !important; }

        /* Break the app's flex+overflow-hidden shell so the print engine
           sees full document height instead of the clipped scroll viewport */
        body,
        #root,
        #root > div,
        #root > div > div {
          display: block !important;
          height: auto !important;
          overflow: visible !important;
        }

        /* main is overflow-auto + flex-1 which clips content at viewport height */
        main {
          overflow: visible !important;
          height: auto !important;
          flex: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById('report-print-styles')?.remove(); };
  }, []);

  const fetchPreview = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyticsAPI.getReport({
        reportType,
        // FIX: convert date-only strings to proper ISO timestamps
        // start = midnight on start date, end = 23:59:59 on end date
        start: toISO(startDate, false),
        end:   toISO(endDate,   true),
      });
      setPreview(data);
    } catch {
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [reportType, startDate, endDate]);

  // Auto-fetch on filter change (debounced 400 ms)
  useEffect(() => {
    const timer = setTimeout(fetchPreview, 400);
    return () => clearTimeout(timer);
  }, [fetchPreview]);

  function handleDownloadCsv() {
    const params = new URLSearchParams({
      format: 'csv',
      reportType,
      ...(startDate && { start: toISO(startDate, false) }),
      ...(endDate   && { end:   toISO(endDate,   true) }),
    });
    const url = `${API_URL}/analytics/report?${params.toString()}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${startDate}-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handlePrint() { window.print(); }

  const selectedType = REPORT_TYPES.find((r) => r.value === reportType)?.label;

  const printedAt = new Date().toLocaleString('en-EG', { dateStyle: 'long', timeStyle: 'short' });

  return (
    <div className="p-6 space-y-6 print:p-0">
      {/* ── Print-only header (hidden on screen) ─────────────────────────── */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-300">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">SafeSpace Analytics</h1>
            <h2 className="text-lg text-gray-700 mt-0.5">{selectedType}</h2>
            <p className="text-sm text-gray-500 mt-1">Period: {startDate} → {endDate}</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Printed: {printedAt}</p>
            <p>Ismailia Ring Road Monitoring System</p>
          </div>
        </div>
      </div>
      {/* Header */}
      <div className="print:hidden flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-safe-text-primary">Reports</h1>
          <p className="text-safe-text-muted text-sm mt-0.5">Build, preview, and export analytics reports</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-safe-blue-btn text-white text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <FontAwesomeIcon icon="download" />
            Download CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-safe-sidebar border border-safe-border text-safe-text-primary text-sm font-medium hover:bg-safe-gray/40 transition-colors"
          >
            <FontAwesomeIcon icon="print" />
            Print / PDF
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <ChartCard
        className="print:hidden"
        title="Report Builder"
        info="Select a report type and date range. The preview updates automatically. Click 'Download CSV' for the full dataset."
      >
        <div className="grid grid-cols-3 gap-4">
          {/* Report type */}
          <div>
            <label className="block text-xs text-safe-text-muted mb-1.5 font-medium">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-safe-gray/40 border border-safe-border rounded-lg px-3 py-2 text-sm text-safe-text-primary focus:outline-none focus:border-safe-blue-btn"
            >
              {REPORT_TYPES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Date range — FIX: both inputs now properly contribute to filtering */}
          <div>
            <label className="block text-xs text-safe-text-muted mb-1.5 font-medium">From (inclusive)</label>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-safe-gray/40 border border-safe-border rounded-lg px-3 py-2 text-sm text-safe-text-primary focus:outline-none focus:border-safe-blue-btn"
            />
          </div>
          <div>
            <label className="block text-xs text-safe-text-muted mb-1.5 font-medium">To (inclusive)</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-safe-gray/40 border border-safe-border rounded-lg px-3 py-2 text-sm text-safe-text-primary focus:outline-none focus:border-safe-blue-btn"
            />
          </div>
        </div>
      </ChartCard>

      {/* Preview */}
      <ChartCard
        title={`Preview — ${selectedType}`}
        info="Shows up to 50 rows. Download CSV to get the full dataset. Date range is inclusive on both ends."
        className="print:border-0 print:rounded-none print:p-0"
      >
        <div className="flex items-center justify-between mb-4 print:mb-2">
          <span className="text-xs text-safe-text-muted">
            {startDate} → {endDate}
          </span>
        </div>
        <PreviewTable rows={preview} loading={loading} />
      </ChartCard>
      {/* Print footer */}
      <div className="hidden print:flex mt-8 pt-3 border-t border-gray-300 items-center justify-between text-[9px] text-gray-400">
        <span>SafeSpace — Ismailia Ring Road Monitoring · Confidential</span>
        <span>{printedAt}</span>
      </div>
    </div>
  );
}