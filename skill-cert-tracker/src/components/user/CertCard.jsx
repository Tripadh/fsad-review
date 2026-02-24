import Badge from '../common/Badge';
import GlowButton from '../common/GlowButton';
import { formatDate, daysUntilExpiry } from '../../utils/dateUtils';
import { getFileIcon } from '../../utils/fileUtils';

export default function CertCard({ cert, index, onView, onEdit, onDelete }) {
  const days = cert.expiryDate ? daysUntilExpiry(cert.expiryDate) : null;

  const getDaysClass = () => {
    if (days === null) return '';
    if (days < 0)   return 'days-remaining--critical';
    if (days <= 30) return 'days-remaining--critical';
    if (days <= 90) return 'days-remaining--warning';
    return 'days-remaining--safe';
  };

  const getDaysLabel = () => {
    if (days === null) return 'No expiry';
    if (days < 0) return `Expired ${Math.abs(days)}d ago`;
    if (days === 0) return 'Expires today!';
    return `${days} days left`;
  };

  return (
    <div className="cert-card" style={{ '--card-index': index }}>
      <div className="cert-card__header">
        <div>
          <div className="cert-card__title">{cert.title}</div>
          <div className="cert-card__issuer">{cert.issuer}</div>
        </div>
        <Badge status={cert.status} pulse />
      </div>

      <div className="cert-card__meta">
        <div className="cert-card__meta-row">
          <span className="cert-card__meta-label">Issued</span>
          <span>{formatDate(cert.issueDate)}</span>
        </div>
        {cert.expiryDate && (
          <div className="cert-card__meta-row">
            <span className="cert-card__meta-label">Expires</span>
            <span>{formatDate(cert.expiryDate)}</span>
            <span className={`days-remaining ${getDaysClass()}`}>{getDaysLabel()}</span>
          </div>
        )}
        {cert.credentialId && (
          <div className="cert-card__meta-row">
            <span className="cert-card__meta-label">ID</span>
            <span style={{ fontFamily:'monospace', fontSize:'0.78rem' }}>{cert.credentialId}</span>
          </div>
        )}
      </div>

      {cert.tags?.length > 0 && (
        <div className="cert-card__tags">
          {cert.tags.map(t => <span key={t} className="cert-tag">{t}</span>)}
        </div>
      )}

      {cert.documentBase64 && (
        <button className="cert-card__doc-preview" onClick={onView}>
          <span>{getFileIcon(cert.documentMimeType)}</span>
          <span className="truncate">{cert.documentName || 'View Document'}</span>
        </button>
      )}

      <div className="cert-card__actions">
        <GlowButton variant="ghost" size="sm" onClick={onView}>
          👁 View
        </GlowButton>
        <GlowButton variant="secondary" size="sm" onClick={onEdit}>
          ✏️ Edit
        </GlowButton>
        <GlowButton variant="danger" size="sm" onClick={onDelete}>
          🗑
        </GlowButton>
      </div>
    </div>
  );
}
