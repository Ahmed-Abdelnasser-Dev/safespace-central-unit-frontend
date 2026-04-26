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
    <div className={`space-y-[12px] p-[12px] border border-[#e5e7eb] rounded-[8px] bg-[#f7f8f9] ${className}`}>
      {children}
    </div>
  );
}

export default ConfigCard;
