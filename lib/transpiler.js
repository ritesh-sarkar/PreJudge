/**
 * Universal Competitive Programming Transpiler & Runner
 * Zero-dependency C++20, C17, Java, and Python execution engine via Node.js
 * Comprehensive support for STL containers, algorithms, C/C++ libs, Java standard library, and Python
 */

export function validateAndTranspileToJs(sourceCode, language) {
    const lang = (language || 'cpp20').toLowerCase();

    // =========================================================================
    // 0. Python Special Handling (Native Python execution / validation)
    // =========================================================================
    if (lang === 'python' || lang === 'py' || lang === 'python3') {
        // Strip Python comments and string literals for bracket/brace balance check
        const sanitizedPy = sourceCode
            .replace(/"""[\s\S]*?"""/g, '""')
            .replace(/'''[\s\S]*?'''/g, "''")
            .replace(/#.*/g, '')
            .replace(/"(?:\\.|[^"\\])*"/g, '""')
            .replace(/'(?:\\.|[^'\\])*'/g, "''");

        const openParens = (sanitizedPy.match(/\(/g) || []).length;
        const closeParens = (sanitizedPy.match(/\)/g) || []).length;
        if (openParens !== closeParens) {
            return {
                success: false,
                error: `Syntax Error: Unmatched parentheses ( ) in Python source code (found ${openParens} '(' and ${closeParens} ')').`,
            };
        }
        const openBrackets = (sanitizedPy.match(/\[/g) || []).length;
        const closeBrackets = (sanitizedPy.match(/\]/g) || []).length;
        if (openBrackets !== closeBrackets) {
            return {
                success: false,
                error: `Syntax Error: Unmatched brackets [ ] in Python source code (found ${openBrackets} '[' and ${closeBrackets} ']').`,
            };
        }
        const openBraces = (sanitizedPy.match(/\{/g) || []).length;
        const closeBraces = (sanitizedPy.match(/\}/g) || []).length;
        if (openBraces !== closeBraces) {
            return {
                success: false,
                error: `Syntax Error: Unmatched curly braces { } in Python source code (found ${openBraces} '{' and ${closeBraces} '}').`,
            };
        }

        const runnerJs = `
const fs = require('fs');
const { spawnSync } = require('child_process');

const __rawInput = fs.readFileSync(0, 'utf8');
const __pyScript = ${JSON.stringify(sourceCode)};

const __res = spawnSync('python3', ['-c', __pyScript], {
    input: __rawInput,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
});

if (__res.error) {
    process.stderr.write(String(__res.error.message || 'Python execution error') + '\\n');
    process.exit(1);
}
if (__res.stderr && __res.status !== 0) {
    process.stderr.write(__res.stderr);
    process.exit(__res.status || 1);
}
if (__res.stdout) {
    process.stdout.write(__res.stdout);
}
process.exit(__res.status || 0);
`;
        return {
            success: true,
            jsCode: runnerJs,
        };
    }

    // =========================================================================
    // 1. Basic syntax sanity validation for C/C++/Java
    // =========================================================================
    function stripStringsAndComments(code) {
        return code
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/.*/g, '')
            .replace(/"(?:\\.|[^"\\])*"/g, '""')
            .replace(/'(?:\\.|[^'\\])*'/g, "''");
    }

    const sanitizedCode = stripStringsAndComments(sourceCode);
    const openBraces = (sanitizedCode.match(/\{/g) || []).length;
    const closeBraces = (sanitizedCode.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
        return {
            success: false,
            error: `Syntax Error: Unmatched curly braces { } in source code (found ${openBraces} '{' and ${closeBraces} '}').`,
        };
    }

    const openParens = (sanitizedCode.match(/\(/g) || []).length;
    const closeParens = (sanitizedCode.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
        return {
            success: false,
            error: `Syntax Error: Unmatched parentheses ( ) in source code (found ${openParens} '(' and ${closeParens} ')').`,
        };
    }

    // Main entry point check
    if (!/main\s*\(|public\s+class\s+Main/i.test(sourceCode)) {
        return {
            success: false,
            error: `Syntax Error: Entry point 'main()' is missing. Competitive programming solutions must define 'int main()' or 'public static void main'.`,
        };
    }

    // Check for raw undeclared standalone statements like "invalid_syntax_here;"
    const bareIdentMatch = sanitizedCode.match(/[{;]\s*([a-zA-Z_]\w*)\s*;/);
    if (bareIdentMatch) {
        const ident = bareIdentMatch[1];
        const knownKeywords = new Set([
            'return', 'break', 'continue', 'pass', 'default', 'flush', 'endl', 'cin', 'cout', 'ws', 'true', 'false'
        ]);
        if (!knownKeywords.has(ident)) {
            const declRegex = new RegExp('\\b(?:int|long|float|double|char|bool|string|auto|void|class|struct)\\s+[^{;]*\\b' + ident + '\\b');
            if (!declRegex.test(sanitizedCode)) {
                return {
                    success: false,
                    error: `Compilation Error: '${ident}' was not declared in this scope.`,
                };
            }
        }
    }

    // Identify variables declared as string or char to preserve string reading in cin
    const stringVars = new Set();
    const stringDecls = sourceCode.matchAll(/\b(?:string|String|char)\b\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)/g);
    for (const match of stringDecls) {
        const names = match[1].split(',').map(n => n.trim().split(/\[/)[0].trim()).filter(Boolean);
        names.forEach(n => stringVars.add(n));
    }

    // Identify variables declared as float or double to preserve float formatting in cout
    const floatVars = new Set();
    const floatDecls = sourceCode.matchAll(/\b(?:float|double|long\s+double)\b\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)/g);
    for (const match of floatDecls) {
        const names = match[1].split(',').map(n => n.trim().split(/\[/)[0].trim()).filter(Boolean);
        names.forEach(n => floatVars.add(n));
    }

    function isFloatExpr(expr) {
        const trimmed = expr.trim();
        if (trimmed.startsWith('Math.trunc(') || trimmed.startsWith('parseInt(')) return false;
        if (floatVars.has(trimmed)) return true;
        for (const fv of floatVars) {
            if (new RegExp('\\b' + fv + '\\b').test(trimmed)) return true;
        }
        if (/\d+\.\d*/.test(trimmed) || /\.\d+/.test(trimmed)) return true;
        if (/\b(?:double|float|long\s+double)\b/.test(trimmed)) return true;
        if (/sqrt|pow|sin|cos|tan|asin|acos|atan|atan2|sinh|cosh|tanh|hypot|cbrt|exp|log|floor|ceil|round/.test(trimmed)) return true;
        return false;
    }

    function makeCinAssignment(v) {
        const cleanV = v.trim().split(/\[/)[0].trim();
        if (stringVars.has(cleanV)) {
            return `${v} = __nextTokenStr()`;
        }
        return `${v} = __nextToken()`;
    }

    // =========================================================================
    // 2. Clean headers, namespaces, fast-io, std prefix
    // =========================================================================
    let body = sourceCode
        .replace(/#include\s*<[^>]+>/g, '')
        .replace(/#include\s*"[^"]+"/g, '')
        .replace(/using\s+namespace\s+std\s*;/g, '')
        .replace(/ios_base::sync_with_stdio\([^)]*\)\s*;/g, '')
        .replace(/cin\.tie\([^)]*\)\s*;/g, '')
        .replace(/import\s+java\.[^;]+;/g, '')
        .replace(/\bstd::/g, '');

    // Escape unescaped literal newlines inside string literals
    body = body.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (m) => {
        return m.replace(/\r?\n/g, '\\n');
    });

    // Unpack Java class Main { ... }
    if (lang === 'java' || body.includes('class Main') || body.includes('public class')) {
        body = body.replace(/public\s+class\s+\w+\s*\{([\s\S]*)\}\s*$/g, '$1');
        body = body.replace(/class\s+\w+\s*\{([\s\S]*)\}\s*$/g, '$1');
    }

    body = body
        .replace(/public\s+static\s+void\s+main\s*\([^)]*\)\s*\{/g, 'function main() {')
        .replace(/\b(int|void)\s+main\s*\([^)]*\)\s*\{/g, 'function main() {');

    // Java Scanner & System.out conversions
    body = body
        .replace(/Scanner\s+\w+\s*=\s*new\s+Scanner\([^)]+\)\s*;/g, '')
        .replace(/\w+\.hasNextInt\(\)/g, '(__tokenIdx < __tokens.length)')
        .replace(/\w+\.hasNextDouble\(\)/g, '(__tokenIdx < __tokens.length)')
        .replace(/\w+\.hasNextLong\(\)/g, '(__tokenIdx < __tokens.length)')
        .replace(/\w+\.hasNext\(\)/g, '(__tokenIdx < __tokens.length)')
        .replace(/\w+\.hasNextLine\(\)/g, '(__lineIdx < __lines.length)')
        .replace(/\w+\.nextInt\(\)/g, '__nextTokenInt()')
        .replace(/\w+\.nextLong\(\)/g, '__nextTokenInt()')
        .replace(/\w+\.nextDouble\(\)/g, '__nextTokenDouble()')
        .replace(/\w+\.nextFloat\(\)/g, '__nextTokenDouble()')
        .replace(/\w+\.nextLine\(\)/g, '__nextTokenLine()')
        .replace(/\w+\.next\(\)/g, '__nextTokenStr()')
        .replace(/\w+\.close\(\)\s*;/g, '')
        .replace(/System\.out\.println\s*\(([^;]*)\)\s*;/g, 'process.stdout.write(String($1) + "\\n");')
        .replace(/System\.out\.printf\s*\(([^;]*)\)\s*;/g, 'printf($1);')
        .replace(/System\.out\.format\s*\(([^;]*)\)\s*;/g, 'printf($1);')
        .replace(/System\.out\.print\s*\(([^;]*)\)\s*;/g, 'process.stdout.write(String($1));')
        .replace(/System\.err\.println\s*\(([^;]*)\)\s*;/g, 'process.stderr.write(String($1) + "\\n");');

    // Java ArrayList, BigInteger, BigDecimal, StringBuilder, StringTokenizer
    body = body.replace(/(?:List|ArrayList)<[^>]*>\s+([a-zA-Z_]\w*)\s*=\s*new\s+ArrayList<[^>]*>\(\)\s*;/g, 'let $1 = [];');
    body = body.replace(/StringBuilder\s+([a-zA-Z_]\w*)\s*=\s*new\s+StringBuilder\(([^)]*)\)\s*;/g, 'let $1 = new StringBuilder($2);');
    body = body.replace(/StringBuffer\s+([a-zA-Z_]\w*)\s*=\s*new\s+StringBuffer\(([^)]*)\)\s*;/g, 'let $1 = new StringBuilder($2);');
    body = body.replace(/StringTokenizer\s+([a-zA-Z_]\w*)\s*=\s*new\s+StringTokenizer\(([^)]*)\)\s*;/g, 'let $1 = new StringTokenizer($2);');

    body = body.replace(/\bBigInteger\s+([a-zA-Z_]\w*)\s*=\s*new\s+BigInteger\(([^)]*)\)\s*;/g, 'let $1 = new BigInteger($2);');
    body = body.replace(/\bBigInteger\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/g, 'let $1 = BigInteger.valueOf($2);');
    body = body.replace(/\bBigDecimal\s+([a-zA-Z_]\w*)\s*=\s*new\s+BigDecimal\(([^)]*)\)\s*;/g, 'let $1 = new BigDecimal($2);');
    body = body.replace(/\bBigDecimal\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/g, 'let $1 = BigDecimal.valueOf($2);');

    // Array initializers with values: int[] arr = { 1, 2, 3 }; or int arr[] = { 1, 2, 3 };
    body = body.replace(/\b(?:(?:unsigned|signed|const|static)\s+)?(?:long\s+long|long\s+double|short\s+int|long\s+int|int64_t|uint64_t|int32_t|uint32_t|size_t|int|long|short|float|double|char|bool|boolean|string|String)\s*(?:\[\s*\])?\s+([a-zA-Z_]\w*)(?:\[\s*\d*\s*\])?\s*=\s*(?:new\s+\w+\s*\[\s*\]\s*)?\{([^}]+)\}\s*;/g,
        'let $1 = [$2];'
    );
    body = body.replace(/\b(?:(?:unsigned|signed|const|static)\s+)?(?:long\s+long|long\s+double|short\s+int|long\s+int|int64_t|uint64_t|int32_t|uint32_t|size_t|int|long|short|float|double|char|bool|boolean|string|String)\s*\[\s*\]\s*([a-zA-Z_]\w*)\s*=\s*new\s+\w+\s*\[\s*([^\]]+)\s*\]\s*;/g,
        'let $1 = new Array($2).fill(0);'
    );

    // C++ STL vector declarations
    body = body.replace(/vector\s*<\s*vector\s*<[^>]+>\s*>\s+([a-zA-Z_]\w*)\s*\(\s*([^,]+)\s*,\s*vector\s*<[^>]+>\s*\(\s*([^,]+)\s*(?:,\s*([^)]+))?\s*\)\s*\)\s*;/g,
        (m, name, r, c, val) => `let ${name} = Array.from({ length: ${r} }, () => new Array(${c}).fill(${val !== undefined ? val : 0}));`
    );
    body = body.replace(/vector\s*<\s*vector\s*<[^>]+>\s*>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => {
            const names = vars.split(',').map(v => v.trim()).filter(Boolean);
            const decls = names.map(n => `${n} = []`).join(', ');
            return `let ${decls};`;
        }
    );
    body = body.replace(/vector\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*\(\s*([^,;)]+)\s*(?:,\s*([^)]+))?\s*\)\s*;/g,
        (m, name, size, val) => `let ${name} = new Array(${size}).fill(${val !== undefined ? val : 0});`
    );
    body = body.replace(/vector\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*=\s*\{([^}]+)\}\s*;/g,
        (m, name, elems) => `let ${name} = [${elems}];`
    );
    body = body.replace(/vector\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => {
            const names = vars.split(',').map(v => v.trim()).filter(Boolean);
            const decls = names.map(n => `${n} = []`).join(', ');
            return `let ${decls};`;
        }
    );

    // STL containers (NOTE: priority_queue MUST come before queue)
    body = body.replace(/\bpriority_queue\s*<[^>]+(?:,\s*vector<[^>]+>,\s*greater<[^>]+>)\s*>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppPriorityQueue(true)`).join(', ')};`
    );
    body = body.replace(/\bpriority_queue\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppPriorityQueue(false)`).join(', ')};`
    );
    body = body.replace(/\bstack\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppStack()`).join(', ')};`
    );
    body = body.replace(/\bqueue\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppQueue()`).join(', ')};`
    );
    body = body.replace(/\bdeque\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppDeque()`).join(', ')};`
    );
    body = body.replace(/\blist\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppList()`).join(', ')};`
    );
    body = body.replace(/\b(?:unordered_)?set\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppSet()`).join(', ')};`
    );
    body = body.replace(/\b(?:unordered_)?multiset\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppMultiSet()`).join(', ')};`
    );
    body = body.replace(/\b(?:unordered_)?map\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppMap()`).join(', ')};`
    );
    body = body.replace(/\b(?:unordered_)?multimap\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = new CppMultiMap()`).join(', ')};`
    );
    body = body.replace(/\bbitset\s*<\s*\d+\s*>\s+([a-zA-Z_]\w*)\s*(?:\(([^)]*)\))?\s*;/g,
        (m, name, arg) => `let ${name} = new bitset(${arg || '0'});`
    );
    body = body.replace(/\bpair\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/g,
        (m, name, val) => `let ${name} = ${val};`
    );
    body = body.replace(/\bpair\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*\(([^,]+),\s*([^)]+)\)\s*;/g,
        (m, name, first, second) => `let ${name} = { first: ${first}, second: ${second} };`
    );
    body = body.replace(/\bpair\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = { first: 0, second: 0 }`).join(', ')};`
    );
    body = body.replace(/\btuple\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/g,
        (m, name, val) => `let ${name} = ${val};`
    );
    body = body.replace(/\btuple\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*\(([^)]+)\)\s*;/g,
        (m, name, args) => `let ${name} = [${args}];`
    );
    body = body.replace(/\btuple\s*<[^>]+>\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g,
        (m, vars) => `let ${vars.split(',').map(v => `${v.trim()} = []`).join(', ')};`
    );
    body = body.replace(/\bget\s*<\s*(\d+)\s*>\s*\(([^)]+)\)/g, '$2[$1]');
    body = body.replace(/\btie\s*\(([^)]+)\)\s*=\s*([^;]+);/g, '[$1] = $2;');
    body = body.replace(/\b(?:stringstream|istringstream|ostringstream)\s+([a-zA-Z_]\w*)\s*(?:\(([^)]+)\))?\s*;/g,
        (m, name, arg) => `let ${name} = new CppStringStream(${arg || '""'});`
    );

    // STL container methods
    body = body.replace(/\.push_back\s*\(/g, '.push(');
    body = body.replace(/\.emplace_back\s*\(/g, '.push(');
    body = body.replace(/\.pop_back\s*\(\s*\)/g, '.pop()');
    body = body.replace(/\.push_front\s*\(/g, '.unshift(');
    body = body.replace(/\.pop_front\s*\(\s*\)/g, '.shift()');

    // STL algorithms (sort, reverse, swap, accumulate, count, find, min_element, max_element, etc.)
    body = body.replace(/sort\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*greater<[^>]*>\(\)\s*\)/g, '$1.sort((a, b) => b - a)');
    body = body.replace(/sort\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*\)/g, '$1.sort((a, b) => a - b)');
    body = body.replace(/reverse\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*\)/g, '$1.reverse()');
    body = body.replace(/sort\s*\(\s*([a-zA-Z_]\w*)\s*,\s*\1\s*\+\s*([^)]+)\s*\)/g, '$1.sort((a, b) => a - b)');
    body = body.replace(/reverse\s*\(\s*([a-zA-Z_]\w*)\s*,\s*\1\s*\+\s*([^)]+)\s*\)/g, '$1.reverse()');

    // In-place swap destructuring
    body = body.replace(/\bswap\s*\(\s*([^,;]+)\s*,\s*([^);]+)\s*\)/g, (m, a, b) => `([${a.trim()}, ${b.trim()}] = [${b.trim()}, ${a.trim()}])`);

    // Standard algorithms with iterator pairs (.begin(), .end())
    body = body.replace(/\baccumulate\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*([^)]+)\)/g, 'accumulate($1, null, $2)');
    body = body.replace(/\bcount\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*([^)]+)\)/g, 'count($1, null, $2)');
    body = body.replace(/\bcount_if\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*([^)]+)\)/g, 'count_if($1, null, $2)');
    body = body.replace(/\bfind\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*([^)]+)\)/g, 'find($1, null, $2)');
    body = body.replace(/\bbinary_search\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*([^)]+)\)/g, 'binary_search($1, null, $2)');
    body = body.replace(/\blower_bound\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*([^)]+)\)/g, 'lower_bound($1, null, $2)');
    body = body.replace(/\bupper_bound\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*([^)]+)\)/g, 'upper_bound($1, null, $2)');
    body = body.replace(/\bmax_element\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*\)/g, 'max_element($1)');
    body = body.replace(/\bmin_element\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*\)/g, 'min_element($1)');
    body = body.replace(/\bfill\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*([^)]+)\)/g, '$1.fill($2)');
    body = body.replace(/\biota\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*,\s*([^)]+)\)/g, 'iota($1, null, $2)');
    body = body.replace(/\bnext_permutation\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*\)/g, 'next_permutation($1)');
    body = body.replace(/\bprev_permutation\s*\(\s*([a-zA-Z_]\w*)\.begin\(\)\s*,\s*\1\.end\(\)\s*\)/g, 'prev_permutation($1)');

    // String conversions
    body = body.replace(/\bto_string\s*\(([^)]+)\)/g, 'String($1)');
    body = body.replace(/\bstoi\s*\(([^)]+)\)/g, '(parseInt($1, 10) || 0)');
    body = body.replace(/\bstod\s*\(([^)]+)\)/g, '(parseFloat($1) || 0)');
    body = body.replace(/\bstoll\s*\(([^)]+)\)/g, '(parseInt($1, 10) || 0)');

    // Replace raw array declarations like int x[10], i; or double arr[100];
    body = body.replace(/\b(?:(?:unsigned|signed|const|static)\s+)?(?:long\s+long|long\s+double|short\s+int|int|long|short|float|double|char|bool)\s+([a-zA-Z_]\w*)\[\s*(\d+)\s*\]\s*(?:,\s*([a-zA-Z_]\w*))*\s*;/g, (m, arrName, size, otherVar) => {
        let res = `let ${arrName} = new Array(${size}).fill(0);`;
        if (otherVar) res += ` let ${otherVar};`;
        return res;
    });

    // getline(cin, str) handling (within conditions and standalone)
    body = body.replace(/if\s*\(\s*getline\s*\(\s*cin\s*,\s*([^)]+)\)\s*\)/g, 'if (($1 = __nextTokenLine(), $1 !== ""))');
    body = body.replace(/while\s*\(\s*getline\s*\(\s*cin\s*,\s*([^)]+)\)\s*\)/g, 'while (__lineIdx < __lines.length && (($1 = __nextTokenLine()), true))');
    body = body.replace(/getline\s*\(\s*cin\s*,\s*([a-zA-Z_]\w*)\)\s*;?/g, '$1 = __nextTokenLine();');

    // cin stream control methods
    body = body.replace(/cin\.ignore\([^)]*\)\s*;?/g, '(__tokenIdx++, __lineIdx++);');
    body = body.replace(/cin\.get\(\)/g, '__nextTokenChar()');

    // C-style type casts (char, int, long long, long, short, double, float)
    body = body.replace(/\(\s*char\s*\)\s*\(([^)]+)\)/g, 'String.fromCharCode($1)');
    body = body.replace(/\(\s*char\s*\)\s*([a-zA-Z_]\w*(?:\([^)]*\)|\[[^\]]*\])?)/g, 'String.fromCharCode($1)');

    body = body.replace(/\(\s*(?:int|long\s+long|long|short)\s*\)\s*\(([^)]+)\)/g, 'Math.trunc($1)');
    body = body.replace(/\(\s*(?:int|long\s+long|long|short)\s*\)\s*([a-zA-Z_]\w*(?:\([^)]*\)|\[[^\]]*\])?)/g, 'Math.trunc($1)');

    body = body.replace(/\(\s*(?:double|float|long\s+double)\s*\)\s*\(([^)]+)\)/g, 'Number($1)');
    body = body.replace(/\(\s*(?:double|float|long\s+double)\s*\)\s*([a-zA-Z_]\w*(?:\([^)]*\)|\[[^\]]*\])?)/g, 'Number($1)');

    // Unified C++ cin stream replacement (handles standalone, while, if, chained, parenthesized, inside conditions)
    const cinExtractRegex = /\bcin\s*>>\s*([a-zA-Z_]\w*(?:\[[^\]]+\])*(?:\.[a-zA-Z_]\w*)*(?:\s*>>\s*[a-zA-Z_]\w*(?:\[[^\]]+\])*(?:\.[a-zA-Z_]\w*)*)*)/g;
    body = body.replace(cinExtractRegex, (match, vars) => {
        const list = vars.split('>>').map(v => v.trim()).filter(Boolean);
        const assignments = list.map(v => makeCinAssignment(v)).join(', ');
        return `(__tokenIdx < __tokens.length && (${assignments}, true))`;
    });

    // C scanf replacements with arbitrary variable count
    body = body.replace(/while\s*\(\s*scanf\s*\([^,]+,\s*([^)\n{}]+)\)\s*(?:!=\s*EOF|==\s*\d+)\s*\)/g, (match, ptrs) => {
        const list = ptrs.split(',').map(p => p.trim().replace(/^&/, '')).filter(Boolean);
        const assignments = list.map(v => `${v} = __nextTokenInt()`).join(', ');
        return `while (__tokenIdx < __tokens.length && (${assignments}, true))`;
    });
    body = body.replace(/if\s*\(\s*scanf\s*\([^,]+,\s*([^)\n{}]+)\)\s*(?:!=\s*EOF|==\s*\d+)\s*\)/g, (match, ptrs) => {
        const list = ptrs.split(',').map(p => p.trim().replace(/^&/, '')).filter(Boolean);
        const assignments = list.map(v => `${v} = __nextTokenInt()`).join(', ');
        return `if (__tokenIdx < __tokens.length && (${assignments}, true))`;
    });
    body = body.replace(/scanf\s*\(\s*"[^"]*"\s*,\s*([^;\n{}]+)\)\s*;?/g, (match, ptrs) => {
        const list = ptrs.split(',').map(p => p.trim().replace(/^&/, '')).filter(Boolean);
        const assignments = list.map(v => `${v} = __nextToken()`).join(', ');
        return `(${assignments}, true);`;
    });

    // C++ max({A, B, C}) / min({A, B, C}) initializer list conversion FIRST before cout stream
    body = body.replace(/\bmax\s*\(\s*\{([^}]+)\}\s*\)/g, 'max($1)');
    body = body.replace(/\bmin\s*\(\s*\{([^}]+)\}\s*\)/g, 'min($1)');

    // C++ cout stream chained expression transpilation with quote awareness
    body = body.replace(/cout\s*<<\s*((?:(?!"[^"]*")[^;]|"[^"]*")+);/g, (match, expr) => {
        const parts = [];
        let cur = '';
        let inQuotes = false;
        for (let i = 0; i < expr.length; i++) {
            const ch = expr[i];
            if (ch === '"' && (i === 0 || expr[i - 1] !== '\\')) inQuotes = !inQuotes;
            if (!inQuotes && ch === '<' && expr[i + 1] === '<') {
                parts.push(cur.trim());
                cur = '';
                i++;
            } else {
                cur += ch;
            }
        }
        if (cur.trim()) parts.push(cur.trim());

        const jsParts = parts.filter(Boolean).map(p => {
            if (p === 'endl') return '"\\n"';
            const isFl = isFloatExpr(p);
            let valExpr = p;
            if (!isFl && p.includes('/') && !p.startsWith('"') && !p.startsWith("'")) {
                valExpr = `Math.trunc(${p})`;
            }
            return `__formatVal(${valExpr}, ${isFl})`;
        });
        return `process.stdout.write(${jsParts.join(' + ')});`;
    });

    // string declaration with default empty string: string s;
    body = body.replace(/\b(?:string|String)\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)\s*;/g, (m, vars) => {
        const names = vars.split(',').map(n => n.trim()).filter(Boolean);
        return `let ${names.map(n => `${n} = ""` ).join(', ')};`;
    });

    // Integer variable declarations with initializers containing division
    body = body.replace(/\b(?:(?:unsigned|signed|const|static)\s+)?(?:long\s+long|short\s+int|long\s+int|int64_t|int32_t|int|long|short)\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/g, (match, varName, expr) => {
        if (expr.includes('/') && !isFloatExpr(expr)) {
            return `let ${varName} = Math.trunc(${expr});`;
        }
        return `let ${varName} = ${expr};`;
    });

    // Replace C/C++/Java type declarations with let (including compound types like long long, unsigned long long, etc.)
    const typeRegex = /\b(?:(?:unsigned|signed|const|static)\s+)?(?:long\s+long|long\s+double|short\s+int|long\s+int|int64_t|uint64_t|int32_t|uint32_t|size_t|int|long|short|float|double|char|bool|boolean|auto|String|string|void)\b\s+([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)*)(?=\s*[;=,])/g;
    body = body.replace(typeRegex, (m, varNames) => {
        if (varNames.includes('=')) {
            return `let ${varNames}`;
        }
        const names = varNames.split(',').map(n => n.trim());
        return `let ${names.join(', ')}`;
    });

    // =========================================================================
    // 3. Runtime Library Header with Complete STL, Java Libs, Math, & Utils
    // =========================================================================
    const wrappedJs = `
const fs = require('fs');
const __rawInput = fs.readFileSync(0, 'utf8');
const __lines = __rawInput.split(/\\r?\\n/);
let __lineIdx = 0;
const __cleanedInput = __rawInput.replace(/(\\d):(\\d)/g, '$1 : $2');
const __tokens = __cleanedInput.trim().split(/\\s+/).filter(Boolean);
let __tokenIdx = 0;

let __coutPrecision = null;
let __coutScientific = false;
let __coutUppercase = false;
let __coutWidth = 0;
let __coutAlign = "right";
let __coutFill = " ";
let __coutBase = 10;
let __coutShowPos = false;

function setw(n) { __coutWidth = typeof n === 'number' ? n : 0; return ""; }
function setfill(c) { __coutFill = String(c !== undefined ? c : ' '); return ""; }
function setprecision(p) { __coutPrecision = typeof p === 'number' ? p : null; return ""; }

const right = Symbol("right");
const left = Symbol("left");
const internal = Symbol("internal");
const fixed = Symbol("fixed");
const scientific = Symbol("scientific");
const uppercase = Symbol("uppercase");
const nouppercase = Symbol("nouppercase");
const hex = Symbol("hex");
const oct = Symbol("oct");
const dec = Symbol("dec");
const showpos = Symbol("showpos");
const noshowpos = Symbol("noshowpos");
const showpoint = Symbol("showpoint");
const noshowpoint = Symbol("noshowpoint");
const showbase = Symbol("showbase");
const noshowbase = Symbol("noshowbase");
const boolalpha = Symbol("boolalpha");
const noboolalpha = Symbol("noboolalpha");
const flush = "";
const unitbuf = "";
const nounitbuf = "";
const ws = "";

// Polyfills on Array, String, Set, Map, Number
if (!Array.prototype.size) Array.prototype.size = function() { return this.length; };
if (!Array.prototype.empty) Array.prototype.empty = function() { return this.length === 0; };
if (!Array.prototype.front) Array.prototype.front = function() { return this[0]; };
if (!Array.prototype.back) Array.prototype.back = function() { return this[this.length - 1]; };
if (!Array.prototype.clear) Array.prototype.clear = function() { this.length = 0; };
if (!Array.prototype.push_back) Array.prototype.push_back = function(x) { this.push(x); };
if (!Array.prototype.pop_back) Array.prototype.pop_back = function() { return this.pop(); };
if (!Array.prototype.push_front) Array.prototype.push_front = function(x) { this.unshift(x); };
if (!Array.prototype.pop_front) Array.prototype.pop_front = function() { return this.shift(); };
if (!Array.prototype.add) Array.prototype.add = function(x) { this.push(x); return true; };
if (!Array.prototype.get) Array.prototype.get = function(i) { return this[i]; };
if (!Array.prototype.set) Array.prototype.set = function(i, x) { this[i] = x; return x; };
if (!Array.prototype.resize) Array.prototype.resize = function(n, val = 0) {
    while (this.length < n) this.push(val);
    if (this.length > n) this.length = n;
};
if (!Array.prototype.assign) Array.prototype.assign = function(n, val) {
    this.length = n;
    this.fill(val);
};
if (!Array.prototype.begin) Array.prototype.begin = function() { return 0; };
if (!Array.prototype.end) Array.prototype.end = function() { return this.length; };
if (!Array.prototype.rbegin) Array.prototype.rbegin = function() { return this.length - 1; };
if (!Array.prototype.rend) Array.prototype.rend = function() { return -1; };

if (!String.prototype.size) String.prototype.size = function() { return this.length; };
if (!String.prototype.empty) String.prototype.empty = function() { return this.length === 0; };
if (!String.prototype.front) String.prototype.front = function() { return this[0]; };
if (!String.prototype.back) String.prototype.back = function() { return this[this.length - 1]; };
if (!String.prototype.contains) String.prototype.contains = function(s) { return this.includes(s); };
if (!String.prototype.equalsIgnoreCase) String.prototype.equalsIgnoreCase = function(s) {
    return this.toLowerCase() === String(s).toLowerCase();
};
if (!String.prototype.compareTo) String.prototype.compareTo = function(o) {
    return this < o ? -1 : (this > o ? 1 : 0);
};
if (!String.prototype.compareToIgnoreCase) String.prototype.compareToIgnoreCase = function(o) {
    const a = this.toLowerCase(), b = String(o).toLowerCase();
    return a < b ? -1 : (a > b ? 1 : 0);
};
if (!String.prototype.find) String.prototype.find = function(s) {
    const idx = this.indexOf(s);
    return idx >= 0 ? idx : -1;
};
if (!String.prototype.toCharArray) String.prototype.toCharArray = function() {
    return this.split('');
};

if (!Number.prototype.size) Number.prototype.size = function() { return String(this).length; };

// C++ STL Containers
class vector extends Array {
    constructor(...args) {
        if (args.length === 1 && typeof args[0] === 'number') {
            super(args[0]);
            this.fill(0);
        } else if (args.length === 2 && typeof args[0] === 'number') {
            super(args[0]);
            this.fill(args[1]);
        } else {
            super(...args);
        }
    }
    at(i) { return this[i]; }
    data() { return this; }
    capacity() { return this.length; }
    shrink_to_fit() {}
}

class CppStack {
    constructor() { this._arr = []; }
    push(x) { this._arr.push(x); }
    emplace(x) { this._arr.push(x); }
    pop() { this._arr.pop(); }
    top() { return this._arr[this._arr.length - 1]; }
    empty() { return this._arr.length === 0; }
    size() { return this._arr.length; }
    clear() { this._arr.length = 0; }
}

class CppQueue {
    constructor() { this._arr = []; this._head = 0; }
    push(x) { this._arr.push(x); }
    emplace(x) { this._arr.push(x); }
    pop() { if (this._head < this._arr.length) this._head++; }
    front() { return this._arr[this._head]; }
    back() { return this._arr[this._arr.length - 1]; }
    empty() { return this._head >= this._arr.length; }
    size() { return Math.max(0, this._arr.length - this._head); }
    clear() { this._arr = []; this._head = 0; }
}

class CppDeque {
    constructor() {
        this._arr = [];
        return new Proxy(this, {
            get(target, prop) {
                if (typeof prop === 'string' && !isNaN(Number(prop))) {
                    return target._arr[Number(prop)];
                }
                const val = target[prop];
                return typeof val === 'function' ? val.bind(target) : val;
            },
            set(target, prop, value) {
                if (typeof prop === 'string' && !isNaN(Number(prop))) {
                    target._arr[Number(prop)] = value;
                    return true;
                }
                target[prop] = value;
                return true;
            }
        });
    }
    push_back(x) { this._arr.push(x); }
    push_front(x) { this._arr.unshift(x); }
    pop_back() { return this._arr.pop(); }
    pop_front() { return this._arr.shift(); }
    front() { return this._arr[0]; }
    back() { return this._arr[this._arr.length - 1]; }
    empty() { return this._arr.length === 0; }
    size() { return this._arr.length; }
    clear() { this._arr.length = 0; }
    at(i) { return this._arr[i]; }
    [Symbol.iterator]() { return this._arr[Symbol.iterator](); }
}

class CppList {
    constructor() { this._arr = []; }
    push_back(x) { this._arr.push(x); }
    push_front(x) { this._arr.unshift(x); }
    pop_back() { return this._arr.pop(); }
    pop_front() { return this._arr.shift(); }
    front() { return this._arr[0]; }
    back() { return this._arr[this._arr.length - 1]; }
    empty() { return this._arr.length === 0; }
    size() { return this._arr.length; }
    clear() { this._arr.length = 0; }
    reverse() { this._arr.reverse(); }
    sort(comp) {
        if (typeof comp === 'function') this._arr.sort(comp);
        else this._arr.sort((a, b) => a - b);
    }
    unique() {
        this._arr = this._arr.filter((v, i, a) => i === 0 || v !== a[i - 1]);
    }
    remove(val) {
        this._arr = this._arr.filter(v => v !== val);
    }
    [Symbol.iterator]() { return this._arr[Symbol.iterator](); }
}

class CppPriorityQueue {
    constructor(isMinOrComp = false) {
        this._heap = [];
        this._isMin = isMinOrComp === true || isMinOrComp === 'greater';
        this._comp = typeof isMinOrComp === 'function' ? isMinOrComp : null;
    }
    push(x) {
        this._heap.push(x);
        this._siftUp(this._heap.length - 1);
    }
    emplace(x) { this.push(x); }
    pop() {
        if (this._heap.length === 0) return;
        const top = this._heap[0];
        const last = this._heap.pop();
        if (this._heap.length > 0) {
            this._heap[0] = last;
            this._siftDown(0);
        }
        return top;
    }
    top() { return this._heap[0]; }
    empty() { return this._heap.length === 0; }
    size() { return this._heap.length; }
    clear() { this._heap.length = 0; }
    _compare(a, b) {
        if (this._comp) return this._comp(a, b);
        if (this._isMin) return a - b;
        return b - a;
    }
    _siftUp(i) {
        while (i > 0) {
            const p = (i - 1) >> 1;
            if (this._compare(this._heap[i], this._heap[p]) < 0) {
                [this._heap[i], this._heap[p]] = [this._heap[p], this._heap[i]];
                i = p;
            } else break;
        }
    }
    _siftDown(i) {
        const len = this._heap.length;
        while ((i << 1) + 1 < len) {
            let best = (i << 1) + 1;
            const r = best + 1;
            if (r < len && this._compare(this._heap[r], this._heap[best]) < 0) best = r;
            if (this._compare(this._heap[best], this._heap[i]) < 0) {
                [this._heap[i], this._heap[best]] = [this._heap[best], this._heap[i]];
                i = best;
            } else break;
        }
    }
}

class CppSet {
    constructor() { this._set = new Set(); }
    insert(x) { this._set.add(x); return this; }
    emplace(x) { this._set.add(x); return this; }
    erase(x) { return this._set.delete(x); }
    count(x) { return this._set.has(x) ? 1 : 0; }
    find(x) { return this._set.has(x) ? x : null; }
    has(x) { return this._set.has(x); }
    empty() { return this._set.size === 0; }
    size() { return this._set.size; }
    clear() { this._set.clear(); }
    lower_bound(x) {
        const sorted = Array.from(this._set).sort((a, b) => a - b);
        for (const v of sorted) if (v >= x) return v;
        return null;
    }
    upper_bound(x) {
        const sorted = Array.from(this._set).sort((a, b) => a - b);
        for (const v of sorted) if (v > x) return v;
        return null;
    }
    [Symbol.iterator]() {
        const sorted = Array.from(this._set).sort((a, b) => a - b);
        return sorted[Symbol.iterator]();
    }
}

class CppMultiSet {
    constructor() { this._arr = []; }
    insert(x) { this._arr.push(x); this._arr.sort((a, b) => a - b); return this; }
    emplace(x) { return this.insert(x); }
    erase(x) {
        const idx = this._arr.indexOf(x);
        if (idx >= 0) { this._arr.splice(idx, 1); return 1; }
        return 0;
    }
    count(x) { return this._arr.filter(v => v === x).length; }
    find(x) { return this._arr.indexOf(x) >= 0 ? x : null; }
    empty() { return this._arr.length === 0; }
    size() { return this._arr.length; }
    clear() { this._arr.length = 0; }
    [Symbol.iterator]() { return this._arr[Symbol.iterator](); }
}

class CppMap {
    constructor() {
        const map = new Map();
        const obj = {
            _map: map,
            insert(p) {
                if (p && p.first !== undefined) map.set(p.first, p.second);
                else if (Array.isArray(p)) map.set(p[0], p[1]);
                return this;
            },
            emplace(k, v) { map.set(k, v); return this; },
            erase(k) { return map.delete(k); },
            count(k) { return map.has(k) ? 1 : 0; },
            find(k) { return map.has(k) ? { first: k, second: map.get(k) } : null; },
            contains(k) { return map.has(k); },
            empty() { return map.size === 0; },
            size() { return map.size; },
            clear() { map.clear(); },
            at(k) { return map.get(k); }
        };
        return new Proxy(obj, {
            get(target, prop) {
                if (prop in target) {
                    return typeof target[prop] === 'function' ? target[prop].bind(target) : target[prop];
                }
                return map.get(prop);
            },
            set(target, prop, value) {
                if (prop in target) {
                    target[prop] = value;
                } else {
                    map.set(prop, value);
                }
                return true;
            }
        });
    }
}

class CppMultiMap {
    constructor() { this._pairs = []; }
    insert(p) {
        const item = p && p.first !== undefined ? { first: p.first, second: p.second } : { first: p[0], second: p[1] };
        this._pairs.push(item);
        this._pairs.sort((a, b) => a.first < b.first ? -1 : (a.first > b.first ? 1 : 0));
        return this;
    }
    emplace(k, v) { return this.insert({ first: k, second: v }); }
    count(k) { return this._pairs.filter(p => p.first === k).length; }
    find(k) { return this._pairs.find(p => p.first === k) || null; }
    empty() { return this._pairs.length === 0; }
    size() { return this._pairs.length; }
    clear() { this._pairs.length = 0; }
}

class bitset {
    constructor(val = 0) {
        this._val = BigInt(val || 0);
    }
    set(i, val = true) {
        if (i !== undefined) {
            if (val) this._val |= (1n << BigInt(i));
            else this._val &= ~(1n << BigInt(i));
        }
        return this;
    }
    reset(i) {
        if (i !== undefined) this._val &= ~(1n << BigInt(i));
        else this._val = 0n;
        return this;
    }
    flip(i) {
        if (i !== undefined) this._val ^= (1n << BigInt(i));
        else this._val = ~this._val;
        return this;
    }
    test(i) {
        return Boolean((this._val >> BigInt(i)) & 1n);
    }
    count() {
        let n = this._val < 0n ? -this._val : this._val;
        let c = 0;
        while (n > 0n) { if (n & 1n) c++; n >>= 1n; }
        return c;
    }
    any() { return this.count() > 0; }
    none() { return this.count() === 0; }
    all() { return true; }
    size() { return 64; }
    to_ulong() { return Number(this._val & 0xffffffffn); }
    to_ullong() { return Number(this._val); }
    to_string() { return this._val.toString(2); }
}

class CppStringStream {
    constructor(str = "") {
        this._tokens = String(str).trim().split(/\\s+/).filter(Boolean);
        this._idx = 0;
    }
    next() {
        if (this._idx >= this._tokens.length) return "";
        const t = this._tokens[this._idx++];
        const num = Number(t);
        return isNaN(num) ? t : num;
    }
    str(s) {
        if (s !== undefined) {
            this._tokens = String(s).trim().split(/\\s+/).filter(Boolean);
            this._idx = 0;
        }
        return this._tokens.join(' ');
    }
    clear() { this._idx = 0; }
}

function make_pair(a, b) {
    return { first: a, second: b };
}
function make_tuple(...args) {
    return args;
}

// Java Arbitrary Precision Math (BigInteger, BigDecimal)
class BigInteger {
    constructor(val) {
        this.val = BigInt(val !== undefined && val !== null ? val : 0);
    }
    static valueOf(n) { return new BigInteger(n); }
    add(other) { return new BigInteger(this.val + BigInteger._toBigInt(other)); }
    subtract(other) { return new BigInteger(this.val - BigInteger._toBigInt(other)); }
    multiply(other) { return new BigInteger(this.val * BigInteger._toBigInt(other)); }
    divide(other) { return new BigInteger(this.val / BigInteger._toBigInt(other)); }
    remainder(other) { return new BigInteger(this.val % BigInteger._toBigInt(other)); }
    mod(other) {
        const m = BigInteger._toBigInt(other);
        const r = this.val % m;
        return new BigInteger(r < 0n ? r + m : r);
    }
    pow(exp) { return new BigInteger(this.val ** BigInt(exp)); }
    abs() { return new BigInteger(this.val < 0n ? -this.val : this.val); }
    negate() { return new BigInteger(-this.val); }
    gcd(other) {
        let a = this.val < 0n ? -this.val : this.val;
        let b = BigInteger._toBigInt(other);
        b = b < 0n ? -b : b;
        while (b !== 0n) { const t = b; b = a % b; a = t; }
        return new BigInteger(a);
    }
    compareTo(other) {
        const o = BigInteger._toBigInt(other);
        return this.val < o ? -1 : (this.val > o ? 1 : 0);
    }
    equals(other) {
        return this.val === BigInteger._toBigInt(other);
    }
    toString(radix = 10) { return this.val.toString(radix); }
    intValue() { return Number(this.val); }
    longValue() { return Number(this.val); }
    doubleValue() { return Number(this.val); }
    static _toBigInt(x) {
        if (x instanceof BigInteger) return x.val;
        if (typeof x === 'bigint') return x;
        return BigInt(x);
    }
}
BigInteger.ZERO = new BigInteger(0);
BigInteger.ONE = new BigInteger(1);
BigInteger.TWO = new BigInteger(2);
BigInteger.TEN = new BigInteger(10);

class BigDecimal {
    constructor(val) { this.val = Number(val || 0); }
    static valueOf(n) { return new BigDecimal(n); }
    add(o) { return new BigDecimal(this.val + BigDecimal._toNum(o)); }
    subtract(o) { return new BigDecimal(this.val - BigDecimal._toNum(o)); }
    multiply(o) { return new BigDecimal(this.val * BigDecimal._toNum(o)); }
    divide(o) { return new BigDecimal(this.val / BigDecimal._toNum(o)); }
    compareTo(o) {
        const v = BigDecimal._toNum(o);
        return this.val < v ? -1 : (this.val > v ? 1 : 0);
    }
    setScale(s) { return new BigDecimal(this.val.toFixed(s)); }
    toString() { return String(this.val); }
    toPlainString() { return String(this.val); }
    static _toNum(x) { return x instanceof BigDecimal ? x.val : Number(x); }
}

class StringTokenizer {
    constructor(str = "", delim = " ") {
        const re = new RegExp(\`[\${delim.replace(/[\\\\^$*+?.()|[\\]{}]/g, '\\\\$&')} ]+\`);
        this._tokens = String(str).split(re).filter(Boolean);
        this._idx = 0;
    }
    hasMoreTokens() { return this._idx < this._tokens.length; }
    nextToken() { return this.hasMoreTokens() ? this._tokens[this._idx++] : ""; }
    countTokens() { return Math.max(0, this._tokens.length - this._idx); }
}

// Java Standard Library Compatibility
const Arrays = {
    sort: (arr, comp) => {
        if (Array.isArray(arr)) {
            if (typeof comp === 'function') arr.sort(comp);
            else arr.sort((a, b) => a - b);
        }
    },
    fill: (arr, val) => {
        if (Array.isArray(arr)) arr.fill(val);
    },
    binarySearch: (arr, val) => binary_search(arr, null, val),
    equals: (a, b) => {
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    },
    copyOf: (arr, newLen) => {
        const res = new Array(newLen).fill(0);
        for (let i = 0; i < Math.min(arr.length, newLen); i++) res[i] = arr[i];
        return res;
    },
    copyOfRange: (arr, from, to) => arr.slice(from, to),
    toString: (arr) => Array.isArray(arr) ? '[' + arr.join(', ') + ']' : String(arr),
    deepToString: (arr) => JSON.stringify(arr)
};

const Collections = {
    sort: (list, comp) => {
        if (Array.isArray(list)) {
            if (typeof comp === 'function') list.sort(comp);
            else list.sort((a, b) => a - b);
        }
    },
    reverse: (list) => {
        if (Array.isArray(list)) list.reverse();
    },
    max: (list) => Array.isArray(list) ? Math.max(...list) : 0,
    min: (list) => Array.isArray(list) ? Math.min(...list) : 0,
    binarySearch: (list, key) => binary_search(list, null, key),
    fill: (list, val) => { if (Array.isArray(list)) list.fill(val); },
    swap: (list, i, j) => {
        if (Array.isArray(list)) { const t = list[i]; list[i] = list[j]; list[j] = t; }
    },
    shuffle: (list) => {
        if (Array.isArray(list)) {
            for (let i = list.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [list[i], list[j]] = [list[j], list[i]];
            }
        }
    },
    frequency: (list, o) => Array.isArray(list) ? list.filter(x => x === o).length : 0,
    reverseOrder: () => (a, b) => b - a
};

class StringBuilder {
    constructor(str = '') { this._str = String(str); }
    append(val) { this._str += String(val); return this; }
    insert(offset, val) { this._str = this._str.slice(0, offset) + String(val) + this._str.slice(offset); return this; }
    delete(start, end) { this._str = this._str.slice(0, start) + this._str.slice(end); return this; }
    deleteCharAt(i) { this._str = this._str.slice(0, i) + this._str.slice(i + 1); return this; }
    setCharAt(i, c) { this._str = this._str.slice(0, i) + String(c) + this._str.slice(i + 1); return this; }
    reverse() { this._str = this._str.split('').reverse().join(''); return this; }
    toString() { return this._str; }
    length() { return this._str.length; }
    charAt(i) { return this._str.charAt(i); }
    substring(start, end) { return end !== undefined ? this._str.substring(start, end) : this._str.substring(start); }
}
const StringBuffer = StringBuilder;

const Integer = {
    parseInt: (s, radix = 10) => parseInt(s, radix) || 0,
    toBinaryString: (n) => (Number(n) >>> 0).toString(2),
    toHexString: (n) => (Number(n) >>> 0).toString(16),
    toOctalString: (n) => (Number(n) >>> 0).toString(8),
    bitCount: (n) => __popcount(n),
    MAX_VALUE: 2147483647,
    MIN_VALUE: -2147483648
};

const Double = {
    parseDouble: (s) => parseFloat(s) || 0,
    isNaN: (v) => Number.isNaN(v),
    isInfinite: (v) => !Number.isFinite(v),
    MAX_VALUE: Number.MAX_VALUE,
    MIN_VALUE: Number.MIN_VALUE,
    POSITIVE_INFINITY: Infinity,
    NEGATIVE_INFINITY: -Infinity,
    NaN: NaN
};

const Long = {
    parseLong: (s, radix = 10) => parseInt(s, radix) || 0,
    MAX_VALUE: Number.MAX_SAFE_INTEGER,
    MIN_VALUE: Number.MIN_SAFE_INTEGER
};

const Character = {
    isDigit: (c) => isdigit(c) === 1,
    isLetter: (c) => isalpha(c) === 1,
    isLetterOrDigit: (c) => isalnum(c) === 1,
    isWhitespace: (c) => isspace(c) === 1,
    isUpperCase: (c) => isupper(c) === 1,
    isLowerCase: (c) => islower(c) === 1,
    toUpperCase: (c) => toupper(c),
    toLowerCase: (c) => tolower(c)
};

// C++ Mathematical Functions & Constants (<cmath>)
const M_PI = Math.PI;
const PI = Math.PI;
const M_E = Math.E;
const M_SQRT2 = Math.SQRT2;
const M_LN2 = Math.LN2;
const M_LN10 = Math.LN10;
const INFINITY = Infinity;
const NAN = NaN;

const INT_MAX = 2147483647;
const INT_MIN = -2147483648;
const LLONG_MAX = 9223372036854775807n;
const LLONG_MIN = -9223372036854775808n;
const UINT_MAX = 4294967295;
const ULLONG_MAX = 18446744073709551615n;
const CHAR_BIT = 8;
const SHRT_MAX = 32767;
const SHRT_MIN = -32768;

const abs = Math.abs;
const fabs = Math.abs;
const labs = Math.abs;
const llabs = Math.abs;
const sqrt = Math.sqrt;
const cbrt = Math.cbrt;
const hypot = Math.hypot;
const pow = Math.pow;
const exp = Math.exp;
const exp2 = (x) => Math.pow(2, x);
const log = Math.log;
const log10 = Math.log10;
const log2 = Math.log2;
const sin = Math.sin;
const cos = Math.cos;
const tan = Math.tan;
const asin = Math.asin;
const acos = Math.acos;
const atan = Math.atan;
const atan2 = Math.atan2;
const sinh = Math.sinh;
const cosh = Math.cosh;
const tanh = Math.tanh;
const asinh = Math.asinh;
const acosh = Math.acosh;
const atanh = Math.atanh;
const floor = Math.floor;
const ceil = Math.ceil;
const round = Math.round;
const trunc = Math.trunc;
const fmod = (a, b) => a % b;
const remainder = (a, b) => a - Math.round(a / b) * b;
const fmax = Math.max;
const fmin = Math.min;
const fdim = (a, b) => Math.max(0, a - b);
const copysign = (m, s) => Math.abs(m) * (s < 0 ? -1 : 1);

// C-style Character Classifications (<cctype>)
function isalpha(c) {
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    return /[a-zA-Z]/.test(ch) ? 1 : 0;
}
function isdigit(c) {
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    return /[0-9]/.test(ch) ? 1 : 0;
}
function isalnum(c) {
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    return /[a-zA-Z0-9]/.test(ch) ? 1 : 0;
}
function isspace(c) {
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    return /\\s/.test(ch) ? 1 : 0;
}
function isupper(c) {
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    return /[A-Z]/.test(ch) ? 1 : 0;
}
function islower(c) {
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    return /[a-z]/.test(ch) ? 1 : 0;
}
function ispunct(c) {
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    return /[!"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_\`{|}~]/.test(ch) ? 1 : 0;
}
function isblank(c) {
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    return /[ \\t]/.test(ch) ? 1 : 0;
}
function iscntrl(c) {
    const ch = typeof c === 'number' ? c : String(c).charCodeAt(0);
    return (ch >= 0 && ch <= 31) || ch === 127 ? 1 : 0;
}
function isprint(c) {
    const ch = typeof c === 'number' ? c : String(c).charCodeAt(0);
    return ch >= 32 && ch <= 126 ? 1 : 0;
}
function isgraph(c) {
    const ch = typeof c === 'number' ? c : String(c).charCodeAt(0);
    return ch >= 33 && ch <= 126 ? 1 : 0;
}
function isxdigit(c) {
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    return /[0-9a-fA-F]/.test(ch) ? 1 : 0;
}
function toupper(c) {
    if (typeof c === 'number') {
        return String.fromCharCode(c).toUpperCase().charCodeAt(0);
    }
    return String(c).toUpperCase();
}
function tolower(c) {
    if (typeof c === 'number') {
        return String.fromCharCode(c).toLowerCase().charCodeAt(0);
    }
    return String(c).toLowerCase();
}

// C Standard Library Helpers (<cstdlib>)
function atoi(s) { return parseInt(s, 10) || 0; }
function atof(s) { return parseFloat(s) || 0; }
function atol(s) { return parseInt(s, 10) || 0; }
function atoll(s) { return parseInt(s, 10) || 0; }
let __seed = 1;
function srand(s) { __seed = Number(s) || 1; }
function rand() {
    __seed = (__seed * 1103515245 + 12345) & 0x7fffffff;
    return __seed;
}
function exit(code = 0) { process.exit(code); }
function abort() { process.exit(1); }

// C String & Memory Manipulation (<cstring>)
function strlen(s) { return typeof s === 'string' || Array.isArray(s) ? s.length : 0; }
function strcmp(s1, s2) {
    const a = String(s1), b = String(s2);
    return a < b ? -1 : (a > b ? 1 : 0);
}
function strncmp(s1, s2, n) {
    const a = String(s1).slice(0, n), b = String(s2).slice(0, n);
    return a < b ? -1 : (a > b ? 1 : 0);
}
function strcasecmp(s1, s2) {
    const a = String(s1).toLowerCase(), b = String(s2).toLowerCase();
    return a < b ? -1 : (a > b ? 1 : 0);
}
function strncasecmp(s1, s2, n) {
    const a = String(s1).slice(0, n).toLowerCase(), b = String(s2).slice(0, n).toLowerCase();
    return a < b ? -1 : (a > b ? 1 : 0);
}
function strstr(haystack, needle) {
    const h = String(haystack), n = String(needle);
    const idx = h.indexOf(n);
    return idx >= 0 ? h.slice(idx) : null;
}
function strchr(s, c) {
    const str = String(s);
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    const idx = str.indexOf(ch);
    return idx >= 0 ? str.slice(idx) : null;
}
function strrchr(s, c) {
    const str = String(s);
    const ch = typeof c === 'number' ? String.fromCharCode(c) : String(c);
    const idx = str.lastIndexOf(ch);
    return idx >= 0 ? str.slice(idx) : null;
}
function strcpy(dest, src) { return String(src); }
function strncpy(dest, src, n) { return String(src).slice(0, n); }
function strcat(dest, src) { return String(dest) + String(src); }
function strncat(dest, src, n) { return String(dest) + String(src).slice(0, n); }
function memset(arr, val, n) {
    if (Array.isArray(arr) || arr instanceof Array) {
        const count = n !== undefined ? Math.min(arr.length, n) : arr.length;
        for (let i = 0; i < count; i++) arr[i] = val;
    }
    return arr;
}
function memcpy(dest, src, n) {
    if (Array.isArray(dest) && Array.isArray(src)) {
        const count = n !== undefined ? Math.min(dest.length, src.length, n) : Math.min(dest.length, src.length);
        for (let i = 0; i < count; i++) dest[i] = src[i];
    }
    return dest;
}
function memmove(dest, src, n) { return memcpy(dest, src, n); }
function memcmp(s1, s2, n) {
    const a = Array.isArray(s1) ? s1 : String(s1).split('');
    const b = Array.isArray(s2) ? s2 : String(s2).split('');
    const count = n !== undefined ? Math.min(a.length, b.length, n) : Math.min(a.length, b.length);
    for (let i = 0; i < count; i++) {
        if (a[i] !== b[i]) return a[i] < b[i] ? -1 : 1;
    }
    return 0;
}
let __strtokStr = "";
let __strtokIdx = 0;
function strtok(str, delim) {
    if (str !== null && str !== undefined) {
        __strtokStr = String(str);
        __strtokIdx = 0;
    }
    if (__strtokIdx >= __strtokStr.length) return null;
    const delims = new Set(delim.split(''));
    while (__strtokIdx < __strtokStr.length && delims.has(__strtokStr[__strtokIdx])) __strtokIdx++;
    if (__strtokIdx >= __strtokStr.length) return null;
    const start = __strtokIdx;
    while (__strtokIdx < __strtokStr.length && !delims.has(__strtokStr[__strtokIdx])) __strtokIdx++;
    return __strtokStr.slice(start, __strtokIdx);
}
function puts(s) { process.stdout.write(String(s) + "\\n"); return 0; }
function putchar(c) {
    process.stdout.write(typeof c === 'number' ? String.fromCharCode(c) : String(c));
    return typeof c === 'number' ? c : String(c).charCodeAt(0);
}
function getchar() { return __nextTokenChar(); }

// C++ STL Numeric & Algorithm Functions
function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a;
}
const __gcd = gcd;
function lcm(a, b) {
    if (a === 0 || b === 0) return 0;
    return Math.abs(a * b) / gcd(a, b);
}
function midpoint(a, b) { return a + Math.floor((b - a) / 2); }

function __popcount(x) {
    let n = BigInt(x < 0 ? -x : x);
    let count = 0;
    while (n > 0n) { if (n & 1n) count++; n >>= 1n; }
    return count;
}
const __builtin_popcount = __popcount;
const __builtin_popcountll = __popcount;

function __clz(x) {
    return Math.clz32(Number(x) >>> 0);
}
const __builtin_clz = __clz;
const __builtin_clzll = (x) => {
    const bi = BigInt(x);
    if (bi === 0n) return 64;
    return 64 - bi.toString(2).length;
};
function __ctz(x) {
    const n = Number(x) >>> 0;
    if (n === 0) return 32;
    return 31 - Math.clz32(n & -n);
}
const __builtin_ctz = __ctz;
const __builtin_parity = (x) => __popcount(x) % 2;

function to_string(x) { return String(x); }
function stoi(x) { return parseInt(x, 10) || 0; }
function stod(x) { return parseFloat(x) || 0; }
function stoll(x) { return parseInt(x, 10) || 0; }

function accumulate(first, last, init = 0, op = null) {
    const arr = Array.isArray(first) ? first : [];
    if (typeof op === 'function') return arr.reduce((acc, val) => op(acc, val), init);
    return arr.reduce((acc, val) => acc + val, init);
}
function count(first, last, val) {
    const arr = Array.isArray(first) ? first : [];
    return arr.filter(x => x === val).length;
}
function count_if(first, last, pred) {
    const arr = Array.isArray(first) ? first : [];
    return arr.filter(pred).length;
}
function find(first, last, val) {
    const arr = Array.isArray(first) ? first : [];
    const idx = arr.indexOf(val);
    return idx >= 0 ? idx : arr.length;
}
function find_if(first, last, pred) {
    const arr = Array.isArray(first) ? first : [];
    const idx = arr.findIndex(pred);
    return idx >= 0 ? idx : arr.length;
}
function find_if_not(first, last, pred) {
    const arr = Array.isArray(first) ? first : [];
    const idx = arr.findIndex(x => !pred(x));
    return idx >= 0 ? idx : arr.length;
}
function all_of(first, last, pred) {
    const arr = Array.isArray(first) ? first : [];
    return arr.every(pred);
}
function any_of(first, last, pred) {
    const arr = Array.isArray(first) ? first : [];
    return arr.some(pred);
}
function none_of(first, last, pred) {
    const arr = Array.isArray(first) ? first : [];
    return !arr.some(pred);
}
function for_each(first, last, fn) {
    const arr = Array.isArray(first) ? first : [];
    arr.forEach(fn);
}
function clamp(val, low, high) {
    return Math.min(Math.max(val, low), high);
}
function binary_search(first, last, val, comp = null) {
    const arr = Array.isArray(first) ? first : [];
    let l = 0, r = arr.length - 1;
    while (l <= r) {
        const m = (l + r) >> 1;
        if (arr[m] === val) return true;
        if (arr[m] < val) l = m + 1;
        else r = m - 1;
    }
    return false;
}
function lower_bound(first, last, val) {
    const arr = Array.isArray(first) ? first : [];
    let l = 0, r = arr.length;
    while (l < r) {
        const m = (l + r) >> 1;
        if (arr[m] < val) l = m + 1;
        else r = m;
    }
    return l;
}
function upper_bound(first, last, val) {
    const arr = Array.isArray(first) ? first : [];
    let l = 0, r = arr.length;
    while (l < r) {
        const m = (l + r) >> 1;
        if (arr[m] <= val) l = m + 1;
        else r = m;
    }
    return l;
}
function min_element(first, last) {
    const arr = Array.isArray(first) ? first : [];
    if (arr.length === 0) return 0;
    let minIdx = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] < arr[minIdx]) minIdx = i;
    }
    return minIdx;
}
function max_element(first, last) {
    const arr = Array.isArray(first) ? first : [];
    if (arr.length === 0) return 0;
    let maxIdx = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > arr[maxIdx]) maxIdx = i;
    }
    return maxIdx;
}
function fill(first, last, val) {
    if (Array.isArray(first)) first.fill(val);
}
function iota(first, last, val) {
    if (Array.isArray(first)) {
        for (let i = 0; i < first.length; i++) first[i] = val + i;
    }
}
function next_permutation(first, last) {
    const arr = Array.isArray(first) ? first : [];
    let i = arr.length - 2;
    while (i >= 0 && arr[i] >= arr[i + 1]) i--;
    if (i < 0) return false;
    let j = arr.length - 1;
    while (arr[j] <= arr[i]) j--;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    let l = i + 1, r = arr.length - 1;
    while (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; l++; r--; }
    return true;
}
function prev_permutation(first, last) {
    const arr = Array.isArray(first) ? first : [];
    let i = arr.length - 2;
    while (i >= 0 && arr[i] <= arr[i + 1]) i--;
    if (i < 0) return false;
    let j = arr.length - 1;
    while (arr[j] >= arr[i]) j--;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    let l = i + 1, r = arr.length - 1;
    while (l < r) { [arr[l], arr[r]] = [arr[r], arr[l]]; l++; r--; }
    return true;
}
function is_sorted(first, last, comp = null) {
    const arr = Array.isArray(first) ? first : [];
    for (let i = 1; i < arr.length; i++) {
        if (typeof comp === 'function' ? comp(arr[i], arr[i - 1]) : arr[i] < arr[i - 1]) return false;
    }
    return true;
}

const greater = () => (a, b) => b - a;
const less = () => (a, b) => a - b;

function int(x) { return Math.trunc(Number(x)); }
function double(x) { return Number(x); }
function char(x) { return typeof x === 'number' ? String.fromCharCode(x) : String(x); }

const cin = {
    ignore: function() { __tokenIdx++; __lineIdx++; },
    get: function() { return __nextTokenStr(); },
    clear: function() {},
    sync: function() {},
    tie: function() { return cin; },
    eof: function() { return __tokenIdx >= __tokens.length; },
    fail: function() { return false; },
    good: function() { return true; }
};

function max(...args) {
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
        if (Array.isArray(args[0])) return Math.max(...args[0]);
        return Math.max(...Object.values(args[0]));
    }
    return Math.max(...args);
}

function min(...args) {
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
        if (Array.isArray(args[0])) return Math.min(...args[0]);
        return Math.min(...Object.values(args[0]));
    }
    return Math.min(...args);
}

function __nextToken() {
    if (__tokenIdx >= __tokens.length) return 0;
    const t = __tokens[__tokenIdx++];
    const num = Number(t);
    return isNaN(num) ? t : num;
}
function __nextTokenStr() {
    if (__tokenIdx >= __tokens.length) return '';
    return String(__tokens[__tokenIdx++]);
}
function __nextTokenChar() {
    if (__tokenIdx >= __tokens.length) return '';
    const t = String(__tokens[__tokenIdx++]);
    return t.length > 0 ? t[0] : '';
}
function __nextTokenInt() {
    if (__tokenIdx >= __tokens.length) return 0;
    return parseInt(__tokens[__tokenIdx++], 10) || 0;
}
function __nextTokenDouble() {
    if (__tokenIdx >= __tokens.length) return 0;
    return parseFloat(__tokens[__tokenIdx++]) || 0;
}
function __nextTokenLine() {
    if (__lineIdx >= __lines.length) return '';
    return __lines[__lineIdx++];
}

function __formatVal(val, isFloat) {
    if (val === right) { __coutAlign = "right"; return ""; }
    if (val === left) { __coutAlign = "left"; return ""; }
    if (val === internal) { __coutAlign = "internal"; return ""; }
    if (val === fixed) { __coutScientific = false; return ""; }
    if (val === scientific) { __coutScientific = true; return ""; }
    if (val === uppercase) { __coutUppercase = true; return ""; }
    if (val === nouppercase) { __coutUppercase = false; return ""; }
    if (val === hex) { __coutBase = 16; return ""; }
    if (val === oct) { __coutBase = 8; return ""; }
    if (val === dec) { __coutBase = 10; return ""; }
    if (val === showpos) { __coutShowPos = true; return ""; }
    if (val === noshowpos) { __coutShowPos = false; return ""; }

    if (val === "" || val === undefined || val === null) return "";

    let str = "";
    if (typeof val === 'number') {
        const treatAsFloat = isFloat !== undefined ? Boolean(isFloat) : !Number.isInteger(val);
        if (__coutBase === 16) {
            str = val.toString(16);
            if (__coutUppercase) str = str.toUpperCase();
        } else if (__coutBase === 8) {
            str = val.toString(8);
        } else if (__coutScientific && treatAsFloat) {
            str = val.toExponential(__coutPrecision !== null ? __coutPrecision : 6);
            if (__coutUppercase) str = str.toUpperCase();
            str = str.replace(/e([+-])(\\d)$/i, 'E$10$2');
        } else if (__coutPrecision !== null && treatAsFloat) {
            const eps = (val >= 0 ? 1 : -1) * 1e-11;
            str = Math.abs(val) < 1e-12 ? (0).toFixed(__coutPrecision) : (val + eps).toFixed(__coutPrecision);
        } else {
            str = String(val);
        }
        if (__coutShowPos && val > 0) {
            str = '+' + str;
        }
    } else {
        str = String(val);
    }

    if (__coutWidth > 0 && str.length < __coutWidth) {
        const padLen = __coutWidth - str.length;
        const padStr = __coutFill.repeat(padLen);
        if (__coutAlign === 'left') {
            str = str + padStr;
        } else if (__coutAlign === 'internal' && (str.startsWith('-') || str.startsWith('+'))) {
            str = str[0] + padStr + str.slice(1);
        } else {
            str = padStr + str;
        }
    }

    __coutWidth = 0;
    return str;
}

function printf(fmt, ...args) {
    let i = 0;
    const out = String(fmt).replace(/%(-?\\d*(?:\\.\\d+)?)?([dfsciuEe]|lf|lld|llu|ld|lu|%)/g, (m, spec, type) => {
        if (type === '%') return '%';
        const val = args[i++];
        if (val === undefined) return '';
        let str = '';
        if (type === 'E' || type === 'e') {
            const dec = spec && spec.includes('.') ? parseInt(spec.split('.')[1], 10) : 6;
            str = Number(val).toExponential(dec);
            if (type === 'E') str = str.toUpperCase();
            str = str.replace(/e([+-])(\\d)$/i, 'E$10$2');
        } else if (type === 'f' || type === 'lf') {
            const dec = spec && spec.includes('.') ? parseInt(spec.split('.')[1], 10) : 6;
            str = typeof val === 'number' ? val.toFixed(dec) : Number(val).toFixed(dec);
        } else {
            str = String(val);
        }

        if (spec) {
            const isZeroPad = spec.startsWith('0') && !spec.includes('-');
            const widthMatch = spec.match(/(-?\\d+)/);
            if (widthMatch) {
                const w = parseInt(widthMatch[1], 10);
                const absW = Math.abs(w);
                if (str.length < absW) {
                    const padChar = isZeroPad ? '0' : ' ';
                    const pad = padChar.repeat(absW - str.length);
                    str = w < 0 ? str + pad : (isZeroPad && (str.startsWith('-') || str.startsWith('+')) ? str[0] + pad + str.slice(1) : pad + str);
                }
            }
        }
        return str;
    });
    process.stdout.write(out);
}

${body}

if (typeof main === 'function') {
    main();
}
`;

    return {
        success: true,
        jsCode: wrappedJs,
    };
}
