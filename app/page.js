'use client';

import React from 'react';
import { Navbar } from '../components/landing/Navbar.jsx';
import { Hero } from '../components/landing/Hero.jsx';
import { Features } from '../components/landing/Features.jsx';
import { Architecture } from '../components/landing/Architecture.jsx';
import { CTA } from '../components/landing/CTA.jsx';
import { Footer } from '../components/landing/Footer.jsx';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
            <Navbar />
            <main className="flex-1 w-full max-w-full overflow-hidden">
                <Hero />
                <Features />
                <Architecture />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
