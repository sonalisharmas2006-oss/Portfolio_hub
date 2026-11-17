const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';
const API_V1 = `${API_BASE}/api/v1`;

export function resolveAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_V1}${path}`, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json();
}

// Public endpoints
export const api = {
  profile: () => apiFetch<any>('/profile'),
  education: () => apiFetch<any[]>('/education'),
  experience: () => apiFetch<any[]>('/experience'),
  skills: () => apiFetch<any[]>('/skills'),
  projects: () => apiFetch<any[]>('/projects'),
  project: (slug: string) => apiFetch<any>(`/projects/${slug}`),
  achievements: () => apiFetch<any[]>('/achievements'),
  certificates: () => apiFetch<any[]>('/certificates'),
  resume: () => apiFetch<any>('/resume'),
  socialLinks: () => apiFetch<any[]>('/social-links'),
  siteSettings: () => apiFetch<any>('/site-settings'),
  contact: (body: { name: string; email: string; subject: string; message: string }) =>
    apiFetch<{ accepted: boolean; email_status: string; message?: string }>('/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
};

// Admin endpoints (all require credentials: 'include')
const adminFetch = <T>(path: string, init?: RequestInit) =>
  apiFetch<T>(path, { ...init, credentials: 'include' });

export const adminApi = {
  login: (username: string, password: string) =>
    adminFetch<{ authenticated: boolean; username: string }>('/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }),
  logout: () => adminFetch<any>('/admin/logout', { method: 'POST' }),
  me: () => adminFetch<{ authenticated: boolean; username: string }>('/admin/me'),
  list: (collection: string) => adminFetch<any[]>(`/admin/${collection}`),
  create: (collection: string, body: any) =>
    adminFetch<any>(`/admin/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  update: (collection: string, id: number, body: any) =>
    adminFetch<any>(`/admin/${collection}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  delete: (collection: string, id: number) =>
    adminFetch<any>(`/admin/${collection}/${id}`, { method: 'DELETE' }),
  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return adminFetch<{ url: string; filename: string }>('/admin/upload', { method: 'POST', body: form });
  },
};
