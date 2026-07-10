import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TradeTrust',
  description: 'AI-powered client updates for local tradespeople',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
