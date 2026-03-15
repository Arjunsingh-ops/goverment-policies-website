'use client';
import { NewsItem } from '@/lib/api';

interface Props {
  item: NewsItem;
  onClick?: () => void;
}

const TAG_COLORS: Record<string, string> = {
  Health: '#EF4444', Agriculture: '#22C55E', Education: '#3B82F6',
  Technology: '#8B5CF6', Finance: '#EAB308', Infrastructure: '#F97316',
  Defence: '#6B7280', Environment: '#10B981',
};

export default function NewsCard({ item, onClick }: Props) {
  const date = new Date(item.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const tagColor = item.tag ? (TAG_COLORS[item.tag] || 'var(--saffron)') : 'var(--saffron)';

  return (
    <div
      className="glass-card animate-fade"
      onClick={onClick}
      style={{ cursor: 'pointer', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      {/* Tag + Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {item.tag && (
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: tagColor, background: `${tagColor}20`, border: `1px solid ${tagColor}30`, borderRadius: 999, padding: '2px 10px' }}>
            {item.tag}
          </span>
        )}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>📅 {date}</span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.title}
      </h3>

      {/* Summary */}
      {item.summary && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.summary}
        </p>
      )}

      {/* Read more */}
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--saffron)', marginTop: 'auto' }}>
        Read more →
      </span>
    </div>
  );
}
