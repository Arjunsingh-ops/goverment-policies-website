import Link from 'next/link';

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Policies', href: '/policies' },
  { label: 'News', href: '/news' },
  { label: 'Login', href: '/auth' },
];

const CATEGORIES = ['Health', 'Agriculture', 'Education', 'Finance', 'Infrastructure', 'Technology'];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', paddingTop: '48px', paddingBottom: '24px', marginTop: 'auto' }}>
      <div className="container">
        <div className="grid-3" style={{ marginBottom: '40px' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>🇮🇳</span>
              <span style={{ fontWeight: 800, fontSize: '16px' }}>
                <span className="gradient-text">India</span> Policy Portal
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.7', maxWidth: '280px' }}>
              Your one-stop destination for exploring India's government policies, welfare schemes, and development initiatives.
            </p>
            <div className="tricolor-bar" style={{ borderRadius: '2px', marginTop: '16px', height: '3px', maxWidth: '120px' }} />
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Quick Links
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {LINKS.map(l => (
                <Link key={l.href} href={l.href} style={{ fontSize: '14px', color: 'var(--text-secondary)', transition: 'color var(--transition)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--saffron)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Categories
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CATEGORIES.map(c => (
                <Link key={c} href={`/policies?category=${c.toLowerCase()}`}
                  style={{ fontSize: '14px', color: 'var(--text-secondary)', transition: 'color var(--transition)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--india-green)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}>
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} India Policy Portal. For informational purposes only.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            जय हिन्द 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}
