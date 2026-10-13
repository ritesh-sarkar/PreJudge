import {
    createSandboxWorkspace,
    compileLanguage,
    executeTest,
    cleanupSandboxWorkspace,
} from '../lib/sandbox.js';
import { compareOutputs } from '../lib/comparison.js';

/**
 * Orchestrates deterministic compilation and isolated execution of user code across multiple languages
 */
export async function executeInSandbox(analysisId, code, language, testSuite) {
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

            // If test is marked for self-consistency runtime check
            if (test.isSelfConsistency) {
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

            // Deterministic output comparison against online reference
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
