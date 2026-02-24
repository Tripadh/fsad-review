import './GlowInput.css';

export default function GlowInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required,
  disabled,
  icon,
  multiline = false,
  rows = 3,
  className = '',
}) {
  const el = multiline
    ? (
      <textarea
        id={id}
        className={`glow-input glow-input--textarea${error ? ' glow-input--error' : ''}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
      />
    ) : (
      <input
        id={id}
        type={type}
        className={`glow-input${error ? ' glow-input--error' : ''}${icon ? ' glow-input--has-icon' : ''}`}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    );

  return (
    <div className={`glow-input-wrap ${className}`}>
      {label && <label className="glow-input-label" htmlFor={id}>{label}{required && <span className="glow-input-required">*</span>}</label>}
      <div className="glow-input-inner">
        {icon && <span className="glow-input-icon">{icon}</span>}
        {el}
      </div>
      {error && <span className="glow-input-err">{error}</span>}
    </div>
  );
}
