import Checkbox from '@/components/ui/Checkbox.jsx';
import Badge from '@/components/ui/Badge.jsx';

/**
 * Card representing a suggested automated action.
 * @param {object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {boolean} props.selected
 * @param {function} props.onToggle
 * @param {string} props.badge - Source badge (e.g., 'AI', 'Decision')
 */
function ActionCard({ title, description, selected, onToggle, recommended = true, badge = null }) {
  return (
    <div 
      onClick={onToggle}
      className={`border rounded-lg p-4 flex gap-3.5 items-start transition-all cursor-pointer hover:shadow-md ${selected ? 'border-safe-blue-btn bg-safe-blue-btn/8 shadow-sm ring-1 ring-safe-blue-btn/20' : 'border-safe-border bg-white hover:border-safe-border/60'}`}
    >
      <Checkbox checked={selected} onChange={onToggle} className="mt-0.5 pointer-events-none" />
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <h4 className="text-base font-bold text-safe-text-dark">{title}</h4>
          <div className="flex gap-2 items-center">
            {badge && (
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                badge === 'AI' 
                  ? 'bg-blue-50 text-blue-700 border-blue-200' 
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {badge}
              </span>
            )}
            {recommended && (
              <span className="px-2 py-0.5 rounded bg-safe-success/15 text-safe-success text-[10px] font-bold uppercase tracking-wide border border-safe-success/20">
                Recommended
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-safe-text-gray leading-relaxed font-medium">{description}</p>
      </div>
    </div>
  );
}

export default ActionCard;
