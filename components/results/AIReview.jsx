'use client';

import React from 'react';
import { Sparkles, AlertCircle, Info, Clock, HardDrive, Lightbulb, Compass } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard.jsx';
import { Badge } from '../ui/Badge.jsx';

export function AIReview({ aiReview }) {
    if (!aiReview) return null;

    const { summary, issues = [], edgeCases = [], complexity = {}, suggestion } = aiReview;

    return (
        <GlassCard elevated className="p-4 sm:p-6 border-purple-500/20 bg-[#0c0d18]/90 w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 border-b border-purple-900/30 pb-3 sm:pb-4 mb-4 sm:mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-semibold text-white tracking-tight">
                            AI Code Diagnostic Review
                        </h3>
                        <p className="text-[11px] sm:text-xs text-purple-400/80 font-mono">
                            Diagnostic insights powered by AI
                        </p>
                    </div>
                </div>

                <Badge variant="purple" size="sm" className="self-start xs:self-auto">
                    AI Review
                </Badge>
            </div>

            {/* Summary */}
            {summary && (
                <div className="mb-4 sm:mb-5 p-3 sm:p-3.5 rounded-lg bg-purple-950/20 border border-purple-800/20 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                    <div className="text-xs font-mono font-medium text-purple-400 mb-1 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        Executive Summary
                    </div>
                    {summary}
                </div>
            )}

            {/* Complexity & Issues Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                {/* Algorithmic Complexity Card */}
                <div className="p-3 sm:p-4 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between">
                    <div className="text-xs font-mono font-medium text-slate-400 mb-2.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        Estimated Complexity
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="p-2 sm:p-2.5 rounded bg-slate-900/60 border border-white/5">
                            <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-0.5">Time</span>
                            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 truncate block">
                                {complexity.time || 'O(N)'}
                            </span>
                        </div>
                        <div className="p-2 sm:p-2.5 rounded bg-slate-900/60 border border-white/5">
                            <span className="text-[10px] sm:text-[11px] text-slate-400 block mb-0.5">Aux Space</span>
                            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-300 truncate block">
                                {complexity.space || 'O(1)'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Overlooked Edge Cases */}
                <div className="p-3 sm:p-4 rounded-lg bg-black/40 border border-white/5">
                    <div className="text-xs font-mono font-medium text-slate-400 mb-2 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-400" />
                        Boundary / Corner Scenarios
                    </div>

                    {edgeCases && edgeCases.length > 0 ? (
                        <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                            {edgeCases.map((ec, idx) => (
                                <li key={idx} className="flex items-start gap-1.5">
                                    <span className="text-amber-400/80 font-mono text-[10px] mt-0.5">•</span>
                                    <span className="break-words">{ec}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-xs text-slate-500 italic">No specific edge-case discrepancies flagged.</p>
                    )}
                </div>
            </div>

            {/* Detected Logic Issues */}
            {issues && issues.length > 0 && (
                <div className="mb-4 sm:mb-5 space-y-2">
                    <div className="text-xs font-mono font-medium text-slate-400 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                        Detected Logic & Formatting Issues ({issues.length})
                    </div>
                    {issues.map((iss, idx) => (
                        <div
                            key={idx}
                            className="p-2.5 sm:p-3 rounded-lg bg-rose-950/15 border border-rose-900/30 flex items-start gap-2 text-xs"
                        >
                            <Badge
                                variant={iss.severity === 'high' ? 'rose' : iss.severity === 'medium' ? 'amber' : 'default'}
                                size="sm"
                                className="uppercase text-[9px] flex-shrink-0 mt-0.5"
                            >
                                {iss.severity || 'Notice'}
                            </Badge>
                            <p className="text-slate-300 leading-relaxed font-sans break-words">{iss.message}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Actionable Suggestion */}
            {suggestion && (
                <div className="p-3 sm:p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-xs text-cyan-200 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div className="leading-relaxed font-sans break-words">
                        <span className="font-semibold text-cyan-300 font-mono block mb-0.5">PreJudge Recommendation:</span>
                        {suggestion}
                    </div>
                </div>
            )}
        </GlassCard>
    );
}
