'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Navbar } from '../../components/landing/Navbar.jsx';
import { Footer } from '../../components/landing/Footer.jsx';
import { Analyzer } from '../../components/analyzer/Analyzer.jsx';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function AnalyzePage() {
    return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">
                {/* Breadcrumb & Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6"
                >
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <Link
                            href="/"
                            className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors flex-shrink-0"
                            title="Back to Home"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div className="min-w-0 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg overflow-hidden border border-cyan-500/30 flex-shrink-0 shadow-sm shadow-cyan-500/20 bg-slate-950 relative">
                                <Image
                                    src="/logo.png"
                                    alt="PreJudge Logo"
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                    priority
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight flex items-center gap-1.5 truncate">
                                    <span>Pre<span className="text-cyan-400">Judge</span></span>
                                    <span className="text-slate-400 font-normal text-sm sm:text-base">Analyzer</span>
                                </h1>
                                <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5 truncate">
                                    Isolated Sandbox • Deterministic Comparator • AI Review
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-[11px] sm:text-xs font-mono text-cyan-300 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                            <span>Stateless Session</span>
                        </div>
                    </div>
                </motion.div>

                {/* Primary Analyzer Interface */}
                <Analyzer />
            </main>

            <Footer />
        </div>
    );
}
