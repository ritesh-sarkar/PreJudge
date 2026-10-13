'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from '../ui/GlassCard.jsx';
import { ProblemInput } from './ProblemInput.jsx';
import { LanguageSelector } from './LanguageSelector.jsx';
import { CodeEditor } from './CodeEditor.jsx';
import { AnalyzeButton } from './AnalyzeButton.jsx';
import { AnalysisProgress } from './AnalysisProgress.jsx';
import { AnalysisDashboard } from '../results/AnalysisDashboard.jsx';
import { ProblemDetailsCard } from '../ui/ProblemDetailsCard.jsx';
import { CODE_TEMPLATES } from '../../lib/codeTemplates.js';
import { AlertCircle, AlertTriangle, Code2, BarChart3, CheckCircle2, XCircle, Play, Sparkles } from 'lucide-react';

export function Analyzer() {
    const [problemId, setProblemId] = useState('1001');
    const [language, setLanguage] = useState('cpp20');
    const [code, setCode] = useState(CODE_TEMPLATES.cpp20);
    const [loading, setLoading] = useState(false);
    const [currentStage, setCurrentStage] = useState('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [result, setResult] = useState(null);
    const [activeProblemSpec, setActiveProblemSpec] = useState(null);
    const [specLoading, setActiveSpecLoading] = useState(false);
    // Mobile view switcher: 'editor' | 'results'
    const [mobileTab, setMobileTab] = useState('editor');

    const resultsRef = useRef(null);

    // Auto-update starter code template when language changes
    const handleLanguageChange = (newLang) => {
        setLanguage(newLang);
        const isDefault = Object.values(CODE_TEMPLATES).some(t => t.trim() === code.trim());
        if (isDefault || !code.trim()) {
            setCode(CODE_TEMPLATES[newLang] || CODE_TEMPLATES.cpp20);
        }
    };

    // Fetch problem details for live preview
    useEffect(() => {
        let isMounted = true;
        const cleanId = String(problemId).trim();

        const timer = setTimeout(async () => {
            if (!cleanId) {
                if (isMounted) setActiveProblemSpec(null);
                return;
            }
            setActiveSpecLoading(true);
            try {
                const res = await fetch(`/api/problems?id=${encodeURIComponent(cleanId)}`);
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && isMounted) {
                        setActiveProblemSpec(json.data.problem);
                    }
                }
            } catch (err) {
                console.warn('Failed to fetch problem preview:', err);
            } finally {
                if (isMounted) setActiveSpecLoading(false);
            }
        }, 300);

        return () => {
            isMounted = false;
            clearTimeout(timer);
        };
    }, [problemId]);

    const handleRunAnalysis = async () => {
        if (loading) return;

        setErrorMessage('');
        setResult(null);

        if (!problemId.trim()) {
            setErrorMessage('Please enter a valid problem ID.');
            return;
        }

        if (!code.trim() || code.trim().length < 5) {
            setErrorMessage(`Please provide valid ${language.toUpperCase()} source code.`);
            return;
        }

        setLoading(true);
        setCurrentStage('resolving_problem');
        // On mobile screens, automatically show the results/progress view
        setMobileTab('results');

        const stageTimers = [
            setTimeout(() => setCurrentStage('understanding_constraints'), 600),
            setTimeout(() => setCurrentStage('generating_tests'), 1200),
            setTimeout(() => setCurrentStage('compiling_code'), 2000),
            setTimeout(() => setCurrentStage('running_tests'), 2800),
            setTimeout(() => setCurrentStage('comparing_outputs'), 3600),
            setTimeout(() => setCurrentStage('generating_ai_review'), 4300),
        ];

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    problemId: problemId.trim(),
                    language,
                    code,
                }),
            });

            stageTimers.forEach(t => clearTimeout(t));

            const json = await response.json();

            if (!response.ok || !json.success) {
                setErrorMessage(json?.error?.message || 'Failed to analyze code.');
                setCurrentStage('idle');
                return;
            }

            setResult(json.data);
            setCurrentStage('complete');
            setMobileTab('results');

            // On mobile, scroll smoothly down to results if needed
            if (window.innerWidth < 1024 && resultsRef.current) {
                resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (err) {
            stageTimers.forEach(t => clearTimeout(t));
            setErrorMessage(`Network or server error: ${err.message}`);
            setCurrentStage('idle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 w-full max-w-full overflow-hidden">
            {/* Top Config Bar: Problem Input & Language Selection */}
            <GlassCard elevated className="p-4 sm:p-5 border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                    <div>
                        <ProblemInput
                            value={problemId}
                            onChange={setProblemId}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <LanguageSelector
                            value={language}
                            onChange={handleLanguageChange}
                            disabled={loading}
                        />
                    </div>
                </div>

                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2 font-mono"
                    >
                        <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                        <span className="break-words">{errorMessage}</span>
                    </motion.div>
                )}
            </GlassCard>

            {/* Heuristic Advisory Notice */}
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-amber-300/80 text-[11px] font-mono leading-relaxed shadow-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>
                    <strong className="text-amber-300 font-semibold">Advisory:</strong> PreJudge simulates local judging & AI edge-case checks. While highly accurate, verdicts are pre-submission simulations and may not be 100% identical for every Beecrowd problem due to judge environment nuances or strict presentation formats.
                </span>
            </div>

            {/* Live Problem Details Preview Card */}
            {activeProblemSpec && !result && (
                <ProblemDetailsCard
                    problem={activeProblemSpec}
                    collapsible={true}
                    defaultOpen={true}
                />
            )}

            {/* Mobile View Toggle (Shown only on screens < lg when results or loading exists) */}
            {(loading || result) && (
                <div className="lg:hidden flex items-center p-1 rounded-xl bg-slate-900/90 border border-white/10 text-xs font-mono">
                    <button
                        type="button"
                        onClick={() => setMobileTab('editor')}
                        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            mobileTab === 'editor'
                                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 shadow-sm font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <Code2 className="w-4 h-4" />
                        <span>Code Editor</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setMobileTab('results')}
                        className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            mobileTab === 'results'
                                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 shadow-sm font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>
                            {loading ? 'Running...' : result ? `Verdict: ${result.status === 'all_tests_passed' ? 'Passed' : 'Review'}` : 'Results'}
                        </span>
                        {result && (
                            result.status === 'all_tests_passed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            )
                        )}
                    </button>
                </div>
            )}

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Code Editor Column with Run Button directly below the code block */}
                <div
                    className={`${
                        result || loading ? 'lg:col-span-6' : 'lg:col-span-12'
                    } ${
                        (loading || result) && mobileTab !== 'editor' ? 'hidden lg:block' : 'block'
                    }`}
                >
                    <CodeEditor
                        code={code}
                        onChange={setCode}
                        onRun={handleRunAnalysis}
                        disabled={loading}
                        language={language}
                    />

                    {/* Run Control Panel directly under the Codeblock */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-[#090d16] border border-white/10 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                    >
                        <div className="flex items-center gap-2.5 text-xs font-mono text-slate-400">
                            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-white/5 text-[11px] text-slate-300 font-mono">
                                Shortcut: <kbd className="text-cyan-400 font-semibold">Ctrl + Enter</kbd>
                            </span>
                            <span className="text-[11px] text-slate-500 hidden xs:inline">
                                Compiles in sandbox & compares edge cases
                            </span>
                        </div>

                        <div className="w-full sm:w-auto sm:min-w-[210px]">
                            <AnalyzeButton
                                onClick={handleRunAnalysis}
                                loading={loading}
                                disabled={loading}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Status & Dashboard Column */}
                {(loading || result) && (
                    <div
                        ref={resultsRef}
                        className={`lg:col-span-6 space-y-6 ${
                            mobileTab !== 'results' ? 'hidden lg:block' : 'block'
                        }`}
                    >
                        {loading && (
                            <AnalysisProgress
                                currentStage={currentStage}
                                isError={false}
                            />
                        )}

                        {result && !loading && (
                            <AnalysisDashboard data={result} />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
