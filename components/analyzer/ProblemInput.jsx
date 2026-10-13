'use client';

import React from 'react';
import { Hash, Sparkles } from 'lucide-react';

const PRESET_PROBLEMS = [
    { id: '1001', name: '1001 (Sum)' },
    { id: '1002', name: '1002 (Circle)' },
    { id: '1004', name: '1004 (Prod)' },
    { id: '2313', name: '2313 (Triangle)' },
    { id: '2757', name: '2757 (I/O)' },
];

export function ProblemInput({ value, onChange, disabled }) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Problem ID</span>
                </label>
                <span className="text-[11px] text-slate-500 font-sans">e.g. 1001 or 2313</span>
            </div>

            <div className="relative w-full">
                <input
                    type="text"
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter ID (e.g. 1001)"
                    className="w-full px-3.5 py-2 sm:py-2.5 rounded-lg glass-input text-sm font-mono focus:border-cyan-400 placeholder:text-slate-600 disabled:opacity-50"
                />
            </div>

            {/* Quick Presets Row - Responsive and horizontally scrollable on mobile */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar -mx-0.5 px-0.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase flex-shrink-0 mr-0.5">
                    Presets:
                </span>
                {PRESET_PROBLEMS.map((preset) => (
                    <button
                        key={preset.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => onChange(preset.id)}
                        className={`px-2 py-1 rounded text-[11px] font-mono transition-colors border flex-shrink-0 active:scale-95 cursor-pointer ${
                            value === preset.id
                                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 font-medium'
                                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                    >
                        {preset.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
