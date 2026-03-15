'use client';
import { Policy } from '@/lib/api';

interface Props {
  policy: Policy;
  viewMode?: 'grid' | 'list';
  onClick?: () => void;
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === 'Active' ? 'badge badge-active' : status === 'Draft' ? 'badge badge-draft' : 'badge badge-archived';
  return <span className={cls}>{status}</span>;
}

function LevelBadge({ level }: { level: string }) {
  const cls = level === 'Central' ? 'badge badge-central' : level === 'State' ? 'badge badge-state' : 'badge badge-joint';
  return <span className={cls}>{level}</span>;
}

export default function PolicyCard({ policy, viewMode = 'grid', onClick }: Props) {
  const launchYear = policy.launched_date ? new Date(policy.launched_date).getFullYear() : null;

  if (viewMode === 'list') {
    return (
      <div className="policy-card-list" onClick={onClick}>
        {/* Category Dot */}
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: policy.category_color || '#FF9933', flexShrink: 0 }} />
        {/* Main */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>{policy.title}</span>
            <StatusBadge status={policy.status} />
            <LevelBadge level={policy.government_level} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {policy.ministry && <span>{policy.ministry}</span>}
            {launchYear && <span style={{ marginLeft: 12 }}>🗓 {launchYear}</span>}
            {policy.category_name && <span style={{ marginLeft: 12 }}>{policy.category_icon} {policy.category_name}</span>}
          </div>
        </div>
        {/* Views */}
        <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>👁 {policy.view_count ?? 0}</span>
      </div>
    );
  }

  return (
    <div
      className={`policy-card animate-fade ${policy.is_featured ? 'policy-card-featured' : ''}`}
      onClick={onClick}
    >
      {/* Top Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {policy.category_name ? (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: `${policy.category_color}20`, color: policy.category_color,
            border: `1px solid ${policy.category_color}30`,
            borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600,
          }}>
            {policy.category_icon} {policy.category_name}
          </span>
        ) : <span />}
        {policy.is_featured && (
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--saffron)', background: 'rgba(255,153,51,0.12)', border: '1px solid rgba(255,153,51,0.25)', borderRadius: 999, padding: '2px 8px', letterSpacing: '0.05em' }}>
            ★ FEATURED
          </span>
        )}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {policy.title}
      </h3>

      {/* Summary */}
      {policy.summary && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {policy.summary}
        </p>
      )}

      {/* Meta */}
      <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <StatusBadge status={policy.status} />
        <LevelBadge level={policy.government_level} />
        {launchYear && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>🗓 {launchYear}</span>}
        {policy.ministry && (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
            🏛 {policy.ministry}
          </span>
        )}
      </div>
    </div>
  );
}
