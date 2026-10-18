# Attendance Management Frontend

React, TypeScript, and Vite interface for the Attendance Management API.

## Local development

1. Start the FastAPI backend at `http://127.0.0.1:8000`.
2. Install frontend dependencies with `npm install`.
3. Run `npm run dev` and open the URL printed by Vite.

Vite proxies requests from `/backend-api` to the local backend, avoiding browser CORS requirements during development. To use another backend in development, set `VITE_API_BASE_URL` in a local `.env` file. The `.env.example` value uses the local proxy.

For production builds, set `VITE_API_BASE_URL` to the deployed API origin or a same-origin reverse-proxy path. Configure the backend's CORS policy if the browser will call a different origin directly.

## Authentication

Sign-in uses the backend admin email/password endpoint and bearer token. The token is held in memory and is not written to browser storage; a page refresh requires signing in again. A `401` response clears the current frontend session. Backend authorization remains the security boundary.

## Checks

```sh
npm run test
npm run lint
npm run build
```

## Docker

### Build and Run with Docker

1. **Build image**:
   ```sh
   docker build -t attendance-frontend .
   ```

   To specify a custom backend API URL during build:
   ```sh
   docker build --build-arg VITE_API_BASE_URL=https://api.yourdomain.com -t attendance-frontend .
   ```

2. **Run container**:
   ```sh
   docker run -d -p 3000:80 --name attendance-frontend attendance-frontend
   ```
   Open `http://localhost:3000` in your browser.

### Run with Docker Compose

Start the backend Compose stack first so the API is available on host port 8000. Then start the frontend from this repository:

```sh
docker compose up -d --build
```

Open `http://localhost:3000`. Nginx forwards `/backend-api/` requests to the backend at `http://host.docker.internal:8000`, so the browser uses the same origin and does not need a separate CORS configuration.
To stop the container:
```sh
docker compose down
```

## CI/CD Pipeline (GitHub Actions)

The repository includes an automated CI/CD pipeline configured at `.github/workflows/frontend-ci.yml`:

1. **Continuous Integration (CI)**:
   - Triggers on `push` and `pull_request` to `master` and `main`.
   - Runs `npm ci`, Vitest tests (`npm run test`), ESLint (`npm run lint`), and production build (`npm run build`).

2. **Continuous Delivery (CD)**:
   - On pushes to `master`/`main` or release tags (`v*`), builds the multi-stage Docker container with layer caching.
   - Pushes automatically to **GitHub Container Registry (GHCR)**:
     ```
     ghcr.io/<owner>/attendance-management-frontend:latest
     ```
   - *(Optional)* If `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are configured in your repository secrets, it also pushes to Docker Hub.

