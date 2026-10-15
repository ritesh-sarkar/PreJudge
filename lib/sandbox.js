import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { validateAndTranspileToJs } from './transpiler.js';

const COMPILE_TIMEOUT_MS = 10000;
const DEFAULT_EXEC_TIMEOUT_MS = 3000;
const MAX_OUTPUT_BYTES = 128 * 1024; // 128KB

/**
 * Checks if a command exists in PATH
 */
function checkCommandExists(command) {
    return new Promise((resolve) => {
        const proc = spawn('which', [command]);
        proc.on('close', (code) => resolve(code === 0));
        proc.on('error', () => resolve(false));
    });
}

/**
 * Creates an isolated execution context for compiling and testing user code
 */
export async function createSandboxWorkspace(analysisId) {
    const tmpBase = os.tmpdir();
    const workDir = path.join(tmpBase, `prejudge_${analysisId}_${Date.now()}`);
    await fs.mkdir(workDir, { recursive: true, mode: 0o700 });
    return workDir;
}

/**
 * Compiles / validates source code inside workspace based on language
 * @param {string} workDir
 * @param {string} language ('cpp20', 'c17', 'python', 'javascript', 'java')
 * @param {string} sourceCode
 * @returns {Promise<{ success: boolean, compiler: string, errors?: string, exitCode?: number }>}
 */
export async function compileLanguage(workDir, language, sourceCode) {
    const lang = (language || 'cpp20').toLowerCase();

    // 1. Python (Native Python 3 Bytecode Verification)
    if (['python', 'py', 'python3'].includes(lang)) {
        const fileName = 'solution.py';
        const srcPath = path.join(workDir, fileName);
        await fs.writeFile(srcPath, sourceCode, 'utf8');

        return new Promise((resolve) => {
            let stderr = '';
            const proc = spawn('python3', ['-m', 'py_compile', 'solution.py'], {
                cwd: workDir,
                env: { ...process.env, PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin' },
            });

            proc.stderr.on('data', (d) => { stderr += d.toString(); });
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, compiler: 'Python 3 (Bytecode Validated)', exitCode: 0 });
                } else {
                    resolve({ success: false, compiler: 'Python 3', errors: stderr.trim() || `Syntax error`, exitCode: code });
                }
            });
            proc.on('error', (err) => {
                resolve({ success: false, compiler: 'Python 3', errors: err.message, exitCode: -1 });
            });
        });
    }

    // 2. JavaScript (Node.js Syntax Verification)
    if (['javascript', 'js', 'node'].includes(lang)) {
        const fileName = 'solution.js';
        const srcPath = path.join(workDir, fileName);
        await fs.writeFile(srcPath, sourceCode, 'utf8');

        return new Promise((resolve) => {
            let stderr = '';
            const proc = spawn('node', ['--check', 'solution.js'], {
                cwd: workDir,
                env: { ...process.env, PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin' },
            });

            proc.stderr.on('data', (d) => { stderr += d.toString(); });
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, compiler: 'Node.js (Syntax Validated)', exitCode: 0 });
                } else {
                    resolve({ success: false, compiler: 'Node.js', errors: stderr.trim() || `Syntax error`, exitCode: code });
                }
            });
            proc.on('error', (err) => {
                resolve({ success: false, compiler: 'Node.js', errors: err.message, exitCode: -1 });
            });
        });
    }

    // Check if native compilers (g++ / gcc / javac) are available on host
    if (['cpp20', 'cpp', 'c++'].includes(lang) && await checkCommandExists('g++')) {
        const srcPath = path.join(workDir, 'main.cpp');
        await fs.writeFile(srcPath, sourceCode, 'utf8');

        return new Promise((resolve) => {
            let stderr = '';
            const proc = spawn('g++', ['-O2', '-std=c++20', '-DONLINE_JUDGE', 'main.cpp', '-o', 'solution'], {
                cwd: workDir,
                env: { ...process.env, PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin' },
            });

            proc.stderr.on('data', (d) => { stderr += d.toString(); });
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, compiler: 'G++ (C++20 Native)', exitCode: 0 });
                } else {
                    resolve({ success: false, compiler: 'G++ (C++20)', errors: stderr.trim() || 'Compilation failed', exitCode: code });
                }
            });
            proc.on('error', () => {
                resolve(fallbackTranspile(workDir, sourceCode, lang));
            });
        });
    }

    if (['c17', 'c'].includes(lang) && await checkCommandExists('gcc')) {
        const srcPath = path.join(workDir, 'main.c');
        await fs.writeFile(srcPath, sourceCode, 'utf8');

        return new Promise((resolve) => {
            let stderr = '';
            const proc = spawn('gcc', ['-O2', '-std=c17', '-DONLINE_JUDGE', 'main.c', '-o', 'solution'], {
                cwd: workDir,
                env: { ...process.env, PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin' },
            });

            proc.stderr.on('data', (d) => { stderr += d.toString(); });
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, compiler: 'GCC (C17 Native)', exitCode: 0 });
                } else {
                    resolve({ success: false, compiler: 'GCC (C17)', errors: stderr.trim() || 'Compilation failed', exitCode: code });
                }
            });
            proc.on('error', () => {
                resolve(fallbackTranspile(workDir, sourceCode, lang));
            });
        });
    }

    if (['java', 'java17'].includes(lang) && await checkCommandExists('javac')) {
        let className = 'Main';
        const match = sourceCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
        if (match && match[1]) {
            className = match[1];
        }

        const srcPath = path.join(workDir, `${className}.java`);
        await fs.writeFile(srcPath, sourceCode, 'utf8');

        return new Promise((resolve) => {
            let stderr = '';
            const proc = spawn('javac', [`${className}.java`], {
                cwd: workDir,
                env: { ...process.env, PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin' },
            });

            proc.stderr.on('data', (d) => { stderr += d.toString(); });
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, compiler: 'Java 17 (OpenJDK)', exitCode: 0, javaClass: className });
                } else {
                    resolve({ success: false, compiler: 'Java 17', errors: stderr.trim() || 'Compilation failed', exitCode: code });
                }
            });
            proc.on('error', () => {
                resolve(fallbackTranspile(workDir, sourceCode, lang));
            });
        });
    }

    // Fallback: Transpiler & Node Runner (for environments without native C++/Java compilers)
    return fallbackTranspile(workDir, sourceCode, lang);
}

async function fallbackTranspile(workDir, sourceCode, lang) {
    const transpiled = validateAndTranspileToJs(sourceCode, lang);
    if (!transpiled.success) {
        return {
            success: false,
            compiler: lang === 'java' ? 'Java 17 (Syntax Checker)' : lang === 'c17' ? 'GCC (C17)' : 'G++ (C++20)',
            errors: transpiled.error,
            exitCode: 1,
        };
    }

    // Write transpiled runner
    const runnerPath = path.join(workDir, 'runner.js');
    await fs.writeFile(runnerPath, transpiled.jsCode, 'utf8');

    // Also write original source for record
    const origFileName = lang === 'java' ? 'Main.java' : lang === 'c17' ? 'main.c' : 'main.cpp';
    await fs.writeFile(path.join(workDir, origFileName), sourceCode, 'utf8');

    // Syntax check the runner with node --check
    return new Promise((resolve) => {
        let stderr = '';
        const proc = spawn('node', ['--check', 'runner.js'], {
            cwd: workDir,
            env: { ...process.env, PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin' },
        });

        proc.stderr.on('data', (d) => { stderr += d.toString(); });
        proc.on('close', (code) => {
            if (code === 0) {
                const label = lang === 'java' ? 'Java 17 Engine' : lang === 'c17' ? 'GCC (C17 Engine)' : 'G++ (C++20 Engine)';
                resolve({ success: true, compiler: label, exitCode: 0 });
            } else {
                const label = lang === 'java' ? 'Java 17' : lang === 'c17' ? 'GCC (C17)' : 'G++ (C++20)';
                resolve({ success: false, compiler: label, errors: stderr.trim() || 'Compilation syntax error', exitCode: code });
            }
        });
        proc.on('error', (err) => {
            resolve({ success: false, compiler: 'Universal Engine', errors: err.message, exitCode: -1 });
        });
    });
}

export async function compileCpp(workDir, sourceCode) {
    return compileLanguage(workDir, 'cpp20', sourceCode);
}

/**
 * Runs the compiled binary or script against a test input
 */
export async function executeTest(workDir, language, inputData, timeoutMs = DEFAULT_EXEC_TIMEOUT_MS) {
    let lang = 'cpp20';
    let input = inputData;
    let timeout = timeoutMs;

    // Handle overload: executeTest(workDir, inputData, timeoutMs)
    if (typeof inputData === 'number' || inputData === undefined) {
        input = language;
        timeout = typeof inputData === 'number' ? inputData : DEFAULT_EXEC_TIMEOUT_MS;
        lang = 'cpp20';
    } else {
        lang = (language || 'cpp20').toLowerCase();
    }

    let execCmd = 'node';
    let execArgs = ['runner.js'];

    // Check if native binary exists
    let hasBinary = false;
    try {
        await fs.access(path.join(workDir, 'solution'));
        hasBinary = true;
    } catch {
        hasBinary = false;
    }

    if (hasBinary && ['cpp20', 'cpp', 'c++', 'c17', 'c'].includes(lang)) {
        execCmd = path.join(workDir, 'solution');
        execArgs = [];
    } else if (['python', 'py', 'python3'].includes(lang)) {
        execCmd = 'python3';
        execArgs = ['solution.py'];
    } else if (['javascript', 'js', 'node'].includes(lang)) {
        execCmd = 'node';
        execArgs = ['solution.js'];
    } else {
        execCmd = 'node';
        execArgs = ['runner.js'];
    }

    return new Promise((resolve) => {
        const startTime = process.hrtime.bigint();
        let stdout = '';
        let stderr = '';
        let isTimedOut = false;
        let isKilled = false;

        const proc = spawn(execCmd, execArgs, {
            cwd: workDir,
            env: {
                PATH: process.env.PATH || '/usr/local/bin:/usr/bin:/bin',
            },
        });

        const timer = setTimeout(() => {
            isTimedOut = true;
            isKilled = true;
            try {
                proc.kill('SIGKILL');
            } catch {
                // ignore
            }
        }, timeout);

        // Pipe input to process stdin
        try {
            if (input !== undefined && input !== null) {
                proc.stdin.write(input);
            }
            proc.stdin.end();
        } catch {
            // stdin closed
        }

        proc.stdout.on('data', (chunk) => {
            if (stdout.length < MAX_OUTPUT_BYTES) {
                stdout += chunk.toString();
            } else if (!isKilled) {
                isKilled = true;
                try {
                    proc.kill('SIGKILL');
                } catch {
                    // ignore
                }
                stderr += '\n[PreJudge Error: Output limit exceeded (128KB)]';
            }
        });

        proc.stderr.on('data', (chunk) => {
            if (stderr.length < MAX_OUTPUT_BYTES) {
                stderr += chunk.toString();
            }
        });

        proc.on('close', (exitCode, signal) => {
            clearTimeout(timer);
            const endTime = process.hrtime.bigint();
            const timeMs = Math.round(Number(endTime - startTime) / 1_000_000);

            if (isTimedOut) {
                resolve({
                    status: 'time_limit',
                    stdout: stdout.trimEnd(),
                    stderr: `Time Limit Exceeded (execution exceeded limit of ${timeout}ms)`,
                    timeMs: timeout,
                    exitCode: -1,
                });
                return;
            }

            if (signal === 'SIGSEGV' || signal === 'SIGABRT' || signal === 'SIGFPE' || (exitCode !== 0 && exitCode !== null)) {
                resolve({
                    status: 'runtime_error',
                    stdout: stdout.trimEnd(),
                    stderr: stderr.trim() || `Process exited with signal ${signal || exitCode}`,
                    timeMs,
                    exitCode: exitCode || -1,
                });
                return;
            }

            resolve({
                status: 'success',
                stdout: stdout,
                stderr: stderr.trim(),
                timeMs,
                exitCode: 0,
            });
        });

        proc.on('error', (err) => {
            clearTimeout(timer);
            resolve({
                status: 'sandbox_error',
                stdout: '',
                stderr: `Execution error (${execCmd}): ${err.message}`,
                timeMs: 0,
                exitCode: -1,
            });
        });
    });
}

/**
 * Clean up the temporary workspace
 * @param {string} workDir
 */
export async function cleanupSandboxWorkspace(workDir) {
    if (!workDir) return;
    try {
        await fs.rm(workDir, { recursive: true, force: true });
    } catch (err) {
        console.warn('[Sandbox] Cleanup error for', workDir, err.message);
    }
}
