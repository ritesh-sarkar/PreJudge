import { ALL_100_PROBLEMS } from './test_suite_100.js';
import { validateAndTranspileToJs } from '../lib/transpiler.js';
import { compareOutputs } from '../lib/comparison.js';
import { spawnSync } from 'child_process';
import fs from 'fs';

console.log(`Starting large test execution of ${ALL_100_PROBLEMS.length} Beecrowd problems (1000 - 3000 series)...`);

let passedCount = 0;
let failedCount = 0;
const failures = [];

for (const p of ALL_100_PROBLEMS) {
    const transpileRes = validateAndTranspileToJs(p.cpp, 'cpp20');
    if (!transpileRes.success) {
        failedCount++;
        failures.push({
            id: p.id,
            name: p.name,
            type: 'TRANSPILE_ERROR',
            error: transpileRes.error
        });
        console.error(`[FAIL] Problem #${p.id} ${p.name} -> Transpile error: ${transpileRes.error}`);
        continue;
    }

    const tmpFile = `/tmp/bench_${p.id}.js`;
    fs.writeFileSync(tmpFile, transpileRes.jsCode);

    let problemPassed = true;
    for (let i = 0; i < p.tests.length; i++) {
        const t = p.tests[i];
        const exec = spawnSync('node', [tmpFile], {
            input: t.input,
            encoding: 'utf8',
            timeout: 3000
        });

        if (exec.status !== 0) {
            problemPassed = false;
            failedCount++;
            failures.push({
                id: p.id,
                name: p.name,
                type: 'RUNTIME_ERROR',
                testIdx: i,
                stderr: exec.stderr,
                input: t.input
            });
            console.error(`[FAIL] Problem #${p.id} ${p.name} (Test #${i + 1}) -> Runtime error: ${exec.stderr}`);
            break;
        }

        const cmp = compareOutputs(exec.stdout, t.expected);
        if (!cmp.matched) {
            problemPassed = false;
            failedCount++;
            failures.push({
                id: p.id,
                name: p.name,
                type: cmp.status,
                diffMessage: cmp.diffMessage,
                actual: exec.stdout,
                expected: t.expected,
                input: t.input
            });
            console.error(`[FAIL] Problem #${p.id} ${p.name} (Test #${i + 1}) -> ${cmp.status}: expected ${JSON.stringify(t.expected)}, got ${JSON.stringify(exec.stdout)}`);
            break;
        }
    }

    if (problemPassed) {
        passedCount++;
        console.log(`[PASS] Problem #${p.id} ${p.name} passed all test cases.`);
    }

    try { fs.unlinkSync(tmpFile); } catch (e) {}
}

console.log(`\n========================================`);
console.log(`TEST RESULTS SUMMARY:`);
console.log(`Total Problems Tested: ${ALL_100_PROBLEMS.length}`);
console.log(`Passed: ${passedCount}`);
console.log(`Failed: ${failedCount}`);
console.log(`Pass Rate: ${((passedCount / ALL_100_PROBLEMS.length) * 100).toFixed(1)}%`);
console.log(`========================================\n`);

if (failures.length > 0) {
    console.log(`DETECTED INCONSISTENCIES AND FAILURES:`);
    console.log(JSON.stringify(failures, null, 2));
    process.exit(1);
} else {
    console.log(`ALL 100 PROBLEMS PASSED PERFECTLY!`);
    process.exit(0);
}
