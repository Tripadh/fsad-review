import { useState } from 'react';
import Modal from '../common/Modal';
import GlowInput from '../common/GlowInput';
import GlowButton from '../common/GlowButton';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import '../../styles/modal.css';

export default function RenewalManager({ isOpen, onClose, cert, user }) {
  const { currentUser } = useAuth();
  const { markRenewed, sendNotification } = useData();

  const [newExpiry, setNewExpiry] = useState('');
  const [note, setNote]           = useState('');
  const [notifMsg, setNotifMsg]   = useState(
    `Your certification "${cert?.title}" has been renewed. New expiry: `
  );
  const [saving, setSaving]       = useState(false);
  const [sending, setSending]     = useState(false);
  const [errors, setErrors]       = useState({});

  if (!cert) return null;

  const handleRenew = async () => {
    if (!newExpiry) {
      setErrors({ newExpiry: 'New expiry date is required.' });
      return;
    }
    setSaving(true);
    try {
      await markRenewed(cert.id, newExpiry, note, currentUser.id);
      onClose();
    } catch (err) {
      setErrors({ newExpiry: err.message || 'Failed to renew certification.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendNotice = async () => {
    if (!notifMsg.trim()) return;
    setSending(true);
    try {
      await sendNotification(cert.userId, cert.id, notifMsg.trim(), currentUser.id);
      onClose();
    } catch (err) {
      setErrors({ newExpiry: err.message || 'Failed to send notification.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="♻️ Manage Renewal" size="sm">
      <div className="renewal-form">
        {/* Cert info */}
        <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-md)', padding:'0.9rem 1rem' }}>
          <div style={{ fontWeight:700, color:'var(--text-primary)', marginBottom:'0.25rem' }}>{cert.title}</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
            {cert.issuer} · {user?.username} · Expires: {formatDate(cert.expiryDate)}
          </div>
        </div>

        {/* Renew section */}
        <div style={{ borderTop:'1px solid var(--border-subtle)', paddingTop:'1rem' }}>
          <div style={{ fontSize:'0.88rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.75rem' }}>
            🔄 Mark as Renewed
          </div>
          <GlowInput
            id="new-expiry"
            label="New Expiry Date"
            type="date"
            value={newExpiry}
            onChange={e => { setNewExpiry(e.target.value); setErrors({}); }}
            error={errors.newExpiry}
            required
          />
          <div style={{ marginTop:'0.75rem' }}>
            <GlowInput
              id="renew-note"
              label="Note (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. Renewed via online portal"
              multiline
              rows={2}
            />
          </div>
          <div style={{ marginTop:'0.75rem' }}>
            <GlowButton variant="success" fullWidth onClick={handleRenew} loading={saving}>
              ✅ Confirm Renewal
            </GlowButton>
          </div>
        </div>

        {/* Send notice section */}
        <div style={{ borderTop:'1px solid var(--border-subtle)', paddingTop:'1rem' }}>
          <div style={{ fontSize:'0.88rem', fontWeight:700, color:'var(--text-secondary)', marginBottom:'0.75rem' }}>
            📨 Send Renewal Notice to {user?.username}
          </div>
          <GlowInput
            id="notif-msg"
            label="Message"
            value={notifMsg}
            onChange={e => setNotifMsg(e.target.value)}
            multiline
            rows={2}
          />
          <div style={{ marginTop:'0.75rem' }}>
            <GlowButton
              variant="warning"
              fullWidth
              onClick={handleSendNotice}
              loading={sending}
              disabled={cert.notified}
            >
              {cert.notified ? '✅ Notice Already Sent' : '📨 Send Notice'}
            </GlowButton>
          </div>
        </div>

        <GlowButton variant="ghost" fullWidth onClick={onClose}>
          Cancel
        </GlowButton>
      </div>
    </Modal>
  );
}
