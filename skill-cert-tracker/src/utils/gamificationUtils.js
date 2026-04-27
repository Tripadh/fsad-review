export function getGamificationLevel(points) {
  const p = points || 0;
  if (p < 100) return { label: 'Novice', color: 'var(--text-muted)' };
  if (p < 300) return { label: 'Intermediate', color: '#60a5fa' }; // Blue
  if (p < 600) return { label: 'Advanced', color: '#c084fc' }; // Purple
  if (p < 1000) return { label: 'Expert', color: '#fb923c' }; // Orange
  return { label: 'Master', color: '#f87171' }; // Red
}

export function getGamificationProgress(points) {
  const p = points || 0;
  if (p < 100) return { current: p, next: 100, percent: (p / 100) * 100 };
  if (p < 300) return { current: p, next: 300, percent: ((p - 100) / 200) * 100 };
  if (p < 600) return { current: p, next: 600, percent: ((p - 300) / 300) * 100 };
  if (p < 1000) return { current: p, next: 1000, percent: ((p - 600) / 400) * 100 };
  return { current: p, next: p, percent: 100 };
}
