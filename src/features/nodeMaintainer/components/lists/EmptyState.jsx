/**
 * Reusable Empty State Component
 * 
 * Displays icon, title, and message when no data available
 * Used for empty list states across tabs
 * 
 * @component
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { typography, fontFamily } from '../../styles/typography';

function EmptyState({ 
  icon, 
  title,
  message = '',
  className = '' 
}) {
  return (
    <div className={`text-center py-[32px]  ${className}`}>
      {icon && (
        <FontAwesomeIcon 
          icon={icon} 
          className="text-[#d0d5dd] mb-[12px] block " 
          style={{ width: '32px', height: '32px' }} 
        />
      )}
      <p className="text-[#6a7282]" style={{ ...typography.body, fontFamily }}>
        {title}
      </p>
      {message && (
        <p className="text-[#99a1af]" style={{ ...typography.caption, fontFamily }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default EmptyState;
