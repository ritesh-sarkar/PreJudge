# PreJudge Dedicated Execution Service (Render)

This is the standalone, containerized code execution service for PreJudge. It runs as a Render Web Service to securely compile and execute untrusted competitive programming code in an isolated environment.

## Supported Languages & Compilers

- **C++20**: `g++ -O2 -std=c++20 -DONLINE_JUDGE -fno-asm -Wall`
- **C17**: `gcc -O2 -std=c17 -DONLINE_JUDGE -fno-asm -Wall`
- **Python 3**: `python3 -m py_compile` & `python3 -u`
- **JavaScript**: `node --check` & `node`
- **Java 17**: OpenJDK 17 `javac` & `java -Xmx256m -Xss64m`

## API Endpoints

### 1. `GET /health`
Confirms the service is running and returns basic status.
```json
{
  "status": "ok",
  "service": "prejudge-execution-service",
  "version": "1.0.0",
  "uptime": 42,
  "timestamp": "2026-10-13T12:00:00.000Z",
  "secured": true
}
```

### 2. `POST /execute`
Executes user code against test cases with deterministic comparison.

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <EXECUTION_SERVICE_TOKEN>` (optional, required if token is set)

**Request Body:**
```json
{
  "language": "cpp20",
  "sourceCode": "#include <iostream>\nint main() { int a, b; std::cin >> a >> b; std::cout << \"X = \" << (a + b) << \"\\n\"; return 0; }",
  "tests": [
    {
      "id": 1,
      "input": "10\n9\n",
      "expected": "X = 19\n",
      "reason": "Sample 1"
    }
  ],
  "timeoutMs": 3000
}
```

**Response Body:**
```json
{
  "success": true,
  "data": {
    "status": "all_tests_passed",
    "compilation": {
      "status": "passed",
      "compiler": "G++ (C++20)"
    },
    "execution": {
      "totalTests": 1,
      "passed": 1,
      "failed": 0,
      "totalTimeMs": 14,
      "slowestTimeMs": 14
    },
    "tests": [
      {
        "id": 1,
        "status": "passed",
        "reason": "Sample 1",
        "input": "10\n9\n",
        "expected": "X = 19\n",
        "actual": "X = 19\n",
        "timeMs": 14
      }
    ]
  }
}
```

## Render Deployment Instructions

1. On Render Dashboard, click **New +** > **Web Service**.
2. Connect your Git repository.
3. Configure the settings:
   - **Name**: `prejudge-execution-service`
   - **Root Directory**: `sandbox`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile` (relative to root directory `sandbox`) or `./sandbox/Dockerfile`
   - **Instance Type**: Free or Starter
4. Set Environment Variables:
   - `PORT`: `8080` (or leave default, Render sets this)
   - `EXECUTION_SERVICE_TOKEN`: `<your-random-secure-secret-token>`
   - `NODE_ENV`: `production`
5. Click **Create Web Service**.
6. Copy the URL (e.g. `https://prejudge-execution.onrender.com`).
7. In your Vercel project settings, set:
   - `EXECUTION_SERVICE_URL=https://prejudge-execution.onrender.com`
   - `EXECUTION_SERVICE_TOKEN=<your-random-secure-secret-token>`
