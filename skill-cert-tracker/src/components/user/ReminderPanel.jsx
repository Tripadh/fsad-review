import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/reminders.css';

export default function ReminderPanel() {
  const { currentUser } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/certifications/calendar/${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch calendar');
        const data = await response.json();

        // Process events into reminders
        const now = new Date();
        const upcomingReminders = data.events
          .filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate());
          })
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);

        setReminders(upcomingReminders);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      }
    };

    if (currentUser?.id) {
      fetchReminders();
    }
  }, [currentUser?.id]);

  const getDaysUntil = (dateStr) => {
    const eventDate = new Date(dateStr);
    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const diff = eventDate - today;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days ago`;
    return `in ${days} days`;
  };

  const getUrgencyColor = (eventType) => {
    switch (eventType) {
      case 'expired': return '#ff4444';
      case 'expiry': return '#ff9800';
      case 'renewal': return '#2196f3';
      case 'verified': return '#4caf50';
      default: return '#666';
    }
  };

  const toggleReminder = (idx) => {
    setExpanded(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (reminders.length === 0) {
    return null;
  }

  return (
    <div className="reminder-panel">
      <div className="reminder-panel__header">
        <h4 className="reminder-panel__title">🔔 Upcoming Reminders</h4>
        <span className="reminder-panel__count">{reminders.length}</span>
      </div>

      <div className="reminder-list">
        {reminders.map((reminder, idx) => (
          <div
            key={idx}
            className={`reminder-item reminder-item--${reminder.eventType}`}
            style={{ borderLeftColor: getUrgencyColor(reminder.eventType) }}
          >
            <div className="reminder-item__header" onClick={() => toggleReminder(idx)}>
              <div className="reminder-item__icon">{reminder.icon}</div>
              <div className="reminder-item__content">
                <div className="reminder-item__title">{reminder.title}</div>
                <div className="reminder-item__time">{getDaysUntil(reminder.date)}</div>
              </div>
              <div 
                className="reminder-item__indicator" 
                style={{ backgroundColor: getUrgencyColor(reminder.eventType) }}
              />
            </div>

            {expanded[idx] && (
              <div className="reminder-item__details">
                <div className="reminder-item__description">{reminder.description}</div>
                <div className="reminder-item__issuer">From: {reminder.issuer}</div>
                <div className="reminder-item__date">Date: {new Date(reminder.date).toLocaleDateString()}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
