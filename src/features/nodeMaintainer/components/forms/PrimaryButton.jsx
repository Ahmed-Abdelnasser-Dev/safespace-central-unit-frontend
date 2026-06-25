import Button from '@/components/ui/Button.jsx';

function PrimaryButton({ onClick, disabled = false, icon = null, text, fullWidth = true, className = '' }) {
  return (
    <Button
      variant="primary"
      onClick={onClick}
      disabled={disabled}
      icon={icon}
      className={`${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {text}
    </Button>
  );
}

export default PrimaryButton;
