'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PolicyCard from '@/components/PolicyCard';
import NewsCard from '@/components/NewsCard';
import PolicyDetailModal from '@/components/PolicyDetailModal';
import { api, Policy, NewsItem } from '@/lib/api';

const STATS = [
  { value: '500+', label: 'Active Policies', icon: '📋', color: 'var(--saffron)' },
  { value: '8',    label: 'Categories',      icon: '🗂', color: 'var(--india-green)' },
  { value: '1B+',  label: 'Citizens Served', icon: '👥', color: 'var(--ashoka-blue)' },
  { value: '28',   label: 'States Covered',  icon: '📍', color: '#8B5CF6' },
];

export default function HomePage() {
  const [featuredPolicies, setFeaturedPolicies] = useState<Policy[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getPolicies({ featured: true, limit: 4 }),
      api.getNews({ limit: 3 }),
    ]).then(([p, n]) => {
      setFeaturedPolicies(p.data);
      setNews(n.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="hero-bg">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,153,51,0.1)', border: '1px solid rgba(255,153,51,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 24, fontSize: 13, fontWeight: 600, color: 'var(--saffron)' }}>
              🇮🇳 &nbsp;भारत सरकार की नीतियाँ
            </div>
            <h1 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.03em' }}>
              <span className="gradient-text">India's</span> Government
              <br />Policy Portal
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 560, margin: '0 auto 36px' }}>
              Explore, discover, and understand the policies shaping a billion lives — from welfare schemes to infrastructure, health, agriculture, and beyond.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/policies" className="btn btn-primary btn-lg">
                🔍 Browse Policies
              </Link>
              <Link href="/auth" className="btn btn-ghost btn-lg">
                Login / Sign Up
              </Link>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid-4" style={{ marginTop: 60, gap: 16 }}>
            {STATS.map(s => (
              <div key={s.label} className="glass-card" style={{ padding: '20px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Policies ─────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="flex-between" style={{ marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
                ⭐ <span className="gradient-text">Featured</span> Policies
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                Landmark schemes impacting millions of Indians
              </p>
            </div>
            <Link href="/policies?featured=true" className="btn btn-outline btn-sm">View All →</Link>
          </div>

          {loading ? (
            <div className="grid-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: 220 }} />
              ))}
            </div>
          ) : (
            <div className="grid-4">
              {featuredPolicies.map(p => (
                <PolicyCard key={p.id} policy={p} onClick={() => setSelectedPolicy(p)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Category Grid ─────────────────────────────────────── */}
      <section style={{ padding: '48px 0', background: 'var(--bg-secondary)' }}>
        <div className="container">
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 28, letterSpacing: '-0.02em', textAlign: 'center' }}>
            Browse by <span className="gradient-text-green">Category</span>
          </h2>
          <div className="grid-4">
            {[
              { name: 'Health',         icon: '🏥', color: '#EF4444', slug: 'health' },
              { name: 'Agriculture',    icon: '🌾', color: '#22C55E', slug: 'agriculture' },
              { name: 'Education',      icon: '📚', color: '#3B82F6', slug: 'education' },
              { name: 'Finance',        icon: '💰', color: '#EAB308', slug: 'finance' },
              { name: 'Infrastructure', icon: '🏗', color: '#F97316', slug: 'infrastructure' },
              { name: 'Technology',     icon: '💻', color: '#8B5CF6', slug: 'technology' },
              { name: 'Defence',        icon: '🛡', color: '#6B7280', slug: 'defence' },
              { name: 'Environment',    icon: '🌿', color: '#10B981', slug: 'environment' },
            ].map(c => (
              <Link key={c.slug} href={`/policies?category=${c.slug}`}
                className="glass-card"
                style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 32, background: `${c.color}20`, borderRadius: 'var(--radius-md)', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {c.icon}
                </span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{c.name}</div>
                  <div style={{ fontSize: 12, color: c.color, fontWeight: 600, marginTop: 3 }}>View Policies →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Latest News ───────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="flex-between" style={{ marginBottom: 32 }}>
            <div>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em' }}>
                📰 Latest <span className="gradient-text">Updates</span>
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
                Recent policy announcements and government news
              </p>
            </div>
            <Link href="/news" className="btn btn-outline btn-sm">All News →</Link>
          </div>
          {loading ? (
            <div className="grid-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: 200 }} />)}
            </div>
          ) : (
            <div className="grid-3">
              {news.map(n => <NewsCard key={n.id} item={n} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section style={{ padding: '60px 0', background: 'linear-gradient(135deg, rgba(255,153,51,0.08), rgba(19,136,8,0.06))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>
            Stay <span className="gradient-text">Informed</span>
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
            Create a free account to bookmark policies, get updates, and track schemes relevant to you.
          </p>
          <Link href="/auth?tab=signup" className="btn btn-primary btn-lg">
            🚀 Get Started Free
          </Link>
        </div>
      </section>

      <Footer />

      {selectedPolicy && (
        <PolicyDetailModal policy={selectedPolicy} onClose={() => setSelectedPolicy(null)} />
      )}
    </div>
  );
}
