/**
 * Request validation utilities for PreJudge API
 */

export const SUPPORTED_LANGUAGES = [
    'cpp20', 'cpp', 'c++',
    'c17', 'c',
    'python', 'py', 'python3',
    'javascript', 'js', 'node',
    'java', 'java17'
];
export const MAX_CODE_BYTES = 64 * 1024; // 64 KB
export const MIN_CODE_BYTES = 5;

export function normalizeLanguage(lang) {
    if (!lang) return 'cpp20';
    const l = String(lang).trim().toLowerCase();
    if (['cpp20', 'cpp', 'c++'].includes(l)) return 'cpp20';
    if (['c17', 'c'].includes(l)) return 'c17';
    if (['python', 'py', 'python3'].includes(l)) return 'python';
    if (['javascript', 'js', 'node'].includes(l)) return 'javascript';
    if (['java', 'java17'].includes(l)) return 'java';
    return l;
}

export function validateAnalyzeRequest(body) {
    if (!body || typeof body !== 'object') {
        return {
            valid: false,
            code: 'INVALID_PAYLOAD',
            message: 'Request body must be a valid JSON object.',
        };
    }

    const { problemId, language, code } = body;

    // Validate problem ID
    if (!problemId || typeof problemId !== 'string' && typeof problemId !== 'number') {
        return {
            valid: false,
            code: 'INVALID_PROBLEM_ID',
            message: 'Problem ID is required and must be a valid identifier (e.g. 1001).',
        };
    }

    const cleanProblemId = String(problemId).trim();
    if (!cleanProblemId || cleanProblemId.length > 20 || !/^[a-zA-Z0-9_-]+$/.test(cleanProblemId)) {
        return {
            valid: false,
            code: 'INVALID_PROBLEM_ID',
            message: 'Problem ID must be alphanumeric and between 1 and 20 characters.',
        };
    }

    // Validate language
    if (!language || typeof language !== 'string') {
        return {
            valid: false,
            code: 'INVALID_LANGUAGE',
            message: 'Language is required.',
        };
    }

    const rawLang = language.trim().toLowerCase();
    if (!SUPPORTED_LANGUAGES.includes(rawLang)) {
        return {
            valid: false,
            code: 'UNSUPPORTED_LANGUAGE',
            message: `Language '${language}' is not currently supported. Supported languages: C++20, C17, Python 3, JavaScript, Java.`,
        };
    }

    const cleanLang = normalizeLanguage(rawLang);

    // Validate code
    if (!code || typeof code !== 'string') {
        return {
            valid: false,
            code: 'MISSING_CODE',
            message: 'Source code is required.',
        };
    }

    const codeBuffer = Buffer.from(code, 'utf8');
    if (codeBuffer.length < MIN_CODE_BYTES) {
        return {
            valid: false,
            code: 'CODE_TOO_SHORT',
            message: 'Source code is too short to be compiled.',
        };
    }

    if (codeBuffer.length > MAX_CODE_BYTES) {
        return {
            valid: false,
            code: 'CODE_TOO_LARGE',
            message: `Source code exceeds maximum permitted size of ${MAX_CODE_BYTES / 1024} KB.`,
        };
    }

    return {
        valid: true,
        sanitized: {
            problemId: cleanProblemId,
            language: cleanLang,
            code: code.trim(),
        },
    };
}
