import Badge from '@/components/ui/Badge';
import { getUnitStatusStyle } from '../../utils/caseFormatters';

/**
 * Status pill for an emergency unit (available/en route/on scene/off duty).
 */
function UnitStatusBadge({ status, className = '' }) {
  const { variant, label } = getUnitStatusStyle(status);
  return <Badge variant={variant} className={className}>{label}</Badge>;
}

export default UnitStatusBadge;
