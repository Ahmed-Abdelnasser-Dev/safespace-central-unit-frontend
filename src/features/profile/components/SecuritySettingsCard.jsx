import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function SecuritySettingsCard({ onChangePassword, onLogout }) {
  return (
    <div className="bg-white rounded-xl border border-safe-border p-7">
      <h3 className="text-base font-bold text-safe-text-dark mb-4">Security & Settings</h3>
      <div className="border-b border-safe-border mb-5" />

      <div className="space-y-3">
        {/* Change Password */}
        <button
          onClick={onChangePassword}
          className="w-full flex items-center gap-4 p-4 border bg-safe-bg rounded-lg hover:bg-safe-bg transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-safe-white text-safe-blue-btn flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon="lock" className="text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-safe-text-dark">Change Password</p>
            <p className="text-xs text-safe-text-gray mt-0.5">Update your account password</p>
          </div>
          <FontAwesomeIcon icon="chevron-right" className="text-safe-text-gray text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-4 p-4 border border-safe-danger/30 rounded-lg hover:bg-safe-danger/5 transition-colors text-left group"
        >
          <div className="w-9 h-9 rounded-lg bg-safe-danger/10 text-safe-danger flex items-center justify-center flex-shrink-0">
            <FontAwesomeIcon icon="arrow-right-from-bracket" className="text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-safe-danger">Logout</p>
            <p className="text-xs text-safe-text-gray mt-0.5">Sign out of your account</p>
          </div>
          <FontAwesomeIcon icon="chevron-right" className="text-safe-danger text-xs ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    </div>
  );
}

export default SecuritySettingsCard;
