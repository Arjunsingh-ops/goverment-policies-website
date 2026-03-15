'use client';

interface Props {
  page: number;
  pages: number;
  total: number;
  onPage: (p: number) => void;
}

export default function Pagination({ page, pages, total, onPage }: Props) {
  if (pages <= 1) return null;

  const getPages = () => {
    const list: (number | '...')[] = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) list.push(i);
    } else {
      list.push(1);
      if (page > 3) list.push('...');
      for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) list.push(i);
      if (page < pages - 2) list.push('...');
      list.push(pages);
    }
    return list;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap', padding: '24px 0' }}>
      <button className="page-btn" disabled={page === 1} onClick={() => onPage(page - 1)}>‹</button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
        ) : (
          <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => onPage(p as number)}>
            {p}
          </button>
        )
      )}
      <button className="page-btn" disabled={page === pages} onClick={() => onPage(page + 1)}>›</button>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{total} results</span>
    </div>
  );
}
