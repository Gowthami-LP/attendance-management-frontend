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
