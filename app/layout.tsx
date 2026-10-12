import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Secure Digital Escrow — Verified Middleman Directory',
  description:
    'Browse verified escrow middlemen. Compare fees and vouches, then contact them directly on Telegram.',
};

export const viewport: Viewport = {
  themeColor: '#030406',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
