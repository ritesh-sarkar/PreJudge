import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function generateId(prefix = 'pj') {
    const rand = Math.random().toString(36).substring(2, 10);
    const ts = Date.now().toString(36);
    return `${prefix}_${ts}${rand}`;
}

export function formatTime(ms) {
    if (ms === undefined || ms === null) return '--';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
}

export function truncateString(str, maxLength = 1000) {
    if (!str || str.length <= maxLength) return str;
    return str.substring(0, maxLength) + '\n... [truncated]';
}
