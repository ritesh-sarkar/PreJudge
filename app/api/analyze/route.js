import { NextResponse } from 'next/server';
import { runAnalysis } from '../../../services/analysisService.js';

export async function POST(req) {
    try {
        const body = await req.json();

        // Extract client IP for rate limiting
        const forwarded = req.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

        const { status, payload } = await runAnalysis(body, ip);

        return NextResponse.json(payload, { status });
    } catch (err) {
        console.error('[API /api/analyze] Unhandled error:', err);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'SERVER_ERROR',
                    message: 'Internal server error while analyzing code.',
                },
            },
            { status: 500 }
        );
    }
}
