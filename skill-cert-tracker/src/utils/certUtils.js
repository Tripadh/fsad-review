import { daysUntilExpiry } from './dateUtils';

/**
 * Compute the status of a certification at read time.
 * NEVER trust the stored status field.
 */
export function deriveCertStatus(expiryDate) {
  if (!expiryDate) return 'active';
  const days = daysUntilExpiry(expiryDate);
  if (days === null) return 'active';
  if (days < 0)   return 'expired';
  if (days <= 90) return 'expiring_soon';
  return 'active';
}

export const STATUS_LABELS = {
  active:         'Active',
  expiring_soon:  'Expiring Soon',
  expired:        'Expired',
};

export const STATUS_COLORS = {
  active:        'var(--glow-success)',
  expiring_soon: 'var(--glow-warning)',
  expired:       'var(--glow-danger)',
};

export function getExpirationBucket(expiryDate) {
  if (!expiryDate) return 'no_expiry';
  const days = daysUntilExpiry(expiryDate);
  if (days === null) return 'no_expiry';
  if (days < 0)   return 'expired';
  if (days <= 7)  return 'lt_7';
  if (days <= 30) return 'lt_30';
  if (days <= 90) return 'lt_90';
  return 'gt_90';
}

/**
 * Attempt to generate an external verification URL based on the issuer and credential ID.
 */
export function getExternalVerificationUrl(issuer, credentialId) {
  if (!issuer || !credentialId) return null;
  const iss = issuer.toLowerCase();
  const id = encodeURIComponent(credentialId);

  if (iss.includes('coursera')) {
    return `https://www.coursera.org/account/accomplishments/verify/${id}`;
  }
  if (iss.includes('google') || iss.includes('gcp')) {
    return `https://www.credential.net/${id}`;
  }
  if (iss.includes('aws') || iss.includes('amazon')) {
    return `https://aws.amazon.com/verification`; // Note: AWS usually requires lookup
  }
  if (iss.includes('microsoft')) {
    return `https://learn.microsoft.com/en-us/users/me/credentials/${id}`;
  }
  if (iss.includes('hackerrank')) {
    return `https://www.hackerrank.com/certificates/${id}`;
  }
  if (iss.includes('cisco')) {
    return `https://www.credly.com/badges/${id}`;
  }
  if (iss.includes('comptia')) {
    return `https://www.certmetrics.com/comptia/public/verification.aspx?code=${id}`;
  }
  
  return null;
}
