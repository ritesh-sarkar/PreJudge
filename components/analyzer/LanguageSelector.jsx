'use client';

import React from 'react';
import { Code2, ChevronDown } from 'lucide-react';

const LANGUAGES = [
    { id: 'cpp20', name: 'C++20 (G++ 12.3)', active: true },
    { id: 'c17', name: 'C17 (GCC 12)', active: true },
    { id: 'python', name: 'Python 3.11', active: true },
    { id: 'javascript', name: 'JavaScript (Node.js 22)', active: true },
    { id: 'java', name: 'Java 17 (OpenJDK)', active: true },
];

export function LanguageSelector({ value, onChange, disabled }) {
    return (
        <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-medium text-slate-300 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Language</span>
                </label>
                <span className="text-[11px] text-slate-500 font-sans">Sandbox Runtime</span>
            </div>

            <div className="relative w-full">
                <select
                    value={value}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2 sm:py-2.5 rounded-lg glass-input text-sm font-mono focus:border-cyan-400 disabled:opacity-50 pr-8 cursor-pointer h-[42px]"
                >
                    {LANGUAGES.map((lang) => (
                        <option
                            key={lang.id}
                            value={lang.id}
                            disabled={!lang.active}
                            className="bg-[#0b0f19] text-slate-200"
                        >
                            {lang.name}
                        </option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="text-[11px] text-slate-500 font-mono py-1 truncate">
                Compiler: <span className="text-slate-400">{value === 'cpp20' ? 'g++ -std=c++20 -O2' : value === 'c17' ? 'gcc -std=c17 -O2' : value}</span>
            </div>
        </div>
    );
}
