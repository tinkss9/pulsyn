import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl sm:text-8xl font-bold text-cyan-400 mb-4">404</h1>
        <h2 className="text-xl sm:text-2xl font-semibold mb-4">Page not found</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-semibold rounded-lg transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/docs"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Documentation
          </Link>
          <Link
            href="/marketplace"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
          >
            Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
