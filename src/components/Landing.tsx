'use client';

import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';

export function Landing() {
  return (
    <main className="landing">
      <header className="topbar"><div className="brand"><span className="brand-mark">w</span> wh0read</div><ThemeToggle /></header>
      <section className="hero">
        <p className="eyebrow">YOUR LIBRARY, EVERYWHERE</p>
        <h1>Pick up<br /><em>where you left off.</em></h1>
        <p className="hero-copy">Your PDFs, bookmarks, and reading progress synchronized. From desktop to mobile, without repeated downloads.</p>
        <div className="hero-actions"><Link className="button primary" href="/login">Start reading <span>→</span></Link><a className="text-link" href="#features">Discover more ↓</a></div>
      </section>
      <section id="features" className="feature-grid">
        <article><span className="feature-icon">↗</span><h2>Continue where you left off</h2><p>Your last page is automatically saved across all your devices.</p></article>
        <article><span className="feature-icon">☆</span><h2>Mark what matters</h2><p>Save favorite pages and return to them whenever you want.</p></article>
        <article><span className="feature-icon">◐</span><h2>Read your way</h2><p>Dark interface and reading modes to make reading easier on your eyes.</p></article>
      </section>
      <footer className="landing-footer">Private by design · Secure synchronization with Supabase</footer>
    </main>
  );
}
