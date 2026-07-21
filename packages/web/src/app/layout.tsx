import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pulsyn — The AI-Native CDC Platform',
  description: 'Real-time change data capture without the complexity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">{children}</body>
    </html>
  );
}
