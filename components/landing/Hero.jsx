'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Terminal, ShieldCheck, Cpu, Code2, AlertTriangle, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge.jsx';
import { Button } from '../ui/Button.jsx';

export function Hero() {
    return (
        <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 overflow-hidden cyber-grid">
            {/* Ambient background glow with floating animation */}
            <motion.div
                animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.7, 0.95, 0.7],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[240px] sm:h-[380px] bg-gradient-to-tr from-cyan-500/15 via-blue-600/10 to-violet-600/10 blur-[100px] sm:blur-[140px] pointer-events-none rounded-full"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Interactive Animated Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        whileHover={{ scale: 1.04, y: -2 }}
                        className="inline-flex items-center gap-2 mb-4 sm:mb-6 cursor-default"
                    >
                        <Badge variant="cyan" size="md" className="border border-cyan-500/30 text-[11px] sm:text-xs shadow-sm shadow-cyan-500/10 backdrop-blur-md">
                            <span className="relative flex h-2 w-2 mr-0.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                            </span>
                            AI-Assisted Competitive Programming Pre-Submission
                        </Badge>
                    </motion.div>

                    {/* Headline with Stagger & Gradient Flow */}
                    <motion.h1
                        initial={{ opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                        className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4 sm:mb-6 leading-tight"
                    >
                        Test your code <br className="hidden xs:inline" />
                        <motion.span
                            initial={{ backgroundPosition: '0% 50%' }}
                            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                            transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
                            className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-[length:200%_auto] bg-clip-text text-transparent inline-block"
                        >
                            before the judge does.
                        </motion.span>
                    </motion.h1>

                    {/* Subheading */}
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.65, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="text-sm sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-normal px-2"
                    >
                        PreJudge compiles and executes your code in an isolated sandbox, validates deterministic outputs against boundary edge cases, and leverages AI for concise diagnostic reviews.
                    </motion.p>

                    {/* Action CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 w-full max-w-sm sm:max-w-none mx-auto"
                    >
                        <Link href="/analyze" className="w-full sm:w-auto">
                            <motion.div
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 shadow-cyan-500/25">
                                    <span>Start Analyzing</span>
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </motion.div>
                        </Link>
                        <a
                            href="#architecture"
                            onClick={(e) => {
                                e.preventDefault();
                                const target = document.getElementById('architecture');
                                if (target) {
                                    target.scrollIntoView({ behavior: 'smooth' });
                                    window.history.pushState(null, '', '#architecture');
                                }
                            }}
                            className="w-full sm:w-auto"
                        >
                            <motion.div
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base py-3 sm:py-3.5">
                                    <Code2 className="w-4 h-4 mr-2 text-cyan-400" />
                                    <span>How It Works</span>
                                </Button>
                            </motion.div>
                        </a>
                    </motion.div>

                    {/* Core Triad Banner: Core Separation Architecture */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 25 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent max-w-3xl mx-auto shadow-2xl"
                    >
                        <div className="bg-[#0b0f19]/90 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/10 text-left">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4 mb-3 sm:mb-4 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                                    <span className="ml-1 sm:ml-2 font-mono text-[11px] sm:text-xs text-slate-300 truncate font-semibold">
                                        Core Separation Architecture
                                    </span>
                                </div>
                                <span className="font-mono text-[11px] sm:text-xs text-cyan-400 flex-shrink-0">
                                    Isolated Execution Engine
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-sm font-mono">
                                {/* AI = Brain */}
                                <motion.div
                                    whileHover={{ y: -3, borderColor: 'rgba(6, 182, 212, 0.5)' }}
                                    transition={{ duration: 0.2 }}
                                    className="p-3 sm:p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-800/30 transition-colors"
                                >
                                    <div className="text-cyan-400 font-semibold mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                                        <Cpu className="w-4 h-4 flex-shrink-0" />
                                        <span>AI = Brain</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                        Understands constraints, generates boundary edge cases, and provides concise diagnostic reviews.
                                    </p>
                                </motion.div>

                                {/* Sandbox = Hands */}
                                <motion.div
                                    whileHover={{ y: -3, borderColor: 'rgba(16, 185, 129, 0.5)' }}
                                    transition={{ duration: 0.2 }}
                                    className="p-3 sm:p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 transition-colors"
                                >
                                    <div className="text-emerald-400 font-semibold mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                                        <Terminal className="w-4 h-4 flex-shrink-0" />
                                        <span>Sandbox = Hands</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                        Compiles with real G++ / Node and executes inside an isolated workspace with strict timeouts.
                                    </p>
                                </motion.div>

                                {/* Backend = Judge */}
                                <motion.div
                                    whileHover={{ y: -3, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                                    transition={{ duration: 0.2 }}
                                    className="p-3 sm:p-3.5 rounded-lg bg-blue-950/20 border border-blue-800/30 transition-colors"
                                >
                                    <div className="text-blue-400 font-semibold mb-1 flex items-center gap-1.5 text-xs sm:text-sm">
                                        <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                                        <span>Backend = Judge</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                                        Deterministic line-by-line output comparator. AI never overrides compilation or test truth.
                                    </p>
                                </motion.div>
                            </div>

                            <div className="mt-3 sm:mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] sm:text-xs text-amber-400/90 font-mono">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
                                <span className="break-words">Passing PreJudge tests does not guarantee acceptance on hidden judge tests.</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
