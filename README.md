# PreJudge — Full-Stack Competitive Programming Pre-Submission Checker

> **"Test your code before the judge does."**
> 
> AI-assisted competitive-programming pre-submission checker. Real C++20 sandbox execution, deterministic output verification, and token-optimized Gemini reasoning.

---

## 1. What PreJudge Is

**PreJudge** is a full-stack developer platform designed specifically for competitive programmers preparing submissions for platforms like beecrowd, Codeforces, and AtCoder. 

A user inputs a competitive programming problem ID, selects the target language (C++20 in V1), and provides their solution. PreJudge:
1. Resolves and caches the problem constraints, input/output requirements, and sample cases.
2. Synthesizes high-value boundary and edge tests.
3. Compiles the code with **real G++ (`-std=c++20 -O2`)** inside an isolated sandbox.
4. Executes the binary against each test case with strict timeouts (2000ms), output size limits, and memory isolation.
5. Deterministically compares the outputs (handling CRLF, whitespace, and formatting).
6. Calls **Google Gemini** for concise post-execution diagnostics and complexity analysis.

### Core Architectural Principle
```text
           PREJUDGE
      Gemini = Brain (Reasoning)
             |
             v
      Backend = Judge (Deterministic Authority)
             |
             v
      Sandbox = Hands (Real G++ Execution)
```

**PreJudge will NEVER falsely claim your code is "Accepted".** The platform clearly distinguishes between deterministic sandbox execution results, AI-generated reasoning, and official online judge hidden test sets.

---

## 2. Features

- **Problem Understanding**: Automatically parses problem statements, constraints, and sample inputs/outputs.
- **Isolated C++20 Sandbox**: Compiles with `g++ -O2 -std=c++20 -DONLINE_JUDGE` with execution timeouts and automatic workspace wiping.
- **Deterministic Comparator**: Normalizes CRLF, trims line whitespace, preserves semantic tokens, and pinpoints exact line discrepancies.
- **Token-Optimized Gemini 3**: Minimizes LLM token consumption via strict structured JSON schemas and conditional AI reviews (only analyzing failed tests).
- **MongoDB Caching Layer**: Caches problem specifications to avoid redundant API requests. Includes resilient in-memory fallback.
- **Monaco Code Editor**: Professional dark-themed C++ editor with line numbers, bracket pair colorization, keyboard shortcuts (`Ctrl+Enter` to run), and starter templates.
- **Stateless & Anonymous**: No accounts, logins, or localStorage tracking. Every run is clean and private.
- **Early Termination & Resource Protection**: Aborts upon compilation failure, isolates memory, and prevents loop hangs.

---

## 3. Technology Stack

- **Frontend**: Next.js 15+ (App Router), React, JavaScript only (`.js`, `.jsx`), Tailwind CSS, Framer Motion, Monaco Editor (`@monaco-editor/react`), Lucide React.
- **Backend**: Next.js Server-Side Route Handlers, Node.js runtime, MongoDB native driver.
- **AI Reasoning**: Google Gemini API (`@google/genai`), `gemini-3.8-flash` model with schema enforcement.
- **Code Execution**: G++ 12+ (C++20 standard), Linux isolated workspace & Docker container runner.

---

## 4. Local Setup & Quickstart

### Prerequisites
- Node.js 18+ or 20+
- G++ with C++20 support (`sudo apt install g++` or `brew install gcc`)
- (Optional) Docker & MongoDB for containerized environments

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd prejudge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Run backend unit tests
npm test

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Environment Variables

Create a `.env.local` file with the following variables:

```env
# Gemini API Key (Server-only secret accessed via process.env)
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Connection String (Optional: gracefully falls back to in-memory store if omitted)
MONGODB_URI=mongodb://localhost:27017/prejudge
MONGODB_DB_NAME=prejudge

# Sandbox Limits
SANDBOX_TIMEOUT_MS=2000
MAX_CODE_SIZE_BYTES=65536
```

---

## 6. Docker Sandbox Setup

To run PreJudge with Docker and isolated containerized sandbox execution:

```bash
# Start Next.js and MongoDB services via Docker Compose
docker compose up --build -d
```

### Standalone Sandbox Container (`sandbox/Dockerfile`)
The repository includes a dedicated sandbox Docker image for locked-down container execution:
```bash
docker build -t prejudge-sandbox -f sandbox/Dockerfile .
```
Features of the sandbox image:
- Non-root user (`sandboxuser`)
- No internet access (`--network none`)
- Read-only root filesystem with temporary `/tmp` mount
- 64MB memory limit, 1 CPU core limit

---

## 7. API Documentation

### `POST /api/analyze`
Submits code for problem resolution, sandbox execution, and AI review.

#### Request Body
```json
{
  "problemId": "1001",
  "language": "cpp20",
  "code": "#include <iostream>\nusing namespace std;\nint main() { int a, b; if (cin >> a >> b) cout << \"X = \" << (a+b) << \"\\n\"; return 0; }"
}
```

#### Response (Success)
```json
{
  "success": true,
  "data": {
    "analysisId": "pj_1738495839",
    "status": "all_tests_passed",
    "problem": {
      "id": "1001",
      "title": "Extremely Basic"
    },
    "compilation": {
      "status": "passed",
      "compiler": "g++ (C++20)"
    },
    "execution": {
      "totalTests": 5,
      "passed": 5,
      "failed": 0,
      "totalTimeMs": 18,
      "slowestTimeMs": 6
    },
    "tests": [
      {
        "id": 1,
        "status": "passed",
        "reason": "Sample Case",
        "isAiDerived": false,
        "input": "10\\n9\\n",
        "expected": "X = 19",
        "actual": "X = 19",
        "timeMs": 4
      }
    ],
    "aiReview": {
      "summary": "Solution passed all generated deterministic test cases.",
      "issues": [],
      "edgeCases": ["Boundary constraints", "Maximum integer ranges"],
      "complexity": { "time": "O(1)", "space": "O(1)" },
      "suggestion": "Inspect edge cases and verify against hidden judge corner cases."
    }
  }
}
```

### `GET /api/problems?id=1001`
Retrieves or preloads problem specifications from cache.

### `GET /api/health`
Health check endpoint reporting app, database, and sandbox compiler status.

---

## 8. Token Optimization Strategy

To ensure zero token waste and cost efficiency:
1. **MongoDB Cache First**: Problem IDs are cached once resolved. Subsequent runs make 0 problem extraction calls.
2. **Strict Schema Constraints**: Requests use `responseSchema` with compact JSON output, preventing verbose prose.
3. **Truncated Context**: AI reviews receive only failed test samples (max 3), not the entire test suite.
4. **Early Exit**: If G++ compilation fails, tests are skipped and Gemini receives only the compiler error.

---

## 9. Limitations & Honesty Pledge

- **No False Guarantees**: Passing PreJudge does not guarantee AC on hidden official judge tests.
- **Language Scope**: C++20 is the fully active production compiler for V1.
- **Time Limits**: Standard pre-submission test limit is 2000ms per test case.

---

## 10. License

MIT. Built for competitive programmers worldwide.
