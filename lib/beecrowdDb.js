/**
 * Dynamic Beecrowd Problem Repository Module
 * No hardcoded problem dictionaries — problem specifications and test cases are fetched
 * and evaluated dynamically online from Beecrowd public repositories.
 */

import { fetchBeecrowdProblemOnline } from './beecrowdFetcher.js';

export { fetchBeecrowdProblemOnline };
