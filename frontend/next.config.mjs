/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const isDev = process.env.NODE_ENV !== 'production';
    if (!isDev) return [];
    
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
      {
        source: '/docs',
        destination: 'http://127.0.0.1:8000/docs',
      },
      {
        source: '/openapi.json',
        destination: 'http://127.0.0.1:8000/openapi.json',
      },
      {
         source: '/uploads/:path*',
         destination: 'http://127.0.0.1:8000/uploads/:path*',
      }
    ]
  },
};

export default nextConfig;
