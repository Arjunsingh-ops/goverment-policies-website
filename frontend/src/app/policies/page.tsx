'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PolicyCard from '@/components/PolicyCard';
import PolicyDetailModal from '@/components/PolicyDetailModal';
import CategorySidebar from '@/components/CategorySidebar';
import SearchBar from '@/components/SearchBar';
import Pagination from '@/components/Pagination';
import { api, Policy, Category } from '@/lib/api';

const STATUS_OPTIONS = ['Active', 'Draft', 'Archived'];
const LEVEL_OPTIONS  = ['Central', 'State', 'Joint'];
const SORT_OPTIONS   = [
  { value: 'created_at', label: 'Most Recent' },
  { value: 'title',      label: 'Alphabetical' },
  { value: 'view_count', label: 'Most Viewed' },
  { value: 'launched_date', label: 'Launch Date' },
];

function PoliciesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal]   = useState(0);
  const [pages, setPages]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filters
  const [search,   setSearch]   = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status,   setStatus]   = useState('');
  const [govLevel, setGovLevel] = useState('');
  const [sort,     setSort]     = useState('created_at');
  const [order,    setOrder]    = useState('desc');
  const [page,     setPage]     = useState(1);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean | undefined> = {
        page, limit: 12, sort, order,
        ...(search   && { search }),
        ...(category && category !== '__featured' && { category }),
        ...(status   && { status }),
        ...(govLevel && { gov_level: govLevel }),
        ...(category === '__featured' && { featured: true }),
      };
      const res = await api.getPolicies(params);
      setPolicies(res.data);
      setTotal(res.total || 0);
      setPages(res.pages || 0);
    } catch { setPolicies([]); } finally { setLoading(false); }
  }, [search, category, status, govLevel, sort, order, page]);

  useEffect(() => { fetchPolicies(); }, [fetchPolicies]);
  useEffect(() => { api.getCategories().then(r => setCategories(r.data)).catch(() => {}); }, []);

  const resetFilters = () => {
    setSearch(''); setCategory(''); setStatus(''); setGovLevel('');
    setSort('created_at'); setOrder('desc'); setPage(1);
  };
  const hasFilters = search || category || status || govLevel;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {/* Page Header */}
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '32px 0' }}>
          <div className="container">
            <div className="tricolor-bar" style={{ borderRadius: 2, marginBottom: 20, maxWidth: 80 }} />
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em' }}>
              Government <span className="gradient-text">Policies</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>
              Browse {total || 'all'} policies across health, agriculture, education, finance, and more.
            </p>
            <div style={{ marginTop: 20, maxWidth: 600 }}>
              <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} />
            </div>
          </div>
        </div>

        <div className="container" style={{ padding: '32px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32, alignItems: 'start' }}>

            {/* Sidebar */}
            <div style={{ position: 'sticky', top: 80 }}>
              <CategorySidebar categories={categories} selected={category} onSelect={s => { setCategory(s); setPage(1); }} />
              {/* Status Filter */}
              <div style={{ marginTop: 24 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>Status</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {STATUS_OPTIONS.map(s => (
                    <div key={s} className={`sidebar-item ${status === s ? 'active' : ''}`}
                      onClick={() => { setStatus(status === s ? '' : s); setPage(1); }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: s === 'Active' ? 'var(--status-active)' : s === 'Draft' ? 'var(--status-draft)' : 'var(--status-archived)', flexShrink: 0 }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              {/* Clear */}
              {hasFilters && (
                <button className="btn btn-ghost btn-sm" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }} onClick={resetFilters}>
                  ✕ Clear Filters
                </button>
              )}
            </div>

            {/* Main Content */}
            <div>
              {/* Toolbar */}
              <div className="flex-between" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                {/* Gov Level Chips */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {LEVEL_OPTIONS.map(l => (
                    <button key={l} className={`chip ${govLevel === l ? 'active' : ''}`}
                      onClick={() => { setGovLevel(govLevel === l ? '' : l); setPage(1); }}>
                      {l}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {/* Sort */}
                  <select className="form-input" style={{ width: 160, height: 36, padding: '0 12px', fontSize: 13 }}
                    value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {/* Order */}
                  <button className="btn btn-ghost btn-sm" style={{ padding: '8px 10px' }}
                    onClick={() => setOrder(o => o === 'desc' ? 'asc' : 'desc')}>
                    {order === 'desc' ? '↓' : '↑'}
                  </button>
                  {/* View Mode */}
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    {(['grid', 'list'] as const).map(m => (
                      <button key={m} onClick={() => setViewMode(m)}
                        style={{ padding: '7px 12px', background: viewMode === m ? 'rgba(255,153,51,0.15)' : 'transparent', color: viewMode === m ? 'var(--saffron)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: 16, transition: 'all var(--transition)' }}>
                        {m === 'grid' ? '⊞' : '☰'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Policy Grid / List */}
              {loading ? (
                <div className={viewMode === 'grid' ? 'grid-3' : ''} style={{ display: viewMode === 'grid' ? undefined : 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...Array(9)].map((_, i) => <div key={i} className="skeleton" style={{ height: viewMode === 'grid' ? 220 : 70 }} />)}
                </div>
              ) : policies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                  <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No policies found</p>
                  <p style={{ fontSize: 14 }}>Try adjusting your filters or search query</p>
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 16 }} onClick={resetFilters}>Reset Filters</button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid-3">
                  {policies.map(p => <PolicyCard key={p.id} policy={p} viewMode="grid" onClick={() => setSelectedPolicy(p)} />)}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {policies.map(p => <PolicyCard key={p.id} policy={p} viewMode="list" onClick={() => setSelectedPolicy(p)} />)}
                </div>
              )}

              <Pagination page={page} pages={pages} total={total} onPage={setPage} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      {selectedPolicy && <PolicyDetailModal policy={selectedPolicy} onClose={() => setSelectedPolicy(null)} />}
    </div>
  );
}

export default function PoliciesPage() {
  return <Suspense><PoliciesContent /></Suspense>;
}
