'use client';

import React from 'react';
import { motion } from 'motion/react';
import { GlassCard } from '../ui/GlassCard.jsx';
import { Database, Cpu, Terminal, Sparkles, Layers, ArrowRight } from 'lucide-react';

export function Architecture() {
    const PHASES = [
        {
            phase: 'PHASE 01',
            icon: Database,
            title: 'Problem Resolution',
            description: 'Checks cache first to minimize AI token consumption. If missing, extracts constraints, sample cases, and format rules.',
            tag: 'Cache TTL + AI',
            color: 'text-cyan-400',
            border: 'border-cyan-500/20',
            bg: 'bg-cyan-950/40',
        },
        {
            phase: 'PHASE 02',
            icon: Cpu,
            title: 'Targeted Tests',
            description: 'Generates 5-8 high-value boundary inputs (min/max bounds, negatives, precision floats, edge cases) plus verified sample tests.',
            tag: 'Structured JSON',
            color: 'text-blue-400',
            border: 'border-blue-500/20',
            bg: 'bg-blue-950/40',
        },
        {
            phase: 'PHASE 03',
            icon: Terminal,
            title: 'Sandbox Execution',
            description: 'Compiles and runs code in an isolated workspace with strict timeouts, 128KB output bounds, and immediate cleanup.',
            tag: 'Isolated Execution',
            color: 'text-emerald-400',
            border: 'border-emerald-500/20',
            bg: 'bg-emerald-950/40',
        },
        {
            phase: 'PHASE 04',
            icon: Sparkles,
            title: 'Truth & AI Review',
            description: 'Deterministic output comparator calculates verdict. If failures occur, AI inspects only failed tests to explain root cause.',
            tag: 'Token-Budgeted AI',
            color: 'text-purple-400',
            border: 'border-purple-500/20',
            bg: 'bg-purple-950/40',
        },
    ];

    return (
        <section id="architecture" className="py-16 sm:py-24 border-t border-white/5 bg-[#06080e] relative overflow-hidden scroll-mt-16 sm:scroll-mt-20">
            {/* Background decorative glow */}
            <motion.div
                animate={{
                    opacity: [0.03, 0.08, 0.03],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/10 blur-[120px] pointer-events-none rounded-full"
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-[11px] font-mono text-cyan-300 mb-3 cursor-default"
                    >
                        <Layers className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Core Separation Architecture</span>
                    </motion.div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-3 sm:mb-4">
                        How PreJudge processes your submission
                    </h2>
                    <p className="text-slate-400 text-xs sm:text-sm md:text-base px-2">
                        Engineered around the core principle: <strong className="text-slate-200 font-semibold">AI is the reasoning layer. The sandbox is the execution layer. The backend is the judge.</strong>
                    </p>
                </motion.div>

                <div className="relative">
                    {/* Pipeline Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                        {PHASES.map((p, idx) => {
                            const Icon = p.icon;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 28 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ duration: 0.55, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                    className="h-full"
                                >
                                    <GlassCard className={`p-4 sm:p-5 flex flex-col justify-between ${p.border} h-full hover:border-cyan-500/40 transition-all duration-300 group`}>
                                        <div>
                                            <div className="text-[11px] sm:text-xs font-mono text-cyan-400 mb-2 flex items-center justify-between">
                                                <span>{p.phase}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:animate-ping"></span>
                                            </div>
                                            <motion.div
                                                whileHover={{ scale: 1.1, rotate: 4 }}
                                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${p.bg} border border-white/5 flex items-center justify-center mb-3 sm:mb-4 transition-transform`}
                                            >
                                                <Icon className={`w-5 h-5 ${p.color}`} />
                                            </motion.div>
                                            <h4 className="text-sm sm:text-base font-semibold text-white mb-1.5 sm:mb-2 group-hover:text-cyan-200 transition-colors">
                                                {p.title}
                                            </h4>
                                            <p className="text-xs text-slate-400 leading-relaxed">
                                                {p.description}
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-slate-500 flex items-center justify-between">
                                            <span>{p.tag}</span>
                                            <span className="text-[10px] text-slate-600">Step {idx + 1}/4</span>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
