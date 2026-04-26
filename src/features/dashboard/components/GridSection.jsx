function GridSection({ columns = 'grid-cols-12', children, className = '' }) {
  return (
    <div className={`grid ${columns} gap-6 ${className}`}>{children}</div>
  );
}

export default GridSection;
