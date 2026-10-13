/**
 * Critical Backend Unit Tests for PreJudge
 * Tests:
 * 1. Request Input Validation
 * 2. Deterministic Output Comparison
 * 3. Token-budgeted problem specification
 * 4. Sandbox compilation & execution with G++
 */

import assert from 'assert';
import { validateAnalyzeRequest } from '../lib/validation.js';
import { compareOutputs, normalizeOutput } from '../lib/comparison.js';
import { compileCpp, executeTest, createSandboxWorkspace, cleanupSandboxWorkspace } from '../lib/sandbox.js';

async function runTests() {
    console.log('--- PreJudge Backend Verification Tests ---');
    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        try {
            fn();
            console.log(`✓ PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`✗ FAIL: ${name}`, err.message);
            failed++;
        }
    }

    async function asyncTest(name, fn) {
        try {
            await fn();
            console.log(`✓ PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`✗ FAIL: ${name}`, err.message);
            failed++;
        }
    }

    // 1. Validation tests
    test('Validation: Rejects empty payload', () => {
        const res = validateAnalyzeRequest(null);
        assert.strictEqual(res.valid, false);
    });

    test('Validation: Rejects invalid problem ID', () => {
        const res = validateAnalyzeRequest({ problemId: '', language: 'cpp20', code: 'int main(){}' });
        assert.strictEqual(res.valid, false);
    });

    test('Validation: Rejects unsupported language', () => {
        const res = validateAnalyzeRequest({ problemId: '1001', language: 'rust', code: 'fn main(){}' });
        assert.strictEqual(res.valid, false);
    });

    test('Validation: Accepts valid C++20 submission', () => {
        const res = validateAnalyzeRequest({ problemId: '1001', language: 'cpp20', code: '#include <iostream>\nint main(){ return 0; }' });
        assert.strictEqual(res.valid, true);
        assert.strictEqual(res.sanitized.language, 'cpp20');
    });

    // 2. Output comparison tests
    test('Comparison: Normalizes CRLF and trailing spaces', () => {
        const actual = 'X = 19   \r\n';
        const expected = 'X = 19\n';
        const comp = compareOutputs(actual, expected);
        assert.strictEqual(comp.matched, true);
    });

    test('Comparison: Detects mismatch on content', () => {
        const actual = 'X = 20\n';
        const expected = 'X = 19\n';
        const comp = compareOutputs(actual, expected);
        assert.strictEqual(comp.matched, false);
        assert.strictEqual(comp.diffLine, 1);
    });

    // 3. Sandbox Compilation & Execution tests with real G++
    await asyncTest('Sandbox: Compiles and runs valid C++20 code', async () => {
        const workDir = await createSandboxWorkspace('test_run_1');
        try {
            const code = `#include <iostream>
int main() {
    int a, b;
    if (std::cin >> a >> b) {
        std::cout << "X = " << (a + b) << "\\n";
    }
    return 0;
}`;
            const compileRes = await compileCpp(workDir, code);
            assert.strictEqual(compileRes.success, true);

            const runRes = await executeTest(workDir, '10\n9\n', 2000);
            assert.strictEqual(runRes.status, 'success');
            const comp = compareOutputs(runRes.stdout, 'X = 19\n');
            assert.strictEqual(comp.matched, true);
        } finally {
            await cleanupSandboxWorkspace(workDir);
        }
    });

    await asyncTest('Sandbox: Detects syntax error during compilation', async () => {
        const workDir = await createSandboxWorkspace('test_run_syntax');
        try {
            const badCode = `int main() { invalid_syntax_here; }`;
            const compileRes = await compileCpp(workDir, badCode);
            assert.strictEqual(compileRes.success, false);
            assert.ok(compileRes.errors.length > 0);
        } finally {
            await cleanupSandboxWorkspace(workDir);
        }
    });

    await asyncTest('Sandbox: Enforces timeout on infinite loop', async () => {
        const workDir = await createSandboxWorkspace('test_run_timeout');
        try {
            const loopCode = `int main() { while(true) {} return 0; }`;
            const compileRes = await compileCpp(workDir, loopCode);
            assert.strictEqual(compileRes.success, true);

            const runRes = await executeTest(workDir, '', 500); // 500ms timeout
            assert.strictEqual(runRes.status, 'time_limit');
        } finally {
            await cleanupSandboxWorkspace(workDir);
        }
    });

    console.log(`\n--- Test Results: ${passed} Passed, ${failed} Failed ---`);
    if (failed > 0) {
        process.exit(1);
    }
}

runTests().catch(err => {
    console.error('Test execution crashed:', err);
    process.exit(1);
});
