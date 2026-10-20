# Deployment Guide

## Local development
1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and adjust values if needed.
3. Start the application: `npm run dev`
4. Open `http://localhost:5173`

The frontend runs on Vite and proxies `/api` requests to the Express server on port 3001.

## Production build
1. Run `npm run build`
2. Deploy the static frontend bundle from `dist/` with a Node-compatible host or CDN.
3. Run the API process with `npm run server` or via a process manager such as PM2.

## Environment variables
- PORT: API server port
- VITE_API_URL: public base URL for the API, if your deployment uses a separate host

## Operational guidance
- Keep the API behind HTTPS in production.
- Use environment-specific secrets and a reverse proxy when exposing the app publicly.
- Do not store raw shared-screen captures or recordings by default.
