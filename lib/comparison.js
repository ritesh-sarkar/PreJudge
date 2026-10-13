/**
 * Deterministic Competitive Programming Output Comparator & Presentation Error Engine
 *
 * Checks:
 * 1. Exact Match (Verdict: Passed)
 * 2. Presentation Error (Verdict: Presentation Error)
 *    - All non-whitespace characters are identical, but whitespace/spacing/newlines differ
 *    - Missing trailing newline (\n) at EOF (classic Beecrowd requirement)
 *    - Extra whitespace on lines
 *    - Spacing around operators / tokens (e.g. "X = 19" vs "X=19" or "X =19")
 *    - Single line vs multi-line token layout
 * 3. Case Mismatch (e.g. "sao multiplos" vs "Sao Multiplos")
 * 4. Wrong Answer with exact diff line & character position
 */

export function normalizeLineEndings(rawText) {
    if (rawText === undefined || rawText === null) return '';
    return String(rawText).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function normalizeOutput(rawText) {
    return normalizeLineEndings(rawText);
}

/**
 * Compares actual execution stdout with expected judge output
 * @param {string} actualRaw
 * @param {string} expectedRaw
 * @returns {{ matched: boolean, isPresentationError: boolean, status: string, expected: string, actual: string, diffLine?: number, diffMessage?: string }}
 */
export function compareOutputs(actualRaw, expectedRaw) {
    const actual = normalizeLineEndings(actualRaw);
    const expected = normalizeLineEndings(expectedRaw);

    // 1. Strict exact match
    if (actual === expected) {
        return {
            matched: true,
            isPresentationError: false,
            status: 'passed',
            actual,
            expected,
        };
    }

    // Line-trimmed normalization check
    const normActual = actual.split('\n').map(l => l.trimEnd()).join('\n');
    const normExpected = expected.split('\n').map(l => l.trimEnd()).join('\n');
    if (normActual === normExpected) {
        return {
            matched: true,
            isPresentationError: false,
            status: 'passed',
            actual,
            expected,
        };
    }

    // Standard judge acceptance: if both match when standardizing trailing newline
    const actualWithNewline = actual.endsWith('\n') ? actual : actual + '\n';
    const expectedWithNewline = expected.endsWith('\n') ? expected : expected + '\n';
    
    // Check if missing trailing newline ONLY
    if (expected.endsWith('\n') && !actual.endsWith('\n') && actualWithNewline === expectedWithNewline) {
        return {
            matched: false,
            isPresentationError: true,
            status: 'presentation_error',
            diffMessage: 'Presentation Error: Missing newline (\\n) at the end of output. In Beecrowd, every output line must end with \\n.',
            actual,
            expected,
        };
    }

    // 2. Comprehensive Presentation Error Check
    // If all non-whitespace characters match 100% in order, it is strictly a Presentation Error
    const actualNoSpace = actual.replace(/\s+/g, '');
    const expectedNoSpace = expected.replace(/\s+/g, '');

    if (actualNoSpace !== '' && actualNoSpace === expectedNoSpace) {
        let detail = 'Presentation Error: Output characters and values are correct, but spacing or line breaks differ.';

        if (!actual.endsWith('\n') && expected.endsWith('\n')) {
            detail = 'Presentation Error: Missing newline (\\n) at end of output (Beecrowd requires \\n after every line).';
        } else if (actual.split('\n').some(l => /\s+$/.test(l))) {
            detail = 'Presentation Error: Extra trailing whitespace detected at the end of a line.';
        } else if (actual.includes('\n') !== expected.includes('\n')) {
            detail = 'Presentation Error: Line break mismatch (output printed on single line instead of multiple lines or vice-versa).';
        } else {
            detail = 'Presentation Error: Spacing difference around operators or tokens (e.g. "X = 19" vs "X=19").';
        }

        return {
            matched: false,
            isPresentationError: true,
            status: 'presentation_error',
            diffMessage: detail,
            actual,
            expected,
        };
    }

    // Also check token-by-token sequence match
    const actualTokens = actual.trim().split(/\s+/).filter(Boolean);
    const expectedTokens = expected.trim().split(/\s+/).filter(Boolean);

    if (actualTokens.length > 0 && actualTokens.length === expectedTokens.length) {
        const exactTokensMatch = actualTokens.every((t, i) => t === expectedTokens[i]);

        if (exactTokensMatch) {
            return {
                matched: false,
                isPresentationError: true,
                status: 'presentation_error',
                diffMessage: 'Presentation Error: Output values match, but whitespace formatting or line breaks differ.',
                actual,
                expected,
            };
        }
    }

    // 3. Case Mismatch Check (e.g. "sao multiplos" vs "Sao Multiplos")
    if (actual.toLowerCase().trim() === expected.toLowerCase().trim()) {
        return {
            matched: false,
            isPresentationError: false,
            status: 'wrong_output',
            diffMessage: 'Case Mismatch (Wrong Answer): Capitalization differs from expected output. Beecrowd is strictly case-sensitive.',
            actual,
            expected,
        };
    }

    // 4. Line by line breakdown to locate the exact mismatch line
    const actualLines = actual.split('\n');
    const expectedLines = expected.split('\n');
    const maxLines = Math.max(actualLines.length, expectedLines.length);

    let diffLine = 1;
    for (let i = 0; i < maxLines; i++) {
        if (actualLines[i] !== expectedLines[i]) {
            diffLine = i + 1;
            break;
        }
    }

    return {
        matched: false,
        isPresentationError: false,
        status: 'wrong_output',
        diffLine,
        diffMessage: `Wrong Answer: Output mismatch on line ${diffLine}.`,
        actual,
        expected,
    };
}
