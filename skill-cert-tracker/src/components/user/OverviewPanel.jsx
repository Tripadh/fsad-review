import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { getPast6Months, getMonthKey } from '../../utils/dateUtils';
import CertStatusPieChart from '../../charts/CertStatusPieChart';
import MonthlyActivityBarChart from '../../charts/MonthlyActivityBarChart';
import SuggestionsCard from './SuggestionsCard';
import ReminderPanel from './ReminderPanel';

export default function OverviewPanel() {
  const { currentUser } = useAuth();
  const { getCertsByUser } = useData();

  const certs = getCertsByUser(currentUser.id);

  return (
    <div className="overview-panel">
      <div className="overview-panel__title">Overview</div>
      
      {/* Reminders - Most Urgent */}
      <ReminderPanel />
      
      {/* Suggestions Section - High Priority */}
      <SuggestionsCard />
      
      <div className="overview-charts">
        <div className="chart-card">
          <div className="chart-card__title">📊 Certification Status</div>
          <CertStatusPieChart certs={certs} />
        </div>
        <div className="chart-card">
          <div className="chart-card__title">📅 Monthly Activity (Past 6 months)</div>
          <MonthlyActivityBarChart certs={certs} />
        </div>
        <div className="chart-card" style={{ display:'flex', flexDirection:'column', justifyContent:'space-between', gap:'1rem' }}>
          <div className="chart-card__title">📋 Quick Stats</div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', flex:1, justifyContent:'center' }}>
            {[
              { label: 'Total Certifications', value: certs.length, color: 'var(--glow-primary)' },
              { label: 'Active', value: certs.filter(c => c.status === 'active').length, color: 'var(--glow-success)' },
              { label: 'Expiring Soon', value: certs.filter(c => c.status === 'expiring_soon').length, color: 'var(--glow-warning)' },
              { label: 'Expired', value: certs.filter(c => c.status === 'expired').length, color: 'var(--glow-danger)' },
            ].map(row => (
              <div key={row.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:'0.84rem', color:'var(--text-muted)' }}>{row.label}</span>
                <span style={{ fontSize:'1.3rem', fontWeight:800, color:row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
