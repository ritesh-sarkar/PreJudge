#!/usr/bin/env node
import http from 'http';
import { executeSubmission } from './runner.js';

const PORT = parseInt(process.env.PORT, 10) || 8080;
const HOST = '0.0.0.0';
const AUTH_TOKEN = process.env.EXECUTION_SERVICE_TOKEN;

function sendJson(res, statusCode, data) {
    const payload = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-execution-token',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    res.end(payload);
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-execution-token',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        });
        return res.end();
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    // Health check endpoint
    if (url.pathname === '/health' && req.method === 'GET') {
        return sendJson(res, 200, {
            status: 'ok',
            service: 'prejudge-execution-service',
            version: '1.0.0',
            uptime: Math.floor(process.uptime()),
            timestamp: new Date().toISOString(),
            secured: Boolean(AUTH_TOKEN),
        });
    }

    // Code execution endpoint
    if (url.pathname === '/execute' && req.method === 'POST') {
        if (AUTH_TOKEN) {
            const authHeader = req.headers['authorization'] || '';
            const customToken = req.headers['x-execution-token'] || '';
            const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader.trim();
            if (bearerToken !== AUTH_TOKEN && customToken !== AUTH_TOKEN) {
                return sendJson(res, 401, {
                    success: false,
                    error: 'Unauthorized: Invalid or missing execution service token',
                });
            }
        }

        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 2 * 1024 * 1024) {
                req.destroy();
            }
        });

        req.on('end', async () => {
            try {
                const parsed = JSON.parse(body);
                const result = await executeSubmission(parsed);
                return sendJson(res, 200, { success: true, ...result });
            } catch (err) {
                return sendJson(res, 400, {
                    success: false,
                    error: err.message || 'Invalid execution request payload',
                });
            }
        });
        return;
    }

    return sendJson(res, 404, { success: false, error: 'Endpoint not found' });
});

server.listen(PORT, HOST, () => {
    console.log(`[PreJudge Execution Service] Listening on http://${HOST}:${PORT}`);
});