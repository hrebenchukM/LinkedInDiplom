# Postman: тестирование LinkedInDiplom API

> **Обновлено:** 2026-06-17  
> Коллекция синхронизирована с backend controllers (56 controllers, ~200 endpoints).

---

## 1. Файлы

| Файл | Назначение |
|------|------------|
| `docs/postman/LinkedInDiplom.postman_collection.json` | Коллекция запросов |
| `docs/postman/LinkedInDiplom.local.postman_environment.json` | Environment с переменными |
| `docs/postman/build-postman.mjs` | Скрипт обновления коллекции (запускать после изменений API) |
| `docs/api/POSTMAN_TESTING.md` | Подробная документация (этот файл) |

---

## 2. Импорт в Postman

1. Запустите backend (см. раздел 4).
2. Postman → **Import** → выберите оба JSON:
   - `LinkedInDiplom.postman_collection.json`
   - `LinkedInDiplom.local.postman_environment.json`
3. В правом верхнем углу выберите environment: **LinkedInDiplom Local**.

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
| **06 Jobs** | vacancies (incl. minSalaryFrom), applications, favorites |
| **07 Events** | discover, attending, schedule, speakers |
| **08 Professional** | experience, education, skills, companies, certificates |
| **09 Notifications** | notifications, activity |
| **10 File Uploads** | все 11 multipart upload endpoints |
| **11 Admin** | platform admin (роль Admin) |
| **12 SignalR Info** | документация hub (не HTTP REST) |
| **99 Debug / Utility / AI** | AI recommendations |
| **99 Error Examples / Validation** | negative tests (400/401/403) |

---

## 6. Автоматическое сохранение токенов

### User token

Запросы с test scripts:

| Запрос | Сохраняет |
|--------|-----------|
| `01 Auth → Login` | `accessToken`, `refreshToken`, `userId` |
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
| Send Message | `messageId` | `message.id` |
| Create Vacancy | `vacancyId` | `vacancy.id` |
| Apply To Vacancy | `applicationId` | `application.id` |
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
3.  01 Auth → Login (или Login Demo User Marya)
4.  01 Auth → Get Current User
5.  02 Profile → Get/Patch My Profile
6.  08 Professional → Create Company → Create Experience
7.  03 Content → Create Post → Create Comment
8.  04 Network → Create Contact / Follow
9.  05 Messaging → Create Chat → Send Message
10. 06 Jobs → Get Vacancies (minSalaryFrom) → Apply
11. 07 Events → Discover → Join
12. 09 Notifications → Get My Notifications
13. 10 File Uploads → Upload Avatar (выбрать файл вручную)
14. 11 Admin → Admin Login → Get Users / Stats
15. 99 Error Examples → validation smoke
16. 01 Auth → Refresh Token → Logout
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

См. `docs/18_SIGNALR_CHAT.md` и папку **12 SignalR Info**.

---

## 14. Demo credentials

| User | Email | Password |
|------|-------|----------|
| Test user | `test@example.com` | `Test123!` |
| Test user 2 | `test2@example.com` | `Test123!` |
| Admin | `admin@local.dev` | `Admin123!` |
| Showcase (Marya) | `marya101204@gmail.com` | `Mgg101204` (или из DemoSeed) |

Environment variables: `userEmail`, `userPassword`, `adminEmail`, `adminPassword`, `otherUserEmail`.

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
| `otherUserId` | Second user (contacts/messaging) |
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
4. Для upload — **выбрать файл** в form-data
5. Для contacts/messaging — заполнить `otherUserId` (login as test2, copy id)
6. Для vacancy create — сначала **Create Company** → `companyId`
7. SignalR — использовать отдельный клиент, не REST

---

## 18. Endpoint tables by module

> Auth=Yes → Bearer `{{accessToken}}`. Admin → Bearer `{{adminAccessToken}}`.

Полный каталог: `docs/06_API_OVERVIEW.md`

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

*(Остальные модули — см. `06_API_OVERVIEW.md` и запросы в коллекции.)*

---

## 19. Обновление коллекции после изменений API

```bash
node docs/postman/build-postman.mjs
```

Скрипт применяет transforms к базовой коллекции: folder order, test scripts, upload folder, health checks.
