/**
 * Self-test script for sandbox execution service
 */

import http from 'http';
import assert from 'assert';
import { executeSubmission } from './runner.js';

async function run() {
    console.log('--- Testing PreJudge Sandbox Runner ---');

    // Test Python execution (python3 is available in environment)
    console.log('Testing Python 3 runner...');
    const pyResult = await executeSubmission({
        language: 'python',
        sourceCode: `import sys
lines = sys.stdin.read().split()
if len(lines) >= 2:
    a, b = int(lines[0]), int(lines[1])
    print(f"X = {a + b}")
`,
        tests: [
            { id: 1, input: '10\n9\n', expected: 'X = 19\n', reason: 'Basic addition' },
            { id: 2, input: '-10\n4\n', expected: 'X = -6\n', reason: 'Negative values' },
        ],
        timeoutMs: 3000,
    });

    assert.strictEqual(pyResult.status, 'all_tests_passed', `Expected all_tests_passed, got ${pyResult.status}`);
    assert.strictEqual(pyResult.execution.passed, 2, 'Expected 2 tests passed');
    console.log('✓ Python 3 test suite passed successfully!');

    // Test JavaScript execution (node is available in environment)
    console.log('Testing JavaScript runner...');
    const jsResult = await executeSubmission({
        language: 'javascript',
        sourceCode: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 2) {
    const a = parseInt(input[0], 10);
    const b = parseInt(input[1], 10);
    console.log("X = " + (a + b));
}
`,
        tests: [
            { id: 1, input: '15 -7', expected: 'X = 8\n', reason: 'Sum test' },
        ],
        timeoutMs: 3000,
    });

    assert.strictEqual(jsResult.status, 'all_tests_passed', `Expected all_tests_passed, got ${jsResult.status}`);
    assert.strictEqual(jsResult.execution.passed, 1, 'Expected 1 test passed');
    console.log('✓ JavaScript test suite passed successfully!');

    console.log('All sandbox execution self-tests completed successfully!');
}

run().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
