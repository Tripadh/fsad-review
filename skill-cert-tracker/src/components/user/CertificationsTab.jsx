import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import GlowButton from '../common/GlowButton';
import Badge from '../common/Badge';
import CertCard from './CertCard';
import CertUploadModal from './CertUploadModal';
import CertViewModal from './CertViewModal';
import '../../styles/cards.css';

export default function CertificationsTab() {
  const { currentUser } = useAuth();
  const { getCertsByUser, deleteCert } = useData();

  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpload, setShowUpload]   = useState(false);
  const [editCert, setEditCert]       = useState(null);
  const [viewCert, setViewCert]       = useState(null);

  const allCerts = getCertsByUser(currentUser.id);

  const filtered = allCerts.filter(c => {
    const matchesSearch = !search || [c.title, c.issuer, c.credentialId, ...(c.tags || [])]
      .join(' ').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Delete this certification? This action cannot be undone.')) {
      try {
        await deleteCert(id);
      } catch (err) {
        window.alert(err.message || 'Failed to delete certification.');
      }
    }
  };

  const handleEdit = (cert) => {
    setEditCert(cert);
    setShowUpload(true);
  };

  const handleUploadClose = () => {
    setShowUpload(false);
    setEditCert(null);
  };

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--text-primary)' }}>
            My Certifications
          </h2>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'0.2rem' }}>
            {allCerts.length} certification{allCerts.length !== 1 ? 's' : ''} on record
          </p>
        </div>
        <GlowButton onClick={() => setShowUpload(true)}>
          + Add Certificate
        </GlowButton>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom:'1.25rem' }}>
        <input
          className="filter-search"
          type="text"
          placeholder="🔍 Search by title, issuer, tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Cert grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">🎓</span>
          <div className="empty-state__title">
            {allCerts.length === 0 ? 'No certifications yet' : 'No results found'}
          </div>
          <div className="empty-state__desc">
            {allCerts.length === 0
              ? 'Upload your first professional certification to get started.'
              : 'Try adjusting your search or filter.'}
          </div>
          {allCerts.length === 0 && (
            <GlowButton onClick={() => setShowUpload(true)}>
              + Upload Certification
            </GlowButton>
          )}
        </div>
      ) : (
        <div className="cert-grid">
          {filtered.map((cert, index) => (
            <CertCard
              key={cert.id}
              cert={cert}
              index={index}
              onView={() => setViewCert(cert)}
              onEdit={() => handleEdit(cert)}
              onDelete={async () => handleDelete(cert.id)}
            />
          ))}
        </div>
      )}

      {/* Upload/Edit modal */}
      {showUpload && (
        <CertUploadModal
          isOpen={showUpload}
          onClose={handleUploadClose}
          editCert={editCert}
        />
      )}

      {/* View modal */}
      {viewCert && (
        <CertViewModal
          isOpen={!!viewCert}
          onClose={() => setViewCert(null)}
          cert={viewCert}
        />
      )}
    </div>
  );
}
