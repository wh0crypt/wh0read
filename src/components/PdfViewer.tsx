'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Bookmark, Document } from '../types/database';
import { ThemeToggle } from './ThemeToggle';

type PdfDocument = { getPage: (page: number) => Promise<{ getViewport: (args: { scale: number }) => { width: number; height: number }; render: (args: { canvasContext: CanvasRenderingContext2D; viewport: unknown }) => { promise: Promise<void> } }> };

export function PdfViewer({ documentId }: { documentId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [pdf, setPdf] = useState<PdfDocument | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [darkReading, setDarkReading] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [error, setError] = useState('');
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) { setError('Connect Supabase to open documents.'); return; }
      const { data: doc, error: docError } = await supabase.from('documents').select('*').eq('id', documentId).single();
      if (docError) { setError(docError.message); return; }
      setDocument(doc as Document);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.assign('/login'); return; }
      const [{ data: progress }, { data: marks }] = await Promise.all([
        supabase.from('reading_progress').select('page').eq('document_id', documentId).eq('user_id', user.id).maybeSingle(),
        supabase.from('bookmarks').select('*').eq('document_id', documentId).eq('user_id', user.id).order('page'),
      ]);
      if (progress?.page) setPage(progress.page);
      setBookmarks((marks || []) as Bookmark[]);
    }
    void load();
  }, [documentId]);

  useEffect(() => {
    if (!document) return;
    const filePath = document.file_path;
    async function loadPdf() {
      try {
        const { data, error: urlError } = await supabase.storage.from('pdfs').createSignedUrl(filePath, 3600);
        if (urlError || !data?.signedUrl) throw urlError || new Error('The file URL could not be generated.');
        const pdfjs = await import('pdfjs-dist');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
        const loaded = await pdfjs.getDocument(data.signedUrl).promise;
        setPdf(loaded as unknown as PdfDocument); setPages(loaded.numPages);
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'The PDF could not be opened.'); }
    }
    void loadPdf();
  }, [document]);

  useEffect(() => {
    if (!pdf || !canvasRef.current || page > pages) return;
    let cancelled = false;
    async function render() {
      const loadedPage = await pdf!.getPage(page);
      if (cancelled || !canvasRef.current) return;
      const width = Math.min(window.innerWidth - 32, 900);
      const base = loadedPage.getViewport({ scale: 1 });
      const viewport = loadedPage.getViewport({ scale: width / base.width });
      const canvas = canvasRef.current; canvas.width = viewport.width; canvas.height = viewport.height;
      await loadedPage.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
    }
    void render();
    return () => { cancelled = true; };
  }, [pdf, page, pages]);

  async function savePage(nextPage: number) {
    setPage(nextPage);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from('reading_progress').upsert({ document_id: documentId, user_id: user.id, page: nextPage, updated_at: new Date().toISOString() });
  }
  async function toggleBookmark() {
    const existing = bookmarks.find(mark => mark.page === page);
    if (existing) { await supabase.from('bookmarks').delete().eq('id', existing.id); setBookmarks(bookmarks.filter(mark => mark.id !== existing.id)); }
    else { const { data: { user } } = await supabase.auth.getUser(); if (!user) return; const { data } = await supabase.from('bookmarks').insert({ document_id: documentId, user_id: user.id, page }).select().single(); if (data) setBookmarks([...bookmarks, data as Bookmark].sort((a, b) => a.page - b.page)); }
  }
  const marked = bookmarks.some(mark => mark.page === page);

  return <main className="reader-shell"><header className="topbar reader-topbar"><Link href="/dashboard" className="back-link">← <span>Library</span></Link><strong className="reader-title">{document?.title || 'Loading…'}</strong><div className="top-actions"><ThemeToggle /><button className="ghost-button" onClick={() => setDarkReading(!darkReading)}>{darkReading ? 'Light reading' : 'Dark reading'}</button></div></header>
    {error && <div className="notice reader-notice">{error}</div>}<div className={`reader-canvas ${darkReading ? 'reading-dark' : ''}`} onTouchStart={event => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={event => { if (touchStart.current === null) return; const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 45) void savePage(Math.max(1, Math.min(pages, page + (distance < 0 ? 1 : -1)))); touchStart.current = null; }}><canvas ref={canvasRef} /></div>
    <footer className="reader-controls"><button className="page-button" disabled={page <= 1} onClick={() => void savePage(page - 1)}>←</button><span>Page <b>{page}</b> <span className="muted">/ {pages || '—'}</span></span><button className="page-button" disabled={page >= pages} onClick={() => void savePage(page + 1)}>→</button><button className={`bookmark-button ${marked ? 'active' : ''}`} onClick={() => void toggleBookmark()}>{marked ? '★' : '☆'} <span>{marked ? 'Saved' : 'Save page'}</span></button></footer>
    {bookmarks.length > 0 && <div className="bookmark-strip"><span>Favorites</span>{bookmarks.map(mark => <button key={mark.id} onClick={() => void savePage(mark.page)}>{mark.page}</button>)}</div>}</main>;
}
