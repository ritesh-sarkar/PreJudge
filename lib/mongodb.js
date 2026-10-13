/**
 * In-Memory Stateless Store for PreJudge
 *
 * No external database required.
 * - Zero persistence to external databases
 * - In-memory problem cache to prevent redundant Gemini API calls
 * - In-memory rate limiting and request tracking
 */

const memoryStore = {
    problems: new Map(),
    usage: new Map(),
};

/**
 * Returns database status (always stateless in-memory)
 */
export async function getDatabase() {
    return null;
}

/**
 * Retrieve cached normalized problem specification from memory
 */
export async function getCachedProblem(problemId) {
    const key = String(problemId).trim();
    return memoryStore.problems.get(key) || null;
}

/**
 * Cache normalized problem specification in memory
 */
export async function setCachedProblem(problemData) {
    const key = String(problemData.problemId).trim();
    const doc = {
        ...problemData,
        problemId: key,
        updatedAt: new Date(),
    };
    memoryStore.problems.set(key, doc);
    return doc;
}

/**
 * Save analysis record - No-op since user requested no DB saving
 */
export async function saveAnalysisRecord(record) {
    // Intentionally stateless - nothing saved to any DB
    return record;
}

/**
 * In-memory rate limit check for anonymous identifier
 */
export async function checkAndRecordUsage(identifier, maxRequests = 30, windowMs = 60000) {
    const now = Date.now();
    const key = String(identifier || 'anonymous');

    const mem = memoryStore.usage.get(key);
    if (!mem || (now - mem.firstRequestAt > windowMs)) {
        memoryStore.usage.set(key, { count: 1, firstRequestAt: now });
        return { allowed: true, remaining: maxRequests - 1 };
    }

    if (mem.count >= maxRequests) {
        return { allowed: false, remaining: 0 };
    }

    mem.count += 1;
    return { allowed: true, remaining: maxRequests - mem.count };
}

/**
 * Health check for storage
 */
export async function checkDbHealth() {
    return {
        connected: true,
        mode: 'stateless-in-memory',
        message: 'Running fully stateless (no DB storage)',
    };
}
