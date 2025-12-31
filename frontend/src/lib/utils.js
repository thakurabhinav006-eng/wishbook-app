import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getApiUrl = (path) => {
    const base = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.hostname}:8000` 
        : 'http://localhost:8000';
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};
