#!/usr/bin/env node
/**
 * Standalone Sandbox Runner
 * Used within Docker execution containers for isolated compilation and multi-test execution
 */

import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const COMPILE_TIMEOUT_MS = 8000;
const EXEC_TIMEOUT_MS = 2000;
const MAX_OUTPUT_BYTES = 128 * 1024;

async function run() {
    let rawInput = '';
    for await (const chunk of process.stdin) {
        rawInput += chunk;
    }

    if (!rawInput.trim()) {
        console.error(JSON.stringify({ error: 'No execution payload provided' }));
        process.exit(1);
    }

    let payload;
    try {
        payload = JSON.parse(rawInput);
    } catch {
        console.error(JSON.stringify({ error: 'Malformed JSON payload' }));
        process.exit(1);
    }

    const { code, tests } = payload;
    const workDir = '/sandbox/exec_' + Date.now();
    await fs.mkdir(workDir, { recursive: true });

    try {
        // Write main.cpp
        await fs.writeFile(path.join(workDir, 'main.cpp'), code, 'utf8');

        // Compile
        const compileProc = spawn('g++', ['-O2', '-std=c++20', '-DONLINE_JUDGE', 'main.cpp', '-o', 'solution'], {
            cwd: workDir,
            env: { PATH: '/usr/bin:/bin' },
        });

        let compileErr = '';
        compileProc.stderr.on('data', d => { compileErr += d.toString(); });

        const compileExit = await new Promise(resolve => {
            const timer = setTimeout(() => {
                compileProc.kill('SIGKILL');
                resolve(-1);
            }, COMPILE_TIMEOUT_MS);

            compileProc.on('close', code => {
                clearTimeout(timer);
                resolve(code);
            });
        });

        if (compileExit !== 0) {
            console.log(JSON.stringify({
                status: 'compilation_failed',
                errors: compileErr.slice(0, 2000) || 'Compilation failed',
                tests: [],
            }));
            return;
        }

        // Run tests
        const results = [];
        const binPath = path.join(workDir, 'solution');

        for (const t of tests || []) {
            const start = process.hrtime.bigint();
            const proc = spawn(binPath, [], { cwd: workDir, env: { PATH: '/usr/bin:/bin' } });

            let stdout = '';
            let stderr = '';
            let timedOut = false;

            const timer = setTimeout(() => {
                timedOut = true;
                proc.kill('SIGKILL');
            }, EXEC_TIMEOUT_MS);

            if (t.input) {
                proc.stdin.write(t.input);
            }
            proc.stdin.end();

            proc.stdout.on('data', d => {
                if (stdout.length < MAX_OUTPUT_BYTES) stdout += d.toString();
            });
            proc.stderr.on('data', d => {
                if (stderr.length < MAX_OUTPUT_BYTES) stderr += d.toString();
            });

            const exitCode = await new Promise(resolve => {
                proc.on('close', code => {
                    clearTimeout(timer);
                    resolve(code);
                });
            });

            const end = process.hrtime.bigint();
            const timeMs = Math.round(Number(end - start) / 1_000_000);

            if (timedOut) {
                results.push({ id: t.id, status: 'time_limit', stdout: '', timeMs: EXEC_TIMEOUT_MS });
            } else if (exitCode !== 0) {
                results.push({ id: t.id, status: 'runtime_error', stdout, stderr, timeMs });
            } else {
                results.push({ id: t.id, status: 'success', stdout, timeMs });
            }
        }

        console.log(JSON.stringify({
            status: 'success',
            tests: results,
        }));
    } finally {
        await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
}

run().catch(err => {
    console.error(JSON.stringify({ error: err.message }));
    process.exit(1);
});
