'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, AlertTriangle, Sparkles, HelpCircle, FileText, Copy, Check } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';

export function TestCaseCard({ test, isOpen, onToggle }) {
    const [copiedInput, setCopiedInput] = useState(false);
    const [copiedExpected, setCopiedExpected] = useState(false);
    const [copiedActual, setCopiedActual] = useState(false);

    const isPassed = test.status === 'passed';
    const isTimeLimit = test.status === 'time_limit';
    const isRuntimeError = test.status === 'runtime_error';
    const isPresentationError = test.status === 'presentation_error';
    const isWrongOutput = test.status === 'wrong_output';

    const getStatusBadge = () => {
        if (isPassed) return <Badge variant="emerald" size="sm">Passed</Badge>;
        if (isTimeLimit) return <Badge variant="amber" size="sm">Time Limit</Badge>;
        if (isPresentationError) return <Badge variant="amber" size="sm">Presentation Error</Badge>;
        if (isRuntimeError) return <Badge variant="rose" size="sm">Runtime Error</Badge>;
        if (isWrongOutput) return <Badge variant="rose" size="sm">Wrong Answer</Badge>;
        return <Badge variant="default" size="sm">{test.status}</Badge>;
    };

    const copyText = (text, type) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        if (type === 'input') {
            setCopiedInput(true);
            setTimeout(() => setCopiedInput(false), 2000);
        } else if (type === 'expected') {
            setCopiedExpected(true);
            setTimeout(() => setCopiedExpected(false), 2000);
        } else if (type === 'actual') {
            setCopiedActual(true);
            setTimeout(() => setCopiedActual(false), 2000);
        }
    };

    const getDiagnosticHint = () => {
        if (!test.error) return null;
        const err = String(test.error);

        if (err.includes('ValueError: invalid literal for int()') || err.includes('not enough values to unpack')) {
            return {
                title: 'Input Reading Format Hint',
                message: 'Your Python code uses input() expecting separate lines, but numbers are on the same line separated by space. Fix: Use `a, b = map(int, input().split())` or `sys.stdin.read().split()`.',
            };
        }

        if (err.includes('IndexError: list index out of range')) {
            return {
                title: 'Index Error',
                message: 'Code tried to access an input element beyond list length. Make sure to check `len(tokens)` before accessing index.',
            };
        }

        if (err.includes('java.util.NoSuchElementException')) {
            return {
                title: 'Java Scanner EOF Error',
                message: 'Scanner reached end of file before reading expected inputs. Wrap reads with `scanner.hasNextInt()`.',
            };
        }

        return null;
    };

    const hint = getDiagnosticHint();

    return (
        <div className={`rounded-xl border transition-all duration-200 overflow-hidden w-full ${
            isOpen 
                ? 'bg-slate-900/90 border-cyan-500/30 ring-1 ring-cyan-500/20 shadow-lg' 
                : isPassed 
                    ? 'bg-slate-950/60 border-white/5 hover:border-white/10'
                    : isPresentationError
                        ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700/50'
                        : 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700/50'
        }`}>
            {/* Header row */}
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between text-left cursor-pointer focus:outline-none gap-2"
            >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded flex items-center justify-center flex-shrink-0">
                        {isPassed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isPresentationError ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                        ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                        <span className="text-xs sm:text-sm font-mono font-medium text-white whitespace-nowrap">
                            Test #{test.id}
                        </span>
                        {getStatusBadge()}
                        <span className="text-[11px] text-slate-400 font-mono hidden md:inline truncate">
                            • {test.reason || 'Sample Case'}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {test.isAiDerived && (
                        <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-800/30">
                            <Sparkles className="w-3 h-3" />
                            AI Test
                        </span>
                    )}

                    <div className="flex items-center gap-1 text-[11px] sm:text-xs font-mono text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{test.timeMs !== undefined ? `${test.timeMs}ms` : '--'}</span>
                    </div>

                    {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                </div>
            </button>

            {/* Expandable Body */}
            {isOpen && (
                <div className="px-3 sm:px-4 pb-4 pt-2 border-t border-white/5 space-y-3 font-mono text-xs">
                    {hint && (
                        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-200 flex items-start gap-2.5">
                            <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <strong className="font-semibold text-amber-300 block mb-0.5 text-xs">{hint.title}</strong>
                                <span className="text-amber-200/90 text-xs font-sans leading-normal break-words">{hint.message}</span>
                            </div>
                        </div>
                    )}

                    {isPresentationError && test.diffMessage && (
                        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-200 flex items-start gap-2.5">
                            <FileText className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0">
                                <strong className="font-semibold text-amber-300 block mb-0.5 text-xs">Presentation Error</strong>
                                <span className="text-amber-200/90 text-xs font-sans leading-normal break-words">{test.diffMessage}</span>
                            </div>
                        </div>
                    )}

                    {!isPresentationError && test.diffMessage && (
                        <div className="p-2.5 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                            <span className="break-words text-xs">{test.diffMessage}</span>
                        </div>
                    )}

                    {test.error && (
                        <div>
                            <span className="text-[11px] text-slate-400 font-sans block mb-1">Standard Error / Runtime Log:</span>
                            <div className="p-2.5 rounded bg-black/60 border border-rose-900/30 text-rose-300 whitespace-pre-wrap break-words font-mono text-xs max-h-36 sm:max-h-48 overflow-y-auto">
                                {test.error}
                            </div>
                        </div>
                    )}

                    {/* Comparison 3-Column Grid (Stacks on mobile, 3 columns on tablet/desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                        {/* Input */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                                <span>Input Stream:</span>
                                {test.input && (
                                    <button
                                        type="button"
                                        onClick={() => copyText(test.input, 'input')}
                                        className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5 cursor-pointer"
                                        title="Copy Input"
                                    >
                                        {copiedInput ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                )}
                            </div>
                            <pre className="p-2.5 rounded bg-black/50 border border-white/5 text-slate-200 whitespace-pre-wrap break-words min-h-[48px] max-h-36 sm:max-h-48 overflow-y-auto font-mono text-xs">
                                {test.input ? test.input.trim() : '<empty>'}
                            </pre>
                        </div>

                        {/* Expected Output */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                                <span>Expected Output:</span>
                                {test.expected && (
                                    <button
                                        type="button"
                                        onClick={() => copyText(test.expected, 'expected')}
                                        className="text-slate-500 hover:text-emerald-400 transition-colors p-0.5 cursor-pointer"
                                        title="Copy Expected"
                                    >
                                        {copiedExpected ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                )}
                            </div>
                            <pre className="p-2.5 rounded bg-black/50 border border-white/5 text-emerald-300 whitespace-pre-wrap break-words min-h-[48px] max-h-36 sm:max-h-48 overflow-y-auto font-mono text-xs font-semibold">
                                {test.expected ? test.expected.trim() : '<empty>'}
                            </pre>
                        </div>

                        {/* Actual Output */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 font-sans">
                                <span>Actual Output:</span>
                                {test.actual && (
                                    <button
                                        type="button"
                                        onClick={() => copyText(test.actual, 'actual')}
                                        className="text-slate-500 hover:text-cyan-400 transition-colors p-0.5 cursor-pointer"
                                        title="Copy Actual"
                                    >
                                        {copiedActual ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                )}
                            </div>
                            <pre className={`p-2.5 rounded bg-black/50 border min-h-[48px] max-h-36 sm:max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs font-semibold ${
                                isPassed 
                                    ? 'border-emerald-900/40 text-emerald-300' 
                                    : isPresentationError
                                        ? 'border-amber-900/40 text-amber-300'
                                        : 'border-rose-900/40 text-rose-300'
                            }`}>
                                {test.actual ? test.actual.trim() : (test.error ? '<Runtime Crash>' : '<no output>')}
                            </pre>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
