import {
    createSandboxWorkspace,
    compileLanguage,
    executeTest,
    cleanupSandboxWorkspace,
} from '../lib/sandbox.js';
import { compareOutputs } from '../lib/comparison.js';

/**
 * Executes code via remote dedicated execution service on Render when configured,
 * or falls back to local execution engine for local development.
 */
export async function executeInSandbox(analysisId, code, language, testSuite) {
    const executionServiceUrl = process.env.EXECUTION_SERVICE_URL?.trim();

    if (executionServiceUrl) {
        try {
            return await executeRemote(executionServiceUrl, analysisId, code, language, testSuite);
        } catch (err) {
            console.error('[ExecutionService] Remote execution failed:', err.message);
            // In local development or if explicitly allowed, fall back to local execution
            if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_LOCAL_FALLBACK === 'true') {
                console.warn('[ExecutionService] Falling back to local execution engine...');
                return await executeInLocalSandbox(analysisId, code, language, testSuite);
            }

            return {
                status: 'sandbox_error',
                compilation: {
                    status: 'failed',
                    compiler: 'Remote Execution Service',
                    errors: `Execution service is unavailable: ${err.message}. Please verify the Render service is running.`,
                    exitCode: -1,
                },
                execution: {
                    totalTests: testSuite.length,
                    passed: 0,
                    failed: testSuite.length,
                    totalTimeMs: 0,
                    slowestTimeMs: 0,
                },
                tests: [],
            };
        }
    }

    return await executeInLocalSandbox(analysisId, code, language, testSuite);
}

/**
 * Calls the dedicated Render code execution service
 */
async function executeRemote(serviceUrl, analysisId, code, language, testSuite) {
    const url = `${serviceUrl.replace(/\/+$/, '')}/execute`;
    const token = process.env.EXECUTION_SERVICE_TOKEN?.trim();

    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = {
        analysisId,
        language,
        sourceCode: code,
        tests: testSuite,
        timeoutMs: 3000,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000), // 15-second cap for cold starts/execution
    });

    if (!response.ok) {
        let errorDetails = `HTTP ${response.status}`;
        try {
            const errData = await response.json();
            const msg = typeof errData?.error === 'string'
                ? errData.error
                : errData?.error?.message || errData?.message;
            if (msg) {
                errorDetails += `: ${msg}`;
            }
        } catch {
            // non-json response
        }
        throw new Error(`Remote execution service error: ${errorDetails}`);
    }

    const json = await response.json();
    if (!json.success) {
        const errorMsg = typeof json?.error === 'string'
            ? json.error
            : json?.error?.message || json?.message || 'Remote execution failed';
        throw new Error(errorMsg);
    }

    // Accept both unwrapped response ({ success: true, status: ... }) and wrapped ({ success: true, data: { status: ... } })
    const resultData = json.data || json;
    if (!resultData.status) {
        throw new Error('Invalid response structure from execution service');
    }

    return resultData;
}

/**
 * Local sandbox execution (used in development or when no remote execution service is configured)
 */
async function executeInLocalSandbox(analysisId, code, language, testSuite) {
    let workDir = null;

    try {
        workDir = await createSandboxWorkspace(analysisId);

        // 1. Compile or validate syntax for the selected language
        const compileResult = await compileLanguage(workDir, language, code);

        if (!compileResult.success) {
            return {
                status: 'compilation_failed',
                compilation: {
                    status: 'failed',
                    compiler: compileResult.compiler,
                    errors: compileResult.errors,
                    exitCode: compileResult.exitCode,
                },
                execution: {
                    totalTests: testSuite.length,
                    passed: 0,
                    failed: 0,
                    totalTimeMs: 0,
                    slowestTimeMs: 0,
                },
                tests: [],
            };
        }

        // 2. Execute test cases
        const testResults = [];
        let passedCount = 0;
        let failedCount = 0;
        let totalTimeMs = 0;
        let slowestTimeMs = 0;
        let overallStatus = 'all_tests_passed';

        for (const test of testSuite) {
            const run = await executeTest(workDir, language, test.input, 3000);
            totalTimeMs += run.timeMs;
            if (run.timeMs > slowestTimeMs) {
                slowestTimeMs = run.timeMs;
            }

            if (run.status === 'time_limit') {
                failedCount++;
                if (overallStatus === 'all_tests_passed') overallStatus = 'time_limit';
                testResults.push({
                    id: test.id,
                    status: 'time_limit',
                    reason: test.reason,
                    isAiDerived: test.isAiDerived,
                    input: test.input,
                    expected: test.expected || '<Process Timeout>',
                    actual: run.stdout,
                    error: run.stderr,
                    timeMs: run.timeMs,
                });
                continue;
            }

            if (run.status === 'runtime_error' || run.status === 'sandbox_error') {
                failedCount++;
                if (overallStatus === 'all_tests_passed') overallStatus = 'runtime_error';
                testResults.push({
                    id: test.id,
                    status: run.status,
                    reason: test.reason,
                    isAiDerived: test.isAiDerived,
                    input: test.input,
                    expected: test.expected || '<Successful Exit>',
                    actual: run.stdout,
                    error: run.stderr,
                    timeMs: run.timeMs,
                });
                continue;
            }

            // Self-consistency check
            if (test.isSelfConsistency || !test.expected) {
                if (run.stdout && run.stdout.trim() !== '') {
                    passedCount++;
                    testResults.push({
                        id: test.id,
                        status: 'passed',
                        reason: test.reason,
                        isAiDerived: false,
                        input: test.input,
                        expected: run.stdout.trimEnd(),
                        actual: run.stdout.trimEnd(),
                        timeMs: run.timeMs,
                    });
                } else {
                    failedCount++;
                    if (overallStatus === 'all_tests_passed') overallStatus = 'test_failed';
                    testResults.push({
                        id: test.id,
                        status: 'wrong_output',
                        reason: test.reason,
                        isAiDerived: false,
                        input: test.input,
                        expected: '<Non-empty output expected>',
                        actual: '<empty output>',
                        diffMessage: 'Program exited without printing any output.',
                        timeMs: run.timeMs,
                    });
                }
                continue;
            }

            // Output comparison
            const comparison = compareOutputs(run.stdout, test.expected);

            if (comparison.matched) {
                passedCount++;
                testResults.push({
                    id: test.id,
                    status: 'passed',
                    reason: test.reason,
                    isAiDerived: test.isAiDerived,
                    input: test.input,
                    expected: test.expected,
                    actual: run.stdout,
                    timeMs: run.timeMs,
                });
            } else if (comparison.isPresentationError) {
                failedCount++;
                if (overallStatus === 'all_tests_passed') overallStatus = 'presentation_error';
                testResults.push({
                    id: test.id,
                    status: 'presentation_error',
                    reason: test.reason,
                    isAiDerived: test.isAiDerived,
                    input: test.input,
                    expected: test.expected,
                    actual: run.stdout,
                    diffMessage: comparison.diffMessage,
                    timeMs: run.timeMs,
                });
            } else {
                failedCount++;
                if (overallStatus === 'all_tests_passed') overallStatus = 'test_failed';
                testResults.push({
                    id: test.id,
                    status: 'wrong_output',
                    reason: test.reason,
                    isAiDerived: test.isAiDerived,
                    input: test.input,
                    expected: test.expected,
                    actual: run.stdout,
                    diffLine: comparison.diffLine,
                    diffMessage: comparison.diffMessage,
                    timeMs: run.timeMs,
                });
            }
        }

        return {
            status: overallStatus,
            compilation: {
                status: 'passed',
                compiler: compileResult.compiler,
            },
            execution: {
                totalTests: testSuite.length,
                passed: passedCount,
                failed: failedCount,
                totalTimeMs,
                slowestTimeMs,
            },
            tests: testResults,
        };
    } finally {
        if (workDir) {
            await cleanupSandboxWorkspace(workDir);
        }
    }
}
