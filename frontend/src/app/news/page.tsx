'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsCard from '@/components/NewsCard';
import Pagination from '@/components/Pagination';
import { api, NewsItem } from '@/lib/api';

const TAGS = ['All', 'Health', 'Agriculture', 'Education', 'Technology', 'Finance', 'Infrastructure', 'Environment', 'Defence'];

export default function NewsPage() {
  const [news, setNews]       = useState<NewsItem[]>([]);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(0);
  const [page, setPage]       = useState(1);
  const [tag, setTag]         = useState('');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<NewsItem | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getNews({ page, limit: 9, ...(tag && { tag }) });
      setNews(res.data);
      setTotal(res.total || 0);
      setPages(Math.ceil((res.total || 0) / 9));
    } catch { setNews([]); } finally { setLoading(false); }
  }, [page, tag]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {/* Header */}
        <div style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', padding: '32px 0' }}>
          <div className="container">
            <div className="tricolor-bar" style={{ borderRadius: 2, marginBottom: 20, maxWidth: 80 }} />
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em' }}>
              Policy <span className="gradient-text">News</span> & Updates
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>
              Latest policy announcements, government news, and scheme updates.
            </p>
            {/* Tag filter */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 20 }}>
              {TAGS.map(t => (
                <button key={t}
                  className={`chip ${(t === 'All' ? !tag : tag === t) ? 'active' : ''}`}
                  onClick={() => { setTag(t === 'All' ? '' : t); setPage(1); }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container section">
          {loading ? (
            <div className="grid-3">
              {[...Array(9)].map((_, i) => <div key={i} className="skeleton" style={{ height: 220 }} />)}
            </div>
          ) : news.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📰</div>
              <p>No news found for this category.</p>
            </div>
          ) : (
            <div className="grid-3">
              {news.map(n => (
                <NewsCard key={n.id} item={n} onClick={() => setSelected(n)} />
              ))}
            </div>
          )}
          <Pagination page={page} pages={pages} total={total} onPage={setPage} />
        </div>
      </main>
      <Footer />

      {/* News Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  {selected.tag && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--saffron)', background: 'rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.2)', borderRadius: 999, padding: '2px 10px', marginBottom: 10, display: 'inline-block' }}>
                      {selected.tag}
                    </span>
                  )}
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 8, lineHeight: 1.35 }}>{selected.title}</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                    📅 {new Date(selected.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <button className="modal-close btn" onClick={() => setSelected(null)}>✕</button>
              </div>
            </div>
            <div className="modal-body">
              {selected.summary && (
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, borderLeft: '3px solid var(--saffron)', paddingLeft: 16, marginBottom: 20 }}>
                  {selected.summary}
                </p>
              )}
              {selected.content && (
                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
                  {selected.content}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
