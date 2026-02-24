import Modal from '../common/Modal';
import Badge from '../common/Badge';
import { formatDate, daysUntilExpiry } from '../../utils/dateUtils';
import '../../styles/modal.css';

export default function CertViewModal({ isOpen, onClose, cert }) {
  if (!cert) return null;

  const days = cert.expiryDate ? daysUntilExpiry(cert.expiryDate) : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎓 Certification Details" size="lg">
      <div className="cert-view">
        {/* Left: document */}
        <div>
          {cert.documentBase64 ? (
            <div className="cert-view__doc">
              {cert.documentMimeType?.startsWith('image/') ? (
                <img src={cert.documentBase64} alt={cert.documentName} />
              ) : cert.documentMimeType === 'application/pdf' ? (
                <iframe src={cert.documentBase64} title="Certificate" />
              ) : (
                <div className="cert-view__no-doc">
                  <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>📄</div>
                  <div style={{ fontSize:'0.85rem' }}>Preview not available</div>
                  <a
                    href={cert.documentBase64}
                    download={cert.documentName || 'certificate'}
                    style={{ color:'var(--glow-primary)', marginTop:'0.5rem', display:'block', fontSize:'0.85rem' }}
                  >
                    Download file
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="cert-view__doc">
              <div className="cert-view__no-doc">
                <div style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>📋</div>
                <div>No document attached</div>
              </div>
            </div>
          )}

          {cert.documentBase64 && cert.documentName && (
            <div style={{ marginTop:'0.75rem' }}>
              <a
                href={cert.documentBase64}
                download={cert.documentName}
                style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', fontSize:'0.82rem', color:'var(--glow-secondary)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-md)', padding:'0.4rem 0.8rem', transition:'all var(--transition-fast)' }}
              >
                ⬇️ Download {cert.documentName}
              </a>
            </div>
          )}
        </div>

        {/* Right: metadata */}
        <div className="cert-view__meta">
          <div className="cert-view__meta-item">
            <div className="cert-view__meta-label">Status</div>
            <div><Badge status={cert.status} size="md" pulse /></div>
          </div>
          <div className="cert-view__meta-item">
            <div className="cert-view__meta-label">Title</div>
            <div className="cert-view__meta-value" style={{ fontWeight:700, fontSize:'1rem' }}>{cert.title}</div>
          </div>
          <div className="cert-view__meta-item">
            <div className="cert-view__meta-label">Issuer</div>
            <div className="cert-view__meta-value">{cert.issuer}</div>
          </div>
          {cert.credentialId && (
            <div className="cert-view__meta-item">
              <div className="cert-view__meta-label">Credential ID</div>
              <div className="cert-view__meta-value" style={{ fontFamily:'monospace', fontSize:'0.85rem' }}>{cert.credentialId}</div>
            </div>
          )}
          <div className="cert-view__meta-item">
            <div className="cert-view__meta-label">Issue Date</div>
            <div className="cert-view__meta-value">{formatDate(cert.issueDate)}</div>
          </div>
          <div className="cert-view__meta-item">
            <div className="cert-view__meta-label">Expiry Date</div>
            <div className="cert-view__meta-value">
              {cert.expiryDate ? (
                <>
                  {formatDate(cert.expiryDate)}
                  {days !== null && (
                    <span style={{
                      marginLeft:'0.5rem',
                      fontSize:'0.75rem',
                      fontWeight:700,
                      color: days < 0 ? 'var(--glow-danger)' : days <= 90 ? 'var(--glow-warning)' : 'var(--glow-success)',
                    }}>
                      ({days < 0 ? `Expired ${Math.abs(days)}d ago` : `${days} days left`})
                    </span>
                  )}
                </>
              ) : 'No expiry'}
            </div>
          </div>
          {cert.tags?.length > 0 && (
            <div className="cert-view__meta-item">
              <div className="cert-view__meta-label">Tags</div>
              <div className="cert-card__tags" style={{ marginTop:'0.25rem' }}>
                {cert.tags.map(t => <span key={t} className="cert-tag">{t}</span>)}
              </div>
            </div>
          )}

          {/* Renewal history */}
          {cert.renewalHistory?.length > 0 && (
            <div className="renewal-history">
              <div className="renewal-history__title">Renewal History</div>
              {cert.renewalHistory.map((r, i) => (
                <div key={i} className="renewal-item">
                  <strong>Renewed:</strong> {formatDate(r.renewedAt)}<br/>
                  <span style={{ color:'var(--text-muted)' }}>
                    {r.previousExpiry} → {r.newExpiry}
                    {r.note && ` | ${r.note}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
