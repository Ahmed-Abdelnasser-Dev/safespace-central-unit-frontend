function SectionHeader({ title, showDivider = true, className = '' }) {
  return (
    <div
      className={`${
        showDivider ? 'mt-4 pt-4 border-t border-safe-gray-light' : 'mt-4'
      } ${className}`}
    >
      <h3 className="text-base font-bold text-safe-text-primary">{title}</h3>
    </div>
  );
}

export default SectionHeader;
