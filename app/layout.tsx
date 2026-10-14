import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono, Syne } from 'next/font/google';
import './globals.css';

const display = Syne({ subsets: ['latin'], weight: ['500', '700', '800'], variable: '--font-display', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: 'Escrow Vault | Secure Digital Escrow',
  description: 'Browse verified escrow middlemen. Compare fees and vouch history, then contact them directly on Telegram.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#05070a',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
