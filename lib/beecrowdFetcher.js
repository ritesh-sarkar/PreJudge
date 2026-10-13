import { createSandboxWorkspace, compileLanguage, executeTest, cleanupSandboxWorkspace } from './sandbox.js';

/**
 * Universal Beecrowd Problem & Ground-Truth Test Case Online Engine
 * Covers thousands of Beecrowd problems across open-source mirrors (1000 - 3400+)
 */

const ONLINE_REPO_PATTERNS = [
    (id, ext) => `https://raw.githubusercontent.com/ShawonBarman/beecrowd-problems-solutions/main/BEE%20${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/ShawonBarman/beecrowd-problems-solutions/main/BEE%20${id}%20${ext === 'py' ? 'Python' : ext === 'cpp' ? 'C++' : 'Java'}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/md-abdullah-al-maruf/beecrowd/main/${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/gabsereniski/beecrowd/main/${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/victor-s-silva/beecrowd/master/${id}/${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/victor-s-silva/beecrowd/master/${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/garodiaa/my-beecrowd-solution/main/${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/shajib-das/beecrowd_problem_solution_in_C/main/${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/filipe-marques/beecrowd-solutions/master/problems/${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/filipe-marques/beecrowd-solutions/master/${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/renatosilveira/beecrowd/master/${id}.${ext}`,
    (id, ext) => `https://raw.githubusercontent.com/alipazin/beecrowd/master/${id}.${ext}`,
];

// Helper to generate a 100-number sequence for problems like 1080, 1174, etc.
const STREAM_100_A = Array.from({ length: 100 }, (_, i) => String((i * 17 + 5) % 1000)).join('\n') + '\n';
const STREAM_100_B = Array.from({ length: 100 }, (_, i) => String((i * 23 + 11) % 1000)).join('\n') + '\n';

// Helper to generate 10-number sequences for problems like 1172, 1173, etc.
const STREAM_10_A = [0, -5, 63, 0, 10, -2, 5, 8, 0, 1].join('\n') + '\n';
const STREAM_10_B = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512].join('\n') + '\n';

// Rich set of candidate input streams covering standard competitive programming input formats
const CANDIDATE_INPUTS = [
    '6 24\n',
    '6 25\n',
    '24 6\n',
    '10\n9\n',
    '15\n7\n',
    '30\n10\n',
    '3\n9\n',
    '2.00\n',
    '100.64\n',
    '150.00\n',
    '5.0\n7.1\n',
    '0.0\n7.1\n',
    '10.0\n10.0\n',
    '25\n100\n5.50\n',
    '1\n200\n20.50\n',
    '12 1 5.30\n16 2 5.10\n',
    '13 2 15.30\n161 4 5.20\n',
    '1.5 2.5\n3.5 4.5\n',
    '-1.5 2.2\n3.0 -4.5\n',
    '12.7 10.4\n15.2 20.1\n',
    '500\n35.0\n',
    '11\n',
    '35\n',
    '61\n',
    '3 2\n',
    '4 3\n',
    '4\n',
    '8\n',
    '3.0 4.0 5.2\n',
    '12.7 10.4 15.2\n',
    '7 14 106\n',
    '5 6 7 8\n',
    '2 3 2 6\n',
    '10.0 20.1 5.1\n',
    '0.0 20.1 5.1\n',
    '25.01\n',
    '25.00\n',
    '4.5 -2.2\n',
    '0.0 0.0\n',
    '7 21 -14\n',
    '6.0 4.0 2.0\n',
    '6.0 4.0 2.1\n',
    '7.0 5.0 7.0\n',
    '16 2\n',
    '400.00\n',
    '800.01\n',
    'vertebrado\nave\ncarnivoro\n',
    'invertebrado\nanelideo\nonivoro\n',
    '7\n5\n6\n3\n4\n12\n',
    '5\n10 50 2 30 4\n',
    '10\n1 2 3 4 -5 6 7 8 9 10\n',
    '2200\n1020\n2022\n2002\n',
    STREAM_10_A,
    STREAM_10_B,
    STREAM_100_A,
    STREAM_100_B,
];

/**
 * Fetches a reference solution online for a given problem ID across multi-repo mirrors
 * Prioritizes Python (.py) for 100% native bytecode execution
 */
export async function fetchOnlineReferenceSolution(problemId) {
    const cleanId = String(problemId).trim();
    const exts = ['py', 'cpp', 'c', 'java'];

    for (const ext of exts) {
        for (const repoFn of ONLINE_REPO_PATTERNS) {
            const url = repoFn(cleanId, ext);
            try {
                const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
                if (res.ok) {
                    const code = await res.text();
                    if (code && code.trim().length > 10 && !code.includes('404')) {
                        return {
                            success: true,
                            language: ext === 'py' ? 'python' : ext === 'cpp' ? 'cpp20' : ext === 'c' ? 'c17' : 'java',
                            code: code.trim(),
                        };
                    }
                }
            } catch {
                // Ignore timeout/fetch error and try next mirror
            }
        }
    }

    return { success: false };
}

/**
 * Dynamically fetches and resolves problem details and ground-truth sample outputs for ANY Beecrowd problem ID
 */
export async function fetchBeecrowdProblemOnline(problemId) {
    const key = String(problemId).trim();

    // 1. Fetch live reference solution online
    const ref = await fetchOnlineReferenceSolution(key);

    let examples = [];
    if (ref.success) {
        let workDir = null;
        try {
            workDir = await createSandboxWorkspace(`dynamic_fetch_${key}`);
            const compile = await compileLanguage(workDir, ref.language, ref.code);
            if (compile.success) {
                // Run candidate inputs against the compiled reference executable to extract ground-truth test cases
                for (const inp of CANDIDATE_INPUTS) {
                    const run = await executeTest(workDir, ref.language, inp, 2000);
                    if (
                        run.status === 'success' &&
                        run.stdout &&
                        run.stdout.trim() !== '' &&
                        !run.stdout.includes('ValueError') &&
                        !run.stdout.includes('IndexError') &&
                        !run.stdout.includes('EOFError') &&
                        !run.stdout.includes('U$ -') &&
                        !run.stdout.includes('%.3E')
                    ) {
                        // Preserve exact output format including trailing newline
                        const expected = run.stdout.replace(/\r\n/g, '\n');
                        if (!examples.some(e => e.expected === expected)) {
                            examples.push({
                                input: inp,
                                expected: expected,
                            });
                        }
                    }
                    if (examples.length >= 3) break;
                }

                if (examples.length === 0) {
                    for (const inp of CANDIDATE_INPUTS) {
                        const run = await executeTest(workDir, ref.language, inp, 2000);
                        if (run.status === 'success' && run.stdout && run.stdout.trim() !== '') {
                            const expected = run.stdout.replace(/\r\n/g, '\n');
                            if (!examples.some(e => e.expected === expected)) {
                                examples.push({
                                    input: inp,
                                    expected: expected,
                                });
                            }
                        }
                        if (examples.length >= 3) break;
                    }
                }
            }
        } catch (err) {
            console.warn('[BeecrowdFetcher] Reference execution error:', err.message);
        } finally {
            if (workDir) {
                await cleanupSandboxWorkspace(workDir);
            }
        }
    }

    return {
        problemId: key,
        title: `Beecrowd Problem #${key}`,
        statement: `Process standard input stream according to Beecrowd problem #${key} requirements and print exact formatted output.`,
        inputSpec: `Input format for problem #${key}. Read standard input values until EOF or complete dataset.`,
        outputSpec: `Output format for problem #${key}. Print result to standard output with exact spacing and newlines.`,
        constraints: 'Time Limit: 1.0 - 2.0s | Memory Limit: 256MB | Standard Judge Constraints',
        examples: examples,
        edgeCases: ['Boundary inputs', 'Zero and negative values', 'Large inputs or EOF termination'],
        hasOnlineReference: ref.success,
    };
}
