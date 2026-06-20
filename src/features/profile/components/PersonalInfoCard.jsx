import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import InfoRow from './InfoRow';

function PersonalInfoCard({ profile, onEdit }) {
  return (
    <div className="bg-safe-sidebar rounded-xl border border-safe-gray-light p-7">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-safe-text-primary">Personal Information</h3>
            <p className="text-xs text-safe-text-muted mt-0.5">Editable by the User</p>
          </div>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3.5 py-2 bg-safe-blue-btn text-white text-xs font-medium rounded-lg hover:bg-safe-blue-btn/90 transition-colors"
          >
            <FontAwesomeIcon icon="pen-to-square" className="text-[10px]" />
            Edit
          </button>
        </div>
        <div className="border-b border-safe-gray-light" />
      </div>

      <div className="space-y-4">
        <InfoRow icon="circle-user"  label="Full Name"       value={profile.fullName}       bold />
        <InfoRow icon="circle-user"  label="Username"        value={profile.username}       bold />
        <InfoRow icon="phone"        label="Phone Number"    value={profile.phoneNumber}    bold />
        <InfoRow icon="cake-candles" label="Birth Date"      value={profile.birthDate}      bold />
        <InfoRow icon="venus-mars"   label="Gender"          value={profile.gender}         bold />
        <InfoRow icon="building"     label="Department"      value={profile.department}     bold />
        <InfoRow icon="map-pin"      label="Office Location" value={profile.officeLocation} bold />
        <InfoRow icon="location-dot" label="Address"         value={profile.address}        bold />
      </div>
    </div>
  );
}

export default PersonalInfoCard;
