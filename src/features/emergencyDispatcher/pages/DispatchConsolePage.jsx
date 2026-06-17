import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDispatcherData } from '../hooks/useDispatcherData';
import CommandBar from '../components/console/CommandBar';
import QueuePanel from '../components/console/QueuePanel';
import ConsoleMap from '../components/console/ConsoleMap';
import UnitsRosterPanel from '../components/console/UnitsRosterPanel';
import NewAssignmentModal from '../components/NewAssignmentModal';

const ACTIVE_STATUSES = ['queued', 'acknowledged', 'active', 'escalated'];
const SEVERITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function sortActiveCases(cases) {
  return cases
    .filter((c) => ACTIVE_STATUSES.includes(c.status))
    .sort((a, b) => {
      const sev = (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3);
      return sev !== 0 ? sev : Date.parse(b.receivedAt) - Date.parse(a.receivedAt);
    });
}

export default function DispatchConsolePage() {
  const navigate = useNavigate();
  const {
    cases,
    units,
    allAssignments,
    assignedToMe,
    pendingAssignment,
    dismissAssignment,
  } = useDispatcherData();

  const [activeTab, setActiveTab] = useState('sos');
  const [mapHighlightedCaseId, setMapHighlightedCaseId] = useState(null);
  const [keyboardFocusId, setKeyboardFocusId] = useState(null);
  const [rosterOpen, setRosterOpen] = useState(false);

  // Keyboard navigation list (current tab's active cases, sorted)
  const keyboardList = useMemo(
    () => sortActiveCases(cases).filter((c) => c.caseType === activeTab),
    [cases, activeTab]
  );

  const pendingCase = pendingAssignment
    ? cases.find((c) => c.id === pendingAssignment.caseId) ?? null
    : null;

  // Global keyboard handler for the console
  useEffect(() => {
    function onKeyDown(e) {
      // Don't steal input focus
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.key === '1') { setActiveTab('sos'); return; }
      if (e.key === '2') { setActiveTab('incident'); return; }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (keyboardList.length === 0) return;
        const currentIdx = keyboardFocusId ? keyboardList.findIndex((c) => c.id === keyboardFocusId) : -1;
        const nextIdx = e.key === 'ArrowDown'
          ? Math.min(currentIdx + 1, keyboardList.length - 1)
          : Math.max(currentIdx - 1, 0);
        const nextCase = keyboardList[nextIdx];
        setKeyboardFocusId(nextCase.id);
        setMapHighlightedCaseId(nextCase.id);
        return;
      }

      if (e.key === 'Enter' && keyboardFocusId) {
        const focused = cases.find((c) => c.id === keyboardFocusId);
        if (focused) navigate(`/cases/${focused.caseType}/${focused.id}`);
        return;
      }

      if (e.key === 'Escape') {
        setKeyboardFocusId(null);
        setMapHighlightedCaseId(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [keyboardList, keyboardFocusId, cases, navigate]);

  const handleMapHighlight = useCallback((caseId) => {
    setMapHighlightedCaseId(caseId);
  }, []);

  const handleUnitCenter = useCallback(() => {
    // Map handles centering internally on unit click — just close roster on mobile
    setRosterOpen(false);
  }, []);

  const activeCaseCount = useMemo(
    () => cases.filter((c) => ACTIVE_STATUSES.includes(c.status)).length,
    [cases]
  );
  const availableUnitCount = useMemo(
    () => units.filter((u) => u.status === 'available').length,
    [units]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-safe-dark">
      {/* Top command bar */}
      <CommandBar activeCaseCount={activeCaseCount} availableUnitCount={availableUnitCount} />

      {/* Three-zone console grid */}
      <div className="flex-1 overflow-hidden flex flex-col xl:grid xl:grid-cols-[minmax(300px,360px)_1fr_minmax(300px,360px)]">

        {/* ── LEFT: Queue panel ── */}
        <div className="order-2 xl:order-1 xl:flex xl:flex-col xl:overflow-hidden xl:border-r xl:border-white/8">
          <div className="xl:hidden flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-white/8 bg-safe-gray">
            <FontAwesomeIcon icon="headset" className="text-safe-text-muted text-xs" />
            <span className="text-xs font-semibold text-white">Case Queue</span>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setRosterOpen((p) => !p)}
              className="flex items-center gap-1.5 text-xs text-safe-text-muted hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-safe-blue/40 rounded"
            >
              <FontAwesomeIcon icon="users" className="text-xs" />
              Units
              <FontAwesomeIcon icon={rosterOpen ? 'chevron-up' : 'chevron-down'} className="text-[10px]" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <QueuePanel
              cases={cases}
              assignedToMe={assignedToMe}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              mapHighlightedCaseId={mapHighlightedCaseId}
              keyboardFocusId={keyboardFocusId}
              onMapHighlight={handleMapHighlight}
            />
          </div>
        </div>

        {/* ── CENTER: Live map ── */}
        <div className="order-1 xl:order-2 h-[44vh] xl:h-full xl:border-x xl:border-white/8">
          <ConsoleMap
            cases={cases}
            units={units}
            allAssignments={allAssignments ?? []}
            selectedCaseId={null}
            mapHighlightedCaseId={mapHighlightedCaseId}
            onSelectCase={handleMapHighlight}
            onSelectUnit={handleUnitCenter}
          />
        </div>

        {/* ── RIGHT: Units roster (xl always visible, below xl: toggleable drawer) ── */}
        <div
          className={`order-3 xl:order-3 xl:flex xl:flex-col xl:overflow-hidden xl:border-l xl:border-white/8 ${
            rosterOpen ? 'flex flex-col h-60 border-t border-white/8' : 'hidden xl:flex'
          }`}
        >
          <UnitsRosterPanel units={units} onCenterOnUnit={handleUnitCenter} />
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="hidden xl:flex flex-shrink-0 px-5 py-1.5 bg-safe-sidebar/40 border-t border-white/6 items-center gap-4">
        <span className="text-[10px] text-safe-text-muted/50">Shortcuts:</span>
        {[
          ['↑↓', 'Navigate queue'],
          ['Enter', 'Open case'],
          ['1', 'SOS tab'],
          ['2', 'Incidents tab'],
          ['Esc', 'Clear selection'],
        ].map(([key, label]) => (
          <span key={key} className="flex items-center gap-1 text-[10px] text-safe-text-muted/55">
            <kbd className="px-1 py-0.5 bg-white/8 rounded text-[9px] font-mono text-safe-text-muted/70 border border-white/10">{key}</kbd>
            {label}
          </span>
        ))}
      </div>

      {/* New-assignment alert modal */}
      <NewAssignmentModal caseRecord={pendingCase} onDismiss={dismissAssignment} />
    </div>
  );
}
