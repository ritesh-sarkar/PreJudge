'use client';

import React from 'react';
import { CheckCircle2, Loader2, Circle, AlertCircle } from 'lucide-react';

export const STAGES = [
    { key: 'resolving_problem', label: 'Resolving problem & cache' },
    { key: 'understanding_constraints', label: 'Understanding constraints & rules' },
    { key: 'generating_tests', label: 'Generating boundary & edge tests' },
    { key: 'compiling_code', label: 'Compiling with G++ (C++20)' },
    { key: 'running_tests', label: 'Running isolated sandbox tests' },
    { key: 'comparing_outputs', label: 'Comparing deterministic outputs' },
    { key: 'generating_ai_review', label: 'Generating compact AI review' },
];

export function AnalysisProgress({ currentStage, isError }) {
    const activeIndex = STAGES.findIndex(s => s.key === currentStage);

    return (
        <div className="p-4 rounded-xl bg-[#090d16]/90 border border-cyan-500/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span className="text-xs font-mono font-semibold text-cyan-300 uppercase tracking-wider">
                        PreJudge Execution Engine
                    </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                    Step {Math.max(1, activeIndex + 1)} of {STAGES.length}
                </span>
            </div>

            <div className="space-y-2.5">
                {STAGES.map((stage, idx) => {
                    const isDone = activeIndex > idx;
                    const isCurrent = activeIndex === idx;
                    const isPending = activeIndex < idx;

                    return (
                        <div
                            key={stage.key}
                            className={`flex items-center gap-3 text-xs font-mono transition-all duration-300 ${
                                isDone
                                    ? 'text-slate-400'
                                    : isCurrent
                                    ? 'text-cyan-300 font-semibold'
                                    : 'text-slate-600'
                            }`}
                        >
                            <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                {isCurrent && !isError && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />}
                                {isCurrent && isError && <AlertCircle className="w-4 h-4 text-rose-400" />}
                                {isPending && <Circle className="w-3 h-3 text-slate-700" />}
                            </div>

                            <span className="flex-1">{stage.label}</span>

                            {isCurrent && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                                    ACTIVE
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
