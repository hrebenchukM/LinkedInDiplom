# Manual E2E checklist — LinkedInDiplom

**Prerequisites:** backend `http://localhost:5000` (`docker compose up -d`), frontend `npm run dev` → `http://localhost:5173`, mock auth **off** (`VITE_USE_MOCK_AUTH` unset or `false`). Copy `frontend/.env.example` → `.env.local` if proxy fails.

## Accounts

| Role | Email | Password |
|------|-------|------------|
| Admin | `admin@local.dev` | `Admin123!` |
| User A (demo Google) | `andrii.rotar@gmail.com` | `LinkUpDemo2024!` |
| User B | register new email or use second demo account |

---

## 1. Auth → Profile

- [ ] Open `/auth`, register new user OR login with email/password
- [ ] Optional: **Continue with Google** (demo fallback) → lands on `/home`
- [ ] Open `/profile` — profile loads from API
- [ ] Edit headline / bio → save → refresh → changes persist
- [ ] Upload avatar (if UI available) → image updates

## 2. Post (Feed)

- [ ] Login as User A → `/home`
- [ ] Create text post → appears in feed
- [ ] Add reaction (like) → count updates
- [ ] Add comment → visible under post
- [ ] Delete own post → removed from feed

## 3. Connect (Network)

- [ ] User A → `/network` → **Connections**
- [ ] Search / find User B → send connection request
- [ ] User B → accept request → both see each other in Connections
- [ ] Optional: `/network?section=events` → discover events → **Join** → **Attending** filter shows event

## 4. Apply (Vacancies)

- [ ] `/vacancies` — job list loads from API
- [ ] Open vacancy → **Apply** → success feedback
- [ ] Save to favorites (if available)

## 5. Chat (SignalR)

- [ ] User A → `/chat` — hub status **Online**
- [ ] Create/open chat with User B (`/chat?chatId=<guid>` if needed for second member)
- [ ] Send message → appears for sender
- [ ] User B receives message in realtime (second browser/incognito)
- [ ] Mark read / delete message works

## 6. Notifications

- [ ] Bell icon → list loads from `GET /api/notifications/me` (not hardcoded demo items)
- [ ] Click notification → navigates + marks read via `PATCH .../read`
- [ ] **Mark all read** clears unread badge
- [ ] API persists read state (refresh page → still read)

## 7. Admin (admin only)

- [ ] Login `admin@local.dev` → **Admin** link visible in header
- [ ] `/admin/dashboard` — stats cards load
- [ ] `/admin/users` — lock/unlock user, open drawer, add/remove role
- [ ] `/admin/content`, `/admin/comments`, `/admin/events`, `/admin/jobs`, `/admin/roles` — lists load

## 8. Non-admin guard

- [ ] Login as `andrii.rotar@gmail.com`
- [ ] `/admin/dashboard` → **403 Access denied**
- [ ] No **Admin** item in header menu

## 9. OAuth demo (optional)

- [ ] `/auth` without OAuth client IDs → Google button → demo account login
- [ ] See `docs/DEMO_SOCIAL_AUTH.md`

## 10. Production config (deploy)

- [ ] Build: `npm run build` in `frontend/`
- [ ] Set `VITE_API_BASE_URL` to API origin OR serve SPA + API same host
- [ ] Backend `Cors:AllowedOrigins` includes frontend URL (see `backend/Facade.API/appsettings.Production.json`)
- [ ] Browser console: no `[LinkedInDiplom config:mock-auth-in-prod]` error

---

**Pass criteria:** steps 1–8 complete without console errors; admin/non-admin behavior correct.
