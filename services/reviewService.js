import { generateReviewWithGemini } from '../lib/gemini.js';

/**
 * Conducts a conditional, token-optimized AI review based on deterministic results
 */
export async function getConditionalAiReview({
    code,
    problem,
    executionResult,
}) {
    const isCompiled = executionResult.compilation.status === 'passed';
    const failedTests = isCompiled
        ? executionResult.tests.filter(t => t.status !== 'passed')
        : [];

    return await generateReviewWithGemini({
        code,
        problemTitle: problem.title || `Problem #${problem.problemId}`,
        problemConstraints: problem.constraints || 'Standard constraints',
        compilationPassed: isCompiled,
        compilerError: executionResult.compilation.errors,
        totalTests: executionResult.execution.totalTests,
        passedCount: executionResult.execution.passed,
        failedTests,
    });
}
