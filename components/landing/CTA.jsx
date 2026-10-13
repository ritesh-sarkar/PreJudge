'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button.jsx';

export function CTA() {
    return (
        <section className="py-20 sm:py-28 border-t border-white/5 bg-[#05070c] relative overflow-hidden">
            {/* Ambient central glow */}
            <motion.div
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.08, 0.16, 0.08],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[320px] bg-cyan-500/10 blur-[140px] pointer-events-none rounded-full"
            />

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.94, y: 24 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                >
                    <motion.div
                        animate={{
                            y: [0, -6, 0],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        whileHover={{ scale: 1.12, rotate: 3 }}
                        className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl overflow-hidden border border-cyan-500/40 p-0.5 mb-5 sm:mb-6 shadow-xl shadow-cyan-500/25 bg-slate-950 cursor-pointer relative"
                    >
                        <Image
                            src="/logo.png"
                            alt="PreJudge Logo"
                            width={64}
                            height={64}
                            className="w-full h-full object-cover rounded-xl"
                            referrerPolicy="no-referrer"
                        />
                    </motion.div>

                    <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 sm:mb-6 leading-tight">
                        Never waste a submission again.
                    </h2>

                    <p className="text-slate-400 text-sm sm:text-base md:text-lg max-w-xl mx-auto mb-8 sm:mb-10 font-normal px-2 leading-relaxed">
                        Pre-validate your logic, corner cases, and time limits against deterministic sandbox execution and AI diagnostics.
                    </p>

                    <div className="flex justify-center w-full max-w-xs sm:max-w-none mx-auto">
                        <Link href="/analyze" className="w-full sm:w-auto">
                            <motion.div
                                whileHover={{ scale: 1.04, y: -2 }}
                                whileTap={{ scale: 0.96 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                <Button size="lg" className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base shadow-lg shadow-cyan-500/25">
                                    <span>Start PreJudge Analysis</span>
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
