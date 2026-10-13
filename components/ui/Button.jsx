import React from 'react';
import { cn } from '../../lib/utils.js';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    onClick,
    ...props
}) {
    const variants = {
        primary:
            'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/20 active:scale-[0.98]',
        secondary:
            'bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 active:scale-[0.98]',
        outline:
            'bg-transparent hover:bg-slate-800/40 text-slate-300 border border-slate-700/80 hover:border-slate-500',
        danger:
            'bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-6 py-3 text-base rounded-xl font-medium',
    };

    return (
        <button
            disabled={disabled || loading}
            onClick={onClick}
            className={cn(
                'inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none select-none',
                variants[variant] || variants.primary,
                sizes[size] || sizes.md,
                className
            )}
            {...props}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
            )}
            {children}
        </button>
    );
}
