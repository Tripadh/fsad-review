import { useState } from 'react';
import '../../styles/dashboard.css';
import UserHeader from './UserHeader';
import OverviewPanel from './OverviewPanel';
import CertificationsTab from './CertificationsTab';
import AchievementsTab from './AchievementsTab';
import EventsTab from './EventsTab';
import CertificationCalendar from './CertificationCalendar';

const TABS = [
  { id: 'overview',      label: '📊 Overview' },
  { id: 'certs',         label: '🎓 Certifications' },
  { id: 'achievements',  label: '🏆 Achievements' },
  { id: 'calendar',      label: '📅 Calendar' },
  { id: 'events',        label: '📅 Events' },
];

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="dashboard">
      <UserHeader />

      <div className="dash-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`dash-tab${activeTab === t.id ? ' dash-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="dash-main">
        {activeTab === 'overview'     && <OverviewPanel />}
        {activeTab === 'certs'        && <CertificationsTab />}
        {activeTab === 'achievements' && <AchievementsTab />}
        {activeTab === 'calendar'     && <CertificationCalendar />}
        {activeTab === 'events'       && <EventsTab />}
      </main>
    </div>
  );
}
