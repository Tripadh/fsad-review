import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import '../../styles/calendar.css';

export default function CertificationCalendar() {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/api/certifications/calendar/${currentUser.id}`);
        if (!response.ok) throw new Error('Failed to fetch calendar events');
        const data = await response.json();
        setEvents(data.events || []);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchCalendarEvents();
    }
  }, [currentUser?.id]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    const dateKey = formatDateKey(date);
    return events.filter(event => event.date === dateKey);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleExportICAL = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/certifications/calendar/${currentUser.id}/export`);
      if (!response.ok) throw new Error('Failed to export calendar');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certifications-${new Date().toISOString().split('T')[0]}.ics`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting calendar:', error);
      alert('Failed to export calendar');
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const monthName = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  const dayArray = [];
  for (let i = 0; i < firstDay; i++) {
    dayArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    dayArray.push(i);
  }

  if (loading) {
    return (
      <div className="cert-calendar">
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="cert-calendar">
      <div className="calendar-header">
        <h2 className="calendar-title">📅 Certification Timeline</h2>
        <button className="calendar-export-btn" onClick={handleExportICAL} title="Export to calendar app">
          📥 Export to Calendar
        </button>
      </div>

      <div className="calendar-controls">
        <button className="calendar-nav-btn" onClick={handlePrevMonth}>←</button>
        <h3 className="calendar-month-year">{monthName} {year}</h3>
        <button className="calendar-nav-btn" onClick={handleNextMonth}>→</button>
      </div>

      <div className="calendar-grid">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-day-header">{day}</div>
        ))}

        {/* Calendar days */}
        {dayArray.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="calendar-day calendar-day--empty"></div>;
          }

          const dateObj = new Date(year, currentDate.getMonth(), day);
          const dateKey = formatDateKey(dateObj);
          const dayEvents = getEventsForDate(dateObj);
          const isSelected = selectedDate === dateKey;
          const isToday = formatDateKey(new Date()) === dateKey;

          return (
            <div
              key={day}
              className={`calendar-day ${isSelected ? 'calendar-day--selected' : ''} ${isToday ? 'calendar-day--today' : ''}`}
              onClick={() => setSelectedDate(isSelected ? null : dateKey)}
            >
              <div className="calendar-day-number">{day}</div>
              {dayEvents.length > 0 && (
                <div className="calendar-day-events">
                  {dayEvents.slice(0, 2).map((event, idx) => (
                    <div
                      key={idx}
                      className={`calendar-event-dot calendar-event-dot--${event.eventType}`}
                      title={event.title}
                    />
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="calendar-event-more">+{dayEvents.length - 2}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected date details */}
      {selectedDate && (
        <div className="calendar-details">
          <h4 className="calendar-details-title">
            Events on {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          
          {getEventsForDate(new Date(selectedDate)).length > 0 ? (
            <div className="calendar-details-list">
              {getEventsForDate(new Date(selectedDate)).map((event, idx) => (
                <div key={idx} className={`calendar-event-card calendar-event-card--${event.eventType}`}>
                  <div className="calendar-event-icon">{event.icon}</div>
                  <div className="calendar-event-content">
                    <div className="calendar-event-title">{event.title}</div>
                    <div className="calendar-event-description">{event.description}</div>
                    <div className="calendar-event-issuer">{event.issuer}</div>
                  </div>
                  <div className={`calendar-event-badge calendar-event-badge--${event.eventType}`}>
                    {event.eventType === 'expiry' ? '⏰ Expires' : 
                     event.eventType === 'expired' ? '🚨 Expired' :
                     event.eventType === 'renewal' ? '🔄 Renewed' : '✅ Verified'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="calendar-no-events">No events on this date</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-dot legend-dot--expiry"></span>
          <span>Expiring Soon</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot--expired"></span>
          <span>Expired</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot--renewal"></span>
          <span>Renewal Date</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot legend-dot--verified"></span>
          <span>Verified</span>
        </div>
      </div>
    </div>
  );
}
