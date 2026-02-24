const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
});

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return dateFormatter.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function formatMonth(dateStr) {
  if (!dateStr) return '';
  try {
    return monthFormatter.format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export function daysUntilExpiry(expiryDateStr) {
  if (!expiryDateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDateStr);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
}

export function isExpired(expiryDateStr) {
  if (!expiryDateStr) return false;
  return daysUntilExpiry(expiryDateStr) < 0;
}

export function isExpiringSoon(expiryDateStr, withinDays = 90) {
  if (!expiryDateStr) return false;
  const days = daysUntilExpiry(expiryDateStr);
  return days !== null && days >= 0 && days <= withinDays;
}

export function getPast6Months() {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: monthFormatter.format(d),
    });
  }
  return months;
}

export function getMonthKey(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function todayISO() {
  return new Date().toISOString().split('T')[0];
}
