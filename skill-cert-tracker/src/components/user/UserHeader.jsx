import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import { getGamificationLevel } from '../../utils/gamificationUtils';
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

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <GlowButton 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            const url = `${window.location.origin}/portfolio/${currentUser.id}`;
            navigator.clipboard.writeText(url);
            alert('Portfolio link copied to clipboard!');
          }}
          title="Share your public portfolio"
        >
          📋 Copy Portfolio Link
        </GlowButton>
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
                    onClick={async () => {
                      try {
                        await markAllNotificationsRead(currentUser.id);
                      } catch (err) {
                        window.alert(err.message || 'Failed to mark notifications as read.');
                      }
                    }}
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
        <div className="dash-header__user" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              className="avatar"
              style={{ background: currentUser.avatarColor, flexShrink: 0 }}
              title={currentUser.username}
            >
              {currentUser.username[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize:'0.85rem', color:'var(--text-primary)', fontWeight: 600 }}>
                {currentUser.username}
              </span>
              <span style={{ fontSize:'0.7rem', color: getGamificationLevel(currentUser.points).color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {getGamificationLevel(currentUser.points).label} ({currentUser.points || 0} pts)
              </span>
            </div>
          </div>
        </div>

        <GlowButton variant="ghost" size="sm" onClick={logout}>
          Sign Out
        </GlowButton>
      </div>
    </header>
  );
}
