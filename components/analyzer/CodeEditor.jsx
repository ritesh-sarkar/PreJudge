'use client';

import React, { useRef, useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-c.js';
import 'prismjs/components/prism-cpp.js';
import 'prismjs/components/prism-python.js';
import 'prismjs/components/prism-java.js';
import 'prismjs/components/prism-javascript.js';
import { motion, AnimatePresence } from 'motion/react';
import {
    Copy,
    Check,
    RotateCcw,
    Clipboard,
    Trash2,
    Code2,
    Sparkles,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { CODE_TEMPLATES, LANGUAGE_LABELS } from '../../lib/codeTemplates.js';

export function CodeEditor({ code, onChange, onRun, disabled, language = 'cpp20' }) {
    const textareaRef = useRef(null);
    const highlightRef = useRef(null);
    const lineNumbersRef = useRef(null);
    const [copied, setCopied] = useState(false);
    const [pasted, setPasted] = useState(false);
    const [pasteNotice, setPasteNotice] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const currentMeta = LANGUAGE_LABELS[language] || LANGUAGE_LABELS.cpp20;

    // Synchronize scrolling across textarea, syntax highlight layer, and line number gutter
    const handleScroll = (e) => {
        const top = e.target.scrollTop;
        const left = e.target.scrollLeft;
        if (highlightRef.current) {
            highlightRef.current.scrollTop = top;
            highlightRef.current.scrollLeft = left;
        }
        if (lineNumbersRef.current) {
            lineNumbersRef.current.scrollTop = top;
        }
    };

    // Count lines for line numbering gutter
    const lines = (code || '').split('\n');
    const lineCount = Math.max(1, lines.length);

    // Compute syntax highlighted HTML using Prism
    const highlightedHtml = useMemo(() => {
        const safeCode = code || '';
        let prismLang = Prism.languages.cpp;
        let langKey = 'cpp';

        if (language === 'python') {
            prismLang = Prism.languages.python;
            langKey = 'python';
        } else if (language === 'java') {
            prismLang = Prism.languages.java;
            langKey = 'java';
        } else if (language === 'javascript') {
            prismLang = Prism.languages.javascript;
            langKey = 'javascript';
        } else if (language === 'c17') {
            prismLang = Prism.languages.c;
            langKey = 'c';
        }

        try {
            return Prism.highlight(safeCode, prismLang, langKey) + (safeCode.endsWith('\n') ? ' ' : '');
        } catch {
            return safeCode
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        }
    }, [code, language]);

    const handleCopy = () => {
        if (!code) return;
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePasteButton = async () => {
        if (disabled) return;
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                if (text) {
                    const ta = textareaRef.current;
                    if (ta) {
                        const start = ta.selectionStart;
                        const end = ta.selectionEnd;
                        const newCode = code.substring(0, start) + text + code.substring(end);
                        onChange(newCode);
                        setTimeout(() => {
                            ta.selectionStart = ta.selectionEnd = start + text.length;
                            ta.focus();
                        }, 10);
                    } else {
                        onChange(text);
                    }
                    setPasted(true);
                    setTimeout(() => setPasted(false), 2000);
                    return;
                }
            }
        } catch {
            // Browser security may restrict async clipboard access without gesture
        }

        if (textareaRef.current) {
            textareaRef.current.focus();
            setPasteNotice('Press Ctrl+V to paste');
            setTimeout(() => setPasteNotice(''), 3000);
        }
    };

    const handleReset = () => {
        const template = CODE_TEMPLATES[language] || CODE_TEMPLATES.cpp20;
        onChange(template);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    const handleClear = () => {
        onChange('');
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };

    // Advanced code editing keyboard handlers (Tab indent, Ctrl+Enter run)
    const handleKeyDown = (e) => {
        const ta = textareaRef.current;
        if (!ta) return;

        // Run shortcut: Ctrl+Enter or Cmd+Enter
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (onRun && !disabled) {
                onRun();
            }
            return;
        }

        // Tab or Shift+Tab handling
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const tabSpaces = '    ';

            if (start === end) {
                const updated = code.substring(0, start) + tabSpaces + code.substring(end);
                onChange(updated);
                setTimeout(() => {
                    ta.selectionStart = ta.selectionEnd = start + tabSpaces.length;
                }, 0);
            } else {
                const selectedLines = code.substring(start, end).split('\n');
                if (e.shiftKey) {
                    const unindented = selectedLines
                        .map((l) => (l.startsWith('    ') ? l.substring(4) : l.startsWith('\t') ? l.substring(1) : l))
                        .join('\n');
                    const updated = code.substring(0, start) + unindented + code.substring(end);
                    onChange(updated);
                } else {
                    const indented = selectedLines.map((l) => tabSpaces + l).join('\n');
                    const updated = code.substring(0, start) + indented + code.substring(end);
                    onChange(updated);
                }
            }
        }
    };

    return (
        <div
            className={`flex flex-col rounded-xl overflow-hidden border border-white/10 bg-[#090d16] shadow-2xl w-full transition-all duration-300 ${
                isExpanded ? 'h-[640px]' : 'h-[460px] sm:h-[490px] lg:h-[510px]'
            }`}
        >
            {/* Header: File title & responsive quick actions */}
            <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#070a12] border-b border-white/5 select-none text-xs">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 flex-shrink-0 animate-pulse"></div>
                    <span className="text-slate-200 font-semibold tracking-wide font-mono truncate text-xs sm:text-sm">
                        {currentMeta.file}
                    </span>
                    <span className="text-slate-500 text-[11px] font-normal hidden md:inline truncate">
                        ({currentMeta.compiler})
                    </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                    {pasteNotice && (
                        <span className="text-[10px] sm:text-[11px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40 animate-pulse font-mono">
                            {pasteNotice}
                        </span>
                    )}

                    {/* Paste Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handlePasteButton}
                        disabled={disabled}
                        title="Paste from clipboard"
                        className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/40 transition-colors text-[11px] font-mono cursor-pointer disabled:opacity-50"
                    >
                        {pasted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5 text-cyan-400" />}
                        <span className="hidden xs:inline">{pasted ? 'Pasted!' : 'Paste'}</span>
                    </motion.button>

                    {/* Copy Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleCopy}
                        title="Copy code"
                        className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/5 transition-colors text-[11px] font-mono cursor-pointer"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="hidden xs:inline">{copied ? 'Copied' : 'Copy'}</span>
                    </motion.button>

                    {/* Reset Starter Template */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleReset}
                        disabled={disabled}
                        title="Reset template"
                        className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 transition-colors text-[11px] font-mono cursor-pointer disabled:opacity-50"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                    </motion.button>

                    {/* Clear Button */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleClear}
                        disabled={disabled}
                        title="Clear code"
                        className="flex items-center gap-1 px-2 sm:px-2 py-1 rounded-md bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-white/5 hover:border-rose-900/40 transition-colors text-[11px] font-mono cursor-pointer disabled:opacity-50"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clear</span>
                    </motion.button>

                    {/* Expand / Minimize Toggle */}
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? 'Standard height' : 'Expand editor'}
                        className="flex items-center gap-1 p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-white/5 transition-colors text-[11px] font-mono cursor-pointer"
                    >
                        {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </motion.button>
                </div>
            </div>

            {/* Editor Canvas: Constrained Flex-1 Container with Gutter & Overlaid Textarea */}
            <div className="relative flex-1 min-h-0 flex bg-[#080c15] font-mono text-[13px] sm:text-sm overflow-hidden">
                {/* Gutter: Line Numbers - Fixed Line-Height & Matched Padding */}
                <div
                    ref={lineNumbersRef}
                    aria-hidden="true"
                    className="w-10 sm:w-12 h-full overflow-hidden flex-shrink-0 select-none bg-[#060910] border-r border-white/5 text-right pr-2 text-slate-600 font-mono text-xs pointer-events-none"
                    style={{
                        paddingTop: '12px',
                        paddingBottom: '96px',
                    }}
                >
                    {Array.from({ length: lineCount }).map((_, i) => (
                        <div
                            key={i + 1}
                            style={{
                                height: '24px',
                                lineHeight: '24px',
                            }}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* Editor Container with Overlaid Native Textarea & Syntax Highlighter */}
                <div className="relative flex-1 min-h-0 h-full overflow-hidden">
                    {/* Background Layer: Real-time Syntax Highlighted HTML */}
                    <pre
                        ref={highlightRef}
                        aria-hidden="true"
                        tabIndex={-1}
                        className="absolute inset-0 w-full h-full m-0 bg-transparent text-slate-100 font-mono text-[13px] sm:text-sm whitespace-pre overflow-hidden pointer-events-none select-none z-0"
                        style={{
                            paddingTop: '12px',
                            paddingLeft: '14px',
                            paddingRight: '14px',
                            paddingBottom: '96px',
                            lineHeight: '24px',
                            tabSize: 4,
                            MozTabSize: 4,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
                        }}
                        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                    />

                    {/* Foreground Layer: Native, 100% Selectable, Editable Textarea */}
                    <textarea
                        ref={textareaRef}
                        value={code}
                        disabled={disabled}
                        onChange={(e) => onChange(e.target.value)}
                        onScroll={handleScroll}
                        onKeyDown={handleKeyDown}
                        placeholder={`// Type or paste your ${currentMeta.name} solution here...`}
                        spellCheck="false"
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        className="relative z-10 w-full h-full bg-transparent text-transparent caret-cyan-400 resize-none outline-none font-mono text-[13px] sm:text-sm whitespace-pre overflow-auto selection:bg-cyan-500/30 selection:text-transparent disabled:opacity-50"
                        style={{
                            paddingTop: '12px',
                            paddingLeft: '14px',
                            paddingRight: '14px',
                            paddingBottom: '96px',
                            lineHeight: '24px',
                            tabSize: 4,
                            MozTabSize: 4,
                            fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace",
                        }}
                    />
                </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="flex-shrink-0 flex items-center justify-between px-3 sm:px-4 py-2 bg-[#070a12] border-t border-white/5 text-[10.5px] sm:text-[11px] font-mono text-slate-500 select-none flex-wrap gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="text-cyan-400 flex items-center gap-1 font-medium">
                        <Code2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[140px] sm:max-w-none">{currentMeta.name}</span>
                    </span>
                    <span>•</span>
                    <span>{lineCount} lines</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{(code || '').length} chars</span>
                    <span className="hidden md:inline">•</span>
                    <span className="text-purple-400 hidden md:flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Prism Syntax
                    </span>
                </div>

                <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Editor Ready
                    </span>
                </div>
            </div>
        </div>
    );
}
