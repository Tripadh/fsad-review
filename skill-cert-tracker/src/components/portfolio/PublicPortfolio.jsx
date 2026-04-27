import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getExternalVerificationUrl } from '../../utils/certUtils';
import VerificationBadge from '../common/VerificationBadge';
import { formatDate } from '../../utils/dateUtils';
import { getFileIcon } from '../../utils/fileUtils';
import { getGamificationLevel } from '../../utils/gamificationUtils';
import '../../styles/cards.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export default function PublicPortfolio() {
  const { userId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/portfolio/${userId}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Portfolio not found");
          throw new Error("Failed to load portfolio");
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [userId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-muted)' }}>
        <h2>Loading Portfolio...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--glow-danger)' }}>
        <h1 style={{ fontSize: '4rem', margin: '0' }}>⚠️</h1>
        <h2>{error}</h2>
      </div>
    );
  }

  const { user, certifications } = data;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', maxWidth: '1000px', margin: '0 auto', fontFamily: 'inherit' }}>
      
      {/* Hero Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem', padding: '3rem 1rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, var(--glow-primary), ${getGamificationLevel(user.points).color})` }} />
        
        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: user.avatarColor, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3rem', color: '#fff', fontWeight: 'bold', marginBottom: '1.5rem', boxShadow: `0 8px 30px ${getGamificationLevel(user.points).color}40`, border: `4px solid ${getGamificationLevel(user.points).color}` }}>
          {user.username[0].toUpperCase()}
        </div>
        
        <div style={{
          background: `${getGamificationLevel(user.points).color}20`,
          color: getGamificationLevel(user.points).color,
          padding: '0.4rem 1rem',
          borderRadius: '2rem',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: '1rem',
          border: `1px solid ${getGamificationLevel(user.points).color}50`
        }}>
          Level: {getGamificationLevel(user.points).label} ({user.points || 0} pts)
        </div>

        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', background: 'linear-gradient(to right, var(--glow-primary), var(--glow-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {user.username}'s Verified Credentials
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
          An official record of valid, verified certifications.
        </p>
      </div>

      {/* Certs Grid */}
      <h2 style={{ fontSize: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        Verified Certifications ({certifications.length})
      </h2>

      {certifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🎓</span>
          No verified certificates to show yet.
        </div>
      ) : (
        <div className="cert-grid">
          {certifications.map((cert, i) => {
            const extUrl = getExternalVerificationUrl(cert.issuer, cert.credentialId);
            return (
              <div key={cert.id} className="cert-card" style={{ '--card-index': i, position: 'relative' }}>
                <div className="cert-card__header">
                  <div>
                    <div className="cert-card__title">{cert.title}</div>
                    <div className="cert-card__issuer">{cert.issuer}</div>
                  </div>
                  <VerificationBadge status={cert.verificationStatus} size="sm" />
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
                    </div>
                  )}
                  {cert.credentialId && (
                    <div className="cert-card__meta-row">
                      <span className="cert-card__meta-label">Credential ID</span>
                      <span style={{ fontFamily:'monospace' }}>{cert.credentialId}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  {cert.documentBase64 && (
                    <button 
                      onClick={() => setViewingDoc(cert)}
                      style={{ flex: 1, padding: '0.6rem', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
                    >
                      {getFileIcon(cert.documentMimeType)} View Doc
                    </button>
                  )}
                  {extUrl && (
                    <a 
                      href={extUrl} target="_blank" rel="noreferrer"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', textDecoration: 'none', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      🔗 Source Link
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Doc Modal overlay */}
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
