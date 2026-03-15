'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

const NAV_LINKS = [
  { href: '/',        label: 'Home' },
  { href: '/policies', label: 'Policies' },
  { href: '/news',    label: 'News' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7,11,20,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="tricolor-bar" />
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', gap: '24px' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '28px' }}>🇮🇳</span>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              <span className="gradient-text">India</span>{' '}
              <span style={{ color: 'var(--text-primary)' }}>Policy Portal</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              सरकारी नीतियाँ
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                padding: '8px 16px', borderRadius: 'var(--radius-md)',
                fontSize: '14px', fontWeight: 500,
                color: pathname === link.href ? 'var(--saffron)' : 'var(--text-secondary)',
                background: pathname === link.href ? 'rgba(255,153,51,0.1)' : 'transparent',
                transition: 'all var(--transition)',
              }}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin" style={{
              padding: '8px 16px', borderRadius: 'var(--radius-md)',
              fontSize: '14px', fontWeight: 500,
              color: pathname === '/admin' ? 'var(--saffron)' : 'var(--text-secondary)',
              background: pathname === '/admin' ? 'rgba(255,153,51,0.1)' : 'transparent',
            }}>
              Admin
            </Link>
          )}
        </nav>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth" className="btn btn-ghost btn-sm">Login</Link>
              <Link href="/auth?tab=signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </>
          )}
          {/* Mobile hamburger */}
          <button
            className="btn btn-ghost btn-sm"
            style={{ display: 'none' }}
            id="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </button>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
