import React from 'react';
import { cn } from '../../lib/utils.js';

export function GlassCard({ children, className = '', elevated = false, hoverEffect = false, ...props }) {
    return (
        <div
            className={cn(
                elevated ? 'glass-panel-elevated' : 'glass-panel',
                'rounded-xl transition-all duration-300',
                hoverEffect && 'hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
