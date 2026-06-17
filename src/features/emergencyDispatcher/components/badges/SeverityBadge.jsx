import Badge from '@/components/ui/Badge';
import { getSeverityStyle } from '../../utils/caseFormatters';

/**
 * Severity pill (HIGH/MEDIUM/LOW) — color always maps to a real severity
 * state, never decoration (DESIGN.md: The State, Not Decoration Rule).
 */
function SeverityBadge({ severity, className = '' }) {
  const { variant, label } = getSeverityStyle(severity);
  return <Badge variant={variant} className={className}>{label}</Badge>;
}

export default SeverityBadge;
