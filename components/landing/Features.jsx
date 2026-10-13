'use client';

import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard.jsx';
import { BookOpen, Terminal, Sparkles, Binary, Gauge, CheckSquare } from 'lucide-react';

const FEATURES = [
    {
        icon: BookOpen,
        title: 'Problem Understanding',
        description: 'PreJudge resolves competitive programming problem statements, parsing input/output rules, limits, and precision specifications.',
        accent: 'from-cyan-500/20 to-cyan-500/5',
        border: 'border-cyan-500/30',
        iconColor: 'text-cyan-400',
    },
    {
        icon: Terminal,
        title: 'Real Code Execution',
        description: 'Your solution is compiled and executed in an isolated sandbox with strict CPU, memory, and timeout limits across C++, C, Java, and Python.',
        accent: 'from-blue-500/20 to-blue-500/5',
        border: 'border-blue-500/30',
        iconColor: 'text-blue-400',
    },
    {
        icon: Sparkles,
        title: 'AI Code Review',
        description: 'Post-execution reasoning by AI identifies suspected logic flaws, off-by-one errors, formatting issues, and time/space complexity.',
        accent: 'from-purple-500/20 to-purple-500/5',
        border: 'border-purple-500/30',
        iconColor: 'text-purple-400',
    },
    {
        icon: Binary,
        title: 'Constraint Edge Cases',
        description: 'Generates targeted tests tailored to problem limits: boundary extremes, max integers, negative inputs, precision floats, and empty collections.',
        accent: 'from-emerald-500/20 to-emerald-500/5',
        border: 'border-emerald-500/30',
        iconColor: 'text-emerald-400',
    },
    {
        icon: Gauge,
        title: 'Execution Metrics',
        description: 'View millisecond-accurate runtime metrics, slowest test benchmarks, and detailed compiler warning/error diagnostics.',
        accent: 'from-amber-500/20 to-amber-500/5',
        border: 'border-amber-500/30',
        iconColor: 'text-amber-400',
    },
    {
        icon: CheckSquare,
        title: 'Honest Results',
        description: 'Zero false "Accepted" guarantees. Clear delineation between deterministic sandbox facts and AI-derived assistance.',
        accent: 'from-rose-500/20 to-rose-500/5',
        border: 'border-rose-500/30',
        iconColor: 'text-rose-400',
    },
];

export function Features() {
    return (
        <section id="features" className="py-16 sm:py-24 border-t border-white/5 bg-[#080b12] relative overflow-hidden scroll-mt-16 sm:scroll-mt-20">
            {/* Ambient background glow */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.03, 0.08, 0.03],
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
                >
                    <motion.span
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase mb-2 sm:mb-3 block"
                    >
                        Engineered for Competitive Programmers
                    </motion.span>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3 sm:mb-4">
                        Everything you need before hitting submit.
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base px-2">
                        A dual-layer verification platform combining deterministic machine execution with state-of-the-art token-efficient AI analysis.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {FEATURES.map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-40px' }}
                                transition={{ duration: 0.55, delay: idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                                whileHover={{ y: -5 }}
                                className="h-full"
                            >
                                <GlassCard
                                    elevated
                                    className="p-5 sm:p-6 relative overflow-hidden group h-full flex flex-col justify-between border-white/5 hover:border-cyan-500/30 transition-all duration-300"
                                >
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${feat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                                    />
                                    <div className="relative z-10">
                                        <motion.div
                                            whileHover={{ rotate: 6, scale: 1.1 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-slate-900/80 border ${feat.border} flex items-center justify-center mb-4 sm:mb-5 flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}
                                        >
                                            <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feat.iconColor}`} />
                                        </motion.div>
                                        <h3 className="text-base sm:text-lg font-semibold text-white mb-2 group-hover:text-cyan-200 transition-colors">
                                            {feat.title}
                                        </h3>
                                        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                                            {feat.description}
                                        </p>
                                    </div>
                                    <div className="relative z-10 mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                                        <span>Automated Verification</span>
                                        <span className="text-[10px] text-cyan-500/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Verified
                                        </span>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
