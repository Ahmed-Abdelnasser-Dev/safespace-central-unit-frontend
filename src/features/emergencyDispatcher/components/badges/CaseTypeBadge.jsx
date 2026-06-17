import Badge from '@/components/ui/Badge';
import { getCaseTypeLabel } from '../../utils/caseFormatters';

/**
 * Case/incident type pill (e.g. "Road Accident", "Collision").
 *
 * Uses the <Badge> primitive rather than <Tag> — Tag's `default` variant
 * (`text-safe-text-dark`) assumes a light surface and is illegible on this
 * feature's dark `bg-safe-gray` cards; Badge's `neutral` variant
 * (`text-safe-text-gray`) is built for the dark canvas.
 */
function CaseTypeBadge({ caseRecord, className = '' }) {
  return (
    <Badge variant="neutral" className={className}>
      {getCaseTypeLabel(caseRecord)}
    </Badge>
  );
}

export default CaseTypeBadge;
