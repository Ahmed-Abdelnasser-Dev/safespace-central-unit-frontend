/**
 * Reusable Configuration Card Component
 * 
 * Container for form sections with title and fields
 * Used in NodeConfigTab and similar configuration screens
 * 
 * @component
 */

function ConfigCard({ 
  children,
  className = '' 
}) {
  return (
    <div className={`space-y-[12px] p-[12px] border border-safe-gray-light rounded-[8px] bg-safe-gray ${className}`}>
      {children}
    </div>
  );
}

export default ConfigCard;
