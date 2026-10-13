import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

// Initialize Gemini client strictly server-side
const apiKey = process.env.GEMINI_API_KEY;

let ai = null;
if (apiKey) {
    ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
            headers: {
                'User-Agent': 'aistudio-build',
            },
        },
    });
}

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

async function generateWithTimeout(params, timeoutMs = 5000) {
    if (!ai) return null;

    const executeModel = async (modelName) => {
        return Promise.race([
            ai.models.generateContent({ ...params, model: modelName }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Gemini API timeout')), timeoutMs)
            ),
        ]);
    };

    try {
        return await executeModel(params.model || PRIMARY_MODEL);
    } catch (primaryErr) {
        // If 429 or model failure, try fallback fast model
        const isQuota = primaryErr?.message?.includes('429') || primaryErr?.message?.includes('quota') || primaryErr?.message?.includes('RESOURCE_EXHAUSTED');
        if (!isQuota && FALLBACK_MODEL) {
            try {
                return await executeModel(FALLBACK_MODEL);
            } catch {
                return null;
            }
        }
        return null;
    }
}

/**
 * Resolve competitive programming problem details dynamically
 */
export async function resolveProblemWithGemini(problemId) {
    const key = String(problemId).trim();

    if (!ai) {
        return {
            problemId: key,
            title: `Beecrowd Problem #${key}`,
            statement: `Process standard input according to Beecrowd problem #${key} requirements.`,
            inputSpec: 'Standard input values.',
            outputSpec: 'Formatted output.',
            constraints: 'Standard constraints.',
            examples: [],
            edgeCases: ['Boundary inputs', 'Zero values', 'Negative values'],
        };
    }

    try {
        const prompt = `You are a competitive programming judge parser. Resolve online judge / beecrowd problem ID #${key}.
Return a compact JSON specification of the problem.
Keep descriptions short and concise to minimize tokens.`;

        const response = await generateWithTimeout({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: {
                systemInstruction: 'You extract competitive programming problems into concise structured JSON. Be factual, concise, and do not include conversational text.',
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        problemId: { type: Type.STRING },
                        title: { type: Type.STRING },
                        statement: { type: Type.STRING },
                        inputSpec: { type: Type.STRING },
                        outputSpec: { type: Type.STRING },
                        constraints: { type: Type.STRING },
                        examples: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    input: { type: Type.STRING },
                                    expected: { type: Type.STRING },
                                },
                                required: ['input', 'expected'],
                            },
                        },
                        edgeCases: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                    required: ['problemId', 'title', 'statement', 'inputSpec', 'outputSpec'],
                },
            },
        }, 4000);

        const text = response?.text?.trim();
        if (text) {
            const parsed = JSON.parse(text);
            if (parsed.title && Array.isArray(parsed.examples) && parsed.examples.length > 0) {
                return {
                    ...parsed,
                    problemId: key,
                    examples: parsed.examples,
                    edgeCases: parsed.edgeCases || ['Boundary values', 'Zero values', 'Negative values'],
                };
            }
        }
    } catch {
        // Quiet fallback to local problem specification
    }

    return {
        problemId: key,
        title: `Beecrowd Problem #${key}`,
        statement: `Process standard input stream according to Beecrowd problem #${key} specifications.`,
        inputSpec: 'Standard input stream.',
        outputSpec: 'Formatted output stream.',
        constraints: 'Standard online judge constraints.',
        examples: [],
        edgeCases: ['Boundary values', 'Zero values', 'Negative values'],
    };
}

/**
 * Generate targeted boundary and edge test cases
 */
export async function generateTestsWithGemini(problemSpec) {
    if (!ai) {
        return (problemSpec.examples || []).map((ex, idx) => ({
            id: idx + 1,
            input: ex.input,
            expected: ex.expected,
            reason: 'sample',
            isAiDerived: false,
        }));
    }

    try {
        const compactContext = {
            id: problemSpec.problemId,
            title: problemSpec.title,
            inputSpec: problemSpec.inputSpec,
            outputSpec: problemSpec.outputSpec,
            constraints: problemSpec.constraints,
            samples: problemSpec.examples?.slice(0, 3) || [],
        };

        const prompt = `Generate 4 to 6 high-value test cases for competitive programming problem:
${JSON.stringify(compactContext)}

Include:
- Minimum/zero boundary
- Maximum constraint boundary
- Negative or duplicate numbers (if applicable)
- Special formatting requirements

Strictly follow the exact expected output format (case sensitive, newline sensitive).`;

        const response = await generateWithTimeout({
            model: PRIMARY_MODEL,
            contents: prompt,
            config: {
                systemInstruction: 'Generate compact test cases for competitive programming. Expected outputs must precisely adhere to output specification. Do not include verbose reasoning.',
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        tests: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    input: { type: Type.STRING },
                                    expected: { type: Type.STRING },
                                    reason: { type: Type.STRING },
                                },
                                required: ['input', 'expected', 'reason'],
                            },
                        },
                    },
                    required: ['tests'],
                },
            },
        }, 4000);

        const text = response?.text?.trim();
        if (text) {
            const parsed = JSON.parse(text);
            return (parsed.tests || []).map((t, idx) => ({
                id: idx + 1,
                input: t.input,
                expected: t.expected,
                reason: t.reason || 'edge-case',
                isAiDerived: true,
            }));
        }
    } catch {
        // Quiet fallback
    }

    return (problemSpec.examples || []).map((ex, idx) => ({
        id: idx + 1,
        input: ex.input,
        expected: ex.expected,
        reason: 'sample',
        isAiDerived: false,
    }));
}

/**
 * Compact AI Review with Intelligent Local Fallback
 */
export async function generateReviewWithGemini({
    code,
    problemTitle,
    problemConstraints,
    compilationPassed,
    compilerError,
    totalTests,
    passedCount,
    failedTests,
}) {
    if (ai) {
        try {
            if (!compilationPassed) {
                const prompt = `Analyze this compilation failure:
Compiler error:
${compilerError?.slice(0, 1000)}

User Code:
${code.slice(0, 2000)}

Explain concisely why it failed to compile and how to fix it.`;

                const response = await generateWithTimeout({
                    model: PRIMARY_MODEL,
                    contents: prompt,
                    config: {
                        systemInstruction: 'Provide a concise, direct analysis of compilation error in structured JSON.',
                        responseMimeType: 'application/json',
                        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING },
                                issues: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            severity: { type: Type.STRING },
                                            type: { type: Type.STRING },
                                            message: { type: Type.STRING },
                                        },
                                        required: ['severity', 'type', 'message'],
                                    },
                                },
                                edgeCases: { type: Type.ARRAY, items: { type: Type.STRING } },
                                complexity: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.STRING },
                                        space: { type: Type.STRING },
                                    },
                                    required: ['time', 'space'],
                                },
                                suggestion: { type: Type.STRING },
                            },
                            required: ['summary', 'issues', 'suggestion'],
                        },
                    },
                }, 4000);

                const text = response?.text?.trim();
                if (text) return JSON.parse(text);
            } else {
                const compactPayload = {
                    problem: { title: problemTitle, constraints: problemConstraints },
                    results: { total: totalTests, passed: passedCount, failed: failedTests.length },
                    failedSamples: failedTests.slice(0, 3).map(f => ({
                        input: f.input?.slice(0, 100),
                        expected: f.expected?.slice(0, 100),
                        actual: f.actual?.slice(0, 100),
                        status: f.status,
                        diffMessage: f.diffMessage,
                    })),
                    code: code.slice(0, 2500),
                };

                const prompt = `Evaluate competitive programming solution execution:
${JSON.stringify(compactPayload)}

Provide concise diagnostic review.
Focus on:
1. What likely caused any failure (presentation, precision, logic, off-by-one, overflow, format)?
2. Estimated algorithmic time & space complexity.
3. Overlooked edge cases.
4. Concrete advice. Keep answers crisp and technical.`;

                const response = await generateWithTimeout({
                    model: PRIMARY_MODEL,
                    contents: prompt,
                    config: {
                        systemInstruction: 'You are a senior competitive programming coach. Provide brief, hyper-specific feedback in structured JSON.',
                        responseMimeType: 'application/json',
                        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING },
                                issues: {
                                    type: Type.ARRAY,
                                    items: {
                                        type: Type.OBJECT,
                                        properties: {
                                            severity: { type: Type.STRING },
                                            type: { type: Type.STRING },
                                            message: { type: Type.STRING },
                                        },
                                        required: ['severity', 'type', 'message'],
                                    },
                                },
                                edgeCases: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING },
                                },
                                complexity: {
                                    type: Type.OBJECT,
                                    properties: {
                                        time: { type: Type.STRING },
                                        space: { type: Type.STRING },
                                    },
                                    required: ['time', 'space'],
                                },
                                suggestion: { type: Type.STRING },
                            },
                            required: ['summary', 'issues', 'edgeCases', 'complexity', 'suggestion'],
                        },
                    },
                }, 4000);

                const text = response?.text?.trim();
                if (text) return JSON.parse(text);
            }
        } catch {
            // Quiet fallback to heuristic engine
        }
    }

    return getFallbackReview(compilationPassed, failedTests, totalTests, compilerError, code);
}

/**
 * Intelligent Static Code Review & Complexity Analyzer
 */
function getFallbackReview(compilationPassed, failedTests, totalTests, compilerError, code = '') {
    if (!compilationPassed) {
        return {
            summary: 'Compilation or syntax error encountered. Fix compiler errors before running test cases.',
            issues: [
                {
                    severity: 'high',
                    type: 'syntax',
                    message: compilerError ? compilerError.slice(0, 200).trim() : 'Syntax / Compilation failure.',
                },
            ],
            edgeCases: ['Check matching brackets', 'Verify semicolon termination', 'Confirm imported headers/modules'],
            complexity: { time: 'N/A (Compile Error)', space: 'N/A' },
            suggestion: 'Inspect the compiler log above to locate the exact error line and fix syntax.',
        };
    }

    // Algorithmic Complexity Heuristics
    let timeComplexity = 'O(1)';
    let spaceComplexity = 'O(1)';

    const hasNestedLoops = /(for|while)[^{}]*\{[^{}]*(for|while)/s.test(code) || /for\s+\w+\s+in[^\n:]+:\s*\n\s+for\s+/m.test(code);
    const hasSorting = /\bsort\s*\(|\.sort\(|std::sort|Arrays\.sort|sorted\(/i.test(code);
    const hasSingleLoop = /for\s*\(|while\s*\(|for\s+\w+\s+in\s+/g.test(code);
    const hasRecursion = /def\s+(\w+)[^:]*:.*?\1\(|(\w+)\s*\([^)]*\)\s*\{.*?\2\(/s.test(code);

    if (hasNestedLoops) timeComplexity = 'O(N²)';
    else if (hasSorting) timeComplexity = 'O(N log N)';
    else if (hasRecursion) timeComplexity = 'O(2ᴺ) or O(N)';
    else if (hasSingleLoop) timeComplexity = 'O(N)';

    const hasLargeArrays = /vector<|int\s+\w+\[\s*\d{3,}\s*\]|\w+\s*=\s*\[0\]\s*\*|ArrayList|new\s+int\[/i.test(code);
    const hasMapSet = /unordered_map|map<|set<|HashMap|HashSet|dict\(|set\(/i.test(code);
    if (hasLargeArrays || hasMapSet) spaceComplexity = 'O(N)';

    // Diagnostic Issues from test outcomes
    const issues = [];
    const presentationErrors = failedTests.filter(t => t.status === 'presentation_error');
    const runtimeErrors = failedTests.filter(t => t.status === 'runtime_error');
    const timeLimits = failedTests.filter(t => t.status === 'time_limit');
    const wrongAnswers = failedTests.filter(t => t.status === 'wrong_output');

    if (presentationErrors.length > 0) {
        issues.push({
            severity: 'medium',
            type: 'presentation',
            message: 'Presentation Error: Check missing newline (\\n) at the end of output or extra spacing between tokens.',
        });
    }

    if (runtimeErrors.length > 0) {
        issues.push({
            severity: 'high',
            type: 'runtime',
            message: 'Runtime Error: Check array bounds, division by zero, or standard input token parsing format.',
        });
    }

    if (timeLimits.length > 0) {
        issues.push({
            severity: 'high',
            type: 'performance',
            message: 'Time Limit Exceeded: Check for infinite loops or consider optimizing inner loop logic.',
        });
    }

    if (wrongAnswers.length > 0) {
        issues.push({
            severity: 'medium',
            type: 'logic',
            message: wrongAnswers[0]?.diffMessage || 'Logic discrepancy detected on test cases.',
        });
    }

    const isAllPassed = failedTests.length === 0;

    return {
        summary: isAllPassed
            ? 'All judge test cases passed deterministically with exact formatting and exit code 0.'
            : `Detected issues on ${failedTests.length} of ${totalTests} test case(s).`,
        issues,
        edgeCases: ['Zero boundary (0, 0.0)', 'Maximum constraint bounds', 'Negative integers', 'Exact trailing \\n at EOF'],
        complexity: { time: timeComplexity, space: spaceComplexity },
        suggestion: isAllPassed
            ? 'Solution is clean and satisfies judge constraints. Ready for Beecrowd submission.'
            : 'Inspect the test breakdown above to address the highlighted formatting or logic differences.',
    };
}
