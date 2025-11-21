import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Resourcery IT Portal',
  description: 'Fast IT support for everyone',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
