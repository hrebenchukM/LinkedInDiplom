# 06. API Overview

> Каталог всех HTTP endpoints backend. **56 controllers**, ~200+ actions.  
> Детальные примеры запросов — [api/POSTMAN_TESTING.md](api/POSTMAN_TESTING.md).

---

## Conventions

| Symbol | Meaning |
|--------|---------|
| ✓ | `[Authorize]` — JWT required |
| Admin | `[Authorize(Roles = "Admin")]` |
| — | Public (anonymous OK; some accept optional JWT) |

**Base URL:** `http://localhost:5000` or `https://localhost:7011`

**Auth header:** `Authorization: Bearer <accessToken>`

**Pagination query:** `page`, `pageSize` (defaults vary; max ~100)

**Error responses:**
- 400 — validation (`fieldErrors`) or business rule
- 401 — missing/invalid JWT
- 403 — insufficient role
- 404 — entity not found
- 409 — conflict (duplicate, invalid state)
- 500 — unhandled exception

---

## Module index

| Prefix | Doc section | Controllers |
|--------|-------------|-------------|
| `/api/auth` | [Auth](#auth-apiauth) | 1 |
| `/api/profile` | [Profile](#profile-apiprofile) | 4 |
| `/api/content` | [Content](#content-apicontent) | 9 |
| `/api/network` | [Network](#network-apinetwork) | 9 |
| `/api/messaging` | [Messaging](#messaging-apimessaging) | 5 |
| `/api/jobs` | [Jobs](#jobs-apijobs) | 5 |
| `/api/events` | [Events](#events-apievents) | 5 |
| `/api/professional` | [Professional](#professional-apiprofessional) | 8 |
| `/api/notifications` | [Notifications](#notifications-apinotifications) | 2 |
| `/api/admin` | [Admin](#admin-apiadmin) | 7 |
| `/api/ai` | [AI](#ai-apiai) | 1 |
| `/hubs/messaging` | [18_SIGNALR_CHAT.md](18_SIGNALR_CHAT.md) | Hub |

---

## Auth (`/api/auth`)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | — | Register new user |
| POST | `/login` | — | Login → JWT |
| POST | `/google` | — | Google external login |
| POST | `/facebook` | — | Facebook external login |
| POST | `/refresh` | — | Refresh access token |
| POST | `/logout` | — | Revoke refresh token |
| GET | `/me` | ✓ | Current account |

Details: [05_API_AUTH_JWT.md](05_API_AUTH_JWT.md)

---

## Profile (`/api/profile`)

| Method | Route | Auth |
|--------|-------|------|
| GET | `/me` | ✓ |
| PUT/PATCH | `/me` | ✓ |
| GET | `/search` | — |
| GET | `/{userId}` | — |
| POST | `/me/avatar` | ✓ (multipart) |
| POST | `/me/header` | ✓ (multipart) |
| DELETE | `/me/avatar` | ✓ |
| DELETE | `/me/header` | ✓ |
| POST | `/{profileOwnerId}/views` | — (optional JWT) |
| GET | `/me/profile-views` | ✓ |
| GET/PUT/PATCH | `/me/message-settings` | ✓ |

---

## Content (`/api/content`)

| Method | Route | Auth |
|--------|-------|------|
| POST | `/me/posts` | ✓ |
| GET | `/me/posts` | ✓ (paged) |
| GET | `/users/{userId}/posts` | — (paged) |
| GET | `/feed` | — (paged; network-aware with JWT) |
| GET | `/posts/{postId}` | ✓ |
| PATCH/DELETE | `/me/posts/{postId}` | ✓ |
| POST/GET/DELETE | `/me/posts/{postId}/media` | ✓ |
| POST/GET/PATCH/DELETE | `/posts/{postId}/comments`, `/me/comments/{id}` | ✓ |
| PUT/DELETE/GET | `/posts/{postId}/reactions` | ✓ |
| POST | `/me/media`, `/me/media/upload` | ✓ |
| GET | `/media/{mediaId}` | ✓ |
| GET/POST | `/hashtags`, `/me/posts/{id}/hashtags` | ✓ (POST hashtags Admin) |
| POST/DELETE/GET | `/me/posts/{id}/mentions` | ✓ |
| POST/DELETE/GET | `/me/posts/{id}/repost`, `/me/reposts` | ✓ |
| POST/DELETE/GET | `/me/posts/{id}/save`, `/me/saved-posts` | ✓ |
| POST/GET | `/posts/{postId}/views` | ✓ |

---

## Network (`/api/network`)

| Method | Route | Auth |
|--------|-------|------|
| POST/GET/PATCH/DELETE | `/me/contacts/*` | ✓ (paged lists) |
| GET | `/me/contacts/pending-counts` | ✓ |
| POST/DELETE/GET | `/me/following`, `/me/followers` | ✓ |
| POST/DELETE/GET | `/me/blocked-users` | ✓ |
| POST/GET/PATCH/DELETE | `/me/groups/{id}` | ✓ |
| POST | `/me/groups/{id}/avatar` | ✓ (multipart) |
| POST/DELETE/GET | `/me/groups/{id}/members`, `/join` | ✓ |
| POST/DELETE/GET | `/me/groups/{id}/posts` | ✓ |
| POST/GET/PATCH/DELETE | `/me/pages/{id}` | ✓ |
| POST | `/me/pages/{id}/logo` | ✓ (multipart) |
| POST/DELETE/GET | `/me/pages/{id}/admins` | ✓ |
| POST/DELETE/GET | `/me/pages/{id}/follow` | ✓ |

---

## Messaging (`/api/messaging`)

| Method | Route | Auth |
|--------|-------|------|
| POST/GET/DELETE | `/me/chats`, `/me/chats/{id}` | ✓ (paged list) |
| POST/DELETE/GET | `/me/chats/{id}/join`, `/membership`, `/members` | ✓ |
| POST/GET/PATCH/DELETE | `/me/chats/{id}/messages`, `/me/messages/{id}` | ✓ (paged) |
| POST/GET | `/me/messages/{id}/read`, `/reads` | ✓ |
| POST/GET/DELETE | `/me/messages/{id}/media`, `/upload` | ✓ |

SignalR: [18_SIGNALR_CHAT.md](18_SIGNALR_CHAT.md)

---

## Jobs (`/api/jobs`)

| Method | Route | Auth |
|--------|-------|------|
| POST/GET/PATCH/DELETE | `/me/vacancies`, `/vacancies/{id}` | ✓ |
| GET | `/vacancies` | ✓ (paged; filters: search, location, minSalaryFrom, …) |
| POST/DELETE/GET | `/me/vacancies/{id}/apply`, `/me/applications` | ✓ |
| POST/DELETE/GET | `/me/favorites/{id}` | ✓ |
| POST/GET/DELETE | `/me/search-queries` | ✓ |
| GET | `/recommended-queries` | ✓ |

---

## Events (`/api/events`)

| Method | Route | Auth |
|--------|-------|------|
| GET | `/` | — (discover, paged) |
| GET | `/me/attending` | ✓ (paged) |
| POST/GET/PATCH/DELETE | `/me`, `/me/{id}` | ✓ |
| GET | `/{eventId}` | ✓ |
| POST | `/me/{id}/cover` | ✓ (multipart) |
| POST/DELETE/GET | `/me/{id}/join`, `/{id}/attendees` | ✓ |
| POST/GET/PATCH/DELETE | `/me/{id}/schedule/*` | ✓ |
| GET/POST/PATCH/DELETE | `/speakers`, `/me/speakers/{id}` | read public; write Admin |
| POST/DELETE/GET | `/me/{id}/speakers` | ✓ |

---

## Professional (`/api/professional`)

| Method | Route | Auth |
|--------|-------|------|
| GET/POST/PUT/PATCH/DELETE | `/me/experiences` | ✓; public read `/users/{id}/experiences` |
| GET/POST/PUT/PATCH/DELETE | `/me/companies`, `/companies/{id}` | ✓; logo upload |
| GET/POST/PUT/PATCH/DELETE | `/me/educations` | ✓; public read |
| GET/POST | `/academies` | read public; write Admin |
| GET/POST/PUT/PATCH/DELETE | `/me/certificates` | ✓; file upload |
| GET/POST | `/skills`, `/me/skills` | catalog read public; create skill Admin |
| GET/POST/PUT/PATCH/DELETE | `/me/languages`, `/languages` | catalog Admin write |
| GET/POST/PATCH/DELETE | `/recommendations` | mixed auth |

---

## Notifications (`/api/notifications`)

| Method | Route | Auth |
|--------|-------|------|
| GET/PATCH/DELETE | `/me`, `/me/{id}/read` | ✓ (paged list) |
| PATCH | `/me/read-all` | ✓ |
| POST/GET | `/me/activity` | ✓ |

---

## Admin (`/api/admin`)

**All endpoints require Admin role.**

| Controller | Routes |
|------------|--------|
| Users | `GET/DELETE/PATCH /users`, roles, lock/unlock, restore |
| Roles | `GET /roles` |
| Stats | `GET /stats/overview` |
| Content | `GET/DELETE/PATCH /content/posts`, `/content/comments` |
| Jobs | `GET/DELETE/PATCH /jobs/vacancies`, `/jobs/recommended-queries` |
| Events | `GET/DELETE/PATCH /events` |

Protections: self-delete, self-lock, last admin removal blocked.

---

## AI (`/api/ai`)

| Method | Route | Auth |
|--------|-------|------|
| GET | `/recommended-jobs` | ✓ |
| GET | `/career-advice` | ✓ |

Requires `Gemini:ApiKey` configured.

---

## File upload endpoints (summary)

| Module | Route |
|--------|-------|
| Profile | `POST /api/profile/me/avatar`, `/me/header` |
| Content | `POST /api/content/me/media/upload` |
| Network | `POST /api/network/me/pages/{id}/logo`, `/me/groups/{id}/avatar` |
| Events | `POST /api/events/me/{id}/cover`, `/me/speakers/{id}/avatar` (Admin) |
| Messaging | `POST /api/messaging/me/messages/{id}/media/upload` |
| Professional | `POST /api/professional/me/companies/{id}/logo`, `/academies/{id}/logo`, `/me/certificates/{id}/file` |

Details: [09_CONFIG_UPLOADS.md](09_CONFIG_UPLOADS.md)

---

## Pagination endpoints

Use `PagedResponse<T>`: feed, me posts, comments, vacancies, notifications, contacts, chats, messages, events discover, admin lists, skills/languages/academies/hashtags catalogs.

Plain arrays (v1 limitation): followers, following, favorites, applications, reactions list, etc. — см. [26_LIMITATIONS_AND_TODO.md](26_LIMITATIONS_AND_TODO.md).
