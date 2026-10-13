'use client';

import React from 'react';
import Image from 'next/image';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#05070a] text-slate-400 text-xs relative overflow-hidden">
            {/* Top Warning Banner regarding Beecrowd accuracy */}
            <div className="border-b border-amber-500/15 bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-amber-950/20 py-3 px-4 sm:px-6">
                <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-center gap-2.5 text-center sm:text-left">
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <p className="text-[11px] sm:text-xs text-amber-300/90 leading-relaxed">
                        <strong className="text-amber-300 font-semibold">Pre-Submission Disclaimer:</strong> PreJudge simulates local sandboxed execution and algorithmic edge cases to catch common bugs early. Results are heuristic simulations and may not be 100% accurate for every Beecrowd problem due to platform-specific judge quirks, hidden test suites, or strict presentation formatting. Always double-check before official submission.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand column */}
                    <div className="md:col-span-2 space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg overflow-hidden border border-cyan-500/30 shadow-sm relative flex-shrink-0 bg-slate-950">
                                <Image
                                    src="/logo.png"
                                    alt="PreJudge Logo"
                                    width={28}
                                    height={28}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                            <span className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">
                                Pre<span className="text-cyan-400">Judge</span>
                            </span>
                        </div>
                        <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                            AI-assisted competitive programming pre-submission validation system. Compiles and executes code in an isolated local sandbox with edge-case stress testing before the official judge tests your submission.
                        </p>
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-500">
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">C++20</span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-400">Python 3</span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">Java</span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">C11</span>
                        </div>
                    </div>

                    {/* Developer Credits column */}
                    <div className="space-y-3">
                        <h4 className="text-slate-200 font-semibold text-xs uppercase tracking-wider mb-2 font-mono">
                            Developer & Credits
                        </h4>
                        <p className="text-xs text-slate-400">
                            Built and architected by:
                        </p>
                        <div>
                            <a
                                href="https://ritesh-sarkar.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-cyan-900/40 hover:border-cyan-400 transition-all font-medium group shadow-sm text-xs"
                            >
                                <span>Ritesh Sarkar</span>
                                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-cyan-400" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-slate-500">
                    <div>
                        © {new Date().getFullYear()} PreJudge. Built by{' '}
                        <a
                            href="https://ritesh-sarkar.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-300 hover:text-cyan-400 font-medium transition-colors"
                        >
                            Ritesh Sarkar
                        </a>
                        . All rights reserved.
                    </div>
                    <div className="flex items-center gap-4">
                        <span>Stateless Sandbox</span>
                        <span>•</span>
                        <span>Isolated Memory</span>
                        <span>•</span>
                        <span>Local Execution</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
