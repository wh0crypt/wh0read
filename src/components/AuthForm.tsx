'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { ThemeToggle } from './ThemeToggle';

export function AuthForm() {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    if (!isSupabaseConfigured) { setMessage('Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable accounts.'); setBusy(false); return; }
    const result = register ? await supabase.auth.signUp({ email, password }) : await supabase.auth.signInWithPassword({ email, password });
    if (result.error) setMessage(result.error.message);
    else if (register) setMessage('Account created. Check your email to confirm access.');
    else window.location.assign('/dashboard');
    setBusy(false);
  }

  return <main className="auth-page"><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">w</span> wh0read</Link><ThemeToggle /></header>
    <div className="auth-card"><div className="auth-badge">w</div><h1>{register ? 'Create your account' : 'Welcome back'}</h1><p>{register ? 'Your personal library starts here.' : 'Continue where you left off.'}</p>
      <form onSubmit={submit}><label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com" /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters" /></label><button className="button primary full" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button></form>
      {message && <p className="form-message">{message}</p>}<button className="switch-auth" onClick={() => { setRegister(!register); setMessage(''); }}>{register ? 'I already have an account →' : 'Create an account →'}</button>
    </div></main>;
}
