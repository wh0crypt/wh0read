'use client';

import { useSearchParams } from 'next/navigation';
import { PdfViewer } from './PdfViewer';

export function Reader() {
  const id = useSearchParams().get('id');
  return id ? <PdfViewer documentId={id} /> : <p className="empty-state">The document identifier is missing.</p>;
}
