'use client';
import { Category } from '@/lib/api';

interface Props {
  categories: Category[];
  selected: string;
  onSelect: (slug: string) => void;
  counts?: Record<string, number>;
}

const NAV_FILTERS = [
  { label: 'All Policies', slug: '', icon: '🗂', color: 'var(--saffron)' },
  { label: 'Featured',     slug: '__featured', icon: '⭐', color: '#FFD700' },
];

export default function CategorySidebar({ categories, selected, onSelect, counts }: Props) {
  return (
    <aside style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Quick / Nav Filters */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
          Browse
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_FILTERS.map(f => (
            <div
              key={f.slug}
              className={`sidebar-item ${selected === f.slug ? 'active' : ''}`}
              onClick={() => onSelect(f.slug)}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
          Categories
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {categories.map(cat => (
            <div
              key={cat.slug}
              className={`sidebar-item ${selected === cat.slug ? 'active' : ''}`}
              onClick={() => onSelect(cat.slug)}
            >
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span style={{ flex: 1 }}>{cat.name}</span>
              {counts?.[cat.slug] !== undefined && (
                <span className="sidebar-count">{counts[cat.slug]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Gov Level */}
      <div>
        <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 10 }}>
          Government Level
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[{ label: 'Central', icon: '🏛' }, { label: 'State', icon: '🏢' }, { label: 'Joint', icon: '🤝' }].map(g => (
            <div key={g.label} className="sidebar-item" onClick={() => {}}>
              <span>{g.icon}</span>
              <span>{g.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
