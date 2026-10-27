const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('bot_fee_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('bot_fee_token', token);
  } else {
    localStorage.removeItem('bot_fee_token');
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem('bot_fee_user');
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('bot_fee_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('bot_fee_user');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setAuthToken(null);
    setCurrentUser(null);
    window.dispatchEvent(new Event('auth:unauthorized'));
    throw new Error('Session expired or unauthorized. Please log in.');
  }

  if (response.headers.get('content-type')?.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    return data;
  }

  if (!response.ok) {
    throw new Error('Request failed with status ' + response.status);
  }

  return response;
}

export const api = {
  login: (username, password) =>
    request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  getMe: () => request('/me'),

  getStats: (year, month) =>
    request(`/bot/stats?year=${encodeURIComponent(year)}&month=${encodeURIComponent(month)}`),

  getRecords: (year, month, search = '', filter = 'all') => {
    const params = new URLSearchParams({
      year,
      month,
      ...(search ? { search } : {}),
      ...(filter && filter !== 'all' ? { filter } : {}),
    });
    return request(`/bot/records?${params.toString()}`);
  },

  createRecord: (clientData) =>
    request('/bot/records', {
      method: 'POST',
      body: JSON.stringify(clientData),
    }),

  updateRecord: (id, clientData) =>
    request(`/bot/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    }),

  deleteRecord: (id) =>
    request(`/bot/records/${id}`, {
      method: 'DELETE',
    }),

  updatePayment: (id, paymentData) =>
    request(`/bot/records/${id}/payment`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    }),

  toggleReferralStatus: (id, referralData) =>
    request(`/bot/records/${id}/referral-status`, {
      method: 'PUT',
      body: JSON.stringify(referralData),
    }),

  batchPayment: (batchData) =>
    request('/bot/records/batch-payment', {
      method: 'POST',
      body: JSON.stringify(batchData),
    }),

  batchReferralStatus: (batchData) =>
    request('/bot/records/batch-referral-status', {
      method: 'POST',
      body: JSON.stringify(batchData),
    }),

  getExportExcelUrl: (year) => `${API_BASE}/bot/export-excel?year=${encodeURIComponent(year)}`,
};
