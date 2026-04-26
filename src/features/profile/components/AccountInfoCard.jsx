import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InfoRow from './InfoRow';

function AccountInfoCard({ profile, isAdmin, onEdit }) {
  return (
    <div className="bg-white rounded-xl border border-safe-border p-7">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-safe-text-dark">Account Information</h3>
            <p className="text-xs text-safe-text-gray mt-0.5">Editable only by Admin</p>
          </div>
          {isAdmin && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-3.5 py-2 bg-safe-blue-btn text-white text-xs font-medium rounded-lg hover:bg-safe-blue-btn/90 transition-colors"
            >
              <FontAwesomeIcon icon="pen-to-square" className="text-[10px]" />
              Edit
            </button>
          )}
        </div>
        <div className="border-b border-safe-border" />
      </div>

      <div className="space-y-4">
        <InfoRow icon="circle-user"   label="User ID"       value={profile.userId}     bold />
        <InfoRow icon="envelope"      label="Email Address"  value={profile.email}      bold />
        <InfoRow icon="id-badge"      label="National ID"    value={profile.nationalId} bold />
        <InfoRow icon="shield-halved" label="Role"           value={profile.role}       bold />
      </div>
    </div>
  );
}

export default AccountInfoCard;
