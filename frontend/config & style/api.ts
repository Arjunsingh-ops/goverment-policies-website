const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}
// ─── Types ────────────────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  description?: string;
}
export interface Policy {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  category_id?: number;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
  category_color?: string;
  ministry?: string;
  launched_date?: string;
  status: 'Active' | 'Draft' | 'Archived';
  budget_outlay?: string;
  beneficiaries?: string;
  eligibility?: string;
  benefits?: string[];
  official_url?: string;
  government_level: 'Central' | 'State' | 'Joint';
  state?: string;
  is_featured: boolean;
  view_count: number;
  created_at: string;
}
export interface NewsItem {
  id: string;
  title: string;
  content?: string;
  summary?: string;
  tag?: string;
  is_published: boolean;
  published_at: string;
  categories?: { name: string; color: string; icon: string };
}
export interface PaginatedPolicies {
  data: Policy[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
export interface AdminStats {
  total_policies: number;
  active_policies: number;
  featured_policies: number;
  total_news: number;
  total_users: number;
  admin_users: number;
}
// ─── API Methods ───────────────────────────────────────────────
export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string; user: { id: string; email: string } }>(
      `/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, { method: 'POST' }
    ),
  signup: (email: string, password: string, full_name: string) =>
    request<{ message: string; user_id: string }>(
      `/auth/signup?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&full_name=${encodeURIComponent(full_name)}`, { method: 'POST' }
    ),
  getMe: () => request<{ user: { id: string; email: string }; profile: { role: string; full_name?: string } }>('/auth/me'),
  // Categories
  getCategories: () => request<{ data: Category[] }>('/categories'),
  // Policies
  getPolicies: (params: Record<string, string | number | boolean | undefined>) => {
    const qs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
      .join('&');
    return request<PaginatedPolicies>(`/policies?${qs}`);
  },
  getPolicy: (id: string) => request<{ data: Policy }>(`/policies/${id}`),
  createPolicy: (data: Partial<Policy>) => request<{ data: Policy }>('/policies', { method: 'POST', body: JSON.stringify(data) }),
  updatePolicy: (id: string, data: Partial<Policy>) => request<{ data: Policy }>(`/policies/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePolicy: (id: string) => request<{ message: string }>(`/policies/${id}`, { method: 'DELETE' }),
  // News
  getNews: (params?: { page?: number; limit?: number; tag?: string }) => {
    const qs = params ? Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&') : '';
    return request<{ data: NewsItem[]; total: number; page: number; limit: number }>(`/news${qs ? '?' + qs : ''}`);
  },
  getNewsItem: (id: string) => request<{ data: NewsItem }>(`/news/${id}`),
  createNews: (data: Partial<NewsItem>) => request<{ data: NewsItem }>('/news', { method: 'POST', body: JSON.stringify(data) }),
  updateNews: (id: string, data: Partial<NewsItem>) => request<{ data: NewsItem }>(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNews: (id: string) => request<{ message: string }>(`/news/${id}`, { method: 'DELETE' }),
  // Bookmarks
  getBookmarks: () => request<{ data: { policy_id: string; policies: Policy }[] }>('/bookmarks'),
  addBookmark: (policyId: string) => request<{ message: string }>(`/bookmarks/${policyId}`, { method: 'POST' }),
  removeBookmark: (policyId: string) => request<{ message: string }>(`/bookmarks/${policyId}`, { method: 'DELETE' }),
  // Admin
  getAdminStats: () => request<AdminStats>('/admin/stats'),
};
