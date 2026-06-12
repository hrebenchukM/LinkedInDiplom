# 06. Validation / Error handling / Swagger

## Validation

- DataAnnotations на facade Request-моделях
- invalid body на `[ApiController]` — auto-validation в `Facade.API` (шаг 16); ручной `BadRequest(ModelState)` **удалён из всех facade controllers** (шаги 18–24: Admin, Account, Network, Jobs, Events, Content, Professional, Messaging, Notifications, Profile message settings)
- controllers **не** вызывают ручной `ModelState.IsValid` — source of truth: `InvalidModelStateResponseFactory` в `Facade.API/Program.cs`
- бизнес-валидация (дубликаты, ownership) — в core services; часть query/body rules — `IValidatableObject` на facade Request DTO (Step 8)

### Unified automatic validation errors

Когда `[ApiController]` отклоняет запрос **до входа в action** (невалидная модель из binding / DataAnnotations), host возвращает **400** в едином формате (`Facade.API/Program.cs` → `InvalidModelStateResponseFactory`):

```json
{
  "success": false,
  "errors": [
    "Email: The Email field is required.",
    "Password: The Password field is required."
  ],
  "fieldErrors": {
    "Email": ["The Email field is required."],
    "Password": ["The Password field is required."]
  }
}
```

- `errors` — плоский список `"FieldKey: message"` (ключи ModelState сохраняются как пришли, в т.ч. вложенные).
- `fieldErrors` — словарь поле → массив сообщений.

**Первый этап унификации:** затронуты только **auto-400** от `[ApiController]`.

**Пока без изменений (старый формат):**

- business errors Account/Auth (`RegisterResponse`, `LoginResponse`, …) и `MapErrors` в CRUD facade (полный `*Response` с null-полями) — отдельные шаги.

**Уже унифицировано (slim envelope, шаги 30–33):**

- точечные GET **404** в facade controllers (раньше пустое тело) → `{ success: false, errors: ["... not found."] }` с каноническими строками из `*ControllerBase` (например `"Company not found."`, `"Post not found."`);
- **`Unauthorized()` / `Forbid()`** — без изменений: стандартные пустые **401** / **403** (JWT middleware и `[Authorize]` как раньше).

**Проверка в Swagger/Postman (Development):**

| Запрос | Ожидание |
|--------|----------|
| `POST /api/auth/register` без email/password | 400, unified format |
| `POST /api/jobs/me/vacancies` без title (с Bearer) | 400, unified format, если сработала auto-validation |
| `PATCH /api/profile/me` с слишком длинным `firstName` (с Bearer) | 400, unified format |

## Error handling

Обычно:

- `400` — validation/business error
- `401` — нет JWT или невалидный/просроченный токен (пустое тело)
- `403` — JWT есть, но **нет роли Admin** на защищённом endpoint (пустое тело); типично: User на `/api/admin/*` или catalog write (`POST /api/professional/skills`, `POST /api/content/hashtags`, …)
- `404` — not found: **GET-by-id** в facade (шаг 33) → slim `{ success, errors }`; для user-owned mutations — также «сущность не найдена» или «чужая сущность» через `MapErrors`
- `200/204` — успех

### Catalog write: 401 vs 403 vs 404

| Ситуация | Код |
|---|---|
| Нет `Authorization: Bearer` | **401** |
| User JWT (роль User) на Admin-only catalog write | **403** |
| Admin JWT, невалидный body | **400** (auto-validation или business) |
| Admin JWT, валидный create | **200** |
| User JWT на `POST /api/professional/me/skills` (привязка skill к профилю) | **200** / **400** / **404** — не **403** |

**Проверка (Postman):**

| Сценарий | Ожидание |
|---|---|
| `POST /api/professional/skills` без JWT | **401** |
| `POST /api/professional/skills` с `{{accessToken}}` (User) | **403** |
| `POST /api/professional/skills` с `{{adminToken}}` | **200** (при валидном body) |
| `POST /api/content/hashtags` с User token | **403** |
| `POST /api/content/me/hashtags/{id}/follow` с User token | **200** / **404** (не **403**) |
| `POST /api/events/me/speakers/{id}/avatar` с User token | **403** |
| `POST /api/events/me/speakers/{id}/avatar` с Admin token | **200** (при валидном файле) |

### GET not-found в facade controllers (шаг 33)

Все пустые `return NotFound();` в facade GET-by-id заменены на `NotFoundError(...)` / `NotFound(new { success = false, errors = [...] })` с каноническими строками из module `*ControllerBase` (тот же текст, что в `MapErrors` not-found sets).

```json
{
  "success": false,
  "errors": ["Company not found."]
}
```

**Не менялось:** `Unauthorized()`, `Forbid()`, `NotFound(...)` где тело уже было (например `ContentReactionsController`, `ContentPostViewsController`), `MapErrors` → полный `*Response`, core services, DTO, routes.

**Проверка GET 404 + 401 (Postman/Swagger, Bearer где нужно):**

| Сценарий | Ожидание |
|----------|----------|
| `GET /api/professional/companies/{nonExistingId}` | **404**, `{ success: false, errors: ["Company not found."] }` |
| `GET /api/content/posts/{nonExistingId}` | **404**, `{ success: false, errors: ["Post not found."] }` |
| `GET /api/jobs/vacancies/{nonExistingId}` | **404**, `{ success: false, errors: ["Vacancy not found."] }` |
| `GET /api/messaging/me/chats/{nonExistingId}` | **404**, `{ success: false, errors: ["Chat not found."] }` |
| `GET /api/events/{nonExistingId}` | **404**, `{ success: false, errors: ["Event not found."] }` |
| Любой protected endpoint без Bearer | **401**, пустое тело (как раньше) |

### Account / Auth (`/api/auth/*`)

- **Invalid request body** (пустой `{}`, нет email/password, невалидный email и т.д.) — только **auto-validation** (шаг 16) на `register`, `login`, `google`, `facebook`, `refresh`, `logout`: `{ success, errors, fieldErrors }`. Ручной `BadRequest(ModelState)` в `AccountController` удалён (шаг 19).
- **Business errors** пока в своих response DTO (без `fieldErrors`):
  - `POST register` — дубликат email и др. → **400** + `RegisterResponse` (`success`, `errors`, …);
  - `POST login` / `refresh` / external — неверные credentials → **401** + соответствующий response DTO;
  - выравнивание business envelope с остальным API — позже, отдельным шагом.
- **`GET /api/auth/me` (шаг 30):** пользователь из JWT не найден в Identity → **404** + `{ success: false, errors: ["Current user was not found."] }` (раньше пустое **404**). Нет/невалидный claim `NameIdentifier` в action → **401** без тела (как раньше). Невалидный/отсутствующий Bearer → **401** от middleware JWT (как раньше).

**Проверка Account validation (Postman):**

| Сценарий | Ожидание |
|----------|----------|
| `POST /api/auth/register` с `{}` | **400**, unified validation |
| `POST /api/auth/login` с `{}` | **400**, unified validation |
| `POST /api/auth/login` валидный body, неверный пароль | **401**, `LoginResponse` как раньше |
| `POST /api/auth/register` валидный body, email уже есть | **400**, `RegisterResponse` business error как раньше |
| `GET /api/auth/me` без Bearer | **401** (JWT), как раньше |
| `GET /api/auth/me` с валидным token существующего user | **200**, `AccountDto` |
| `GET /api/auth/me` с token удалённого/несуществующего user | **404**, `{ success: false, errors: ["Current user was not found."] }` |

### Network (`/api/network/*`)

- **Invalid request body** на write endpoints (`contacts`, `follows`, `blocked-users`, `pages`, `groups`, `page-admins`) — только **auto-validation** (шаг 16): `{ success, errors, fieldErrors }`. Ручной `BadRequest(ModelState)` удалён из Network controllers (шаг 20).
- **Business errors** — без изменений: `NetworkManagementControllerBase.MapErrors` → **400/404** + facade `*Response` с `success` и `errors`.
- **GET not-found (шаг 33):** `GET` contacts, groups, pages, group posts — **404** + slim envelope (`"Contact not found."`, `"Group not found."`, `"Page not found."`, `"Group post not found."` и т.д. из base).

**Проверка Network validation (Postman, Bearer):**

| Сценарий | Ожидание |
|----------|----------|
| `POST /api/network/me/contacts` с `{}` или без `receiverId` | **400**, unified validation |
| `POST /api/network/me/follows` с `{}` или без `followingId` | **400**, unified validation |
| Валидный contact / follow | **200**, как раньше |
| Несуществующий `followingId` / receiver | **400/404** через `MapErrors`, как раньше |

### Jobs (`/api/jobs/*`) и Events (`/api/events/*`)

- **Invalid request body** на write endpoints (vacancies create/update, events create/update, speakers, schedule, attach speaker) — только **auto-validation** (шаг 16): `{ success, errors, fieldErrors }`. Ручной `BadRequest(ModelState)` удалён из Jobs/Events controllers (шаг 21).
- **Events body validation (Step 8):** `CreateEventRequest` / `UpdateEventRequest` (`IValidatableObject`):
  - `StartAt` required;
  - если `EndAt` задан — `EndAt` **должен быть позже** `StartAt`;
  - `Visibility` ∈ `public` / `private`.
- **Jobs/Notifications query date range (Step 8):** `GetVacanciesQueryRequest`, `GetMyNotificationsQueryRequest` — `fromCreatedAt` ≤ `toCreatedAt`, иначе **400** unified validation.
- **Business errors** — без изменений: `JobsManagementControllerBase` / `EventsManagementControllerBase` → `MapErrors` → **400/404** + facade `*Response`.
- **GET not-found (шаг 33):** `GET /api/jobs/vacancies/{id}`, applications, search queries; `GET /api/events/{id}`, speakers — **404** + slim envelope.

**Проверка Jobs/Events validation (Postman, Bearer):**

| Сценарий | Ожидание |
|----------|----------|
| `POST /api/jobs/me/vacancies` с `{}` или без `title` | **400**, unified validation |
| `POST /api/events/me` с `endAt <= startAt` | **400**, unified validation |
| `PATCH /api/events/me/{eventId}` с `endAt <= startAt` | **400**, unified validation |
| `GET /api/jobs/vacancies?fromCreatedAt=...&toCreatedAt=...` где from > to | **400**, unified validation |
| Валидный vacancy / event create | **200**, как раньше |
| `GET /api/jobs/vacancies/{nonExistingId}` | **404**, `{ success: false, errors: ["Vacancy not found."] }` |
| `GET /api/events/{nonExistingId}` | **404**, `{ success: false, errors: ["Event not found."] }` |

### Content (`/api/content/*`)

- **Invalid request body** на write endpoints (posts, comments, media, mentions, reactions, hashtags) — только **auto-validation** (шаг 16): `{ success, errors, fieldErrors }`. Ручной `BadRequest(ModelState)` удалён из Content controllers (шаг 22).
- **Business errors** — `ContentManagementControllerBase.MapErrors` → **400/404** + facade `*Response` (`success`, `errors`, …).
- **Hashtag not-found (шаг 25):** строка `"Hashtag not found."` из Content core (`HashtagService` / `PostHashtagService` / `UserHashtagFollowService`) мапится в **404** через `MapErrors` и наборы `HashtagNotFoundErrors`, `PostHashtagNotFoundErrors`, `UserHashtagFollowNotFoundErrors`. Ранее `MapHashtagError` использовал пустой `NoNotFoundErrors` — любая ошибка `HashtagResponse` уходила в **400**; теперь not-found для hashtag → **404**. Прочие hashtag business errors (например `"Hashtag already exists."`, `"Post hashtag already exists."`, `"Already following this hashtag."`) остаются **400**.
- **GET not-found (шаг 33):** `GET /api/content/hashtags/{hashtagId}`, `GET /api/content/posts/{postId}`, `GET /api/content/media/{mediaId}` при отсутствии записи → **404** + slim `{ success, errors }` (канонические `"Hashtag not found."`, `"Post not found."`, `"Media not found."`; не `MapErrors`).

**Проверка Content validation (Postman, Bearer):**

| Сценарий | Ожидание |
|----------|----------|
| `POST /api/content/me/posts` с `{}` или без `content` | **400**, unified validation |
| `POST /api/content/me/posts/{postId}/comments` с invalid body | **400**, unified validation |
| Валидный post / comment create | **200**, как раньше |
| Несуществующий `postId` / `commentId` на write | **404** через `MapErrors`, как раньше |
| `GET /api/content/posts/{nonExistingPostId}` | **404**, `{ success: false, errors: ["Post not found."] }` |
| `GET /api/content/hashtags/{nonExistingHashtagId}` | **404**, `{ success: false, errors: ["Hashtag not found."] }` |
| `POST /api/content/me/posts/{postId}/hashtags` с несуществующим `hashtagId` | **404**, `PostHashtagResponse` + `"Hashtag not found."` |
| `POST /api/content/me/hashtags/{hashtagId}/follow` с несуществующим `hashtagId` | **404**, `UserHashtagFollowResponse` + `"Hashtag not found."` |
| `POST /api/content/hashtags` с уже существующим именем | **400**, `"Hashtag already exists."` |
| `POST .../hashtags` attach, дубликат связи post–hashtag | **400**, `"Post hashtag already exists."` |

### Professional (`/api/professional/*`)

- **Invalid request body** на write endpoints (companies, experiences, educations, certificates, skills, languages, academies, recommendations) — только **auto-validation** (шаг 16): `{ success, errors, fieldErrors }`. Ручной `BadRequest(ModelState)` удалён из Professional controllers (шаг 23).
- **Business errors** — без изменений: `ProfessionalManagementControllerBase.MapErrors` → **400/404** + facade `*Response`.
- **GET not-found (шаг 33):** `GET .../companies/{id}`, experiences, educations, academies, certificates, skills, languages, recommendations — при `null` из service → **404** + slim envelope (канонические строки `*NotFoundError` из base).
- **Recommended-skills query validation (шаг 28):** `GET /api/professional/recommended-skills?position=` — проверка `position` внутри action (не auto-validation ModelState). Пустой/отсутствующий `position` → **400** + `{ success: false, errors: ["Position is required."] }` (раньше только `errors` без `success`).

**Проверка Professional validation (Postman, Bearer):**

| Сценарий | Ожидание |
|----------|----------|
| `POST /api/professional/me/companies` с `{}` или без `name` | **400**, unified validation |
| `POST /api/professional/me/experiences` с invalid body | **400**, unified validation |
| Валидный company / experience create | **200**, как раньше |
| Несуществующий `companyId` / `experienceId` на write | **404** через `MapErrors`, как раньше |
| `GET /api/professional/companies/{nonExistingId}` | **404**, `{ success: false, errors: ["Company not found."] }` |
| `GET /api/professional/recommended-skills` без `position` или с пустым `position` | **400**, `{ success: false, errors: ["Position is required."] }` |
| `GET /api/professional/recommended-skills?position=Developer` | **200**, список skills как раньше |
| `PATCH /api/professional/me/experiences/{id}` с `endDate < startDate` (оба заданы) | **400**, unified validation (Step 8) |
| `PATCH /api/professional/me/educations/{id}` с `endDate < startDate` (оба заданы) | **400**, unified validation (Step 8) |

### Messaging (`/api/messaging/*`), Notifications (`/api/notifications/*`), Profile settings

- **Invalid request body** — только **auto-validation** (шаг 16). Ручной `BadRequest(ModelState)` удалён (шаг 24): `MessagingMessagesController` (send/edit message, attach media), `NotificationsUserActivityController`, `ProfileMessageSettingsController` (PUT/PATCH).
- **Profile** `PUT/PATCH me` — invalid profile body → auto-validation (шаг 16).
- **Profile media upload (шаг 27):** `POST /api/profile/me/avatar` и `POST /api/profile/me/header` — ошибки загрузки (пустой файл, размер > 5 MB, недопустимый тип из `InvalidOperationException`) → **400** + `{ success: false, errors: ["..."] }` (раньше plain string в теле). Успешная загрузка и `MapProfileError` для business errors без изменений.
- **Business errors** — `MessagingManagementControllerBase` / `NotificationsManagementControllerBase` (`MapErrors` на notifications CRUD) / `ProfileManagementControllerBase` → `MapErrors`.
- **GET not-found (шаг 33):** `GET /api/messaging/me/chats/{id}`, messages; `GET` notification by id — **404** + slim envelope (`"Chat not found."`, `"Message not found."`, `"Notification not found."`).
- **User activity business errors (шаг 32):** `POST /api/notifications/me/activity` при `!response.Success` → **400** + `{ success: false, errors: [...] }` (раньше полный `UserActivityResponse`). Invalid body → auto-validation (шаг 16) **до** action.
- **Message settings not-found (шаг 26):** `"Message settings not found."` — каноническая строка в `ProfileManagementControllerBase` (`MessageSettingsNotFoundError`), в том же стиле, что `"Profile not found."` в `ProfileViewService`. Мапится в **404** через `MapMessageSettingsError` / `MessageSettingsNotFoundErrors` (ранее набор пустой → not-found уходил в **400**). Сейчас `MessageSettingsService` при отсутствии строки **создаёт defaults** (GET/PUT/PATCH → **200**); **404** появится, когда core начнёт возвращать `Succeeded = false` с этой строкой. Прочие business errors → **400**.
- `PUT` / `PATCH /api/profile/me/message-settings` при `!response.Success` → `MapMessageSettingsError`; invalid body → auto-validation **до** action.
- **Profile GET not-found (шаг 31):** `GET /api/profile/me` и `GET /api/profile/{userId}` при отсутствии профиля → **404** + `{ success: false, errors: ["Profile not found."] }` (строка `ProfileNotFoundError` из `ProfileManagementControllerBase`; раньше пустое **404**).

**Проверка Profile GET (Postman):**

| Сценарий | Ожидание |
|----------|----------|
| `GET /api/profile/me` (Bearer), профиля нет | **404**, `{ success: false, errors: ["Profile not found."] }` |
| `GET /api/profile/{userId}`, профиля нет / несуществующий user | **404**, тот же формат |
| `GET /api/profile/me` или `GET /api/profile/{userId}` с существующим профилем | **200**, DTO как раньше |

**Проверка (Postman, Bearer):**

| Сценарий | Ожидание |
|----------|----------|
| `POST .../chats/{chatId}/messages` с invalid body | **400**, unified validation |
| `POST /api/notifications/me/activity` с `{}` / без `action` | **400**, unified validation (`fieldErrors`) |
| `POST /api/notifications/me/activity` с `"action": "   "` (только пробелы) | **400**, `{ success: false, errors: ["Activity action is required."] }` |
| `POST /api/notifications/me/activity` с валидным `{ "action": "viewed_profile" }` | **200**, `UserActivityResponse` как раньше |
| `PUT` или `PATCH /api/profile/me/message-settings` с слишком длинным `officeAbsenceMessage` | **400**, unified validation |
| Валидные messaging / notifications / settings writes | **200**, как раньше |
| Несуществующий `chatId` / `messageId` на write | **404** через `MapErrors`, как раньше |
| `GET /api/messaging/me/chats/{nonExistingId}` | **404**, `{ success: false, errors: ["Chat not found."] }` |
| `PUT` / `PATCH /api/profile/me/message-settings`, core вернул `"Message settings not found."` | **404**, `MessageSettingsResponse` + `errors` |
| `PUT` / `PATCH .../message-settings`, прочая business error (не not-found) | **400**, `MessageSettingsResponse` |
| Валидный `GET` / `PUT` / `PATCH .../message-settings` | **200**, как раньше |

**Проверка Profile media upload (Postman, Bearer, `multipart/form-data`):**

| Сценарий | Ожидание |
|----------|----------|
| `POST /api/profile/me/avatar` без файла / пустой файл | **400**, `{ success: false, errors: ["File is empty."] }` |
| `POST /api/profile/me/header` без файла / пустой файл | **400**, `{ success: false, errors: ["File is empty."] }` |
| `POST .../avatar` или `.../header` файл > 5 MB | **400**, `errors: ["File is too large. Maximum size is 5 MB."]` |
| `POST .../avatar` недопустимое расширение (например `.gif`) | **400**, `errors: ["File extension is not allowed."]` |
| Валидный jpg/png/webp ≤ 5 MB | **200**, `ProfileResponse` как раньше |

**Все 11 multipart upload endpoints** (Profile, Content, Professional, Network, Events, Messaging) используют поле `file`, те же тексты `FileUploadValidation` для empty/too large, и `FileStorageService` для extension/content-type. Полная таблица: `09_CONFIG_UPLOADS.md`.

### Admin API (`/api/admin/*`)

- требуется `Authorization: Bearer <access_token>` с claim роли **Admin**
- обычный пользователь (роль User) → **403 Forbidden** (без изменений)
- ошибки Admin controllers (`AdminControllerBase`) возвращают:

```json
{
  "success": false,
  "errors": ["Human-readable message"]
}
```

- **404** — если `InvalidOperationException.Message` содержит `not found` или `was not found` (user, post, vacancy, recommended query и т.д.)
- **400** — business/security validation, прочие `InvalidOperationException`
- успешные write без тела: **204** (lock, delete/restore user, delete/restore post/vacancy, delete recommended query)
- `POST /api/admin/jobs/recommended-queries` → **200** с DTO в теле при успехе; invalid model (пустой body, пустой `query` и т.д.) — только **auto-validation** из `Facade.API` (шаг 16): `{ success, errors, fieldErrors }`; ручной `BadRequest(ModelState)` в admin controllers не используется
- `GET /api/admin/stats/overview` → **200** с `AdminStatsOverviewDto` (incl. event aggregates)
- **Admin body validation (Step 8):**
  - `AssignUserRoleRequest`: `roleName` required, allowed values `Admin` / `User` only;
  - `LockUserRequest`: если `lockoutEnd` задан — дата **в будущем**.
- **Admin query date ranges (Step 8):** `AdminPostsQueryRequest`, `AdminVacanciesQueryRequest`, `AdminEventsQueryRequest`, `AdminCommentsQueryRequest` — `from* <= to*`, иначе **400**.

**Проверка Admin errors (Swagger/Postman):**

| Сценарий | Ожидание |
|----------|----------|
| `GET /api/admin/users/not-existing-id` | **404**, `{ success: false, errors: ["User with id '...' was not found."] }` |
| `PATCH /api/admin/users/{adminUserId}/lock` (self) | **400**, `{ success: false, errors: ["Admin cannot lock own account."] }` |
| `DELETE /api/admin/content/posts/{randomGuid}` | **404**, `{ success: false, errors: ["Post with id '...' was not found."] }` |
| `GET /api/admin/stats/overview` без роли Admin | **403** Forbidden |
| `POST /api/admin/jobs/recommended-queries` с пустым/невалидным body (Admin token) | **400**, unified validation (шаг 16) |
| `POST /api/admin/jobs/recommended-queries` с валидным `{ "query": "dotnet" }` | **200** с DTO |
| `POST /api/admin/users/{id}/roles` с `{ "roleName": "SuperAdmin" }` | **400**, unified validation |
| `PATCH /api/admin/users/{id}/lock` с `lockoutEnd` в прошлом | **400**, unified validation |
| `GET /api/admin/events?fromStartAt=...&toStartAt=...` где from > to | **400**, unified validation |
| `GET /api/admin/content/comments?fromCreatedAt=...&toCreatedAt=...` где from > to | **400**, unified validation |

Postman: папка `12 Validation / Negative cases` — готовые запросы с ожидаемым **400**.

### Admin self-protection (400)

| Действие | Сообщение в `errors[0]` (пример) |
|---|---|
| lock себя | `Admin cannot lock own account.` |
| soft delete себя | `Admin cannot delete own account.` |
| снять у себя роль Admin | `Admin cannot remove own Admin role.` |
| снять Admin у последнего admin | `Cannot remove Admin role from the last admin user.` |

## Swagger

- включен только в Development
- URL: `/swagger`
- кнопка Authorize поддерживает Bearer token

Для точного списка endpoints используйте Swagger как источник правды.
