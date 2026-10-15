/**
 * Isolated Multi-Language Compiler & Multi-Test Execution Runner
 * Part of PreJudge Execution Service
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { spawn } from 'child_process';
import { compareOutputs } from './comparison.js';

const COMPILE_TIMEOUT_MS = 10000;
const DEFAULT_EXEC_TIMEOUT_MS = 3000;
const MAX_EXEC_TIMEOUT_MS = 8000;
const MAX_OUTPUT_BYTES = 128 * 1024; // 128KB buffer limit

const SANITIZED_ENV = {
    PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
    LANG: 'C.UTF-8',
    LC_ALL: 'C.UTF-8',
    HOME: '/tmp',
};

/**
 * Spawns a child process with timeout, stdin piping, and output limits
 */
function spawnProcess({ command, args, cwd, input, timeoutMs, env = SANITIZED_ENV }) {
    return new Promise((resolve) => {
        const start = process.hrtime.bigint();
        let stdout = '';
        let stderr = '';
        let timedOut = false;
        let outputExceeded = false;
        let proc = null;

        try {
            proc = spawn(command, args, {
                cwd,
                env,
                stdio: ['pipe', 'pipe', 'pipe'],
                detached: false,
            });
        } catch (err) {
            return resolve({
                status: 'sandbox_error',
                stdout: '',
                stderr: `Failed to spawn ${command}: ${err.message}`,
                exitCode: -1,
                timeMs: 0,
            });
        }

        const timer = setTimeout(() => {
            timedOut = true;
            try {
                proc.kill('SIGKILL');
            } catch {
                // ignore
            }
        }, timeoutMs);

        if (input !== undefined && input !== null) {
            try {
                proc.stdin.write(String(input));
                proc.stdin.end();
            } catch {
                // stdin closed
            }
        } else {
            proc.stdin.end();
        }

        proc.stdout.on('data', (chunk) => {
            if (stdout.length < MAX_OUTPUT_BYTES) {
                stdout += chunk.toString();
            } else if (!outputExceeded) {
                outputExceeded = true;
                stderr += '\n[PreJudge Limit: Maximum output buffer 128KB exceeded]';
                try {
                    proc.kill('SIGKILL');
                } catch {
                    // ignore
                }
            }
        });

        proc.stderr.on('data', (chunk) => {
            if (stderr.length < MAX_OUTPUT_BYTES) {
                stderr += chunk.toString();
            }
        });

        proc.on('close', (code, signal) => {
            clearTimeout(timer);
            const end = process.hrtime.bigint();
            const timeMs = Math.round(Number(end - start) / 1_000_000);

            if (timedOut) {
                return resolve({
                    status: 'time_limit',
                    stdout: stdout.trimEnd(),
                    stderr: `Time Limit Exceeded (${timeoutMs}ms)`,
                    exitCode: -1,
                    timeMs: timeoutMs,
                });
            }

            if (signal === 'SIGSEGV' || signal === 'SIGABRT' || signal === 'SIGFPE' || (code !== 0 && code !== null)) {
                return resolve({
                    status: 'runtime_error',
                    stdout: stdout.trimEnd(),
                    stderr: stderr.trim() || `Process terminated with ${signal || `exit code ${code}`}`,
                    exitCode: code || -1,
                    timeMs,
                });
            }

            return resolve({
                status: 'success',
                stdout,
                stderr: stderr.trim(),
                exitCode: 0,
                timeMs,
            });
        });

        proc.on('error', (err) => {
            clearTimeout(timer);
            resolve({
                status: 'sandbox_error',
                stdout: '',
                stderr: `Execution failure: ${err.message}`,
                exitCode: -1,
                timeMs: 0,
            });
        });
    });
}

/**
 * Compiles or syntax-validates the source code
 */
async function compileCode(workDir, language, sourceCode) {
    const lang = (language || 'cpp20').toLowerCase();

    // 1. C++20
    if (['cpp20', 'cpp', 'c++'].includes(lang)) {
        const srcFile = path.join(workDir, 'solution.cpp');
        await fs.writeFile(srcFile, sourceCode, 'utf8');

        const res = await spawnProcess({
            command: 'g++',
            args: ['-O2', '-std=c++20', '-DONLINE_JUDGE', '-fno-asm', '-Wall', 'solution.cpp', '-o', 'solution'],
            cwd: workDir,
            timeoutMs: COMPILE_TIMEOUT_MS,
        });

        if (res.exitCode !== 0) {
            return {
                success: false,
                compiler: 'G++ (C++20)',
                errors: res.stderr || 'Compilation failed',
                exitCode: res.exitCode,
            };
        }
        return { success: true, compiler: 'G++ (C++20)', binary: path.join(workDir, 'solution') };
    }

    // 2. C17
    if (['c17', 'c'].includes(lang)) {
        const srcFile = path.join(workDir, 'solution.c');
        await fs.writeFile(srcFile, sourceCode, 'utf8');

        const res = await spawnProcess({
            command: 'gcc',
            args: ['-O2', '-std=c17', '-DONLINE_JUDGE', '-fno-asm', '-Wall', 'solution.c', '-o', 'solution'],
            cwd: workDir,
            timeoutMs: COMPILE_TIMEOUT_MS,
        });

        if (res.exitCode !== 0) {
            return {
                success: false,
                compiler: 'GCC (C17)',
                errors: res.stderr || 'Compilation failed',
                exitCode: res.exitCode,
            };
        }
        return { success: true, compiler: 'GCC (C17)', binary: path.join(workDir, 'solution') };
    }

    // 3. Python 3
    if (['python', 'py', 'python3'].includes(lang)) {
        const srcFile = path.join(workDir, 'solution.py');
        await fs.writeFile(srcFile, sourceCode, 'utf8');

        const res = await spawnProcess({
            command: 'python3',
            args: ['-m', 'py_compile', 'solution.py'],
            cwd: workDir,
            timeoutMs: COMPILE_TIMEOUT_MS,
        });

        if (res.exitCode !== 0) {
            return {
                success: false,
                compiler: 'Python 3 (Bytecode Validator)',
                errors: res.stderr || 'Python syntax error',
                exitCode: res.exitCode,
            };
        }
        return { success: true, compiler: 'Python 3', script: srcFile };
    }

    // 4. JavaScript / Node.js
    if (['javascript', 'js', 'node'].includes(lang)) {
        const srcFile = path.join(workDir, 'solution.js');
        await fs.writeFile(srcFile, sourceCode, 'utf8');

        const res = await spawnProcess({
            command: 'node',
            args: ['--check', 'solution.js'],
            cwd: workDir,
            timeoutMs: COMPILE_TIMEOUT_MS,
        });

        if (res.exitCode !== 0) {
            return {
                success: false,
                compiler: 'Node.js (Syntax Validator)',
                errors: res.stderr || 'JavaScript syntax error',
                exitCode: res.exitCode,
            };
        }
        return { success: true, compiler: 'Node.js', script: srcFile };
    }

    // 5. Java (OpenJDK)
    if (['java', 'java17'].includes(lang)) {
        // Find public class or default to Main
        let className = 'Main';
        const match = sourceCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
        if (match && match[1]) {
            className = match[1];
        }

        const srcFile = path.join(workDir, `${className}.java`);
        await fs.writeFile(srcFile, sourceCode, 'utf8');

        const res = await spawnProcess({
            command: 'javac',
            args: [`${className}.java`],
            cwd: workDir,
            timeoutMs: COMPILE_TIMEOUT_MS,
        });

        if (res.exitCode !== 0) {
            return {
                success: false,
                compiler: 'Java (javac)',
                errors: res.stderr || 'Java compilation error',
                exitCode: res.exitCode,
            };
        }
        return { success: true, compiler: 'Java 17', javaClass: className };
    }

    return {
        success: false,
        compiler: 'Unknown',
        errors: `Unsupported language: ${language}`,
        exitCode: 1,
    };
}

/**
 * Runs a single test case for the compiled artifact
 */
async function runSingleTest({ workDir, language, compileInfo, testInput, timeoutMs }) {
    const lang = (language || 'cpp20').toLowerCase();

    if (['cpp20', 'cpp', 'c++', 'c17', 'c'].includes(lang)) {
        return spawnProcess({
            command: compileInfo.binary,
            args: [],
            cwd: workDir,
            input: testInput,
            timeoutMs,
        });
    }

    if (['python', 'py', 'python3'].includes(lang)) {
        return spawnProcess({
            command: 'python3',
            args: ['-u', 'solution.py'],
            cwd: workDir,
            input: testInput,
            timeoutMs,
        });
    }

    if (['javascript', 'js', 'node'].includes(lang)) {
        return spawnProcess({
            command: 'node',
            args: ['solution.js'],
            cwd: workDir,
            input: testInput,
            timeoutMs,
        });
    }

    if (['java', 'java17'].includes(lang)) {
        return spawnProcess({
            command: 'java',
            args: ['-Xmx256m', '-Xss64m', compileInfo.javaClass],
            cwd: workDir,
            input: testInput,
            timeoutMs,
        });
    }

    return {
        status: 'sandbox_error',
        stdout: '',
        stderr: `Unsupported language runtime: ${language}`,
        exitCode: -1,
        timeMs: 0,
    };
}

/**
 * Main execution handler invoked by HTTP server
 */
export async function executeSubmission({ language, sourceCode, tests = [], timeoutMs = DEFAULT_EXEC_TIMEOUT_MS }) {
    const executionId = `exec_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const baseDir = process.env.SANDBOX_TMP_DIR || path.join(os.tmpdir(), 'prejudge_sandbox');
    await fs.mkdir(baseDir, { recursive: true });

    const workDir = path.join(baseDir, executionId);
    await fs.mkdir(workDir, { recursive: true, mode: 0o700 });

    const effectiveTimeoutMs = Math.min(Math.max(timeoutMs || DEFAULT_EXEC_TIMEOUT_MS, 500), MAX_EXEC_TIMEOUT_MS);

    try {
        // 1. Compile / validate source
        const compileRes = await compileCode(workDir, language, sourceCode);

        if (!compileRes.success) {
            return {
                status: 'compilation_failed',
                compilation: {
                    status: 'failed',
                    compiler: compileRes.compiler,
                    errors: compileRes.errors,
                    exitCode: compileRes.exitCode,
                },
                execution: {
                    totalTests: tests.length,
                    passed: 0,
                    failed: 0,
                    totalTimeMs: 0,
                    slowestTimeMs: 0,
                },
                tests: [],
            };
        }

        // 2. Execute test cases sequentially
        const testResults = [];
        let passedCount = 0;
        let failedCount = 0;
        let totalTimeMs = 0;
        let slowestTimeMs = 0;
        let overallStatus = 'all_tests_passed';

        for (const test of tests) {
            const run = await runSingleTest({
                workDir,
                language,
                compileInfo: compileRes,
                testInput: test.input,
                timeoutMs: effectiveTimeoutMs,
            });

            totalTimeMs += run.timeMs;
            if (run.timeMs > slowestTimeMs) {
                slowestTimeMs = run.timeMs;
            }

            // Timeout
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

            // Runtime Crash or Error
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

            // Self-consistency check (when no expected output is provided)
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
                compiler: compileRes.compiler,
            },
            execution: {
                totalTests: tests.length,
                passed: passedCount,
                failed: failedCount,
                totalTimeMs,
                slowestTimeMs,
            },
            tests: testResults,
        };
    } finally {
        // Strict cleanup of per-submission temporary workspace
        await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
}
