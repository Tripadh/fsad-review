import { useState } from 'react';
import { useData } from '../../context/DataContext';
import GlowButton from '../common/GlowButton';
import { formatDate } from '../../utils/dateUtils';
import { getFileIcon } from '../../utils/fileUtils';
import { getExternalVerificationUrl } from '../../utils/certUtils';

export default function VerificationQueue({ allCerts, allUsers }) {
  const { updateCert } = useData();
  const [viewingDoc, setViewingDoc] = useState(null);

  // Get all pending certs
  const pendingCerts = allCerts.filter(c => c.verificationStatus === 'pending');

  const handleVerify = async (id, status) => {
    try {
      await updateCert(id, { verificationStatus: status });
    } catch (err) {
      alert(err.message || 'Failed to update verification status.');
    }
  };

  if (pendingCerts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
        <h3>All clear!</h3>
        <p>No certificates are currently waiting for verification.</p>
      </div>
    );
  }

  return (
    <div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Review {pendingCerts.length} certificates waiting for manual verification.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {pendingCerts.map(cert => {
          const user = allUsers.find(u => u.id === cert.userId);
          const extUrl = getExternalVerificationUrl(cert.issuer, cert.credentialId);

          return (
            <div key={cert.id} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)', padding: '1.25rem',
              display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start'
            }}>
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{cert.title}</h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  {cert.issuer} • Uploaded by <strong>{user?.username || 'Unknown'}</strong>
                </div>
                
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <span><strong>Issued:</strong> {formatDate(cert.issueDate)}</span>
                  {cert.expiryDate && <span><strong>Expires:</strong> {formatDate(cert.expiryDate)}</span>}
                  {cert.credentialId && <span style={{ fontFamily: 'monospace' }}><strong>ID:</strong> {cert.credentialId}</span>}
                </div>
              </div>

              <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                {cert.documentBase64 ? (
                  <button
                    onClick={() => setViewingDoc(cert)}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem',
                      color: 'var(--text-primary)', fontSize: '0.8rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}
                  >
                    <span>{getFileIcon(cert.documentMimeType)}</span>
                    View Document
                  </button>
                ) : (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.4rem' }}>
                    No Document
                  </div>
                )}
                
                {extUrl && (
                  <a 
                    href={extUrl} target="_blank" rel="noreferrer"
                    style={{
                      background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)',
                      borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.6rem',
                      fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}
                  >
                    🔗 Check External
                  </a>
                )}
              </div>

              <div style={{ flex: '0 0 auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <GlowButton variant="success" size="sm" onClick={() => handleVerify(cert.id, 'verified')}>
                  ✅ Approve
                </GlowButton>
                <GlowButton variant="danger" size="sm" onClick={() => handleVerify(cert.id, 'rejected')}>
                  ❌ Reject
                </GlowButton>
              </div>
            </div>
          );
        })}
      </div>

      {viewingDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }} onClick={() => setViewingDoc(null)}>
           <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>{viewingDoc.title}</h3>
                <button onClick={() => setViewingDoc(null)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
             </div>
             <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center' }}>
               {viewingDoc.documentMimeType?.startsWith('image/') ? (
                 <img src={viewingDoc.documentBase64} alt="cert" style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }} />
               ) : viewingDoc.documentMimeType === 'application/pdf' ? (
                 <iframe src={viewingDoc.documentBase64} title="pdf" style={{ width: '100%', height: '70vh', border: 'none' }} />
               ) : (
                 <p>Preview not available</p>
               )}
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
