'use client';

import React, { useState } from 'react';
import { GlassCard } from './GlassCard.jsx';
import { Badge } from './Badge.jsx';
import { BookOpen, FileText, ArrowRight, Copy, Check, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export function ProblemDetailsCard({ problem, collapsible = false, defaultOpen = true }) {
    const [copiedInputIdx, setCopiedInputIdx] = useState(null);
    const [copiedOutputIdx, setCopiedOutputIdx] = useState(null);
    const [isOpen, setIsOpen] = useState(defaultOpen);

    if (!problem) return null;

    const {
        id,
        problemId = id,
        title = 'Competitive Programming Problem',
        statement,
        inputSpec,
        outputSpec,
        constraints,
        examples = [],
    } = problem;

    const copyToClipboard = (text, type, idx) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'input') {
            setCopiedInputIdx(idx);
            setTimeout(() => setCopiedInputIdx(null), 2000);
        } else {
            setCopiedOutputIdx(idx);
            setTimeout(() => setCopiedOutputIdx(null), 2000);
        }
    };

    return (
        <GlassCard elevated className="p-4 sm:p-5 border-cyan-500/20 bg-gradient-to-b from-[#0e1626]/80 to-[#0a0f1b]/90 relative overflow-hidden w-full">
            {/* Header */}
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-3 pb-3 border-b border-white/10 select-none">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 flex-shrink-0">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight truncate">
                                {title}
                            </h3>
                            <Badge variant="cyan" size="sm">Problem #{problemId}</Badge>
                        </div>
                        <span className="text-[11px] sm:text-xs text-slate-400 font-mono">Official Specification</span>
                    </div>
                </div>

                {collapsible && (
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-white/10 transition-colors cursor-pointer self-start xs:self-center flex-shrink-0 active:scale-95"
                    >
                        <span>{isOpen ? 'Hide Spec' : 'View Spec'}</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                )}
            </div>

            {/* Collapsible Content */}
            {isOpen && (
                <div className="space-y-3.5 text-xs font-sans text-slate-300">
                    {/* Problem Statement */}
                    {statement && (
                        <div className="space-y-1">
                            <span className="text-[10px] sm:text-[11px] font-mono text-cyan-400 font-semibold uppercase tracking-wider block">
                                Statement
                            </span>
                            <p className="text-slate-200 leading-relaxed text-xs sm:text-sm font-normal break-words">
                                {statement}
                            </p>
                        </div>
                    )}

                    {/* Input & Output Specifications Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                        {inputSpec && (
                            <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5 space-y-1">
                                <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 font-medium flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                    Input Specification
                                </span>
                                <p className="text-slate-300 font-mono text-[11px] sm:text-[12px] leading-normal break-words">
                                    {inputSpec}
                                </p>
                            </div>
                        )}

                        {outputSpec && (
                            <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5 space-y-1">
                                <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 font-medium flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                    Output Specification
                                </span>
                                <p className="text-slate-300 font-mono text-[11px] sm:text-[12px] leading-normal break-words">
                                    {outputSpec}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Constraints */}
                    {constraints && (
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-950/40 p-2 sm:p-2.5 rounded border border-white/5 break-words">
                            <Layers className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            <span>Constraints: <strong className="text-slate-200 font-normal">{constraints}</strong></span>
                        </div>
                    )}

                    {/* Official Sample Cases */}
                    {examples && examples.length > 0 && (
                        <div className="space-y-2 pt-1">
                            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider block">
                                Official Sample Cases
                            </span>
                            <div className="grid grid-cols-1 gap-2.5">
                                {examples.map((ex, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-lg bg-[#070a12] border border-white/10 font-mono text-xs space-y-2"
                                    >
                                        <div className="flex items-center justify-between text-[11px] text-slate-500 pb-1 border-b border-white/5">
                                            <span className="font-semibold text-slate-400">Sample Case #{idx + 1}</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                                            {/* Input */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                                                    <span>Sample Input</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(ex.input, 'input', idx)}
                                                        className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5 cursor-pointer"
                                                        title="Copy Input"
                                                    >
                                                        {copiedInputIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <pre className="p-2 rounded bg-black/50 border border-white/5 text-cyan-300 text-[11px] sm:text-[12px] whitespace-pre-wrap break-words overflow-x-auto">
                                                    {ex.input || '(No input)'}
                                                </pre>
                                            </div>

                                            {/* Output */}
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                                                    <span>Expected Output</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(ex.expected, 'output', idx)}
                                                        className="text-slate-500 hover:text-emerald-400 transition-colors p-0.5 cursor-pointer"
                                                        title="Copy Output"
                                                    >
                                                        {copiedOutputIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                    </button>
                                                </div>
                                                <pre className="p-2 rounded bg-black/50 border border-white/5 text-emerald-300 text-[11px] sm:text-[12px] whitespace-pre-wrap break-words overflow-x-auto font-semibold">
                                                    {ex.expected || '(No output)'}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </GlassCard>
    );
}
