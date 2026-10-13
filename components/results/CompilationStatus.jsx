'use client';

import React from 'react';
import { CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.jsx';
import { Badge } from '../ui/Badge.jsx';

export function CompilationStatus({ compilation }) {
    const [copied, setCopied] = React.useState(false);

    if (!compilation) return null;

    const isSuccess = compilation.status === 'passed';

    const handleCopy = () => {
        if (compilation.errors) {
            navigator.clipboard.writeText(compilation.errors);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <GlassCard className="p-3.5 sm:p-4 border-white/10 w-full overflow-hidden">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-900 border border-white/5 flex-shrink-0">
                        {isSuccess ? (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                        ) : (
                            <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="text-xs sm:text-sm font-semibold text-white whitespace-nowrap">
                                {isSuccess ? 'Compilation Succeeded' : 'Compilation Failed'}
                            </span>
                            <Badge variant={isSuccess ? 'emerald' : 'rose'} size="sm">
                                {isSuccess ? 'Exit 0' : `Exit ${compilation.exitCode ?? 1}`}
                            </Badge>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                            Compiler: {compilation.compiler || 'g++ (C++20)'}
                        </p>
                    </div>
                </div>

                {!isSuccess && compilation.errors && (
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono flex items-center gap-1.5 transition-colors border border-slate-700 self-start xs:self-center cursor-pointer active:scale-95"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Log'}</span>
                    </button>
                )}
            </div>

            {!isSuccess && compilation.errors && (
                <div className="mt-3 p-2.5 sm:p-3 rounded-lg bg-black/60 border border-rose-900/40 text-xs font-mono text-rose-300 overflow-x-auto whitespace-pre-wrap break-words max-h-48 leading-relaxed">
                    {compilation.errors}
                </div>
            )}
        </GlassCard>
    );
}
