import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { daysUntilExpiry } from '../utils/dateUtils';

const BUCKETS = [
  { key: 'expired',   label: 'Expired',    color: '#ff4757' },
  { key: 'lt_7',      label: '< 7 days',   color: '#ff6b5b' },
  { key: 'lt_30',     label: '7–30 days',  color: '#ffa502' },
  { key: 'lt_90',     label: '31–90 days', color: '#ffe066' },
  { key: 'gt_90',     label: '> 90 days',  color: '#2ed573' },
];

export default function ExpirationBarChart({ certs }) {
  const counts = { expired: 0, lt_7: 0, lt_30: 0, lt_90: 0, gt_90: 0 };

  certs.forEach(c => {
    if (!c.expiryDate) return;
    const days = daysUntilExpiry(c.expiryDate);
    if (days < 0)   counts.expired++;
    else if (days <= 7)  counts.lt_7++;
    else if (days <= 30) counts.lt_30++;
    else if (days <= 90) counts.lt_90++;
    else counts.gt_90++;
  });

  const data = BUCKETS.map(b => ({ name: b.label, count: counts[b.key], color: b.color }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-normal)', borderRadius:'8px', padding:'8px 12px', fontSize:'0.83rem', color:'var(--text-primary)' }}>
        <div style={{ color:'var(--text-muted)', marginBottom:4 }}>{label}</div>
        <strong>{payload[0].value}</strong> cert{payload[0].value !== 1 ? 's' : ''}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(249,115,22,0.1)" vertical={false} />
        <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill:'rgba(249,115,22,0.06)' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={45}>
          {data.map((entry) => (
            <Cell key={entry.name} fill={entry.color} style={{ filter:`drop-shadow(0 0 4px ${entry.color})` }} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
