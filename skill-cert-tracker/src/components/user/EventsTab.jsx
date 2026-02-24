import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Modal from '../common/Modal';
import GlowInput from '../common/GlowInput';
import GlowButton from '../common/GlowButton';
import AchievementTimeline from './AchievementTimeline';
import { todayISO } from '../../utils/dateUtils';
import '../../styles/cards.css';

export default function EventsTab() {
  const { currentUser } = useAuth();
  const { getAchievementsByUser, addAchievement } = useData();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'event', description: '', date: todayISO(),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Filter to events only
  const allItems = getAchievementsByUser(currentUser.id);
  const events = allItems.filter(a => a.type === 'event');

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Event title is required.';
    if (!form.date) errs.date = 'Date is required.';
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    addAchievement({ ...form, type: 'event', userId: currentUser.id });
    setSaving(false);
    setShowForm(false);
    setForm({ title: '', type: 'event', description: '', date: todayISO() });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--text-primary)' }}>
            Events
          </h2>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'0.2rem' }}>
            {events.length} event{events.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <GlowButton variant="secondary" onClick={() => setShowForm(true)}>
          + Add Event
        </GlowButton>
      </div>

      {/* Timeline */}
      {events.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">📅</span>
          <div className="empty-state__title">No events recorded yet</div>
          <div className="empty-state__desc">Log workshops, conferences, training sessions, and other professional events.</div>
          <GlowButton variant="secondary" onClick={() => setShowForm(true)}>+ Add First Event</GlowButton>
        </div>
      ) : (
        <AchievementTimeline items={events} />
      )}

      {/* Add modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="📅 Add Event" size="sm">
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>

          {/* Event type indicator */}
          <div style={{
            display:'flex', alignItems:'center', gap:'0.75rem',
            background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)',
            borderRadius:'var(--radius-md)', padding:'0.75rem 1rem',
          }}>
            <span style={{ fontSize:'1.6rem' }}>📅</span>
            <div>
              <div style={{ fontWeight:600, color:'var(--glow-secondary)', fontSize:'0.88rem' }}>Professional Event</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Conference, workshop, seminar, training session, etc.</div>
            </div>
          </div>

          <GlowInput
            id="evt-title"
            label="Event Name"
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. AWS re:Invent 2024"
            error={errors.title}
            required
          />
          <GlowInput
            id="evt-desc"
            label="Description (optional)"
            value={form.description}
            onChange={set('description')}
            placeholder="What did you learn or accomplish at this event?"
            multiline
            rows={3}
          />
          <GlowInput
            id="evt-date"
            label="Event Date"
            type="date"
            value={form.date}
            onChange={set('date')}
            error={errors.date}
            required
          />

          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
            <GlowButton variant="ghost" onClick={() => setShowForm(false)}>Cancel</GlowButton>
            <GlowButton variant="secondary" onClick={handleSave} loading={saving}>Add Event</GlowButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
