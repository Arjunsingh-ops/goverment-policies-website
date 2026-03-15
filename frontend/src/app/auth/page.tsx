'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, signup } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(
    searchParams.get('tab') === 'signup' ? 'signup' : 'login'
  );
  const [form, setForm] = useState({ email: '', password: '', fullName: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { if (user) router.push('/'); }, [user, router]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (tab === 'signup' && form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      if (tab === 'login') {
        await login(form.email, form.password);
        router.push('/');
      } else {
        const res = await signup(form.email, form.password, form.fullName);
        setSuccess(res.message || 'Account created! Please check your email.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        {/* Background glow */}
        <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle at 50% 40%, rgba(255,153,51,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative' }} className="animate-fade">
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🇮🇳</div>
            <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em' }}>
              <span className="gradient-text">India</span> Policy Portal
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>
              {tab === 'login' ? 'Welcome back! Sign in to your account.' : 'Create your free account today.'}
            </p>
          </div>

          {/* Card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            {/* Tabs */}
            <div className="tab-bar" style={{ padding: '0 24px' }}>
              {(['login', 'signup'] as const).map(t => (
                <button key={t} className={`tab-item ${tab === t ? 'active' : ''}`} onClick={() => { setTab(t); setError(''); setSuccess(''); }}>
                  {t === 'login' ? 'Login' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '28px 28px 32px' }}>
              {/* Error / Success */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, color: '#FCA5A5', fontSize: 14 }}>
                  ⚠ {error}
                </div>
              )}
              {success && (
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 20, color: '#86EFAC', fontSize: 14 }}>
                  ✅ {success}
                </div>
              )}

              {tab === 'signup' && (
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" type="text" placeholder="Your full name" value={form.fullName} onChange={set('fullName')} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required minLength={8} />
              </div>
              {tab === 'signup' && (
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
                </div>
              )}

              <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
                {loading ? '⏳ Please wait...' : tab === 'login' ? '🔐 Login' : '🚀 Create Account'}
              </button>

              {tab === 'login' && (
                <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
                  Don't have an account?{' '}
                  <button type="button" onClick={() => setTab('signup')} style={{ background: 'none', border: 'none', color: 'var(--saffron)', cursor: 'pointer', fontWeight: 600 }}>
                    Sign up for free
                  </button>
                </p>
              )}
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 20 }}>
            By signing up you agree to our terms of service.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return <Suspense><AuthContent /></Suspense>;
}
