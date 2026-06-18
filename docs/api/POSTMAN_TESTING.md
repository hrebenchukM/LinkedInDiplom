# Postman Testing Guide — LinkedInDiplom

> **Обновлено:** 2026-06-18  
> REST-коллекция синхронизирована с backend после интеграций: repost, mentions/hashtags, portfolio certs/languages, withdraw application, admin recommended queries, notifications/messaging SignalR (documented).

См. также: [../09_TESTING_AND_POSTMAN.md](../09_TESTING_AND_POSTMAN.md) (детали коллекции, auto-save, troubleshooting).

---

## 1. Файлы

| Файл | Назначение |
|------|------------|
| `docs/postman/LinkedInDiplom.postman_collection.json` | REST-запросы (~200 endpoints) |
| `docs/postman/LinkedInDiplom.local.postman_environment.json` | Переменные (tokens, IDs, demo credentials) |
| `docs/postman/build-postman.mjs` | Регенерация коллекции после правок скрипта |

```bash
node docs/postman/build-postman.mjs
```

---

## 2. Запуск backend

```powershell
cd backend/Facade.API
dotnet run --launch-profile https
```

| URL | Назначение |
|-----|------------|
| `https://localhost:7011` | HTTPS (default `baseUrl` в environment) |
| `http://localhost:5282` | HTTP profile |
| `http://localhost:5000` | Docker / `dotnet run` без https profile |

**Swagger UI:** `https://localhost:7011/swagger`  
**Важно:** Swagger **не тестирует SignalR** — только REST.

---

## 3. Импорт в Postman

1. **Import** → `LinkedInDiplom.postman_collection.json` + `LinkedInDiplom.local.postman_environment.json`
2. Выбрать environment **LinkedInDiplom Local**
3. Проверить `baseUrl` (по умолчанию `https://localhost:7011`)
4. Для self-signed cert: Settings → SSL certificate verification → **OFF** (только localhost)

---

## 4. Environment variables

### Credentials (из DemoSeed / AdminSeed в Development)

| Variable | Default | Описание |
|----------|---------|----------|
| `userAEmail` / `userAPassword` | `test@example.com` / `Test123!` | User A |
| `userBEmail` / `userBPassword` | `test2@example.com` / `Test123!` | User B |
| `adminEmail` / `adminPassword` | `admin@local.dev` / `Admin123!` | Admin |
| `otherUserEmail` / `otherUserPassword` | aliases для User B | backward compat |

Пароли зависят от `appsettings.Development.json` → `DemoSeed:DefaultUserPassword`, `AdminSeed`. См. [../08_SEED_DATA.md](../08_SEED_DATA.md).

### Tokens (auto-save scripts)

| Variable | Когда заполняется |
|----------|-------------------|
| `accessToken`, `token` | Login User A, Marya, Admin |
| `refreshToken` | Login User A |
| `adminToken`, `adminAccessToken` | Login Admin |
| `userId`, `userAId` | Login User A |
| `userBId`, `otherUserId`, `participantUserId` | Login User B (без перезаписи accessToken) |
| `adminUserId` | Login Admin |

### Entity IDs (auto-save on create)

`postId`, `commentId`, `vacancyId`, `applicationId`, `chatId`, `messageId`, `notificationId`, `recommendedQueryId`, `hashtagId`, …

---

## 5. Login flow

| Запрос (папка **01 Auth**) | Назначение |
|----------------------------|------------|
| **Login User A** | Основной JWT → `accessToken`, `userId` |
| **Login User B (resolve userBId)** | Только `userBId` — для mentions, public profile, direct chat |
| **Login Admin** | `adminToken`, `adminUserId` |
| **Login Demo User (Marya)** | Showcase user (`Mgg101204`) |
| **Get Current User** | `GET /api/auth/me` |
| **Refresh Token** | Обновление access token |
| **Logout** | `POST /api/auth/logout` |

Дублирующий **Admin Login** также в папке **11 Admin**.

---

## 6. Структура коллекции

| # | Папка | Содержание |
|---|-------|------------|
| 00 | Health / Swagger / Base | Smoke без auth |
| 01 | Auth / Account | Register, login A/B/admin, refresh, logout, me |
| 02 | Profile | CRUD, avatar/header, views, **message-settings** |
| 03 | Professional | me/* CRUD + **public** certs/languages/experiences |
| 04 | Content | feed, posts, comments, reactions, save, **repost**, **mentions/hashtags** |
| 05 | Network | contacts, follows, groups, pages |
| 06 | Messaging | chats, **direct chat `participantUserId`**, messages, read |
| 07 | Notifications | REST list/read/delete + **activity** |
| 08 | Jobs | vacancies, apply, **withdraw**, applications, recommended queries |
| 09 | Events | discover, CRUD, join, speakers, schedule |
| 10 | AI | recommended-jobs, **career-advice** |
| 11 | Admin | users, roles, moderation, **recommended-queries CRUD** |
| 12 | File Uploads | 11 multipart endpoints |
| 13 | SignalR Info | **README** (not HTTP) — messaging + notifications hubs |
| 99 | Error Examples | 400/401/403 negative tests |

---

## 7. Основные test flows

### 7.1 Auth + Profile

1. `00` Swagger JSON → 200  
2. `01` Login User A  
3. `02` GET `/api/profile/me`  
4. `02` PUT/PATCH profile (optional)

### 7.2 Content (post → comment → reaction → repost → tags)

1. `04` Create Post → saves `postId`  
2. `04` Upload media + attach (optional)  
3. Login User B → `04` Create Comment  
4. `04` Set Reaction  
5. `04` **Repost Post** / **Unrepost** / GET **my reposts**  
6. `04` Save / Unsave post  
7. `01` Login User B → resolve `userBId`  
8. `04` POST mention `{ "mentionedUserId": "{{userBId}}" }` (author of post only)  
9. `04` POST hashtag `{ "hashtagId": "{{hashtagId}}" }` (create hashtag via Admin first)

### 7.3 Messaging User A ↔ User B

1. Login User A  
2. Login User B (resolve `userBId`)  
3. Login User A again  
4. `06` **Create Direct Chat** `{ "participantUserId": "{{userBId}}" }` → `chatId`  
5. `06` Send Message  
6. Login User B → GET messages (REST)  
7. **Realtime:** frontend two browsers + `/hubs/messaging` (см. §9)

### 7.4 Notifications REST

1. Trigger: User B comments on User A post  
2. Login User A → `07` GET `/api/notifications/me` → saves `notificationId`  
3. `07` PATCH read / read-all  
4. **Realtime:** `/hubs/notifications` + `NotificationCreated` (см. §9)

### 7.5 Jobs apply / withdraw

> **После demo seed:** login Marya (`marya101204@gmail.com`) — `GET /api/jobs/me/applications` уже содержит заявку на **Senior Frontend Engineer**; sidebar chips заполнены.

1. `08` GET vacancies  
2. `08` GET `/api/jobs/me/applications` → `applicationId` (или Apply To Vacancy если withdrawn)  
3. `08` **Withdraw Application** `DELETE /api/jobs/me/applications/{{applicationId}}`  
4. Apply again  

### 7.6 Admin recommended queries

> **После demo seed:** `GET /api/jobs/recommended-queries` возвращает **8** queries без ручного POST.

1. `01` or `11` Login Admin  
2. (Optional) `11` POST `/api/admin/jobs/recommended-queries` `{ "query": "..." }` → `recommendedQueryId`  
3. User token → `08` GET `/api/jobs/recommended-queries`  
4. Admin DELETE recommended query  

### 7.7 Portfolio (public professional)

1. Login User B → saves `userBId`  
2. `03` GET `/api/professional/users/{{userBId}}/certificates`  
3. `03` GET `/api/professional/users/{{userBId}}/languages`  
4. Or Marya: Login Demo User → use `userId` in path  

---

## 8. SignalR (не REST)

Postman REST **не заменяет** WebSocket-клиент. Папка **13 SignalR Info** — документация.

| Hub | URL | Group | Events |
|-----|-----|-------|--------|
| Messaging | `{{baseUrl}}/hubs/messaging?access_token={{accessToken}}` | `chat:{chatId}` | MessageCreated, MessageUpdated, MessageDeleted, MessageRead, MessageMediaAttached |
| Notifications | `{{baseUrl}}/hubs/notifications?access_token={{accessToken}}` | `user:{userId}` | NotificationCreated |

**Как тестировать realtime:**
- **Рекомендуется:** frontend `http://localhost:5173` — два браузера (User A + incognito User B)
- DevTools → Network → **WS** — проверить connect к hubs
- Vite proxy: `/hubs/*` → `localhost:5000`
- Опционально: `frontend/scripts/verify-signalr.mjs`

**Offline:** notifications сохраняются в PostgreSQL → `GET /api/notifications/me` после входа.

---

## 9. Backend-ready / future frontend

| Endpoint | Postman | Frontend |
|----------|---------|----------|
| `GET /api/ai/career-advice` | ✓ папка 10 AI | не wired |
| `GET/PUT/PATCH /api/profile/me/message-settings` | ✓ папка 02 | stub modal |
| Events create/edit | ✓ папка 09 | discover/join only |
| `GET /api/jobs/me/vacancies/{id}/applications` | ✓ | recruiter UI нет |
| `/api/jobs/me/search-queries` | ✓ | не wired |
| `GET/POST /api/notifications/me/activity` | ✓ | не wired |
| Admin catalog writes | Swagger/Postman partial | admin UI нет |

---

## 10. Frontend demo / client-only (не искать в backend)

| Feature | Backend v1 |
|---------|------------|
| Chat archive/favorites/spam/drafts | **Нет** (localStorage) |
| AI assistant in messages | **Нет** |
| Voice/video calls | **Нет** |
| Resume file persistence | **Нет** |
| Extra profile local fields | **Частично** |

---

## 11. Пересборка коллекции

После изменения `build-postman.mjs`:

```bash
node docs/postman/build-postman.mjs
```

Не редактировать вручную тысячи строк JSON, если изменение можно выразить в скрипте.

---

## 12. Automated checks (CI / before defense)

```powershell
dotnet build LinkedIn.sln
dotnet test backend/Tests/LinkedIn.Tests
cd frontend; npm run build
```

Manual QA checklist: [../09_TESTING_AND_POSTMAN.md](../09_TESTING_AND_POSTMAN.md) §21.
