/**
 * Simple card surface.
 */
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white border border-safe-border rounded-xl shadow-card ${className}`}>
      {children}
    </div>
  );
}

export default Card;
