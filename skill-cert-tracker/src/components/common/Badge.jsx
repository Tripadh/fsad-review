import './Badge.css';
import { STATUS_LABELS } from '../../utils/certUtils';

export default function Badge({ status, size = 'sm', pulse = false }) {
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`badge badge--${status} badge--${size}${pulse && status === 'expiring_soon' ? ' badge--pulse' : ''}`}>
      <span className="badge__dot" />
      {label}
    </span>
  );
}
