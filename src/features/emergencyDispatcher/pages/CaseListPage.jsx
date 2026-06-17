import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '@/components/layout/PageHeader';
import CaseListTabs from '../components/CaseListTabs';
import CaseCard from '../components/CaseCard';
import { useDispatcherData } from '../hooks/useDispatcherData';

function CaseListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-safe-gray rounded-xl border border-safe-gray-light p-4 animate-pulse">
          <div className="h-4 w-32 bg-safe-gray-light rounded mb-3" />
          <div className="h-3 w-48 bg-safe-gray-light rounded mb-2" />
          <div className="h-3 w-64 bg-safe-gray-light rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ tabLabel }) {
  return (
    <div className="bg-safe-gray rounded-xl border border-safe-gray-light p-10 text-center">
      <FontAwesomeIcon icon="circle-check" className="text-3xl text-safe-success/70 mb-3" />
      <p className="text-white font-semibold">No active {tabLabel} right now</p>
      <p className="text-sm text-safe-text-gray mt-1">
        New {tabLabel.toLowerCase()} will appear here the moment they come in.
      </p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="bg-safe-gray rounded-xl border border-safe-danger/40 p-10 text-center">
      <FontAwesomeIcon icon="triangle-exclamation" className="text-3xl text-safe-danger mb-3" />
      <p className="text-white font-semibold">Couldn't load cases</p>
      <p className="text-sm text-safe-text-gray mt-1">{message}</p>
    </div>
  );
}

function CaseListPage() {
  const navigate = useNavigate();
  const { cases, loading, error } = useDispatcherData();
  const [activeTab, setActiveTab] = useState('sos');

  const visibleCases = useMemo(
    () =>
      cases
        .filter((caseRecord) => caseRecord.caseType === activeTab)
        .sort((a, b) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt)),
    [cases, activeTab]
  );

  const unreadCounts = useMemo(
    () => ({
      sos: cases.filter((c) => c.caseType === 'sos' && c.isUnread).length,
      incident: cases.filter((c) => c.caseType === 'incident' && c.isUnread).length,
    }),
    [cases]
  );

  function handleOpen(caseRecord) {
    navigate(`/cases/${caseRecord.caseType}/${caseRecord.id}`);
  }

  const tabLabel = activeTab === 'sos' ? 'SOS Cases' : 'Incidents';

  return (
    <div className="p-6 lg:p-8">
      <PageHeader
        title="Cases"
        description="Triage incoming SOS requests and detected incidents, then dispatch the nearest emergency units."
        icon="headset"
      />

      <CaseListTabs activeTab={activeTab} onChange={setActiveTab} unreadCounts={unreadCounts} />

      <div className="mt-4">
        {loading && <CaseListSkeleton />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && visibleCases.length === 0 && <EmptyState tabLabel={tabLabel} />}
        {!loading && !error && visibleCases.length > 0 && (
          <div className="space-y-3">
            {visibleCases.map((caseRecord, index) => (
              <div
                key={caseRecord.id}
                className="animate-slideUp motion-reduce:animate-none"
                style={{ animationDelay: `${Math.min(index, 4) * 60}ms` }}
              >
                <CaseCard caseRecord={caseRecord} onOpen={handleOpen} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CaseListPage;
