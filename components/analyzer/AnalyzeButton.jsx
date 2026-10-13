'use client';

import React from 'react';
import { Play, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function AnalyzeButton({ onClick, loading, disabled }) {
    return (
        <Button
            size="lg"
            variant="primary"
            disabled={disabled || loading}
            onClick={onClick}
            className="w-full font-mono text-sm tracking-wide px-6 py-2.5 sm:py-3 flex items-center justify-center gap-2 group cursor-pointer h-[42px] active:scale-[0.98]"
        >
            {loading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span className="truncate">Analyzing Code...</span>
                </>
            ) : (
                <>
                    <Play className="w-4 h-4 fill-slate-950 transition-transform group-hover:scale-110 flex-shrink-0" />
                    <span className="font-semibold tracking-normal">Run PreJudge</span>
                </>
            )}
        </Button>
    );
}
