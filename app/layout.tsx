import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Credential Distributor',
  description: 'One-time credential distribution with admin approval',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
