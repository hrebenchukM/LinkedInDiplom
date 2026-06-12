# Frontend → Backend merge handoff

## What you are merging

A **Vite + React 19 SPA** under `frontend/`.  
Production entry: `frontend/index.html` → `frontend/src/main.jsx`.

---

## API integration (implemented)

| Area | Module | Notes |
|------|--------|-------|
| Auth | `src/features/auth/authApi.js` | register, login, refresh, logout, me |
| Profile | `src/features/profile/profileApi.js` | me, search, avatar, public profiles |
| Content / posts | `src/features/content/contentApi.js` | feed, CRUD, saved, reposts, hashtags, comments |
| Network | `src/features/network/*.js` | contacts, follows, pages, groups, blocks |
| Jobs | `src/features/jobs/jobsApi.js` | vacancies (paged), applications, favorites |
| Events | `src/features/events/eventsApi.js` | paged lists |
| Messaging | `src/features/messaging/messagingApi.js` | chats, messages |
| Notifications | `src/features/notifications/notificationsApi.js` | list, mark read |
| Professional | `src/features/professional/professionalApi.js` | skills, languages, academies, education |

**HTTP layer:** `src/shared/api/http.js` (`apiFetch`, reactive refresh on 401)  
**Paths:** `src/shared/api/paths.js`  
**Client:** `src/shared/api/client.js` — throws on error; POST/PATCH/PUT/DELETE show global banner by default

**Paging:** `src/shared/lib/pagedResponse.js`

- `unwrapPagedResponse(data, mapItem)` → full `PagedResponse`
- `unwrapPagedItems(data, mapItem)` → `items[]` only (handles plain arrays too)

Used across all `*Api.js` modules that return lists.

---

## Auth & tokens

**localStorage keys:**

- `authAccessToken` — `Authorization: Bearer …`
- `authRefreshToken` — logout + proactive/reactive refresh
- `authTokenExpiresAt` — ISO expiry from login/refresh `token.expiresAt` or JWT `exp`

**Session (React):** `AuthContext` → `{ isAuthenticated, user }`  
**Roles:** `src/shared/lib/jwtClaims.js` — parses `Admin` / `User` from JWT; `user.isAdmin` on session

**Token refresh:**

1. **Reactive** — `http.js` retries once after `POST /api/auth/refresh` on 401
2. **Proactive** — `tokenRefreshScheduler.js` refreshes ~60s before `expiresAt`; started on login and app bootstrap

**Production env** (`frontend/.env.production`):

```env
VITE_USE_MOCK_AUTH=false
VITE_ENABLE_GUEST=false
```

`features.js` also hard-disables mock auth when `import.meta.env.PROD`.

---

## Global API feedback

- `src/shared/ui/ApiFeedbackBanner.jsx` — fixed top banner (mounted in `AppProviders`)
- `showApiFeedback(message)` from `src/shared/lib/apiFeedback.js`
- `auth:expired` event → “Session expired…” before redirect to `/auth`
- Page-level loaders may use `LoadStatus.jsx` for inline errors + retry

`apiClient` shows the banner automatically on failed **mutations** (POST/PATCH/PUT/DELETE).  
Pass `{ feedback: false }` as the last argument to suppress; `{ feedback: true }` on GET to force.

---

## Demo / dev-only

| Flag | Purpose |
|------|---------|
| `VITE_USE_MOCK_AUTH=true` | Offline in-browser auth (dev only) |
| `VITE_ENABLE_GUEST=true` | Guest button on auth screen |
| `VITE_DEV_PROXY_TARGET` | Vite proxy target (default Docker `:5000`) |

Dev API startup seeds demo bot posts when `ASPNETCORE_ENVIRONMENT=Development`.

---

## Run locally against Facade.API

```bash
# Terminal 1 — Docker
docker compose up -d

# Terminal 2
cd frontend
cp .env.example .env.local
npm ci
npm run dev
```

Open `http://localhost:5173`.

| Backend | `.env.local` |
|---------|----------------|
| Docker `:5000` | `VITE_DEV_PROXY_TARGET=http://localhost:5000`, empty `VITE_API_BASE_URL` |
| `dotnet run` `:5282` | `VITE_DEV_PROXY_TARGET=http://localhost:5282` |

---

## Production static hosting

```bash
npm run build   # → frontend/dist/
```

Set `VITE_API_BASE_URL` at **build time** if API is on another host.

Facade.API does not serve the SPA by default — use nginx/CDN or `wwwroot` + SPA fallback.

---

## Acceptance checklist

1. `npm ci && npm run build` — success  
2. Register / login → `authAccessToken` + `authTokenExpiresAt` in localStorage  
3. Reload → still logged in (`GET /api/auth/me`)  
4. Wait until near token expiry → silent refresh (no logout)  
5. Logout → tokens cleared, redirect to `/auth`  
6. Home feed loads posts from `GET /api/content/feed` (not local mocks)  
7. Do not commit `node_modules/`, `dist/`, `.env.local`

---

## File map

```
frontend/src/
  features/auth/
    authApi.js, AuthContext.jsx, mapAccount.js
  shared/api/
    http.js, client.js, tokens.js, tokenRefreshScheduler.js, paths.js
  shared/lib/
    pagedResponse.js, jwtClaims.js, apiFeedback.js, apiError.js
  shared/ui/
    ApiFeedbackBanner.jsx, LoadStatus.jsx
  app/providers/AppProviders.jsx
```
