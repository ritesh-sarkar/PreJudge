#!/usr/bin/env node
/**
 * PreJudge Execution Service - HTTP Server for Render
 * Receives authorized compilation and execution requests from the PreJudge Next.js backend on Vercel.
 */

import http from 'http';
import { executeSubmission } from './runner.js';

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = '0.0.0.0';
const AUTH_TOKEN = process.env.EXECUTION_SERVICE_TOKEN || process.env.AUTH_TOKEN || '';
const MAX_PAYLOAD_BYTES = 1024 * 1024; // 1MB payload limit

const SUPPORTED_LANGUAGES = new Set([
    'cpp20', 'cpp', 'c++',
    'c17', 'c',
    'python', 'py', 'python3',
    'javascript', 'js', 'node',
    'java', 'java17'
]);

function sendJson(res, statusCode, data) {
    const payload = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-execution-token',
    });
    res.end(payload);
}

function verifyAuth(req) {
    if (!AUTH_TOKEN) return true; // Token check optional if not configured

    const authHeader = req.headers['authorization'] || '';
    if (authHeader.startsWith('Bearer ') && authHeader.slice(7).trim() === AUTH_TOKEN) {
        return true;
    }

    const tokenHeader = req.headers['x-execution-token'] || '';
    if (tokenHeader.trim() === AUTH_TOKEN) {
        return true;
    }

    return false;
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        let bytesReceived = 0;

        req.on('data', (chunk) => {
            bytesReceived += chunk.length;
            if (bytesReceived > MAX_PAYLOAD_BYTES) {
                reject(new Error('Payload exceeds maximum allowed size (1MB)'));
                req.destroy();
                return;
            }
            body += chunk;
        });

        req.on('end', () => {
            try {
                if (!body.trim()) {
                    return resolve({});
                }
                const parsed = JSON.parse(body);
                resolve(parsed);
            } catch {
                reject(new Error('Invalid JSON request body'));
            }
        });

        req.on('error', (err) => reject(err));
    });
}

const server = http.createServer(async (req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-execution-token',
        });
        return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Health check endpoint
    if (req.method === 'GET' && (pathname === '/health' || pathname === '/')) {
        return sendJson(res, 200, {
            status: 'ok',
            service: 'prejudge-execution-service',
            version: '1.0.0',
            uptime: Math.round(process.uptime()),
            timestamp: new Date().toISOString(),
            secured: Boolean(AUTH_TOKEN),
        });
    }

    // Code Execution Endpoint
    if (req.method === 'POST' && pathname === '/execute') {
        if (!verifyAuth(req)) {
            return sendJson(res, 401, {
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'Missing or invalid authentication token for execution service.',
                },
            });
        }

        let body;
        try {
            body = await parseBody(req);
        } catch (err) {
            return sendJson(res, 400, {
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: err.message,
                },
            });
        }

        const { language, sourceCode, tests, timeoutMs } = body;

        // Validation
        if (!language || typeof language !== 'string') {
            return sendJson(res, 400, {
                success: false,
                error: {
                    code: 'INVALID_LANGUAGE',
                    message: 'Language parameter is required and must be a string.',
                },
            });
        }

        const normLang = language.trim().toLowerCase();
        if (!SUPPORTED_LANGUAGES.has(normLang)) {
            return sendJson(res, 400, {
                success: false,
                error: {
                    code: 'UNSUPPORTED_LANGUAGE',
                    message: `Language '${language}' is not supported. Supported: C++20, C17, Python 3, JavaScript, Java.`,
                },
            });
        }

        if (!sourceCode || typeof sourceCode !== 'string') {
            return sendJson(res, 400, {
                success: false,
                error: {
                    code: 'MISSING_SOURCE_CODE',
                    message: 'sourceCode parameter is required.',
                },
            });
        }

        if (sourceCode.length < 3 || Buffer.byteLength(sourceCode, 'utf8') > 65536) {
            return sendJson(res, 400, {
                success: false,
                error: {
                    code: 'INVALID_SOURCE_SIZE',
                    message: 'sourceCode must be between 3 bytes and 64KB.',
                },
            });
        }

        if (!Array.isArray(tests)) {
            return sendJson(res, 400, {
                success: false,
                error: {
                    code: 'INVALID_TESTS',
                    message: 'tests parameter must be an array of test cases.',
                },
            });
        }

        if (tests.length > 50) {
            return sendJson(res, 400, {
                success: false,
                error: {
                    code: 'TOO_MANY_TESTS',
                    message: 'Maximum allowed test cases per submission is 50.',
                },
            });
        }

        try {
            const executionResult = await executeSubmission({
                language: normLang,
                sourceCode,
                tests,
                timeoutMs,
            });

            return sendJson(res, 200, {
                success: true,
                data: executionResult,
            });
        } catch (err) {
            console.error('[Execution Service Error]:', err);
            return sendJson(res, 500, {
                success: false,
                error: {
                    code: 'EXECUTION_FAILED',
                    message: `Execution service error: ${err.message}`,
                },
            });
        }
    }

    // 404 for any other route
    return sendJson(res, 404, {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${pathname} not found. Available: GET /health, POST /execute.`,
        },
    });
});

server.listen(PORT, HOST, () => {
    console.log(`[PreJudge Execution Service] Listening on http://${HOST}:${PORT}`);
    console.log(`[PreJudge Execution Service] Auth enabled: ${Boolean(AUTH_TOKEN)}`);
});

// Graceful termination handling
process.on('SIGTERM', () => {
    console.log('[PreJudge Execution Service] Received SIGTERM, shutting down...');
    server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
    console.log('[PreJudge Execution Service] Received SIGINT, shutting down...');
    server.close(() => process.exit(0));
});
