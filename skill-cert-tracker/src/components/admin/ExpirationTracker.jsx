import { useState } from 'react';
import Badge from '../common/Badge';
import GlowButton from '../common/GlowButton';
import { formatDate, daysUntilExpiry } from '../../utils/dateUtils';
import RenewalModal from './RenewalManager';

export default function ExpirationTracker({ allCerts, allUsers }) {
  const [renewCert, setRenewCert] = useState(null);

  // Only certs with an expiry date, sorted ascending (soonest first)
  const certsWithExpiry = allCerts
    .filter(c => c.expiryDate)
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  const getUser = (userId) => allUsers.find(u => u.id === userId);

  const getDaysClass = (days) => {
    if (days === null) return '';
    if (days < 0) return 'days-cell--expired';
    if (days <= 7) return 'days-cell--critical';
    if (days <= 30) return 'days-cell--warning';
    return 'days-cell--safe';
  };

  const getDaysLabel = (days) => {
    if (days === null) return '—';
    if (days < 0) return `${Math.abs(days)}d ago`;
    if (days === 0) return 'Today!';
    return `${days} days`;
  };

  return (
    <div style={{ overflowX:'auto' }}>
      {certsWithExpiry.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">✅</span>
          <div className="empty-state__title">No certificates with expiry dates</div>
        </div>
      ) : (
        <table className="expiry-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Certification</th>
              <th>Issuer</th>
              <th>Expiry Date</th>
              <th>Days Remaining</th>
              <th>Status</th>
              <th>Notified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certsWithExpiry.map(cert => {
              const user = getUser(cert.userId);
              const days = daysUntilExpiry(cert.expiryDate);
              return (
                <tr key={cert.id}>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                      {user && (
                        <div
                          className="avatar"
                          style={{ background: user.avatarColor, width:'28px', height:'28px', fontSize:'0.72rem', flexShrink:0 }}
                        >
                          {user.username[0].toUpperCase()}
                        </div>
                      )}
                      <span style={{ fontSize:'0.83rem', color:'var(--text-primary)', fontWeight:600 }}>
                        {user?.username || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight:600, color:'var(--text-primary)', maxWidth:'200px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {cert.title}
                  </td>
                  <td>{cert.issuer}</td>
                  <td>{formatDate(cert.expiryDate)}</td>
                  <td>
                    <span className={`days-cell ${getDaysClass(days)}`}>
                      {getDaysLabel(days)}
                    </span>
                  </td>
                  <td><Badge status={cert.status} size="sm" pulse /></td>
                  <td>
                    {cert.notified ? (
                      <span style={{ fontSize:'0.75rem', color:'var(--glow-success)' }}>✅ Sent</span>
                    ) : (
                      <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:'0.4rem' }}>
                      <GlowButton
                        variant="success"
                        size="sm"
                        onClick={() => setRenewCert({ cert, user })}
                      >
                        ♻️ Renew
                      </GlowButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {renewCert && (
        <RenewalModal
          isOpen={!!renewCert}
          onClose={() => setRenewCert(null)}
          cert={renewCert.cert}
          user={renewCert.user}
        />
      )}
    </div>
  );
}
