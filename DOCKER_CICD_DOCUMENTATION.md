# Attendance Management Frontend: Dockerization & CI/CD Documentation

## 1. Executive Summary

This document provides a technical overview of the containerization and automated CI/CD pipeline implemented for the **Attendance Management Frontend** repository (`Gowthami-LP/attendance-management-frontend`).

The application is a Single Page Application (SPA) built with **React 19**, **TypeScript**, and **Vite**. It is containerized using a multi-stage Docker build and deployed through an automated GitHub Actions CI/CD pipeline that delivers production container images to **GitHub Container Registry (GHCR)**.

---

## 2. Architecture Overview

- **Code Repository**: GitHub (`origin/master`)
- **Continuous Integration (CI)**: GitHub Actions runner executing unit tests (`vitest`), linter (`eslint`), and production compilation (`vite build`).
- **Continuous Delivery (CD)**: Automated Docker Buildx multi-stage build, pushing images to GitHub Container Registry (`ghcr.io/gowthami-lp/attendance-management-frontend`).
- **Runtime Environment**: `nginx:alpine` serving static SPA assets with custom routing, gzip compression, security headers, and health checks.

---

## 3. Containerization Implementation

### 3.1 Multi-Stage Dockerfile (`Dockerfile`)

- **Stage 1 (Builder - `node:22-alpine`)**:
  - Installs npm dependencies using `npm ci` based on `package-lock.json` for deterministic builds.
  - Supports build argument `ARG VITE_API_BASE_URL` (default: `/backend-api`) to configure the backend URL at build time.
  - Compiles the optimized production bundle with `npm run build`.

- **Stage 2 (Runner - `nginx:alpine`)**:
  - Replaces default Nginx files with compiled assets from `/app/dist`.
  - Injects custom `nginx.conf`.
  - Adds a container `HEALTHCHECK` hitting `/health`.
  - Exposes port `80`.

### 3.2 Production Nginx Configuration (`nginx.conf`)

1. **SPA Fallback Routing**:
   ```nginx
   location / {
       try_files $uri $uri/ /index.html;
   }
   ```
   Ensures React Router client-side routes (e.g. `/dashboard`, `/login`) do not result in `404 Not Found` when accessed directly or refreshed.
2. **Gzip Compression**: Compresses text, CSS, JavaScript, JSON, and SVG assets.
3. **Immutable Caching**: 1-year cache headers for static Vite assets in `/assets/`.
4. **Security Headers**: Includes `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `X-XSS-Protection`, and `Referrer-Policy`.
5. **Healthcheck Endpoint**: `/health` returns `HTTP 200` with `healthy`.

### 3.3 Build Context Optimization (`.dockerignore`)

Excludes `node_modules`, `dist`, `venv`, `.git`, `.github`, environment files (`.env`), and logs to keep the Docker context small and build times fast.

### 3.4 Local Docker Compose (`docker-compose.yml`)

- Runs the frontend container on host port `3000` (mapped to container port `80`).
- Configures health checks and restart policies.

---

## 4. GitHub Actions CI/CD Pipeline (`.github/workflows/frontend-ci.yml`)

### 4.1 Trigger Conditions & Permissions
- **Triggers**: Pushes to `main`/`master`, release tags (`v*`), pull requests to `main`/`master`, and manual trigger (`workflow_dispatch`).
- **Permissions**: `contents: read`, `packages: write`.

### 4.2 Pipeline Jobs
1. **`ci-checks` (Continuous Integration)**:
   - Sets up Node.js 22 with npm cache.
   - Runs `npm ci`.
   - Runs `npm run test` (Vitest).
   - Runs `npm run lint` (ESLint).
   - Runs `npm run build` (TypeScript check & Vite bundle).
2. **`docker-cd` (Continuous Delivery)**:
   - Executes only if `ci-checks` succeeds.
   - Sets up Docker Buildx.
   - Authenticates with GitHub Container Registry using `${{ secrets.GITHUB_TOKEN }}` (no external secrets required).
   - Extracts Docker metadata and tags (`latest`, short commit SHA, branch name).
   - Builds and pushes the image with GitHub Actions layer cache (`cache-from/cache-to: type=gha`).

---

## 5. Troubleshooting & Root Cause Analysis

### 5.1 Issue Observed
On initial push, GitHub Actions showed:
> *"This workflow graph cannot be shown. A graph will be generated the next time this workflow is run."*
The run failed immediately with 0 executed jobs.

### 5.2 Root Cause
In GitHub Actions workflow syntax, `secrets` cannot be referenced directly in an `if:` conditional (`if: ${{ secrets.DOCKERHUB_USERNAME != '' ... }}`). GitHub Actions rejected the workflow schema before jobs could be scheduled.

### 5.3 Resolution
- Corrected `.github/workflows/frontend-ci.yml` and validated it with `actionlint`.
- Committed and pushed commit `6c00e94`.
- **Result**: Run **#38231686504** completed with **100% success** (both CI and CD jobs passed).

---

## 6. Verification Results

| Check | Command | Status |
| :--- | :--- | :---: |
| Unit Tests | `npm run test` | :white_check_mark: Passed |
| Code Linting | `npm run lint` | :white_check_mark: Passed |
| Docker Build | `docker build -t attendance-frontend .` | :white_check_mark: Passed |
| Local Container | `docker compose up -d` | :white_check_mark: Passed (Healthy) |
| Root Route | `curl -i http://localhost:3000/` | :white_check_mark: HTTP 200 OK |
| Health Route | `curl -i http://localhost:3000/health` | :white_check_mark: HTTP 200 OK |
| SPA Fallback | `curl -i http://localhost:3000/dashboard` | :white_check_mark: HTTP 200 OK |
| Remote CI/CD Run | Run #38231686504 | :white_check_mark: Success |

---

## 7. Command Cheat Sheet

```sh
# Start local containerized frontend
docker compose up -d

# View live container logs
docker compose logs -f

# Stop container
docker compose down

# Run with Vite development server (HMR on port 5173)
npm run dev

# Run tests locally
npm run test

# Run linting locally
npm run lint
```
