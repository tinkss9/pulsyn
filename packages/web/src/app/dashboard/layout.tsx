'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/pipelines', label: 'Pipelines', icon: '🔄' },
  { href: '/dashboard/connectors', label: 'Connectors', icon: '🔌' },
  { href: '/marketplace', label: 'Marketplace', icon: '🏪' },
  { href: '/mcp/templates', label: 'MCP Templates', icon: '🤖' },
  { href: '/ai/insights', label: 'AI Insights', icon: '🧠' },
  { href: '/dashboard/usage', label: 'Usage', icon: '📈' },
  { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
  { href: '/dashboard/api-keys', label: 'API Keys', icon: '🔑' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name?: string; email?: string; plan?: string } | null>(null);

  useEffect(() => {
    const apiKey = localStorage.getItem('pulsyn_api_key');
    if (!apiKey) {
      router.push('/login');
      return;
    }
    try {
      const userData = JSON.parse(localStorage.getItem('pulsyn_user') || '{}');
      setUser(userData);
    } catch {
      setUser({});
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/50 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Link href="/" className="text-xl font-bold text-pulsyn-500">Pulsyn</Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-pulsyn-950/50 text-pulsyn-400 border border-pulsyn-800'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-pulsyn-600 rounded-full flex items-center justify-center text-sm font-medium">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name || user.email || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user.plan || 'community'} plan</p>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('pulsyn_api_key');
                localStorage.removeItem('pulsyn_user');
                window.location.href = '/login';
              }}
              className="text-gray-500 hover:text-white text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
