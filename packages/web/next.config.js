/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // CORS headers for API routes — restricted to pulsynai.com
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://pulsynai.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, x-api-key' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
