import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import GlowButton from '../common/GlowButton';

export default function UserHeader() {
  const { currentUser, logout } = useAuth();
  const { getNotificationsForUser, markAllNotificationsRead } = useData();
  const [showNotifs, setShowNotifs] = useState(false);
  const dropRef = useRef(null);

  const notifications = getNotificationsForUser(currentUser.id);
  const unreadCount   = notifications.filter(n => !n.read).length;

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <header className="dash-header">
      <div className="dash-header__brand">
        <img src="/logorbg.png" alt="CertTracker Pro" style={{ height: '56px', objectFit: 'contain', filter: 'drop-shadow(0 0 10px var(--glow-primary))' }} />
        CertTracker Pro
      </div>

      <div className="dash-header__actions">
        {/* Notification bell */}
        <div style={{ position: 'relative' }} ref={dropRef}>
          <button
            className={`notif-bell${unreadCount > 0 ? ' has-new' : ''}`}
            onClick={() => setShowNotifs(v => !v)}
            title="Notifications"
          >
            🔔
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>

          {showNotifs && (
            <div className="notif-dropdown">
              <div className="notif-dropdown__header">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    style={{ background:'none', border:'none', color:'var(--glow-primary)', fontSize:'0.78rem', fontWeight:600, cursor:'pointer' }}
                    onClick={() => markAllNotificationsRead(currentUser.id)}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--text-muted)', fontSize:'0.85rem' }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`notif-item${!n.read ? ' notif-item--unread' : ''}`}>
                    <div>{n.message}</div>
                    <div className="notif-time">{formatDate(n.createdAt)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User info */}
        <div className="dash-header__user">
          <div
            className="avatar"
            style={{ background: currentUser.avatarColor }}
            title={currentUser.username}
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
