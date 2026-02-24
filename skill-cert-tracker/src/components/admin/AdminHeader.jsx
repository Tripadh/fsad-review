import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import GlowButton from '../common/GlowButton';
import '../../styles/admin.css';

export default function AdminHeader() {
  const { currentUser, logout } = useAuth();
  const { getAllCerts, getSystemStats } = useData();
  const { getAllUsersForAdmin } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header__brand">
        <img src="/logorbg.png" alt="CertTracker" style={{ height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px var(--glow-primary))' }} />
        CertTracker Admin
        <span className="admin-badge">ADMIN</span>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <div
            className="avatar"
            style={{ background: currentUser.avatarColor, width:'34px', height:'34px', fontSize:'0.85rem' }}
          >
            {currentUser.username[0].toUpperCase()}
          </div>
          <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>
            {currentUser.username}
          </span>
        </div>
        <GlowButton variant="ghost" size="sm" onClick={logout}>
          Sign Out
        </GlowButton>
      </div>
    </header>
  );
}
