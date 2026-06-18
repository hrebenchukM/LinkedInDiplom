

---

<!-- merged from: 09_TESTING_AND_POSTMAN.md -->

# Тесты и troubleshooting

# 11. Тесты и troubleshooting

## Тесты

Проект: `backend/Tests/LinkedIn.Tests`

Пакеты:

- xUnit
- Moq
- Microsoft.EntityFrameworkCore.InMemory

Фактические test classes:

- `ContactServiceTests` (13)
- `FileStorageServiceTests` (19)
- `ExperienceServiceTests` (12)
- `CommentServiceTests` (11)
- `PostServiceTests` (11)
- `ReactionServiceTests` (10)
- `FollowServiceTests` (9)
- `HashtagServiceTests` (8)
- `ProfileServiceTests` (7)
- `SkillServiceTests` (6)
- `AccountServiceTests` (5)

Всего: **111 unit-тестов** в **11 классах**.

Запуск:

```bash
dotnet test LinkedIn.sln
```

## Чего не хватает в покрытии

- facade service tests
- error mapping tests
- auth/refresh regression tests
- integration tests по API
- расширение покрытия по Messaging/Jobs/Notifications/Events facade layer

## Частые проблемы

- Swagger не открывается: проверьте Development env и URL
- 401 в Swagger: формат `Bearer <token>`
- DB connection error: проверьте postgres/connection string
- порт занят: поменяйте mapping в compose
- lock dll: остановите запущенный процесс API
- migrations не применяются: смотрите логи api контейнера


---

<!-- merged from: 09_TESTING_AND_POSTMAN.md -->

# Postman quick start

# Postman: как протестировать весь LinkedInDiplom API

> **Обновлено:** 2026-06-18 — коллекция v2026-06-18-postman-sync, repost/withdraw/mentions/admin queries.

Подробная инструкция: **[api/POSTMAN_TESTING.md](api/POSTMAN_TESTING.md)**  
Краткий quick start ниже; полная документация — этот файл + POSTMAN_TESTING.md.

---

## 1) Что импортировать

Файлы в репозитории (не редактировать collection вручную, если не нужны кастомные запросы):

| Файл | Назначение |
|------|------------|
| `docs/postman/LinkedInDiplom.postman_collection.json` | ~100 HTTP-запросов, папки 00–99 |
| `docs/postman/LinkedInDiplom.local.postman_environment.json` | `baseUrl`, tokens, saved IDs |

**Шаги в Postman:**

1. **Import** → выбрать оба JSON-файла → Import.
2. В правом верхнем углу выбрать environment **LinkedInDiplom Local**.
3. Проверить `baseUrl` (по умолчанию `https://localhost:7011`).
4. Запустить backend (`dotnet run --launch-profile https` или Docker).
5. Папка **00 Health** → Swagger JSON → ожидать **200**.
6. **01 Auth → Login User A** → auto-save `accessToken`, `token`, `refreshToken`, `userId`
7. **01 Auth → Login User B** → saves `userBId` (does not overwrite token).

Пересборка collection из кода (опционально): `node docs/postman/build-postman.mjs` — не обязательна для ручного тестирования.

**SignalR** не тестируется REST-коллекцией — папка **12 SignalR Info** только с инструкцией; см. `frontend/scripts/verify-signalr.mjs` или [07_REALTIME_AND_DOMAIN_EVENTS.md](07_REALTIME_AND_DOMAIN_EVENTS.md).

---

## 2) baseUrl

По умолчанию:

```
baseUrl = https://localhost:7011
```

Альтернативы (из `launchSettings.json`):

- `http://localhost:5282` (HTTP profile)
- Docker port из `docker-compose.yml`

---

## 3) Запуск backend

```bash
cd backend/Facade.API
dotnet run --launch-profile https
```

Smoke: папка **00 Health / Swagger / Base** → Swagger JSON → **200**.

---

## 4) Быстрый старт (4 шага)

1. **01 Auth → Login** → auto-saves `accessToken`, `refreshToken`, `userId`
2. **01 Auth → Login Other User** → saves `otherUserId` (second demo user)
3. **01 Auth → Get Current User** → проверка JWT
4. **03 Content → Get Feed** → проверка данных (demo seed)

Admin: **11 Admin → Admin Login** (`admin@local.dev` / `Admin123!`) → `adminAccessToken`

---

## 5) Структура папок

| # | Папка |
|---|-------|
| 00 | Health / Swagger / Base |
| 01 | Auth / Account |
| 02 | Profile |
| 03 | Professional |
| 04 | Content |
| 05 | Network |
| 06 | Messaging |
| 07 | Notifications |
| 08 | Jobs |
| 09 | Events |
| 10 | AI |
| 11 | Admin |
| 12 | File Uploads |
| 13 | SignalR Info (not HTTP REST) |
| 99 | Error Examples / Validation |

---

## 6) Auto-save

**Tokens:** Login, Admin Login, Refresh Token  
**IDs:** Create Post, Create Chat, Create Vacancy, Create Contact, и др.

Console Postman покажет: `accessToken saved`, `postId saved: ...`

---

## 7) Upload

Папка **12 File Uploads** — form-data, key `file`, выберите файл вручную.

---

## 8) Обновление коллекции

```bash
node docs/postman/build-postman.mjs
```

---

## 9) Demo users

| Email | Password |
|-------|----------|
| test@example.com | Test123! |
| test2@example.com | Test123! |
| admin@local.dev | Admin123! |
| marya101204@gmail.com | Mgg101204 |

См. также [../08_SEED_DATA.md](../08_SEED_DATA.md)


---

<!-- merged from: 09_TESTING_AND_POSTMAN.md -->

# Postman testing (полная документация)

> **Обновлено:** 2026-06-18  
> Коллекция синхронизирована с backend controllers (56 controllers, ~200 endpoints).

---

## 1. Файлы

| Файл | Назначение |
|------|------------|
| `docs/postman/LinkedInDiplom.postman_collection.json` | Коллекция запросов |
| `docs/postman/LinkedInDiplom.local.postman_environment.json` | Environment с переменными |
| `docs/postman/build-postman.mjs` | Скрипт обновления коллекции (запускать после изменений API) |
| `docs/09_TESTING_AND_POSTMAN.md` | Подробная документация (этот файл) |

---

## 2. Импорт в Postman

1. Запустите backend (см. раздел 4).
2. Postman → **Import** → выберите оба JSON из `docs/postman/`:
   - `LinkedInDiplom.postman_collection.json`
   - `LinkedInDiplom.local.postman_environment.json`
3. В правом верхнем углу выберите environment: **LinkedInDiplom Local**.
4. Проверьте `baseUrl` (по умолчанию `https://localhost:7011`).
5. **Не нужно** править collection для базового smoke — готовая коллекция в репозитории актуальна; пересборка только через `build-postman.mjs` при изменении API.

**SignalR:** REST-коллекция не заменяет WebSocket-тест hub; см. папку **12 SignalR Info** и [07_REALTIME_AND_DOMAIN_EVENTS.md](07_REALTIME_AND_DOMAIN_EVENTS.md).

---

## 3. baseUrl и порты

По умолчанию в environment:

```
baseUrl = https://localhost:7011
apiUrl  = https://localhost:7011/api
```

Соответствует `launchSettings.json` profile **https**:
- HTTPS: `https://localhost:7011`
- HTTP: `http://localhost:5282`

Docker compose может использовать другой порт — измените `baseUrl` в environment.

**SSL:** для self-signed cert: Postman → Settings → SSL certificate verification → OFF (только localhost).

---

## 4. Запуск backend

```bash
cd backend/Facade.API
dotnet run --launch-profile https
```

Или Docker: `docker-compose up -d`

Проверка: `00 Health / Swagger / Base` → **Swagger JSON (health check)** → ожидайте **200**.

Swagger UI: `https://localhost:7011/swagger`

---

## 5. Структура коллекции (папки)

| Папка | Содержание |
|-------|------------|
| **00 Health / Swagger / Base** | Health check, public feed без auth |
| **01 Auth / Account** | register, login, refresh, logout, me |
| **02 Profile** | profile CRUD, search, avatar/header upload+delete |
| **03 Content** | posts, feed, comments, reactions, media, hashtags |
| **04 Network** | contacts, follows, groups, pages |
| **05 Messaging** | chats, messages, reads, media |
| **06 Jobs** | vacancies (incl. minSalaryFrom), applications, **withdraw**, favorites |
| **07 Events** | discover, attending, schedule, speakers |
| **08 Professional** | experience, education, skills, **public certificates/languages**, companies, certificates |
| **09 Notifications** | notifications, activity |
| **10 File Uploads** | все 11 multipart upload endpoints |
| **11 Admin** | platform admin; **recommended-queries CRUD** |
| **12 SignalR Info** | документация hub (не HTTP REST) |
| **99 Debug / Utility / AI** | AI recommendations (expect **200** or **503** when unavailable) |
| **99 Error Examples / Validation** | negative tests (400/401/403) |

---

## 6. Автоматическое сохранение токенов

### User token

Запросы с test scripts:

| Запрос | Сохраняет |
|--------|-----------|
| `01 Auth → Login` | `accessToken`, `refreshToken`, `userId` |
| `01 Auth → Login Other User (resolve otherUserId)` | `otherUserId` (does **not** overwrite `accessToken`) |
| `01 Auth → Login Demo User (Marya)` | то же (showcase user) |
| `01 Auth → Register` | `userId` |
| `01 Auth → Refresh Token` | `accessToken`, `refreshToken` |

Формат ответа backend:

```json
{
  "success": true,
  "account": { "id": "...", "email": "..." },
  "token": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresAt": "..."
  }
}
```

Scripts читают `j.token.accessToken` и `j.account.id`.

### Admin token

| Запрос | Сохраняет |
|--------|-----------|
| `11 Admin → Admin Login` | `adminAccessToken`, `adminToken`, `adminUserId` |

Credentials (Development seed):

- Email: `admin@local.dev`
- Password: `Admin123!`

---

## 7. Автоматическое сохранение ID

Create-запросы сохраняют ID в environment (test scripts):

| Запрос | Variable | Response path |
|--------|----------|---------------|
| Create Post | `postId` | `post.id` |
| Create Comment | `commentId` | `comment.id` |
| Create Chat | `chatId` | `chat.id` |
| Create Direct Chat (participantUserId) | `chatId` | `chat.id` |
| Send Message | `messageId` | `message.id` |
| Create Vacancy | `vacancyId` | `vacancy.id` |
| Apply To Vacancy | `applicationId` | `application.id` |
| **Withdraw Application** | — | uses `applicationId` |
| Create Recommended Query (Admin) | `recommendedQueryId`, `recommendedJobQueryId` | `id` |
| Get My Notifications | `notificationId` | first item in `items` |
| Create Contact | `contactId` | `contact.id` |
| Create Group | `groupId` | `userGroup.id` |
| Create Page | `pageId` | `page.id` |
| Create Event | `eventId` | `event.id` |
| Create Company | `companyId` | `company.id` |
| Create Experience | `experienceId` | `experience.id` |
| Create Hashtag (Admin) | `hashtagId` | `hashtag.id` |
| Upload Content Media | `mediaId` | `media.id` |

Если переменная пустая — выполните create-запрос или вставьте ID вручную из Swagger/SQL.

---

## 8. Рекомендуемый порядок тестирования

```
1.  Запустить backend
2.  00 Health → Swagger JSON (200?)
3.  01 Auth → Login (test@example.com)
4.  01 Auth → Login Other User (resolve otherUserId) — для otherUserId (test2@example.com)
5.  01 Auth → Get Current User
6.  02 Profile → Get/Patch My Profile
7.  08 Professional → Get User Certificates/Languages (public) — smoke без JWT
8.  08 Professional → Create Company → Create Experience
9.  03 Content → Create Post → Create Comment
10. 04 Network → Create Contact / Follow
11. 05 Messaging → Create Direct Chat (participantUserId) → Send Message
12. 06 Jobs → Get Vacancies (minSalaryFrom) → Apply
13. 07 Events → Discover → Join
14. 09 Notifications → Get My Notifications
15. 10 File Uploads → Upload Avatar (выбрать файл вручную)
16. 11 Admin → Admin Login → Get Users / Stats
17. 99 Debug / Utility / AI → Get Recommended Jobs (200 или 503)
18. 99 Error Examples → validation smoke
19. 01 Auth → Refresh Token → Logout
```

---

## 9. Protected vs Admin endpoints

### User (Bearer {{accessToken}})

Большинство папок 02–09 используют folder-level auth `Bearer {{accessToken}}`.

### Admin (Bearer {{adminAccessToken}})

Папка **11 Admin** — все запросы требуют роль **Admin**.

Catalog writes (Admin-only, в других папках):

- `POST /api/professional/skills`
- `POST /api/professional/academies`
- `POST /api/professional/languages`
- `POST /api/content/hashtags`
- `POST/PATCH/DELETE /api/events/me/speakers/*`

User token → **403 Forbidden**.

---

## 10. Upload endpoints (10 File Uploads)

Все используют **form-data**, key **`file`**, type **File**.

| Endpoint | Auth | Limits |
|----------|------|--------|
| `POST /api/profile/me/avatar` | User | 5 MB, jpg/png/webp |
| `POST /api/profile/me/header` | User | 5 MB |
| `POST /api/content/me/media/upload` | User | 10 MB |
| `POST /api/professional/me/companies/{id}/logo` | User | 5 MB |
| `POST /api/professional/academies/{id}/logo` | Admin | 5 MB |
| `POST /api/professional/me/certificates/{id}/file` | User | 10 MB, pdf+images |
| `POST /api/network/me/pages/{id}/logo` | User | 5 MB |
| `POST /api/network/me/groups/{id}/avatar` | User | 5 MB |
| `POST /api/events/me/{id}/cover` | User | 5 MB |
| `POST /api/events/me/speakers/{id}/avatar` | Admin | 5 MB |
| `POST /api/messaging/me/messages/{id}/media/upload` | User | 10 MB |

**Вручную в Postman:** на вкладке Body → form-data → поле `file` → Select Files.

Response содержит URL: `/uploads/...` (local) или `https://bucket.s3...` (S3).

---

## 11. Pagination

Paged endpoints используют query:

```
page=1&pageSize=20
```

Примеры: feed, vacancies, contacts, chats, messages, notifications, admin lists.

**Важно:** `pageSize` должен быть **> 0**. Default обычно 20.

Jobs filter example:

```
GET /api/jobs/vacancies?minSalaryFrom=80000&page=1&pageSize=20
```

Response: `{ "items": [...], "totalCount": N, "page": 1, "pageSize": 20 }`

---

## 12. Refresh / Logout

**Refresh:** `01 Auth → Refresh Token` — body `{ "refreshToken": "{{refreshToken}}" }`  
Обновляет `accessToken` и `refreshToken` в environment.

**Logout:** `01 Auth → Logout` — body `{ "refreshToken": "{{refreshToken}}" }`  
После logout protected endpoints → **401**.

---

## 13. SignalR (не через REST Postman)

Hub: `wss://localhost:7011/hubs/messaging?access_token={{accessToken}}`

Postman WebSocket может подключиться, но полный chat flow тестируйте через:
- `frontend/scripts/verify-signalr.mjs`
- или frontend app

См. `docs/07_REALTIME_AND_DOMAIN_EVENTS.md` и папку **12 SignalR Info**.

---

## 14. Demo credentials

| User | Email | Password |
|------|-------|----------|
| Test user | `test@example.com` | `Test123!` |
| Test user 2 | `test2@example.com` | `Test123!` |
| Admin | `admin@local.dev` | `Admin123!` |
| Showcase (Marya) | `marya101204@gmail.com` | `Mgg101204` (или из DemoSeed) |

Environment variables: `userEmail`, `userPassword`, `otherUserEmail`, `otherUserPassword`, `adminEmail`, `adminPassword`.

Для direct chat и public portfolio: после **Login** выполните **Login Other User** — сохранится `otherUserId` без перезаписи основного `accessToken`.

---

## 15. Error responses

### Validation (400)

```json
{
  "success": false,
  "errors": ["Email: invalid"],
  "fieldErrors": { "Email": ["invalid"] }
}
```

### Business (400/404)

```json
{ "success": false, "errors": ["Post not found."] }
```

### 401 / 403

- **401** — нет JWT или expired
- **403** — JWT есть, но нет роли Admin

Папка **99 Error Examples / Validation** — готовые negative requests.

---

## 16. Environment variables (полный список)

| Variable | Назначение |
|----------|------------|
| `baseUrl` | API host |
| `apiUrl` | `{{baseUrl}}/api` |
| `accessToken` | User JWT |
| `refreshToken` | Refresh token |
| `adminAccessToken` | Admin JWT |
| `adminToken` | Alias для admin JWT |
| `userId` | Current user GUID |
| `adminUserId` | Admin user GUID |
| `otherUserId` | Second user (contacts/messaging/public portfolio) |
| `participantUserId` | Optional alias; requests use `otherUserId` by default |
| `receiverId` | Contact request target |
| `postId`, `commentId`, `chatId`, `messageId` | Content/Messaging |
| `vacancyId`, `applicationId`, `companyId` | Jobs/Professional |
| `eventId`, `pageId`, `groupId` | Events/Network |
| `skillId`, `hashtagId`, `mediaId` | Catalog/Media |

---

## 17. Что сделать вручную после импорта

1. Проверить `baseUrl` (HTTPS vs HTTP vs Docker port)
2. Отключить SSL verify для localhost (если HTTPS)
3. Выполнить **Login** → проверить `accessToken` в environment
4. Выполнить **Login Other User** → проверить `otherUserId` (для messaging и public professional)
5. Для upload — **выбрать файл** в form-data
6. Для vacancy create — сначала **Create Company** → `companyId`
7. AI endpoints: **200** = success; **503** = AI unavailable (`success: false` в body)
8. SignalR — использовать отдельный клиент, не REST

---

## 18. Endpoint tables by module

> Auth=Yes → Bearer `{{accessToken}}`. Admin → Bearer `{{adminAccessToken}}`.

Полный каталог: `docs/04_API_REFERENCE.md`

### 01 Auth

| Method | Route | Auth |
|--------|-------|------|
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| POST | `/api/auth/google` | — |
| POST | `/api/auth/facebook` | — |
| POST | `/api/auth/refresh` | — |
| POST | `/api/auth/logout` | — |
| GET | `/api/auth/me` | Yes |

### 02 Profile

| Method | Route | Auth |
|--------|-------|------|
| GET/PUT/PATCH | `/api/profile/me` | Yes |
| GET | `/api/profile/search` | — |
| GET | `/api/profile/{userId}` | — |
| POST/DELETE | `/api/profile/me/avatar`, `/me/header` | Yes |
| GET/PUT/PATCH | `/api/profile/me/message-settings` | Yes |
| POST | `/api/profile/{id}/views` | optional |
| GET | `/api/profile/me/profile-views` | Yes |

*(Остальные модули — см. `04_API_REFERENCE.md` и запросы в коллекции.)*

---

## 19. Обновление коллекции после изменений API

```bash
node docs/postman/build-postman.mjs
```

Скрипт применяет transforms к базовой коллекции: folder order, test scripts, upload folder, health checks.

---

## 20. Automated build & test (before defense)

```powershell
# from repo root
dotnet build LinkedIn.sln
dotnet test backend/Tests/LinkedIn.Tests/LinkedIn.Tests.csproj
cd frontend
npm run build
```

| Command | Expected |
|---------|----------|
| `dotnet build` | Build succeeded, 0 errors |
| `dotnet test` | All passed (111 tests) |
| `npm run build` | Exit 0; Vite production bundle |

**Frontend build warnings (non-critical):** npm `devdir`, SignalR `/*#__PURE__*/` in node_modules, chunk size >500 kB — do not break runtime.

---

## 21. Manual QA checklist (defense)

> Два браузера: **User A** = `test@example.com` / `Test123!`; **User B** = `test2@example.com` / `Test123!` (incognito).  
> Admin: `admin@local.dev` / `Admin123!`. Portfolio demo: `marya101204@gmail.com` / `Mgg101204`.  
> Frontend: `http://localhost:5173` (Vite proxy → `:5000`). Backend: `http://localhost:5000`.

### Preconditions

- [ ] PostgreSQL + `linkedin_dev` running
- [ ] `DemoSeed:Enabled = true`
- [ ] DevTools → Network → **WS** filter enabled
- [ ] Verify Vite proxy: `/api/*` and `/hubs/*` → backend

### User flow — content & notifications

| # | Step | Pass criteria |
|---|------|---------------|
| 1 | Login User A | `/app`, JWT in storage |
| 2 | Login User B (incognito) | Separate session |
| 3 | User A: create post **with image** | Post in feed; `POST /api/content/me/posts` 2xx |
| 4 | User B: comment on A's post | Comment visible; count +1 |
| 5 | User A: **realtime** notification (no F5) | WS `/hubs/notifications` Connected; badge +1; type `post_comment` |
| 6 | User B: Like reaction | Reaction active |
| 7 | User A: notification `post_reaction` | Badge or list update |
| 8 | Mention → `post_mention` | **Note:** mention add = post author only; use User B's post + API `POST .../mentions` or Postman; A receives notification |
| 9 | User A: Save / Unsave post | Saved tab; hint messages |
| 10 | Repost / unrepost | API `POST/DELETE .../repost` (UI on Home may be absent — see limitations) |
| 11 | Portfolio: `/app/portfolio/{maryaUserId}` | Certificates + Languages sections populated |
| 12 | Mentions/hashtags panel | If entities exist on post (API seed); `PostTagsPanel` on legacy `FeedPostCard` route |

### Messaging flow

| # | Step | Pass criteria |
|---|------|---------------|
| 1 | User A: New message → search User B → create chat | `/app/messages/{chatId}` |
| 2 | User A: send message | Message in thread |
| 3 | User B: message appears **without refresh** | WS `/hubs/messaging`; `MessageCreated` |
| 4 | User B: reply | User A sees reply realtime |
| 5 | Read status | Opening chat calls `POST .../read`; unread badge clears |

### Jobs flow

> После seed: login **Marya** (`marya101204@gmail.com`) — на **Senior Frontend Engineer** (NovaStack) уже есть application; sidebar chips заполнены из seed.

| # | Step | Pass criteria |
|---|------|---------------|
| 1 | Marya: `/app/vacancies` | Vacancies list; **8 recommended chips** in sidebar |
| 2 | Find **Senior Frontend Engineer** | Button **Applied** (pre-seeded) |
| 3 | **Withdraw** | `DELETE /api/jobs/me/applications/{id}`; status clears |
| 4 | Apply again | Success |
| 5 | (Optional) Admin adds another recommended query | Chip appears for user |

### Admin flow

| # | Step | Pass criteria |
|---|------|---------------|
| 1 | Admin login | `/app/admin/dashboard` |
| 2 | Users list | Search/pagination works |
| 3 | Lock / unlock user (not self) | Badge Locked; locked user cannot login |
| 4 | Assign / remove role | Role column updates |
| 5 | Content moderation | List + delete/restore |
| 6 | Jobs moderation | Vacancies table |
| 7 | Events moderation | Events table |
| 8 | Recommended queries | List shows **8 seeded** queries; add → user sidebar → delete |

### Events flow (Network sidebar)

| # | Step | Pass criteria |
|---|------|---------------|
| 1 | `/app/network` → EventPanel filter **Upcoming** | **Design Systems Conference** visible (rolling +21d) |
| 2 | Open event | Speakers + schedule populated |

### SignalR verification (browser)

| Hub | Check |
|-----|-------|
| `/hubs/notifications` | Status 101 Switching Protocols; `NotificationCreated` after comment/reaction |
| `/hubs/messaging` | Connected after opening Messages; `MessageCreated` after send |

### Known partial UI (document honestly if fails on UI but API works)

- Repost button not on Home `PostCard` — test via API or legacy profile posts
- Mention/hashtag add — no composer UI; use Postman
- Post deep link `/app/post/{id}` — may not exist; notifications list still works

См. также [11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md) roadmap § A–D.

