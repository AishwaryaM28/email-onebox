import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Email Onebox',
  description: 'Manage and organize your emails',
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
