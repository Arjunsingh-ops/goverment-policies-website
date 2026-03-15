'use client';
import { useEffect } from 'react';
import { Policy } from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface Props {
  policy: Policy;
  onClose: () => void;
}

export default function PolicyDetailModal({ policy, onClose }: Props) {
  const { user } = useAuth();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const launchDate = policy.launched_date
    ? new Date(policy.launched_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              {policy.category_name && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 10,
                  background: `${policy.category_color}20`, color: policy.category_color,
                  border: `1px solid ${policy.category_color}30`,
                  borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                }}>
                  {policy.category_icon} {policy.category_name}
                </span>
              )}
              <h2 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.3, color: 'var(--text-primary)' }}>
                {policy.title}
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <span className={`badge badge-${policy.status.toLowerCase()}`}>{policy.status}</span>
                <span className={`badge badge-${policy.government_level.toLowerCase()}`}>{policy.government_level}</span>
                {launchDate && <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>🗓 {launchDate}</span>}
              </div>
            </div>
            <button className="modal-close btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Summary */}
          {policy.summary && (
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, borderLeft: '3px solid var(--saffron)', paddingLeft: 16 }}>
              {policy.summary}
            </p>
          )}

          {/* Description */}
          {policy.description && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 10 }}>About this Policy</h4>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{policy.description}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid-2" style={{ gap: 12 }}>
            {policy.ministry && (
              <InfoBox icon="🏛" label="Ministry" value={policy.ministry} />
            )}
            {policy.budget_outlay && (
              <InfoBox icon="💰" label="Budget Outlay" value={policy.budget_outlay} />
            )}
            {policy.beneficiaries && (
              <InfoBox icon="👥" label="Beneficiaries" value={policy.beneficiaries} />
            )}
            {policy.state && (
              <InfoBox icon="📍" label="State" value={policy.state} />
            )}
          </div>

          {/* Eligibility */}
          {policy.eligibility && (
            <div style={{ background: 'rgba(19,136,8,0.08)', border: '1px solid rgba(19,136,8,0.2)', borderRadius: 'var(--radius-md)', padding: '16px 20px' }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--india-green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>✅ Eligibility</h4>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{policy.eligibility}</p>
            </div>
          )}

          {/* Benefits */}
          {policy.benefits && policy.benefits.length > 0 && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 12 }}>⭐ Key Benefits</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {policy.benefits.map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: 'rgba(255,153,51,0.05)', border: '1px solid rgba(255,153,51,0.1)', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ color: 'var(--saffron)', flexShrink: 0, marginTop: 1 }}>›</span>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            {policy.official_url && (
              <a href={policy.official_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                🔗 Official Website
              </a>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto', alignSelf: 'center' }}>
              👁 {policy.view_count ?? 0} views
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)', marginBottom: 6 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
