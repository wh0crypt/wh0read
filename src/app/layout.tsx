import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'wh0read — your PDF library',
  description: 'Read your PDFs on any device, always synchronized.',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
