import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import AdminHeader from './AdminHeader';
import AdminOverview from './AdminOverview';
import UsersPanel from './UsersPanel';
import ExpirationTracker from './ExpirationTracker';
import '../../styles/dashboard.css';
import '../../styles/admin.css';

const TABS = [
  { id: 'overview',    label: '📊 Overview' },
  { id: 'users',       label: '👥 Users' },
  { id: 'expiration',  label: '⏰ Expiration Tracker' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { getAllUsersForAdmin } = useAuth();
  const { getAllCerts } = useData();

  const allUsers = getAllUsersForAdmin();
  const allCerts = getAllCerts();

  return (
    <div className="admin-dash">
      <AdminHeader />

      <div className="admin-nav">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`admin-nav-tab${activeTab === t.id ? ' admin-nav-tab--active' : ''}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="admin-main">
        {activeTab === 'overview' && (
          <div>
            <div className="admin-section__title">System Overview</div>
            <AdminOverview allCerts={allCerts} allUsers={allUsers} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-section">
            <div className="admin-section__title">All Users</div>
            <UsersPanel allUsers={allUsers} allCerts={allCerts} />
          </div>
        )}

        {activeTab === 'expiration' && (
          <div className="admin-section">
            <div className="admin-section__title">
              Expiration Tracker
            </div>
            <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'1rem' }}>
              All certifications sorted by expiry date. Use the Renew button to update expiry dates and send renewal notices.
            </p>
            <ExpirationTracker allCerts={allCerts} allUsers={allUsers} />
          </div>
        )}
      </main>
    </div>
  );
}
