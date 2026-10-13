import crypto from 'crypto';
import { checkAndRecordUsage } from './mongodb.js';

// In-flight request deduplication cache to prevent concurrent identical expensive runs
const inFlightRequests = new Map();

/**
 * Generates deterministic hash of problemId + language + code
 */
export function computeRequestHash(problemId, language, code) {
    return crypto
        .createHash('sha256')
        .update(`${problemId}_${language}_${code.trim()}`)
        .digest('hex');
}

/**
 * Checks if identical request is currently in progress
 */
export function checkDuplicateInProgress(hash) {
    const active = inFlightRequests.get(hash);
    if (active && Date.now() - active < 15000) {
        return true;
    }
    inFlightRequests.set(hash, Date.now());
    return false;
}

/**
 * Clears in-flight request on completion
 */
export function clearDuplicateInProgress(hash) {
    inFlightRequests.delete(hash);
}

/**
 * Rate limit check for incoming requests
 * Allows 20 requests per minute per IP / token
 */
export async function enforceRateLimit(identifier) {
    return await checkAndRecordUsage(identifier, 20, 60000);
}
