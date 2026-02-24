import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/certUtils';

const COLORS = {
  active:        '#2ed573',
  expiring_soon: '#ffa502',
  expired:       '#ff4757',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-normal)',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '0.83rem',
      color: 'var(--text-primary)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      animation: 'tooltipAppear 150ms ease',
    }}>
      <strong>{name}</strong>: {value} cert{value !== 1 ? 's' : ''}
    </div>
  );
};

export default function CertStatusPieChart({ certs }) {
  const counts = { active: 0, expiring_soon: 0, expired: 0 };
  certs.forEach(c => { if (counts[c.status] !== undefined) counts[c.status]++; });

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: STATUS_LABELS[key], value, key }));

  if (data.length === 0) {
    data.push({ name: 'No certifications', value: 1, key: 'empty' });
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          dataKey="value"
          stroke="none"
        >
          {data.map((entry) => (
            <Cell
              key={entry.key}
              fill={COLORS[entry.key] || '#555'}
              style={{ filter: `drop-shadow(0 0 6px ${COLORS[entry.key] || '#555'})` }}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
