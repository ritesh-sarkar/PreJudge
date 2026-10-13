import { NextResponse } from 'next/server';
import { getOrResolveProblem } from '../../../services/problemService.js';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const problemId = searchParams.get('id') || '1001';

        const cleanId = String(problemId).trim();
        if (!cleanId || cleanId.length > 20) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'INVALID_PROBLEM_ID',
                        message: 'Problem ID must be between 1 and 20 characters.',
                    },
                },
                { status: 400 }
            );
        }

        const { problem, fromCache } = await getOrResolveProblem(cleanId);

        return NextResponse.json({
            success: true,
            data: {
                problem,
                fromCache,
            },
        });
    } catch (err) {
        console.error('[API /api/problems] Error:', err);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'PROBLEM_FETCH_ERROR',
                    message: 'Could not resolve problem information.',
                },
            },
            { status: 500 }
        );
    }
}
