import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import Modal from '../common/Modal';
import GlowInput from '../common/GlowInput';
import GlowButton from '../common/GlowButton';
import AchievementTimeline from './AchievementTimeline';
import { todayISO } from '../../utils/dateUtils';
import '../../styles/cards.css';

const TYPES = [
  { value: 'achievement', label: 'Achievement', icon: '🏆' },
  { value: 'milestone',   label: 'Milestone',   icon: '🚩' },
];

export default function AchievementsTab() {
  const { currentUser } = useAuth();
  const { getAchievementsByUser, addAchievement } = useData();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', type: 'achievement', description: '', date: todayISO(),
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Filter to only achievements and milestones (exclude events)
  const allItems = getAchievementsByUser(currentUser.id);
  const achievements = allItems.filter(a => a.type === 'achievement' || a.type === 'milestone');

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.date) errs.date = 'Date is required.';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await addAchievement({ ...form, userId: currentUser.id });
      setShowForm(false);
      setForm({ title: '', type: 'achievement', description: '', date: todayISO() });
    } catch (err) {
      setErrors(prev => ({ ...prev, title: err.message || 'Failed to save achievement.' }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.75rem' }}>
        <div>
          <h2 style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--text-primary)' }}>
            Achievements
          </h2>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'0.2rem' }}>
            {achievements.length} achievement{achievements.length !== 1 ? 's' : ''} & milestone{achievements.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <GlowButton onClick={() => setShowForm(true)}>
          + Add Achievement
        </GlowButton>
      </div>

      {/* Timeline */}
      {achievements.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state__icon">🏆</span>
          <div className="empty-state__title">No achievements yet</div>
          <div className="empty-state__desc">Document your professional accomplishments and milestones.</div>
          <GlowButton onClick={() => setShowForm(true)}>+ Add First Achievement</GlowButton>
        </div>
      ) : (
        <AchievementTimeline items={achievements} />
      )}

      {/* Add modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="🏆 Add Achievement" size="sm">
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {/* Type selector */}
          <div>
            <div style={{ fontSize:'0.82rem', fontWeight:600, color:'var(--text-secondary)', letterSpacing:'0.04em', textTransform:'uppercase', marginBottom:'0.5rem' }}>
              Type
            </div>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, type: t.value }))}
                  style={{
                    flex:1, display:'flex', flexDirection:'column', alignItems:'center',
                    gap:'0.3rem', padding:'0.7rem 0.35rem',
                    border: `1.5px solid ${form.type === t.value ? 'var(--glow-primary)' : 'var(--border-subtle)'}`,
                    borderRadius:'var(--radius-md)',
                    background: form.type === t.value ? 'rgba(249,115,22,0.1)' : 'transparent',
                    color: form.type === t.value ? 'var(--glow-primary)' : 'var(--text-muted)',
                    cursor:'pointer', fontSize:'0.78rem', fontWeight:600,
                    transition:'all var(--transition-normal)',
                    transform: form.type === t.value ? 'translateY(-2px)' : 'none',
                    boxShadow: form.type === t.value ? 'var(--glow-spread-sm) rgba(249,115,22,0.2)' : 'none',
                  }}
                >
                  <span style={{ fontSize:'1.4rem' }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <GlowInput
            id="ach-title"
            label="Title"
            value={form.title}
            onChange={set('title')}
            placeholder="e.g. Led Cloud Migration Project"
            error={errors.title}
            required
          />
          <GlowInput
            id="ach-desc"
            label="Description (optional)"
            value={form.description}
            onChange={set('description')}
            placeholder="Briefly describe this achievement..."
            multiline
            rows={3}
          />
          <GlowInput
            id="ach-date"
            label="Date"
            type="date"
            value={form.date}
            onChange={set('date')}
            error={errors.date}
            required
          />

          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
            <GlowButton variant="ghost" onClick={() => setShowForm(false)}>Cancel</GlowButton>
            <GlowButton onClick={handleSave} loading={saving}>Add Achievement</GlowButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
