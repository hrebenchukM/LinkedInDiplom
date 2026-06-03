# Frontend → Backend merge handoff

## What you are merging

A **Vite + React 19 SPA** under `frontend/`.  
Production entry: `frontend/index.html` → `frontend/src/main.jsx`.

There is **no** secondary app in this folder (legacy `pages/` / `shared/` removed).

---

## API integration (implemented)

| Endpoint | Module | Notes |
|----------|--------|-------|
| `POST /api/auth/register` | `src/features/auth/authApi.js` | Body: `{ email, password }` only |
| `POST /api/auth/login` | same | Stores JWT, then hydrates session |
| `GET /api/auth/me` | same | Called on app bootstrap if `authAccessToken` exists |
| `POST /api/auth/logout` | same | Sends `{ refreshToken }` on logout |
| `POST /api/auth/refresh` | same | Exported, not used in UI yet |

**HTTP layer:** `src/shared/api/http.js` (`apiFetch`)  
**Paths:** `src/shared/api/paths.js`  
**Authenticated client:** `src/shared/api/client.js` (`apiClient.get/post/...`, throws on error)

**Tokens (localStorage):**

- `authAccessToken` — sent as `Authorization: Bearer …`
- `authRefreshToken` — used on logout

**Session (React):**

- `authSession` — `{ isAuthenticated, user }` (AuthContext only)
- `registeredAccount` — extra UI fields (name, avatar) until `PUT /api/profile/me`

---

## Not implemented (intentional for v1 merge)

These screens use **local demo data** (`src/shared/constants/mockData.js` + `localStorage`):

- Home feed, Network, Chat, Vacancies, Profile editor

Flag: `UI_USES_LOCAL_DEMO_DATA` in `src/shared/config/features.js`.

Next integration step for backend team: replace store loaders with `apiClient` calls module by module.

---

## Auth UI behaviour

| Flow | Backend API | Notes |
|------|-------------|--------|
| Email register/login | ✅ `POST /api/auth/*` | Production path |
| Google / Facebook buttons | ❌ UI demo only | Local mock session; real OAuth needs `ProviderToken` → `/api/auth/google` or `/facebook` |
| Guest | ❌ by default | `VITE_ENABLE_GUEST=true` for demo without JWT |

`VITE_USE_MOCK_AUTH=true` — full offline auth without API.

---

## Run locally against Facade.API

```bash
# Terminal 1
cd backend/Facade.API && dotnet run

# Terminal 2
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:5173`.

| Backend | `.env.local` |
|---------|----------------|
| `http://localhost:5282` (http profile) | leave `VITE_API_BASE_URL` empty (Vite proxy) |
| `https://localhost:7011` | `VITE_API_BASE_URL=https://localhost:7011` |
| Docker `:5000` | `VITE_API_BASE_URL=http://localhost:5000` |

---

## Production static hosting

Build: `npm run build` → `frontend/dist/`.

Facade.API does **not** serve SPA today. After merge, either:

1. Copy `dist/` to `wwwroot` + `MapFallbackToFile("index.html")`, or  
2. Serve SPA from nginx/CDN and proxy `/api` to the API.

Set `VITE_API_BASE_URL` at **build time** if API is on another host.

---

## Acceptance checklist

1. `npm ci && npm run build` — success  
2. Register new user → `authAccessToken` in localStorage  
3. Reload page → still logged in (`GET /api/auth/me` succeeds)  
4. Logout → token cleared, redirect to `/auth`  
5. Do not commit `node_modules/`, `dist/`, `.env.local`

---

## File map for backend developers

```
frontend/src/
  features/auth/
    authApi.js       ← all /api/auth calls
    AuthContext.jsx  ← session, bootstrap, logout
    mapAccount.js    ← AccountDto → UI user
  shared/api/
    http.js          ← fetch + Bearer
    client.js        ← apiClient for future modules
    paths.js         ← route constants
  pages/             ← UI (mostly demo data today)
```
