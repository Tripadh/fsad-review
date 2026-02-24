import { useData } from '../../context/DataContext';
import { formatDate } from '../../utils/dateUtils';
import GlowButton from '../common/GlowButton';

const TYPE_META = {
  achievement: { icon: '🏆', label: 'Achievement', dotClass: 'timeline-item__dot--achievement', typeClass: 'timeline-card__type--achievement' },
  event:       { icon: '📅', label: 'Event',        dotClass: 'timeline-item__dot--event',       typeClass: 'timeline-card__type--event' },
  milestone:   { icon: '🚩', label: 'Milestone',    dotClass: 'timeline-item__dot--milestone',   typeClass: 'timeline-card__type--milestone' },
};

export default function AchievementTimeline({ items }) {
  const { deleteAchievement } = useData();

  const handleDelete = (id) => {
    if (window.confirm('Delete this entry?')) deleteAchievement(id);
  };

  return (
    <div className="timeline">
      {items.map((item, index) => {
        const meta = TYPE_META[item.type] || TYPE_META.achievement;
        return (
          <div key={item.id} className="timeline-item" style={{ '--timeline-index': index }}>
            <div className={`timeline-item__dot ${meta.dotClass}`}>{meta.icon}</div>
            <div className="timeline-card">
              <div className="timeline-card__header">
                <div className="timeline-card__title">{item.title}</div>
                <div className="timeline-card__date">{formatDate(item.date)}</div>
              </div>
              {item.description && (
                <div className="timeline-card__desc">{item.description}</div>
              )}
              <div className={`timeline-card__type ${meta.typeClass}`}>
                {meta.icon} {meta.label}
              </div>
              <div className="timeline-card__actions">
                <GlowButton variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                  🗑 Delete
                </GlowButton>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
