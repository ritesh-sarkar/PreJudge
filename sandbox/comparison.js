/**
 * Deterministic Competitive Programming Output Comparator & Presentation Error Engine
 * Used by PreJudge Execution Service on Render
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

    // 3. Line by line mismatch inspection
    const actualLines = actual.split('\n');
    const expectedLines = expected.split('\n');
    const maxLines = Math.max(actualLines.length, expectedLines.length);

    let firstDiffLine = 1;
    let diffMsg = 'Wrong Answer: Output does not match expected output.';

    for (let i = 0; i < maxLines; i++) {
        const aLine = actualLines[i] ?? '<EOF>';
        const eLine = expectedLines[i] ?? '<EOF>';

        if (aLine !== eLine) {
            firstDiffLine = i + 1;
            diffMsg = `Wrong Answer at line ${firstDiffLine}: Expected '${eLine.slice(0, 50)}', received '${aLine.slice(0, 50)}'`;
            break;
        }
    }

    return {
        matched: false,
        isPresentationError: false,
        status: 'wrong_output',
        diffLine: firstDiffLine,
        diffMessage: diffMsg,
        actual,
        expected,
    };
}
