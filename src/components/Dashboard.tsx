'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Document } from '../types/database';
import { ThemeToggle } from './ThemeToggle';

export function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!isSupabaseConfigured) { setError('Connect Supabase to load your library.'); setLoading(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.assign('/login'); return; }
    setEmail(user.email || '');
    const { data, error: queryError } = await supabase.from('documents').select('*').order('updated_at', { ascending: false });
    if (queryError) setError(queryError.message); else setDocuments((data || []) as Document[]);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);

  async function signOut() { await supabase.auth.signOut(); window.location.assign('/'); }
  async function upload(file: File) {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const path = `${user.id}/${crypto.randomUUID()}-${file.name}`;
    const uploadResult = await supabase.storage.from('pdfs').upload(path, file, { contentType: 'application/pdf' });
    if (uploadResult.error) { setError(uploadResult.error.message); return; }
    const { error: insertError } = await supabase.from('documents').insert({ owner_id: user.id, title: file.name.replace(/\.pdf$/i, ''), file_path: path, file_size: file.size });
    if (insertError) setError(insertError.message); else void load();
  }

  return <main className="app-shell"><header className="topbar app-topbar"><Link className="brand" href="/"><span className="brand-mark">w</span> wh0read</Link><div className="top-actions"><span className="user-email">{email}</span><ThemeToggle /><button className="ghost-button" onClick={signOut}>Sign out</button></div></header>
    <section className="dashboard-content"><div className="section-heading"><div><p className="eyebrow">LIBRARY</p><h1>Your reading</h1><p className="muted">All your content, synchronized.</p></div><label className="button primary upload-button">+ Add PDF<input type="file" accept="application/pdf" onChange={e => e.target.files?.[0] && void upload(e.target.files[0])} /></label></div>
      {error && <div className="notice">{error}</div>}{loading ? <div className="empty-state">Loading library…</div> : documents.length === 0 ? <div className="empty-state"><div className="empty-icon">▧</div><h2>No PDFs yet</h2><p>Add your first document to start reading.</p></div> : <div className="document-grid">{documents.map(doc => <Link href={`/read?id=${doc.id}`} className="document-card" key={doc.id}><div className="doc-cover">PDF</div><div className="doc-info"><h2>{doc.title}</h2><p>{doc.file_size ? `${(doc.file_size / 1024 / 1024).toFixed(1)} MB` : 'PDF document'}</p></div><span className="card-arrow">→</span></Link>)}</div>}
    </section></main>;
}
