# 04. Facade-модули (BFF)

## Общий шаблон facade

- `Facade.*.Contracts`
- `Facade.*.Services`
- `Facade.*.Controllers`
- `Facade.*.DI`

Controllers лежат только в facade.

## AccountManagement (`/api/auth`)

- сервис: `IAccountManagementService` → `IIdentityClient`
- controller: `AccountController`
- endpoints: register/login/google/facebook/refresh/logout/me
- особенность: не использует base `*ManagementControllerBase`, отличается error mapping

## ProfileManagement (`/api/profile`)

- controllers: profiles, message settings, views, media
- сервис: `IProfileManagementService` → `IProfileClient` + `IFileStorageService`
- multipart uploads: `POST me/avatar`, `POST me/header` → `AvatarUrl` / `HeaderUrl`
- **people search:** `GET /api/profile/search` — публичный, без JWT; `ProfileSearchQueryRequest` → `PagedResponse<ProfileSearchItemDto>` (query, location, page, pageSize)

## ProfessionalManagement (`/api/professional`)

- controllers: experiences/companies/academies/educations/certificates/skills/languages/recommendations
- сервис: `IProfessionalManagementService` → `IProfessionalClient` + `IFileStorageService`
- catalog writes: skills, academies, languages, recommended-skills — **Admin-only**; uploads: company logo (user), academy logo (Admin), certificate file
- **public profile sections (Step 1):** без JWT:
  - `GET /api/professional/users/{userId}/experiences`
  - `GET /api/professional/users/{userId}/educations`
  - `GET /api/professional/users/{userId}/skills`

## NetworkManagement (`/api/network`)

- controllers: contacts/follows/blocked/groups/group members/group posts/pages/page admins/page followers
- сервис: `INetworkManagementService` → `INetworkClient` + `IFileStorageService`
- orchestration с `IContentClient` для group posts
- uploads: page logo, group avatar
- **contacts (paged):** `GET /api/network/me/contacts` → `PagedResponse<ContactDto>`; query: `page`, `pageSize`, `status`, `direction`
- **shortcuts:** `GET .../contacts/incoming`, `GET .../contacts/outgoing` (pending + direction)
- **badges:** `GET .../contacts/pending-counts`
- **cancel:** `DELETE .../contacts/{contactId}/cancel` — только outgoing pending

## ContentManagement (`/api/content`)

- controllers: posts/media/comments/reactions/hashtags/saved/reposts/views/mentions
- сервис: `IContentManagementService` → `IContentClient` + `INetworkClient` (UserGraph) + `IFileStorageService`
- upload: `POST me/media/upload` → `Media.Url`; attach к post — отдельный flow
- catalog write: `POST hashtags` — **Admin-only**; follow/attach — User JWT
- **feed:** `GET /api/content/feed` — JWT **optional**:
  - без JWT → global public feed (`PagedResponse<PostDto>`);
  - с JWT → network-aware feed (author IDs из Network graph);
  - `limit` — backward-compatible alias для `pageSize` на `page=1`
- **public user posts:** `GET /api/content/users/{userId}/posts` — публичный, `PagedResponse<PostDto>`

## MessagingManagement (`/api/messaging`)

- controllers: chats/chat members/messages/message reads/message media
- сервис: `IMessagingManagementService` → `IMessagingClient` + `IFileStorageService`
- upload: `POST me/messages/{messageId}/media/upload`; JSON attach — `POST .../media`

## JobsManagement (`/api/jobs`)

- controllers: vacancies/favorites/applications/search queries/recommended queries (read-only для recommended)
- сервис: `IJobsManagementService` → `IJobsClient`
- recommended queries: user может только **GET**; POST/DELETE для recommended queries **удалены** из user API (перенесены в AdminManagement)
- **public vacancies list:** `GET /api/jobs/vacancies` → `PagedResponse<VacancyDto>` (не plain array); `GetVacanciesQueryRequest`: `query`, `search` (alias), `sortBy`, `sortDirection`, `fromCreatedAt`, `toCreatedAt`, `page`, `pageSize`

## AdminManagement (`/api/admin`)

Platform admin facade. Проекты: `Facade.AdminManagement.Contracts`, `.Services`, `.Controllers`, `.DI`.

- сервис: `IAdminManagementService` → `IUserResource` (Identity), `IPostResource` + `ICommentResource` (Content), `IVacancyResource` + `IRecommendedJobQueryResource` (Jobs), `IEventResource` (Events)
- отдельного core `AdminManagement` и своего DbContext **нет**
- все `/api/admin/*` требуют JWT с ролью `Admin` (`[Authorize(Roles = IdentityRoleNames.Admin)]`)

### Controllers

| Controller | Route prefix | Назначение |
|---|---|---|
| `AdminUsersController` | `/api/admin/users` | users, roles assignment, lock/unlock, soft delete / restore |
| `AdminRolesController` | `/api/admin/roles` | список ролей платформы |
| `AdminContentController` | `/api/admin/content` | moderation постов (list / soft delete / restore) |
| `AdminCommentsController` | `/api/admin/content/comments` | moderation комментариев (list / soft delete / restore) |
| `AdminJobsController` | `/api/admin/jobs` | moderation вакансий (list / soft delete / restore) + CRUD recommended job queries |
| `AdminEventsController` | `/api/admin/events` | moderation событий (list / soft delete / restore) |
| `AdminStatsController` | `/api/admin/stats` | сводная статистика |

### Admin endpoints (факт)

| Method | Route | Description | Access | Notes |
|---|---|---|---|---|
| GET | `/api/admin/roles` | Список ролей | Admin | |
| GET | `/api/admin/users` | Список пользователей (включая soft-deleted) | Admin | `PagedResponse`; `page`, `pageSize`; filters: `email`, `role`, `isDeleted`, `isLocked`; sort: `sortBy`, `sortDirection` |
| GET | `/api/admin/users/{userId}` | Пользователь по id | Admin | not found → **404** `{ success, errors }` |
| GET | `/api/admin/users/{userId}/roles` | Роли пользователя | Admin | |
| POST | `/api/admin/users/{userId}/roles` | Назначить роль | Admin | body: `{ "roleName": "..." }` → 204 |
| DELETE | `/api/admin/users/{userId}/roles/{roleName}` | Снять роль | Admin | self Admin → 400; last admin → 400 |
| PATCH | `/api/admin/users/{userId}/lock` | Заблокировать | Admin | self lock → 400; revoke refresh tokens |
| PATCH | `/api/admin/users/{userId}/unlock` | Разблокировать | Admin | |
| DELETE | `/api/admin/users/{userId}` | Soft delete пользователя | Admin | self delete → 400; lock + `DeletedAt` + revoke tokens |
| PATCH | `/api/admin/users/{userId}/restore` | Восстановить пользователя | Admin | 204; clears `DeletedAt`, unlocks; idempotent if not deleted |
| GET | `/api/admin/content/posts` | Список постов для moderation | Admin | `PagedResponse<AdminPostDto>`; filters: `authorId`, `isDeleted`, `includeDeleted`, `search`, `createdFrom`, `createdTo`; sort: `sortBy`, `sortDirection` |
| DELETE | `/api/admin/content/posts/{postId}` | Soft delete поста | Admin | 204; без ownership |
| PATCH | `/api/admin/content/posts/{postId}/restore` | Восстановить пост | Admin | 204 |
| GET | `/api/admin/jobs/vacancies` | Список вакансий для moderation | Admin | `PagedResponse<AdminVacancyDto>`; filters: `companyId`, `postedByUserId`, `isDeleted`, `includeDeleted`, `search`, `createdFrom`, `createdTo`; sort: `sortBy`, `sortDirection` |
| DELETE | `/api/admin/jobs/vacancies/{vacancyId}` | Soft delete вакансии | Admin | 204 |
| PATCH | `/api/admin/jobs/vacancies/{vacancyId}/restore` | Восстановить вакансию | Admin | 204 |
| GET | `/api/admin/jobs/recommended-queries` | Список recommended queries | Admin | |
| POST | `/api/admin/jobs/recommended-queries` | Создать recommended query | Admin | body: `{ "query": "..." }` → 200 |
| DELETE | `/api/admin/jobs/recommended-queries/{id}` | Удалить recommended query | Admin | hard delete строки → 204 |
| GET | `/api/admin/events` | Список событий для moderation | Admin | `PagedResponse<AdminEventDto>`; filters: `isDeleted`, `includeDeleted`, `fromStartAt`, `toStartAt`, … |
| DELETE | `/api/admin/events/{eventId}` | Soft delete события | Admin | 204 |
| PATCH | `/api/admin/events/{eventId}/restore` | Восстановить событие | Admin | 204 |
| GET | `/api/admin/content/comments` | Список комментариев для moderation | Admin | `PagedResponse<AdminCommentDto>`; filters: `postId`, `authorUserId`, `includeDeleted`, date range |
| DELETE | `/api/admin/content/comments/{commentId}` | Soft delete комментария | Admin | 204 |
| PATCH | `/api/admin/content/comments/{commentId}/restore` | Восстановить комментарий | Admin | 204 |
| GET | `/api/admin/stats/overview` | Сводка статистики | Admin | users/posts/vacancies/recommended + **events** (`totalEvents`, `activeEvents`, `deletedEvents`, `upcomingEvents`) |

## NotificationsManagement (`/api/notifications`)

- controllers: notifications items, user activity
- сервис: `INotificationsManagementService` → `INotificationsClient`
- **my notifications (paged):** `GET /api/notifications/me` → `PagedResponse<NotificationDto>`; `limit` alias для `pageSize`; filters: `isRead`, `fromCreatedAt`, `toCreatedAt`

## EventsManagement (`/api/events`)

- controllers: events/attendees/schedule/speakers/event-speakers
- сервис: `IEventsManagementService` → `IEventsClient` + `IFileStorageService`
- uploads: event cover (user), speaker avatar (**Admin**); catalog write speakers — **Admin-only**
- **discover (public):** `GET /api/events` — JWT optional; `PagedResponse<EventDto>` с `attendeeCount`; с JWT добавляется `isAttending`
- **attending:** `GET /api/events/me/attending` — JWT required
- **speakers catalog (public):** `GET /api/events/speakers` — paged list (отдельно от `GET me/speakers/{id}`)
- сохранены: `POST/GET/PATCH/DELETE me/events`, join/leave, cover upload, schedule, attach speakers, Admin CRUD speakers

## AIManagement (`/api/ai`)

- controllers: `AIController`
- сервис: `IAIManagementService` → `IAIService` (Gemini + fallback) — **прямая регистрация** `IAIService` в `AddAIManagementFacade`, без полноценного `AI.Client` / `I*Resource` слоя
- endpoints (JWT required): `GET /api/ai/recommended-jobs`, `GET /api/ai/career-advice`
- **без** FileStorage uploads

## FileStorage (shared, не facade CRUD)

См. `09_CONFIG_UPLOADS.md` — `IFileStorageService`, local/S3, 11 upload endpoints, `FileUploadConstants`, `FileUploadValidation`.

## Global catalog / reference entities (Admin-only writes)

Глобальные справочники (не user-owned): **Skill**, **RecommendedSkillByPosition**, **Academy**, **Language**, **Hashtag**, **EventSpeaker**.

| Правило | Описание |
|---|---|
| **Read** | GET/list/search — как раньше (публично или с User JWT, без роли Admin) |
| **User-scoped** | `me/skills`, `me/languages`, attach/detach/follow hashtags, attach speaker к event — User JWT |
| **Catalog write** | POST/PATCH/DELETE глобального справочника — **только Admin** (`[Authorize(Roles = IdentityRoleNames.Admin)]`) |

Обычный пользователь с валидным JWT на catalog write → **403 Forbidden** (пустое тело). Admin → **200** (или business **400**).

### Professional catalog (skills)

| Method | Route | Auth |
|---|---|---|
| GET | `/api/professional/skills` | публичный read (paged list) |
| POST | `/api/professional/skills` | **Admin-only** |

### Professional catalog (languages)

| Method | Route | Auth |
|---|---|---|
| GET | `/api/professional/languages` | публичный read (paged list) |
| POST | `/api/professional/languages` | **Admin-only** |

### Professional catalog (academies)

| Method | Route | Auth |
|---|---|---|
| GET | `/api/professional/academies` | публичный read (paged list) |
| POST | `/api/professional/academies` | **Admin-only** |
| POST | `/api/professional/academies/{academyId}/logo` | **Admin-only** (upload) |

### Content catalog (hashtags)

| Method | Route | Auth |
|---|---|---|
| GET | `/api/content/hashtags` | User JWT (authorized read, paged list) |
| POST | `/api/content/hashtags` | **Admin-only** |

### Admin-only catalog write endpoints

| Method | Route | Entity |
|---|---|---|
| POST | `/api/professional/skills` | Skill |
| POST | `/api/professional/recommended-skills` | RecommendedSkillByPosition |
| DELETE | `/api/professional/recommended-skills/{rspId}` | RecommendedSkillByPosition |
| POST | `/api/professional/academies` | Academy |
| POST | `/api/professional/academies/{academyId}/logo` | Academy (upload) |
| POST | `/api/professional/languages` | Language |
| POST | `/api/content/hashtags` | Hashtag |
| POST | `/api/events/me/speakers` | EventSpeaker |
| PATCH | `/api/events/me/speakers/{speakerId}` | EventSpeaker |
| DELETE | `/api/events/me/speakers/{speakerId}` | EventSpeaker |
| POST | `/api/events/me/speakers/{speakerId}/avatar` | EventSpeaker (upload) |

**EventSpeaker:** глобальный справочник без `OwnerId`; write/avatar — Admin-only; read: `GET /api/events/speakers` (public paged catalog), `GET me/speakers/{id}` — User JWT.

**Recommended job queries** (`/api/jobs/recommended-queries`): user только **GET**; write — `/api/admin/jobs/recommended-queries`.

## Общие правила facade

- JWT current user берется из claims, не из body
- validation через DataAnnotations + ModelState
- ошибки: MapErrors (404 vs 400) для большинства CRUD фасадов
- business logic остается в core services
