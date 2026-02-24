import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { getPast6Months, getMonthKey } from '../utils/dateUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-normal)',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '0.83rem',
      color: 'var(--text-primary)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <strong>{payload[0].value}</strong> added
    </div>
  );
};

export default function MonthlyActivityBarChart({ certs }) {
  const months = getPast6Months();
  const countMap = {};
  certs.forEach(c => {
    const k = getMonthKey(c.createdAt);
    countMap[k] = (countMap[k] || 0) + 1;
  });

  const data = months.map(m => ({
    name: m.label,
    count: countMap[m.key] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(249,115,22,0.1)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(249,115,22,0.06)' }} />
        <Bar
          dataKey="count"
          fill="url(#barGrad)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
