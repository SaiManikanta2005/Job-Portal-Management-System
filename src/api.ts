const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const apiFetch = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
};

export const api = {
  auth: {
    login: (credentials: any) => 
      apiFetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      }),
      
    register: (data: any) =>
      apiFetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },
  
  profile: {
    get: () => 
      apiFetch(`${API_BASE}/profile`, { headers: getHeaders() }),
    update: (formData: FormData) => {
      const token = localStorage.getItem('token');
      return apiFetch(`${API_BASE}/profile/update`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
    }
  },
  
  jobs: {
    list: (params?: any) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : '';
      return apiFetch(`${API_BASE}/jobs${qs}`);
    },
    my: () => 
      apiFetch(`${API_BASE}/employer/jobs`, { headers: getHeaders() }),
    create: (data: any) =>
      apiFetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      apiFetch(`${API_BASE}/jobs/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      }),
  },
  
  applications: {
    apply: (job_id: number, cover_letter: string) =>
      apiFetch(`${API_BASE}/applications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ job_id, cover_letter }),
      }),
    my: () =>
      apiFetch(`${API_BASE}/applications/my`, { headers: getHeaders() }),
    employer: () =>
      apiFetch(`${API_BASE}/employer/applications`, { headers: getHeaders() }),
    stats: () =>
      apiFetch(`${API_BASE}/employer/stats`, { headers: getHeaders() }),
    updateStatus: (id: number, status: string) =>
      apiFetch(`${API_BASE}/applications/${id}/status`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      }),
  },

  alerts: {
    list: () => apiFetch(`${API_BASE}/subscriptions`, { headers: getHeaders() }),
    subscribe: (data: any) => apiFetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    }),
    delete: (id: number) => apiFetch(`${API_BASE}/subscriptions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    }),
    notifications: () => apiFetch(`${API_BASE}/notifications`, { headers: getHeaders() }),
    markRead: () => apiFetch(`${API_BASE}/notifications/read`, { method: 'POST', headers: getHeaders() })
  }
};
