# PreJudge Deployment Guide: Vercel + Render

This guide outlines the production deployment architecture for PreJudge, decoupling the Next.js application (hosted on Vercel) from the isolated code execution service (hosted on Render).

---

## Architecture Overview

```
                                      +-------------------------------+
                                      |   End User (Web Browser)      |
                                      +---------------+---------------+
                                                      | 
                                                      v
                                      +-------------------------------+
                                      |     Vercel (Next.js 15 App)   |
                                      |  - UI, Monaco Code Editor     |
                                      |  - Problem Spec & Test Suites |
                                      |  - Gemini AI Code Review      |
                                      +---------------+---------------+
                                                      |
                                                      |  POST /execute
                                                      |  (Bearer Token)
                                                      v
                                      +-------------------------------+
                                      |   Render (Execution Service)  |
                                      |  - Docker Container (Node.js) |
                                      |  - Native G++ 20, GCC 17      |
                                      |  - Python 3, OpenJDK 17       |
                                      |  - Unprivileged Sandbox User  |
                                      |  - Output & Timeout Guards    |
                                      +-------------------------------+
```

---

## 1. Deploying the Execution Service to Render

The execution service resides in the `sandbox/` directory and compiles/runs C++20, C17, Python 3, JavaScript, and Java.

### Option A: Using Render Web Service (Manual)
1. Log in to [Render](https://dashboard.render.com).
2. Click **New +** > **Web Service**.
3. Select your Git repository.
4. Set the following configuration:
   - **Name**: `prejudge-execution-service`
   - **Region**: Any region (e.g., Oregon or Frankfurt)
   - **Root Directory**: `sandbox`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `./Dockerfile` (relative to Root Directory `sandbox`) or leave default
   - **Instance Type**: Free or Starter
5. Under **Environment Variables**, add:
   - `PORT`: `8080` (or leave as Render defaults)
   - `EXECUTION_SERVICE_TOKEN`: `<generate-a-secure-random-string>`
   - `NODE_ENV`: `production`
6. Click **Create Web Service**.
7. Once deployed, verify your service is alive by visiting:
   ```
   https://<your-render-subdomain>.onrender.com/health
   ```
   It should return:
   ```json
   { "status": "ok", "service": "prejudge-execution-service", ... }
   ```

### Option B: Using Render Blueprint (`render.yaml`)
1. In Render, select **New +** > **Blueprint**.
2. Select your repository. Render will automatically detect `render.yaml` at the root and provision the service with an auto-generated `EXECUTION_SERVICE_TOKEN`.

---

## 2. Deploying the Main Next.js Application to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project** and import your PreJudge repository.
3. Configure the **Environment Variables** in Vercel:
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `EXECUTION_SERVICE_URL`: The Render service URL (e.g., `https://prejudge-execution.onrender.com`).
   - `EXECUTION_SERVICE_TOKEN`: The exact secret token configured in Render.
   - `NEXT_PUBLIC_APP_URL`: Your Vercel production domain (e.g. `https://prejudge.vercel.app`).
4. Click **Deploy**.

---

## 3. Local Development

You can run PreJudge locally in two ways:

### Method 1: Hybrid / Standalone Next.js
Without configuring `EXECUTION_SERVICE_URL`, PreJudge automatically uses its built-in local execution engine with transpilation fallback for environments without `g++`:
```bash
npm install
npm run dev
```

### Method 2: Docker Compose (Full Stack)
To run both the Next.js app and the Render-like execution container locally:
```bash
docker compose up --build
```
- Web Application: `http://localhost:3000`
- Execution Service: `http://localhost:8080`

---

## 4. Security Architecture

1. **Unprivileged Execution**: User processes run under an unprivileged `sandboxuser` account (`uid 1001`).
2. **Ephemeral File Isolation**: Each submission executes inside a dedicated temporary folder (`0700` permissions) cleaned up in a `finally` block.
3. **Environment Sanitization**: User programs only receive `PATH` and `LANG`; all server environment variables, tokens, and credentials are kept out of child processes.
4. **Hard Limits**:
   - Max output buffer: 128KB (process is terminated if exceeded).
   - Max compilation timeout: 10s.
   - Max execution timeout: 3s (configurable up to 8s).
   - Max source code size: 64KB.
   - Max test cases: 50.
5. **No Shell Interpolation**: Processes are spawned with argument arrays (`spawn`), preventing command injection.
