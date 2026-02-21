'use client';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) router.push('/');
    else setError('Invalid email or password.');
  }

  return (
    <div className="login-wrap fade-in">
      <div className="login-box">
        <div className="login-logo">StandupLoop</div>
        <div className="login-sub">Daily standup tracker for Teams</div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="input-label">Email</label>
            <input className="input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus />
          </div>
          <div className="form-row">
            <label className="input-label">Password</label>
            <input className="input" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div className="login-hint">
          <strong style={{ color: 'var(--text2)' }}>Demo accounts</strong><br />
          Admin → admin@loop.dev / admin123<br />
          Members → sam@loop.dev · jordan@loop.dev · mia@loop.dev<br />
          Password → pass123
        </div>
      </div>
    </div>
  );
}
