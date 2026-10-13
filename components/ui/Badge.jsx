import React from 'react';
import { cn } from '../../lib/utils.js';

export function Badge({ children, variant = 'default', size = 'md', className = '' }) {
    const variants = {
        default: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
        cyan: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50 shadow-sm shadow-cyan-950',
        emerald: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50',
        amber: 'bg-amber-950/60 text-amber-300 border-amber-800/50',
        rose: 'bg-rose-950/60 text-rose-300 border-rose-800/50',
        purple: 'bg-purple-950/60 text-purple-300 border-purple-800/50',
    };

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-xs px-2.5 py-1',
        lg: 'text-sm px-3 py-1.5',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 font-medium rounded-full border',
                variants[variant] || variants.default,
                sizes[size] || sizes.md,
                className
            )}
        >
            {children}
        </span>
    );
}
