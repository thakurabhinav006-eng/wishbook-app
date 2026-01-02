import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getApiUrl = (path) => {
    // If it's a full URL, return as is
    if (path.startsWith('http')) return path;

    // For file uploads or other static assets, we might want the full backend URL if not proxied
    // But since we have a proxy for /uploads in next.config.mjs, relative is best.

    // CRITICAL FIX: Always use relative paths for /api calls on the client.
    // This forces the request to go through the Next.js Rewrite Proxy (next.config.mjs).
    // Browser -> Next.js (Same Origin) -> Backend (Server-to-Server).
    // This bypasses CORS entirely.
    if (path.startsWith('/api') || path.startsWith('/uploads')) {
        // If we are on the server (SSR), we need the full URL.
        if (typeof window === 'undefined') {
             const base = process.env.BACKEND_URL || 'http://127.0.0.1:8000';
             return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
        }
        // Client Side -> Relative
        return path;
    }

    // Default fallback
    const base = process.env.NEXT_PUBLIC_API_URL || '';
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};
