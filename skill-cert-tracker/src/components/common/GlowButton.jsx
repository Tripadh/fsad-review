import './GlowButton.css';

export default function GlowButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
}) {
  return (
    <button
      type={type}
      className={`glow-btn glow-btn--${variant} glow-btn--${size}${fullWidth ? ' glow-btn--full' : ''}${loading ? ' glow-btn--loading' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="glow-btn__spinner" />}
      <span className="glow-btn__label">{children}</span>
    </button>
  );
}
