import { useState } from 'react';
import Badge from '../common/Badge';
import GlowButton from '../common/GlowButton';
import { formatDate } from '../../utils/dateUtils';
import { getFileIcon } from '../../utils/fileUtils';

export default function UserDetailDrawer({ user, certs, onClose }) {
  const [viewingDoc, setViewingDoc] = useState(null); // cert whose doc is being viewed

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="user-drawer">
        <div className="user-drawer__header">
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <div
              className="avatar"
              style={{ background: user.avatarColor, width:'44px', height:'44px', fontSize:'1rem' }}
            >
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'1rem' }}>{user.username}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{user.email}</div>
            </div>
          </div>
          <button className="user-drawer__close" onClick={onClose}>✕</button>
        </div>

        <div className="user-drawer__body">
          {/* Stats row */}
          <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
            {[
              { label:'Total Certs',    value: certs.length,                                          color:'var(--glow-primary)'  },
              { label:'Active',         value: certs.filter(c => c.status==='active').length,         color:'var(--glow-success)'  },
              { label:'Expiring Soon',  value: certs.filter(c => c.status==='expiring_soon').length,  color:'var(--glow-warning)'  },
              { label:'Expired',        value: certs.filter(c => c.status==='expired').length,        color:'var(--glow-danger)'   },
            ].map(s => (
              <div key={s.label} style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-md)', padding:'0.6rem 0.85rem', flex:1, minWidth:'80px' }}>
                <div style={{ fontSize:'1.3rem', fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="user-drawer__section-title">Certifications</div>

          {certs.length === 0 ? (
            <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'1.5rem', fontSize:'0.85rem' }}>
              No certifications uploaded yet.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {certs.map(cert => (
                <div
                  key={cert.id}
                  style={{
                    background:'var(--bg-surface)', border:'1px solid var(--border-subtle)',
                    borderRadius:'var(--radius-md)', padding:'0.9rem 1rem',
                    transition:'border-color var(--transition-fast)',
                  }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'0.5rem', marginBottom:'0.5rem' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'0.9rem' }}>{cert.title}</div>
                      <div style={{ fontSize:'0.76rem', color:'var(--text-muted)' }}>{cert.issuer}</div>
                    </div>
                    <Badge status={cert.status} size="sm" pulse />
                  </div>

                  <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', display:'flex', gap:'1rem', flexWrap:'wrap', marginBottom: cert.documentBase64 ? '0.65rem' : 0 }}>
                    <span>Issued: {formatDate(cert.issueDate)}</span>
                    {cert.expiryDate && <span>Expires: {formatDate(cert.expiryDate)}</span>}
                    {cert.credentialId && <span style={{ fontFamily:'monospace', fontSize:'0.73rem' }}>{cert.credentialId}</span>}
                  </div>

                  {/* Document preview button */}
                  {cert.documentBase64 && (
                    <button
                      onClick={() => setViewingDoc(cert)}
                      style={{
                        display:'flex', alignItems:'center', gap:'0.5rem',
                        background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)',
                        borderRadius:'var(--radius-sm)', padding:'0.4rem 0.75rem',
                        color:'var(--glow-secondary)', fontSize:'0.78rem', fontWeight:600,
                        cursor:'pointer', transition:'all var(--transition-fast)', width:'100%',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.borderColor = 'var(--glow-secondary)';
                        e.currentTarget.style.boxShadow  = 'var(--glow-spread-xs) var(--glow-secondary)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.borderColor = 'rgba(251,191,36,0.2)';
                        e.currentTarget.style.boxShadow  = 'none';
                      }}
                    >
                      <span style={{ fontSize:'1rem' }}>{getFileIcon(cert.documentMimeType)}</span>
                      <span style={{ flex:1, textAlign:'left', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {cert.documentName || 'View Certificate Document'}
                      </span>
                      <span>👁 View</span>
                    </button>
                  )}
                  {!cert.documentBase64 && (
                    <div style={{ fontSize:'0.73rem', color:'var(--text-muted)', fontStyle:'italic' }}>
                      No document attached
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document viewer overlay (over the drawer) */}
      {viewingDoc && (
        <div
          style={{
            position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
            zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem',
          }}
          onClick={() => setViewingDoc(null)}
        >
          <div
            style={{
              background:'var(--bg-card)', border:'1px solid var(--border-normal)',
              borderRadius:'var(--radius-xl)', width:'100%', maxWidth:'900px',
              maxHeight:'90vh', display:'flex', flexDirection:'column',
              boxShadow:'0 0 60px rgba(249,115,22,0.2)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Doc modal header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1rem 1.25rem', borderBottom:'1px solid var(--border-subtle)', flexShrink:0 }}>
              <div>
                <div style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'1rem' }}>{viewingDoc.title}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                  {viewingDoc.issuer} · {user.username} · {viewingDoc.documentName}
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                <a
                  href={viewingDoc.documentBase64}
                  download={viewingDoc.documentName || 'certificate'}
                  style={{ display:'flex', alignItems:'center', gap:'0.35rem', fontSize:'0.78rem', color:'var(--glow-success)', border:'1px solid rgba(46,213,115,0.3)', borderRadius:'var(--radius-sm)', padding:'0.35rem 0.7rem', background:'rgba(46,213,115,0.06)' }}
                  onClick={e => e.stopPropagation()}
                >
                  ⬇️ Download
                </a>
                <button
                  onClick={() => setViewingDoc(null)}
                  style={{ background:'none', border:'1.5px solid var(--border-subtle)', color:'var(--text-secondary)', width:'32px', height:'32px', borderRadius:'var(--radius-sm)', cursor:'pointer', fontSize:'0.88rem', display:'flex', alignItems:'center', justifyContent:'center', transition:'all var(--transition-fast)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor='var(--glow-danger)'; e.currentTarget.style.color='var(--glow-danger)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor='var(--border-subtle)'; e.currentTarget.style.color='var(--text-secondary)'; }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document display */}
            <div style={{ flex:1, overflow:'hidden', padding:'0.5rem', minHeight:'400px', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-surface)', borderRadius:'0 0 var(--radius-xl) var(--radius-xl)' }}>
              {viewingDoc.documentMimeType?.startsWith('image/') ? (
                <img
                  src={viewingDoc.documentBase64}
                  alt={viewingDoc.documentName}
                  style={{ maxWidth:'100%', maxHeight:'70vh', objectFit:'contain', borderRadius:'var(--radius-md)' }}
                />
              ) : viewingDoc.documentMimeType === 'application/pdf' ? (
                <iframe
                  src={viewingDoc.documentBase64}
                  title="Certificate document"
                  style={{ width:'100%', height:'70vh', border:'none', borderRadius:'var(--radius-md)' }}
                />
              ) : (
                <div style={{ textAlign:'center', color:'var(--text-muted)', padding:'3rem' }}>
                  <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📄</div>
                  <div>Preview not available for this file type.</div>
                  <a href={viewingDoc.documentBase64} download={viewingDoc.documentName} style={{ color:'var(--glow-primary)', marginTop:'0.75rem', display:'block' }}>
                    Download to view
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
