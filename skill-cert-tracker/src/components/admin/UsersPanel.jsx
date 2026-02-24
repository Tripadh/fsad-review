import { useState } from 'react';
import { useData } from '../../context/DataContext';
import GlowButton from '../common/GlowButton';
import Badge from '../common/Badge';
import UserDetailDrawer from './UserDetailDrawer';

export default function UsersPanel({ allUsers, allCerts }) {
  const [search, setSearch]         = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const filtered = allUsers.filter(u =>
    !search ||
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const getCertCount = (userId) => allCerts.filter(c => c.userId === userId);

  return (
    <div>
      <div className="users-panel__search">
        <input
          className="filter-search"
          style={{ width:'100%' }}
          type="text"
          placeholder="🔍 Search users by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">👥</span>
          <div className="empty-state__title">No users found</div>
        </div>
      ) : (
        <div className="users-list">
          {filtered.map((user, index) => {
            const userCerts = getCertCount(user.id);
            const expiringSoon = userCerts.filter(c => c.status === 'expiring_soon').length;
            const expired      = userCerts.filter(c => c.status === 'expired').length;

            return (
              <div key={user.id} className="user-row" style={{ '--row-index': index }}>
                <div
                  className="avatar"
                  style={{ background: user.avatarColor, flexShrink:0 }}
                >
                  {user.username[0].toUpperCase()}
                </div>

                <div className="user-row__info">
                  <div className="user-row__name">{user.username}</div>
                  <div className="user-row__email">{user.email}</div>
                </div>

                <div className="user-row__stats">
                  <span className="cert-count-badge" title="Total certs">
                    🎓 {userCerts.length}
                  </span>
                  {expiringSoon > 0 && (
                    <span style={{ background:'rgba(255,165,2,0.12)', border:'1px solid rgba(255,165,2,0.25)', color:'var(--glow-warning)', borderRadius:'var(--radius-full)', fontSize:'0.72rem', fontWeight:700, padding:'0.15rem 0.55rem' }}>
                      ⚠️ {expiringSoon}
                    </span>
                  )}
                  {expired > 0 && (
                    <span style={{ background:'rgba(255,71,87,0.12)', border:'1px solid rgba(255,71,87,0.25)', color:'var(--glow-danger)', borderRadius:'var(--radius-full)', fontSize:'0.72rem', fontWeight:700, padding:'0.15rem 0.55rem' }}>
                      ❌ {expired}
                    </span>
                  )}
                </div>

                <GlowButton variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                  View Details
                </GlowButton>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail drawer */}
      {selectedUser && (
        <UserDetailDrawer
          user={selectedUser}
          certs={allCerts.filter(c => c.userId === selectedUser.id)}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
