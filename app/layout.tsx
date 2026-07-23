import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const display = Archivo({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-display' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'TradeTrust',
  description: 'AI-powered client updates for local tradespeople',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
