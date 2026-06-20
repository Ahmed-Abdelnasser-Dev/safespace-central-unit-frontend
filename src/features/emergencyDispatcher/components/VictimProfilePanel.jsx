import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-[11px] font-medium text-safe-text-muted/70 uppercase tracking-wide flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className={`text-sm text-white text-right ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function PillList({ items, variantClass }) {
  if (!items || items.length === 0)
    return <span className="text-xs text-safe-text-muted/60">None on file</span>;
  return (
    <div className="flex flex-wrap gap-1.5 mt-1.5">
      {items.map((item) => (
        <span key={item} className={`px-2 py-0.5 rounded-full text-xs font-medium ${variantClass}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function SectionHeader({ title, open, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between text-left py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-safe-blue/40 rounded"
      aria-expanded={open}
    >
      <span className="text-xs font-semibold text-safe-text-muted/70 uppercase tracking-wider">{title}</span>
      <FontAwesomeIcon
        icon={open ? 'chevron-up' : 'chevron-down'}
        className="text-safe-text-muted/50 text-[10px]"
      />
    </button>
  );
}

function calcAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function VictimProfilePanel({ victim, medicalProfile, emergencyContacts, loading = false }) {
  const [medicalOpen, setMedicalOpen] = useState(true);
  const [contactsOpen, setContactsOpen] = useState(true);

  if (!victim) {
    return (
      <div className="bg-safe-gray rounded-xl border border-white/8 p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Victim</h3>
        <p className={`text-sm text-safe-text-muted/60 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? 'Loading victim profile…' : 'No victim profile on file.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-safe-gray rounded-xl border border-white/8 divide-y divide-white/5">
      {/* Identification */}
      <div className="p-4 space-y-0.5">
        <h3 className="text-sm font-semibold text-white mb-3">Victim</h3>
        <InfoRow label="Name" value={victim.fullName} />
        <InfoRow label="National ID" value={victim.nationalId ?? '—'} mono />
        <InfoRow label="Age" value={calcAge(victim.dob) !== null ? `${calcAge(victim.dob)} yrs` : '—'} />
        <div className="flex items-start justify-between gap-4 py-2">
          <span className="text-[11px] font-medium text-safe-text-muted/70 uppercase tracking-wide flex-shrink-0 pt-0.5">Phone</span>
          {victim.phone ? (
            <a
              href={`tel:${victim.phone}`}
              className="text-sm text-safe-blue hover:text-safe-blue-light font-mono transition-colors"
            >
              {victim.phone}
            </a>
          ) : (
            <span className="text-sm text-safe-text-muted/60 italic">No phone on file</span>
          )}
        </div>
      </div>

      {/* Medical Profile */}
      <div className="p-4">
        <SectionHeader
          title="Medical Profile"
          open={medicalOpen}
          onToggle={() => setMedicalOpen((o) => !o)}
        />
        {medicalOpen && (
          <div className="mt-3">
            {medicalProfile ? (
              <div className="space-y-3">
                <InfoRow label="Blood Type" value={medicalProfile.bloodType ?? 'Unknown'} mono />
                <div>
                  <span className="text-[11px] font-medium text-safe-text-muted/60 uppercase tracking-wide">Conditions</span>
                  <PillList
                    items={medicalProfile.conditions}
                    variantClass="bg-safe-info/12 text-safe-info"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-safe-text-muted/60 uppercase tracking-wide">Medications</span>
                  <PillList
                    items={medicalProfile.medications}
                    variantClass="bg-white/8 text-white"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-safe-text-muted/60 uppercase tracking-wide">Allergies</span>
                  <PillList
                    items={medicalProfile.allergies}
                    variantClass="bg-safe-danger/12 text-safe-danger"
                  />
                </div>
                {medicalProfile.notes && (
                  <p className="text-sm text-safe-text-muted italic border-l-2 border-white/10 pl-3 mt-1">
                    {medicalProfile.notes}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-safe-text-muted/60 mt-2">No medical profile on file.</p>
            )}
          </div>
        )}
      </div>

      {/* Emergency Contacts */}
      <div className="p-4">
        <SectionHeader
          title="Emergency Contacts"
          open={contactsOpen}
          onToggle={() => setContactsOpen((o) => !o)}
        />
        {contactsOpen && (
          <div className="mt-3 space-y-2">
            {emergencyContacts && emergencyContacts.length > 0 ? (
              emergencyContacts.map((contact) => (
                <div
                  key={contact.phone}
                  className="flex items-center justify-between gap-3 py-2 px-3 rounded-lg bg-white/4 border border-white/6"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{contact.name}</p>
                    <p className="text-xs text-safe-text-muted/70">{contact.relationship}</p>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 text-safe-blue hover:text-safe-blue-light font-mono text-sm transition-colors"
                  >
                    <FontAwesomeIcon icon="phone" className="text-xs" />
                    {contact.phone}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-sm text-safe-text-muted/60">No emergency contacts on file.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VictimProfilePanel;
