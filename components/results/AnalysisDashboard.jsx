'use client';

import React, { useState, useEffect } from 'react';
import { GlassCard } from '../ui/GlassCard.jsx';
import { Badge } from '../ui/Badge.jsx';
import { CompilationStatus } from './CompilationStatus.jsx';
import { TestCaseCard } from './TestCaseCard.jsx';
import { AIReview } from './AIReview.jsx';
import { ProblemDetailsCard } from '../ui/ProblemDetailsCard.jsx';
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Sparkles,
    Terminal,
} from 'lucide-react';

export function AnalysisDashboard({ data }) {
    const [selectedTestId, setSelectedTestId] = useState(null);
    const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'ai-review'

    const defaultOpenId = data?.tests?.length > 0 
        ? (data.tests.find((t) => t.status !== 'passed')?.id || data.tests[0].id) 
        : null;
    const openTestId = selectedTestId !== null ? selectedTestId : defaultOpenId;
    const setOpenTestId = setSelectedTestId;

    if (!data) return null;

    const {
        status,
        problem,
        compilation,
        execution = {},
        tests = [],
        aiReview,
        analysisId,
    } = data;

    const isAllPassed = status === 'all_tests_passed';
    const isCompileFailed = status === 'compilation_failed';

    const getVerdictHeader = () => {
        if (isAllPassed) {
            return {
                title: 'All Tests Passed',
                subtext: 'Your code satisfied all deterministic judge test cases with exact formatting and exit code 0.',
                badge: <Badge variant="emerald" size="md">Accepted (100%)</Badge>,
                icon: <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />,
                border: 'border-emerald-500/30',
                glow: 'from-emerald-950/40 to-emerald-950/10',
            };
        }
        if (isCompileFailed) {
            return {
                title: 'Compilation Error',
                subtext: 'The build tool or interpreter encountered syntax errors or missing symbols.',
                badge: <Badge variant="rose" size="md">Build Failed</Badge>,
                icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />,
                border: 'border-rose-500/30',
                glow: 'from-rose-950/40 to-rose-950/10',
            };
        }
        if (status === 'presentation_error') {
            return {
                title: 'Presentation Error',
                subtext: 'Values are correct, but whitespace, spacing, or newline (\\n) formatting differs. Beecrowd requires printing \\n after every line.',
                badge: <Badge variant="amber" size="md">Format Error (PE)</Badge>,
                icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />,
                border: 'border-amber-500/30',
                glow: 'from-amber-950/40 to-amber-950/10',
            };
        }
        if (status === 'time_limit') {
            return {
                title: 'Time Limit Exceeded',
                subtext: 'Execution timed out (exceeded sandbox limit). Check for infinite loops or high complexity.',
                badge: <Badge variant="amber" size="md">Time Limit (TLE)</Badge>,
                icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />,
                border: 'border-amber-500/30',
                glow: 'from-amber-950/40 to-amber-950/10',
            };
        }
        if (status === 'runtime_error') {
            return {
                title: 'Runtime Error (RTE)',
                subtext: 'Process crashed during execution. Check stderr, input parsing, or array bounds.',
                badge: <Badge variant="rose" size="md">Runtime Crash</Badge>,
                icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />,
                border: 'border-rose-500/30',
                glow: 'from-rose-950/40 to-rose-950/10',
            };
        }
        return {
            title: 'Wrong Answer (WA)',
            subtext: 'Your code produced output that differs from the expected judge output. See diff below.',
            badge: <Badge variant="rose" size="md">Wrong Answer</Badge>,
            icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-rose-400" />,
            border: 'border-rose-500/30',
            glow: 'from-rose-950/40 to-rose-950/10',
        };
    };

    const verdict = getVerdictHeader();

    return (
        <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
            {/* Top Verdict Banner */}
            <GlassCard
                elevated
                className={`p-4 sm:p-6 border ${verdict.border} bg-gradient-to-b ${verdict.glow} relative overflow-hidden`}
            >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {verdict.icon}
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                                    {verdict.title}
                                </h2>
                                {verdict.badge}
                            </div>
                            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl font-normal leading-relaxed">
                                {verdict.subtext}
                            </p>
                            {problem && (
                                <p className="text-xs font-mono text-cyan-400 mt-1.5 truncate">
                                    Problem #{problem.id} — {problem.title}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] font-mono text-slate-500 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <span>ID: {analysisId ? String(analysisId).slice(0, 16) : 'local'}</span>
                        <span className="text-slate-400">PreJudge Sandbox</span>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] sm:text-xs text-amber-300/90 font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                    <span className="break-words">
                        Deterministic sample & boundary cases executed in isolated sandbox.
                    </span>
                </div>
            </GlassCard>

            {/* Problem Details Section */}
            {problem && (
                <ProblemDetailsCard
                    problem={problem}
                    collapsible={true}
                    defaultOpen={false}
                />
            )}

            {/* Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <GlassCard className="p-3 sm:p-3.5 border-white/5">
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block mb-0.5 sm:mb-1 truncate">
                        Passed Tests
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-lg sm:text-xl font-bold font-mono ${isAllPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {execution.passed ?? 0}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                            / {execution.totalTests ?? 0}
                        </span>
                    </div>
                </GlassCard>

                <GlassCard className="p-3 sm:p-3.5 border-white/5">
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block mb-0.5 sm:mb-1 truncate">
                        Execution Time
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl font-bold font-mono text-white">
                            {execution.totalTimeMs ?? 0}
                        </span>
                        <span className="text-xs font-mono text-slate-500">ms</span>
                    </div>
                </GlassCard>

                <GlassCard className="p-3 sm:p-3.5 border-white/5">
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block mb-0.5 sm:mb-1 truncate">
                        Slowest Case
                    </span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg sm:text-xl font-bold font-mono text-white">
                            {execution.slowestTimeMs ?? 0}
                        </span>
                        <span className="text-xs font-mono text-slate-500">ms</span>
                    </div>
                </GlassCard>

                <GlassCard className="p-3 sm:p-3.5 border-white/5">
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-400 block mb-0.5 sm:mb-1 truncate">
                        Build Status
                    </span>
                    <div className={`text-xs sm:text-sm font-mono font-medium truncate ${compilation?.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {compilation?.status === 'passed' ? 'Passed (OK)' : 'Build Failed'}
                    </div>
                </GlassCard>
            </div>

            {/* Compilation Status Details */}
            <CompilationStatus compilation={compilation} />

            {/* Tabs for Test Breakdown vs AI Code Review */}
            <div>
                <div className="flex items-center gap-2 border-b border-white/10 pb-2.5 mb-4 overflow-x-auto no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setActiveTab('tests')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap active:scale-95 ${
                            activeTab === 'tests'
                                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Terminal className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Test Breakdown ({tests.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('ai-review')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap active:scale-95 ${
                            activeTab === 'ai-review'
                                ? 'bg-purple-950/80 text-purple-300 border border-purple-800/50 font-medium'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <span>AI Code Review</span>
                    </button>
                </div>

                {activeTab === 'tests' ? (
                    <div className="space-y-2.5">
                        {tests.length === 0 ? (
                            <div className="p-6 sm:p-8 rounded-xl bg-slate-950/40 border border-white/5 text-center text-xs sm:text-sm text-slate-500 font-mono">
                                No test executions available.
                            </div>
                        ) : (
                            tests.map((test) => (
                                <TestCaseCard
                                    key={test.id}
                                    test={test}
                                    isOpen={openTestId === test.id}
                                    onToggle={() =>
                                        setOpenTestId(openTestId === test.id ? null : test.id)
                                    }
                                />
                            ))
                        )}
                    </div>
                ) : (
                    <AIReview aiReview={aiReview} />
                )}
            </div>
        </div>
    );
}
