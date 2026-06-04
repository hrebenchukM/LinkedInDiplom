# Frontend SPA (React + Vite)

**Backend merge:** read [`HANDOFF_FOR_BACKEND.md`](./HANDOFF_FOR_BACKEND.md).

## Structure

```
src/
  features/auth/     authApi.js, AuthContext.jsx  ← real /api/auth integration
  shared/api/        http.js, client.js, paths.js
  shared/config/     feature flags
  pages/             UI (demo data except auth)
```

## Quick start

```bash
cp .env.example .env.local
npm ci
npm run dev
```

API on `http://localhost:5282`: leave `VITE_API_BASE_URL` empty (Vite proxy).

## Build

```bash
npm run build
```

Output: `dist/` (do not commit).

## Demo mode (no backend)

```env
VITE_USE_MOCK_AUTH=true
VITE_ENABLE_GUEST=true
```
