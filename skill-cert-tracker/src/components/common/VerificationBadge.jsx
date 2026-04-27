import './VerificationBadge.css';

export default function VerificationBadge({ status, size = 'md' }) {
  if (!status) return null;

  const STATUS_CONFIG = {
    pending: { label: 'Verification Pending', icon: '⏳', type: 'pending' },
    verified: { label: 'Verified Credential', icon: '✅', type: 'verified' },
    rejected: { label: 'Verification Failed', icon: '❌', type: 'rejected' },
  };

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;

  return (
    <span className={`verification-badge verification-badge--${config.type} verification-badge--${size}`}>
      <span className="v-badge-icon">{config.icon}</span>
      <span className="v-badge-label">{config.label}</span>
    </span>
  );
}
