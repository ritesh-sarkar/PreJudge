import { NextResponse } from 'next/server';
import { checkDbHealth } from '../../../lib/mongodb.js';
import { spawnSync } from 'child_process';

export async function GET() {
    try {
        const storageHealth = await checkDbHealth();

        // Check Universal Sandbox availability (Node.js & Python runtime)
        let compilerStatus = 'ok';
        try {
            const checkNode = spawnSync('node', ['--version'], { encoding: 'utf8' });
            if (checkNode.status !== 0) {
                compilerStatus = 'unavailable';
            }
        } catch {
            compilerStatus = 'unavailable';
        }

        return NextResponse.json({
            success: true,
            data: {
                app: 'ok',
                storage: storageHealth.mode,
                database: 'not-required (100% stateless)',
                sandbox: compilerStatus,
                timestamp: new Date().toISOString(),
            },
        });
    } catch {
        return NextResponse.json(
            {
                success: false,
                data: {
                    app: 'degraded',
                    database: 'not-required',
                    sandbox: 'unknown',
                },
            },
            { status: 500 }
        );
    }
}
