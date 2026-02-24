import CertStatusPieChart from '../../charts/CertStatusPieChart';
import ExpirationBarChart from '../../charts/ExpirationBarChart';

export default function AdminOverview({ allCerts, allUsers }) {
  const stats = {
    totalUsers:    allUsers.length,
    totalCerts:    allCerts.length,
    active:        allCerts.filter(c => c.status === 'active').length,
    expiring_soon: allCerts.filter(c => c.status === 'expiring_soon').length,
    expired:       allCerts.filter(c => c.status === 'expired').length,
  };

  const statCards = [
    { icon:'👥', label:'Total Users',     value: stats.totalUsers,    variant:'primary'   },
    { icon:'🎓', label:'Total Certs',      value: stats.totalCerts,    variant:'secondary' },
    { icon:'✅', label:'Active',           value: stats.active,        variant:'success'   },
    { icon:'⚠️', label:'Expiring Soon',   value: stats.expiring_soon, variant:'warning'   },
    { icon:'❌', label:'Expired',          value: stats.expired,       variant:'danger'    },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="stat-cards">
        {statCards.map(s => (
          <div key={s.label} className={`stat-card stat-card--${s.variant}`}>
            <div className="stat-card__icon">{s.icon}</div>
            <div className="stat-card__value">{s.value}</div>
            <div className="stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="overview-charts">
        <div className="chart-card">
          <div className="chart-card__title">📊 Certification Status (All Users)</div>
          <CertStatusPieChart certs={allCerts} />
        </div>
        <div className="chart-card">
          <div className="chart-card__title">⏰ Expiration Breakdown</div>
          <ExpirationBarChart certs={allCerts} />
        </div>
      </div>
    </div>
  );
}
