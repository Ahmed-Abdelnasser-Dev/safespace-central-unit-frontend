/**
 * Card — the single card surface for the entire app.
 *
 * Variants:
 *   default  — bg-safe-sidebar + shadow-card + border (standard content card)
 *   elevated — stronger shadow, same surface (modals, emphasis)
 *   subtle   — bg-safe-gray, lighter (nested / secondary panels)
 *   ghost    — transparent, no border (layout grouping only)
 *
 * Padding:
 *   none     — no internal padding (caller adds className padding as needed)
 *   sm       — p-4 (16px, compact)
 *   md       — p-6 (24px, standard) ← default for new code
 *   lg       — p-8 (32px, roomy)
 *
 * Interactive:
 *   Set interactive={true} for clickable cards (adds hover/focus styles).
 *
 * Backward compat: padding defaults to 'none' so existing callers
 * that pass padding via className continue to work unchanged.
 */
function Card({
  children,
  className = '',
  padding = 'none',
  variant = 'default',
  interactive = false,
  as: Tag = 'div',
  onClick,
  tabIndex,
}) {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const variants = {
    default:  'bg-safe-sidebar border border-safe-border shadow-card',
    elevated: 'bg-safe-sidebar border border-safe-border shadow-lg',
    subtle:   'bg-safe-gray border border-safe-border shadow-sm',
    ghost:    '',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-safe-text-muted/30 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-safe-blue-btn/40 active:translate-y-0 active:shadow-card'
    : '';

  return (
    <Tag
      className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${interactiveClasses} ${className}`}
      onClick={onClick}
      tabIndex={interactive ? (tabIndex ?? 0) : tabIndex}
    >
      {children}
    </Tag>
  );
}

export default Card;
