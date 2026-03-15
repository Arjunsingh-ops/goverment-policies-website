'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { api, Policy, NewsItem, AdminStats, Category } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type AdminTab = 'stats' | 'policies' | 'news';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<AdminTab>('stats');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [toast, setToast] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/auth');
  }, [authLoading, isAdmin, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchData = useCallback(async () => {
    if (!isAdmin) return;
    setDataLoading(true);
    try {
      const [s, p, n, c] = await Promise.all([
        api.getAdminStats(),
        api.getPolicies({ limit: 50 }),
        api.getNews({ limit: 50 }),
        api.getCategories(),
      ]);
      setStats(s);
      setPolicies(p.data);
      setNews(n.data);
      setCategories(c.data);
    } catch { } finally { setDataLoading(false); }
  }, [isAdmin]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Policy modal state ──────────────────────────────────────
  const [policyModal, setPolicyModal] = useState<'create' | 'edit' | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<Partial<Policy>>({});
  const [policyForm, setPolicyForm] = useState<Partial<Policy>>({
    title: '', summary: '', ministry: '', status: 'Active', government_level: 'Central', is_featured: false, benefits: [],
  });

  const openCreatePolicy = () => {
    setPolicyForm({ title: '', summary: '', ministry: '', description: '', status: 'Active', government_level: 'Central', is_featured: false, benefits: [], budget_outlay: '', beneficiaries: '', eligibility: '' });
    setPolicyModal('create');
  };
  const openEditPolicy = (p: Policy) => {
    setPolicyForm({ ...p });
    setEditingPolicy(p);
    setPolicyModal('edit');
  };
  const closePolicyModal = () => { setPolicyModal(null); };

  const savePolicy = async () => {
    try {
      if (policyModal === 'create') {
        await api.createPolicy(policyForm);
        showToast('✅ Policy created successfully');
      } else {
        await api.updatePolicy(editingPolicy.id!, policyForm);
        showToast('✅ Policy updated successfully');
      }
      closePolicyModal();
      fetchData();
    } catch (e: unknown) { showToast(`❌ ${e instanceof Error ? e.message : 'Failed'}`); }
  };

  const deletePolicy = async (id: string) => {
    if (!confirm('Delete this policy?')) return;
    try {
      await api.deletePolicy(id);
      showToast('Policy deleted');
      fetchData();
    } catch { showToast('❌ Failed to delete'); }
  };

  // ── News modal state ──────────────────────────────────────
  const [newsModal, setNewsModal] = useState<'create' | 'edit' | null>(null);
  const [editingNews, setEditingNews] = useState<Partial<NewsItem>>({});
  const [newsForm, setNewsForm] = useState<Partial<NewsItem>>({ title: '', summary: '', tag: '', is_published: true });

  const openCreateNews = () => {
    setNewsForm({ title: '', summary: '', content: '', tag: '', is_published: true });
    setNewsModal('create');
  };
  const openEditNews = (n: NewsItem) => { setNewsForm({ ...n }); setEditingNews(n); setNewsModal('edit'); };
  const closeNewsModal = () => setNewsModal(null);

  const saveNews = async () => {
    try {
      if (newsModal === 'create') {
        await api.createNews(newsForm);
        showToast('✅ News created');
      } else {
        await api.updateNews(editingNews.id!, newsForm);
        showToast('✅ News updated');
      }
      closeNewsModal();
      fetchData();
    } catch (e: unknown) { showToast(`❌ ${e instanceof Error ? e.message : 'Failed'}`); }
  };

  const deleteNews = async (id: string) => {
    if (!confirm('Delete this news item?')) return;
    try { await api.deleteNews(id); showToast('News deleted'); fetchData(); }
    catch { showToast('❌ Failed to delete'); }
  };

  if (authLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ fontSize: 18, color: 'var(--text-muted)' }}>Loading...</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {/* Admin Header */}
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '28px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28 }}>⚙</span>
              <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.02em' }}>
                Admin <span className="gradient-text">Dashboard</span>
              </h1>
              <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.2)', fontSize: 12, fontWeight: 700, color: 'var(--saffron)' }}>
                ADMIN
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage policies, news, and portal content.</p>
          </div>
        </div>

        <div className="container" style={{ padding: '28px 24px' }}>
          {/* Tabs */}
          <div className="tab-bar" style={{ marginBottom: 28 }}>
            {([['stats', '📊 Overview'], ['policies', '📋 Policies'], ['news', '📰 News']] as [AdminTab, string][]).map(([t, label]) => (
              <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{label}</button>
            ))}
          </div>

          {/* Stats Tab */}
          {tab === 'stats' && stats && (
            <div className="animate-fade">
              <div className="grid-3" style={{ marginBottom: 32 }}>
                {[
                  { label: 'Total Policies',  value: stats.total_policies,   icon: '📋', color: 'var(--saffron)' },
                  { label: 'Active Policies', value: stats.active_policies,  icon: '✅', color: 'var(--india-green)' },
                  { label: 'Featured',        value: stats.featured_policies, icon: '⭐', color: '#FFD700' },
                  { label: 'Total News',      value: stats.total_news,       icon: '📰', color: 'var(--ashoka-blue)' },
                  { label: 'Total Users',     value: stats.total_users,      icon: '👥', color: '#8B5CF6' },
                  { label: 'Admin Users',     value: stats.admin_users,      icon: '🔑', color: '#EF4444' },
                ].map(s => (
                  <div key={s.label} className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{ fontSize: 28 }}>{s.icon}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>All time</span>
                    </div>
                    <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Policies Tab */}
          {tab === 'policies' && (
            <div className="animate-fade">
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, fontSize: 18 }}>All Policies ({policies.length})</h2>
                <button className="btn btn-primary btn-sm" onClick={openCreatePolicy}>+ Add Policy</button>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Ministry</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Level</th>
                        <th>Featured</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policies.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</td>
                          <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.ministry || '—'}</td>
                          <td>{p.category_name || '—'}</td>
                          <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                          <td><span className={`badge badge-${p.government_level.toLowerCase()}`}>{p.government_level}</span></td>
                          <td style={{ textAlign: 'center' }}>{p.is_featured ? '⭐' : '—'}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEditPolicy(p)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => deletePolicy(p.id)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* News Tab */}
          {tab === 'news' && (
            <div className="animate-fade">
              <div className="flex-between" style={{ marginBottom: 20 }}>
                <h2 style={{ fontWeight: 700, fontSize: 18 }}>All News ({news.length})</h2>
                <button className="btn btn-primary btn-sm" onClick={openCreateNews}>+ Add News</button>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Tag</th>
                        <th>Published</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.map(n => (
                        <tr key={n.id}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</td>
                          <td>{n.tag || '—'}</td>
                          <td>{n.is_published ? <span className="badge badge-active">Yes</span> : <span className="badge badge-draft">No</span>}</td>
                          <td>{new Date(n.published_at).toLocaleDateString('en-IN')}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => openEditNews(n)}>Edit</button>
                              <button className="btn btn-danger btn-sm" onClick={() => deleteNews(n.id)}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Toast */}
      {toast && (
        <div className="toast">{toast}</div>
      )}

      {/* Policy Modal */}
      {policyModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closePolicyModal(); }}>
          <div className="modal-content" style={{ maxWidth: 600 }}>
            <div className="modal-header">
              <div className="flex-between">
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{policyModal === 'create' ? '+ New Policy' : '✏ Edit Policy'}</h2>
                <button className="modal-close btn" onClick={closePolicyModal}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              <div className="grid-2">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Title *</label>
                  <input className="form-input" value={policyForm.title || ''} onChange={e => setPolicyForm(f => ({ ...f, title: e.target.value }))} placeholder="Policy title" required />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Summary</label>
                  <textarea className="form-input" value={policyForm.summary || ''} onChange={e => setPolicyForm(f => ({ ...f, summary: e.target.value }))} rows={3} placeholder="Brief summary" style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ministry</label>
                  <input className="form-input" value={policyForm.ministry || ''} onChange={e => setPolicyForm(f => ({ ...f, ministry: e.target.value }))} placeholder="Ministry name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={policyForm.category_id || ''} onChange={e => setPolicyForm(f => ({ ...f, category_id: Number(e.target.value) || undefined }))}>
                    <option value="">— None —</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-input" value={policyForm.status || 'Active'} onChange={e => setPolicyForm(f => ({ ...f, status: e.target.value as Policy['status'] }))}>
                    {['Active', 'Draft', 'Archived'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Government Level</label>
                  <select className="form-input" value={policyForm.government_level || 'Central'} onChange={e => setPolicyForm(f => ({ ...f, government_level: e.target.value as Policy['government_level'] }))}>
                    {['Central', 'State', 'Joint'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Budget Outlay</label>
                  <input className="form-input" value={policyForm.budget_outlay || ''} onChange={e => setPolicyForm(f => ({ ...f, budget_outlay: e.target.value }))} placeholder="e.g. ₹5,000 Crore" />
                </div>
                <div className="form-group">
                  <label className="form-label">Beneficiaries</label>
                  <input className="form-input" value={policyForm.beneficiaries || ''} onChange={e => setPolicyForm(f => ({ ...f, beneficiaries: e.target.value }))} placeholder="e.g. 10 Crore farmers" />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Eligibility</label>
                  <input className="form-input" value={policyForm.eligibility || ''} onChange={e => setPolicyForm(f => ({ ...f, eligibility: e.target.value }))} placeholder="Who is eligible?" />
                </div>
                <div className="form-group">
                  <label className="form-label">Launch Date</label>
                  <input className="form-input" type="date" value={policyForm.launched_date || ''} onChange={e => setPolicyForm(f => ({ ...f, launched_date: e.target.value }))} />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
                  <input type="checkbox" id="featured" checked={!!policyForm.is_featured} onChange={e => setPolicyForm(f => ({ ...f, is_featured: e.target.checked }))} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  <label htmlFor="featured" style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>⭐ Mark as Featured</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <button className="btn btn-ghost" onClick={closePolicyModal}>Cancel</button>
                <button className="btn btn-primary" onClick={savePolicy}>
                  {policyModal === 'create' ? '+ Create Policy' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News Modal */}
      {newsModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeNewsModal(); }}>
          <div className="modal-content" style={{ maxWidth: 560 }}>
            <div className="modal-header">
              <div className="flex-between">
                <h2 style={{ fontSize: 20, fontWeight: 800 }}>{newsModal === 'create' ? '+ New News' : '✏ Edit News'}</h2>
                <button className="modal-close btn" onClick={closeNewsModal}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={newsForm.title || ''} onChange={e => setNewsForm(f => ({ ...f, title: e.target.value }))} placeholder="News headline" required />
              </div>
              <div className="form-group">
                <label className="form-label">Summary</label>
                <textarea className="form-input" value={newsForm.summary || ''} onChange={e => setNewsForm(f => ({ ...f, summary: e.target.value }))} rows={2} placeholder="Short summary" style={{ resize: 'vertical' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea className="form-input" value={newsForm.content || ''} onChange={e => setNewsForm(f => ({ ...f, content: e.target.value }))} rows={5} placeholder="Full article content" style={{ resize: 'vertical' }} />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Tag</label>
                  <select className="form-input" value={newsForm.tag || ''} onChange={e => setNewsForm(f => ({ ...f, tag: e.target.value }))}>
                    <option value="">— None —</option>
                    {['Health', 'Agriculture', 'Education', 'Technology', 'Finance', 'Infrastructure', 'Environment', 'Defence'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 20 }}>
                  <input type="checkbox" id="published" checked={!!newsForm.is_published} onChange={e => setNewsForm(f => ({ ...f, is_published: e.target.checked }))} style={{ width: 18, height: 18 }} />
                  <label htmlFor="published" style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Publish Now</label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                <button className="btn btn-ghost" onClick={closeNewsModal}>Cancel</button>
                <button className="btn btn-primary" onClick={saveNews}>
                  {newsModal === 'create' ? '+ Publish' : '💾 Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
