/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // In dev, defaults to localhost. In prod, uses the environment variable.
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/docs',
        destination: `${backendUrl}/docs`,
      },
      {
        source: '/openapi.json',
        destination: `${backendUrl}/openapi.json`,
      },
      {
         source: '/uploads/:path*',
         destination: `${backendUrl}/uploads/:path*`,
      }
    ]
  },
};

export default nextConfig;
