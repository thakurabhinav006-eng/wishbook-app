/** @type {import('next').NextConfig} */
const nextConfig = {
  // Trigger redeploy for env vars
  async rewrites() {
    // In dev, defaults to localhost. In prod, uses the environment variable.
    let backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
    // Remove trailing slash if present to avoid double slashes in destination
    if (backendUrl.endsWith('/')) {
        backendUrl = backendUrl.slice(0, -1);
    }
    
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
  output: 'standalone',
};

export default nextConfig;
