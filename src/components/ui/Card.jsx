/**
 * Simple card surface with refined styling.
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {string} [props.variant] - 'default' | 'elevated' | 'flat'
 */
function Card({ children, className = '', variant = 'default' }) {
  const variants = {
    default: 'bg-white border border-safe-border/50 rounded-xl shadow-card hover:shadow-lg transition-shadow duration-200',
    elevated: 'bg-white border border-safe-border/30 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200',
    flat: 'bg-safe-bg border border-transparent rounded-xl'
  };

  return (
    <div className={`${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}

export default Card;
