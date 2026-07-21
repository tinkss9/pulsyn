import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pulsyn — The AI-Native CDC Platform',
  description: 'Real-time change data capture without the complexity. Replicate databases with checkpoint recovery, connector certification, and AI agent integration.',
  keywords: ['CDC', 'change data capture', 'database replication', 'real-time', 'AI', 'MCP'],
  openGraph: {
    title: 'Pulsyn — The AI-Native CDC Platform',
    description: 'Real-time change data capture without the complexity',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}
