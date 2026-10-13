import { generateId } from '../lib/utils.js';
import { validateAnalyzeRequest } from '../lib/validation.js';
import {
    computeRequestHash,
    checkDuplicateInProgress,
    clearDuplicateInProgress,
    enforceRateLimit,
} from '../lib/rateLimit.js';
import { saveAnalysisRecord } from '../lib/mongodb.js';
import { getOrResolveProblem } from './problemService.js';
import { prepareTestSuite } from './testService.js';
import { executeInSandbox } from './executionService.js';
import { getConditionalAiReview } from './reviewService.js';

/**
 * Main Analysis Orchestrator
 * Coordinates problem resolution, test preparation, sandbox execution, output comparison, and AI review
 */
export async function runAnalysis(body, clientIp = 'anonymous') {
    // 1. Validate request payload
    const validation = validateAnalyzeRequest(body);
    if (!validation.valid) {
        return {
            status: 400,
            payload: {
                success: false,
                error: {
                    code: validation.code,
                    message: validation.message,
                },
            },
        };
    }

    const { problemId, language, code } = validation.sanitized;

    // 2. Check rate limit
    const rateLimit = await enforceRateLimit(clientIp);
    if (!rateLimit.allowed) {
        return {
            status: 429,
            payload: {
                success: false,
                error: {
                    code: 'RATE_LIMIT_EXCEEDED',
                    message: 'Too many analysis requests. Please wait a minute before submitting again.',
                },
            },
        };
    }

    // 3. Deduplication check
    const reqHash = computeRequestHash(problemId, language, code);
    if (checkDuplicateInProgress(reqHash)) {
        return {
            status: 409,
            payload: {
                success: false,
                error: {
                    code: 'DUPLICATE_IN_PROGRESS',
                    message: 'An identical analysis is currently in progress. Please wait for results.',
                },
            },
        };
    }

    const analysisId = generateId('pj');
    const startTime = Date.now();

    try {
        // 4. Resolve problem specification (cached in MongoDB or resolved via Gemini)
        const { problem, fromCache } = await getOrResolveProblem(problemId);

        // 5. Generate high-value test suite
        const testSuite = await prepareTestSuite(problem);

        // 6. Compile & execute in sandbox (Deterministic truth)
        const executionResult = await executeInSandbox(analysisId, code, language, testSuite);

        // 7. Conditional AI review
        let aiReview = null;
        try {
            aiReview = await getConditionalAiReview({
                code,
                problem,
                executionResult,
            });
        } catch (err) {
            console.warn('[AnalysisService] AI Review non-fatal failure:', err.message);
            aiReview = {
                summary: 'AI code review is temporarily unavailable.',
                issues: [],
                edgeCases: [],
                complexity: { time: 'Unknown', space: 'Unknown' },
                suggestion: 'Rely on deterministic test outputs above.',
            };
        }

        // 8. Store minimal analysis metadata in MongoDB (anonymized, no full code persistence)
        const analysisRecord = {
            analysisId,
            problemId,
            language,
            status: executionResult.status,
            totalTests: executionResult.execution.totalTests,
            testsPassed: executionResult.execution.passed,
            testsFailed: executionResult.execution.failed,
            totalTimeMs: executionResult.execution.totalTimeMs,
            cachedProblemUsed: fromCache,
            durationMs: Date.now() - startTime,
        };

        try {
            await saveAnalysisRecord(analysisRecord);
        } catch (err) {
            console.warn('[AnalysisService] Metadata save warning:', err.message);
        }

        return {
            status: 200,
            payload: {
                success: true,
                data: {
                    analysisId,
                    status: executionResult.status,
                    problem: {
                        id: problem.problemId,
                        title: problem.title,
                        statement: problem.statement,
                        inputSpec: problem.inputSpec,
                        outputSpec: problem.outputSpec,
                        constraints: problem.constraints,
                    },
                    compilation: executionResult.compilation,
                    execution: executionResult.execution,
                    tests: executionResult.tests,
                    aiReview,
                },
            },
        };
    } catch (err) {
        console.error('[AnalysisService] Unexpected analysis error:', err);
        return {
            status: 500,
            payload: {
                success: false,
                error: {
                    code: 'ANALYSIS_FAILED',
                    message: 'Internal error processing code analysis. Please check your code syntax and try again.',
                },
            },
        };
    } finally {
        clearDuplicateInProgress(reqHash);
    }
}
