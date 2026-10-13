import { getCachedProblem, setCachedProblem } from '../lib/mongodb.js';
import { fetchBeecrowdProblemOnline } from '../lib/beecrowdFetcher.js';
import { resolveProblemWithGemini } from '../lib/gemini.js';
import { BEECROWD_CATALOG } from '../lib/problemCatalog.js';

/**
 * Resolves a problem specification by checking the comprehensive Beecrowd catalog,
 * dynamic online mirrors, and MongoDB cache.
 */
export async function getOrResolveProblem(problemId) {
    const key = String(problemId).trim();

    // 1. Check local high-fidelity Beecrowd Catalog (Instant & 100% Reliable)
    if (BEECROWD_CATALOG[key]) {
        const cat = BEECROWD_CATALOG[key];
        const problemData = {
            problemId: key,
            title: cat.title,
            statement: cat.statement,
            inputSpec: cat.inputSpec,
            outputSpec: cat.outputSpec,
            constraints: cat.constraints,
            examples: cat.examples,
            edgeCases: ['Boundary limits', 'Zero values', 'Negative values', 'Format precision'],
            hasOnlineReference: true,
        };
        setCachedProblem(problemData).catch(() => {});
        return {
            problem: problemData,
            fromCache: false,
        };
    }

    // 2. Try dynamic online fetch from Beecrowd public repositories & ground-truth execution
    try {
        const fetched = await fetchBeecrowdProblemOnline(key);
        if (fetched && fetched.examples && fetched.examples.length > 0 && fetched.hasOnlineReference) {
            setCachedProblem(fetched).catch(() => {});
            return {
                problem: fetched,
                fromCache: false,
            };
        }
    } catch (err) {
        console.warn('[ProblemService] Live online fetch warning:', err.message);
    }

    // 3. Check MongoDB cache for previously fetched problems
    try {
        const cached = await getCachedProblem(key);
        if (cached && cached.statement && Array.isArray(cached.examples) && cached.examples.length > 0) {
            return {
                problem: cached,
                fromCache: true,
            };
        }
    } catch (err) {
        console.warn('[ProblemService] Cache read error:', err.message);
    }

    // 4. Fall back to AI reasoning / dynamic extraction if online network is limited
    const resolved = await resolveProblemWithGemini(key);

    // 5. Save normalized representation to MongoDB cache
    try {
        await setCachedProblem(resolved);
    } catch (err) {
        console.warn('[ProblemService] Cache write error:', err.message);
    }

    return {
        problem: resolved,
        fromCache: false,
    };
}
