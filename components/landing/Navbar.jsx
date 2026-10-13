'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Sparkles } from 'lucide-react';

export function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (e, targetId) => {
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById(targetId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                window.history.pushState(null, '', `#${targetId}`);
            }
        }
        setMobileMenuOpen(false);
    };

    return (
        <motion.header
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#07090e]/90 backdrop-blur-xl"
        >
            <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Brand Logo & Name */}
                <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
                    <motion.div
                        whileHover={{ scale: 1.08, rotate: 2 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                        className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400/60 transition-colors shadow-sm shadow-cyan-500/20 bg-slate-950 relative"
                    >
                        <Image
                            src="/logo.png"
                            alt="PreJudge Logo"
                            width={36}
                            height={36}
                            className="w-full h-full object-cover"
                            priority
                            referrerPolicy="no-referrer"
                        />
                    </motion.div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <motion.span
                            whileHover={{ letterSpacing: '0.02em' }}
                            className="font-bold text-base sm:text-lg tracking-tight text-white group-hover:text-cyan-100 transition-all flex items-center"
                        >
                            <span>Pre</span>
                            <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                                Judge
                            </span>
                        </motion.span>
                        <span className="hidden xs:inline-flex text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                            C++20 • Python • Java
                        </span>
                    </div>
                </Link>

                {/* Desktop & Tablet Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-slate-400">
                    <Link
                        href="/#features"
                        onClick={(e) => handleNavClick(e, 'features')}
                        className="hover:text-cyan-300 transition-colors relative py-1 group cursor-pointer"
                    >
                        <span>Features</span>
                        <motion.span
                            className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-200 group-hover:w-full"
                        />
                    </Link>
                    <Link
                        href="/#architecture"
                        onClick={(e) => handleNavClick(e, 'architecture')}
                        className="hover:text-cyan-300 transition-colors relative py-1 group cursor-pointer"
                    >
                        <span>How It Works</span>
                        <motion.span
                            className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-200 group-hover:w-full"
                        />
                    </Link>
                    <span className="text-slate-700">|</span>
                    <motion.div
                        whileHover={{ scale: 1.04 }}
                        className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-mono shadow-sm"
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Sandbox Ready</span>
                    </motion.div>
                </nav>

                {/* Mobile Menu Hamburger Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span>Online</span>
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        aria-label="Toggle navigation menu"
                    >
                        {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </motion.button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="md:hidden border-t border-white/5 bg-[#090d16] px-4 py-3 space-y-2 text-xs font-mono overflow-hidden"
                    >
                        <Link
                            href="/#features"
                            onClick={(e) => handleNavClick(e, 'features')}
                            className="block py-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                        >
                            Features & Capabilities
                        </Link>
                        <Link
                            href="/#architecture"
                            onClick={(e) => handleNavClick(e, 'architecture')}
                            className="block py-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer"
                        >
                            How It Works (Architecture)
                        </Link>
                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="flex items-center gap-1.5 text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Sandbox Status: Online
                            </span>
                            <span>Node 22 • G++ 12 • Python 3</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
