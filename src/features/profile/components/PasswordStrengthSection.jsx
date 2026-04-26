import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function PasswordRequirement({ met, text }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <FontAwesomeIcon
        icon={met ? 'check-circle' : 'circle'}
        className={`text-xs ${met ? 'text-safe-green' : 'text-safe-text-gray'}`}
      />
      <span className={met ? 'text-safe-green' : 'text-safe-text-gray'}>{text}</span>
    </li>
  );
}

/**
 * Password strength bar + requirements checklist
 */
export default function PasswordStrengthSection({ password, strength }) {
  return (
    <>
      {password && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-safe-text-gray">Password Strength:</span>
            <span className={`text-xs font-medium ${strength.color}`}>
              {strength.label}
            </span>
          </div>
          <div className="h-1.5 bg-safe-border rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                strength.strength === 100 ? 'bg-safe-green' :
                strength.strength >= 60 ? 'bg-yellow-500' : 'bg-safe-danger'
              }`}
              style={{ width: `${strength.strength}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-2 p-3 bg-safe-bg rounded-lg">
        <p className="text-xs font-medium text-safe-text-dark mb-2">Password must contain:</p>
        <ul className="space-y-1">
          <PasswordRequirement met={password.length >= 8} text="At least 8 characters" />
          <PasswordRequirement met={/[A-Z]/.test(password)} text="One uppercase letter" />
          <PasswordRequirement met={/[a-z]/.test(password)} text="One lowercase letter" />
          <PasswordRequirement met={/[0-9]/.test(password)} text="One number" />
          <PasswordRequirement met={/[!@#$%^&*]/.test(password)} text="One special character (!@#$%^&*)" />
        </ul>
      </div>
    </>
  );
}
