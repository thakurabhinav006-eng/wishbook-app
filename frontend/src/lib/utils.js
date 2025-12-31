import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getApiUrl = (path) => {
    // In production (Vercel), we want to use relative paths so requests go through the same domain
    // and are handled by the Rewrites or Vercel config.
    // If NEXT_PUBLIC_API_URL is set, use that.
    
    if (path.startsWith('http')) return path;

    const base = process.env.NEXT_PUBLIC_API_URL || '';
    
    // If no env var and we are on client, use relative path (empty base)
    // If server-side (build time), we might need a full URL if not using fetch with relative support,
    // but Next.js fetch supports relative if configured or if this is client component.
    
    // Fallback for purely local dev without env var:
    if (!base && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
         return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
    }

    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};
