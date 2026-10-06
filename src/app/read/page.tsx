import { Suspense } from 'react';
import { Reader } from '../../components/Reader';

export default function ReadPage() {
  return <Suspense fallback={<p className="empty-state">Loading reader…</p>}><Reader /></Suspense>;
}
