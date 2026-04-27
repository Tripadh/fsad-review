const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

function getAuthToken() {
  try {
    const raw = localStorage.getItem('sct_session');
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.token || null;
  } catch {
    return null;
  }
}

export async function request(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return payload;
}