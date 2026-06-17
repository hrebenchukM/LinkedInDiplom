

---

<!-- merged from: 02_ARCHITECTURE_AND_MODULES.md -->

# Архитектура и правила

## Слои

Frontend  
↓ HTTP  
Facade.API  
↓ Controllers (`Facade.*.Controllers`)  
Facade services (`Facade.*.Services`)  
↓ `I*Client` / Resource (+ `IFileStorageService` для uploads)  
Core services (`*.Services`)  
↓ `*DbContext` (`*.DataAccess`)  
PostgreSQL schema

## Program.cs (факт)

Facade.API регистрирует:

- 9 core модулей: `AddIdentityModule ... AddEventsModule`
- shared **FileStorage**: `AddFileStorage(configuration)`
- facade модулей: `AddAccountManagementFacade`, `AddProfileManagementFacade`, … `AddEventsManagementFacade`, `AddAdminManagementFacade`, `AddAIManagementFacade`
- controllers через `AddApplicationPart(...)` (включая `AdminManagementControllersAssemblyMarker`, `AIController`)
- JWT, CORS, Swagger (dev), static files `/uploads`

## FileStorage (shared infrastructure)

Не core-модуль и не facade bounded context. Отдельные проекты `backend/FileStorage/Facade.FileStorage.*`.

```
Upload Controller (IFormFile)
  → Facade *ManagementService
    → permission / existence check (entity uploads)
    → IFileStorageService.SaveAsync
      → local /uploads/...  OR  S3 HTTPS URL
    → I*Client updates URL in DB (string only, no blob)
```

- Feature facades зависят только от `Facade.FileStorage.Contracts`.
- `FileStorageService` не зависит от Profile/Content/Professional/Network/Events/Messaging.
- Подробности: `05_CONFIGURATION_AND_UPLOADS.md`.

## Facade.Shared.Contracts (shared facade contracts)

`backend/Facade/Facade.Shared.Contracts` — **не** бизнес-модуль и не bounded context.

- Хранит только **технические** общие facade/API contracts, переиспользуемые несколькими `Facade.*Management` модулями.
- Сейчас: **pagination** (`PagedRequest`, `PagedResponse<T>`, `Pagination` helper).
- Feature modules **не** должны складывать туда свои бизнес DTO, Request/Response bounded context или entities.
- При подключении пагинации к list endpoints модули добавляют `ProjectReference` только когда реально используют contract.
- При будущем переходе к микросервисам такие contracts могут быть вынесены в отдельный shared NuGet/package без переноса бизнес-логики.

## Platform Admin (Facade.AdminManagement)

`Facade.AdminManagement` — facade для **platform admin** (администратор платформы), а не отдельный core-модуль.

- **Нет своего** `*DbContext` и schema: admin facade не владеет данными.
- **Не путать** с `network.page_admins` — это админы **страниц** (Network), другая сущность и другие endpoints (`/api/network/.../pages/.../admins`).

### Request flow (admin)

```
HTTP /api/admin/*
  → Facade.AdminManagement.Controllers (Admin*Controller)
  → IAdminManagementService (Facade.AdminManagement.Services)
  → Client Resources: IUserResource (Identity), IPostResource + ICommentResource (Content),
    IVacancyResource + IRecommendedJobQueryResource (Jobs), IEventResource (Events)
  → Core Services (UserAdminService, PostService, CommentService, VacancyService, EventService, …)
  → свой DbContext модуля
```

Правило сохранено: `Facade.AdminManagement` **не ссылается** на чужой `*DataAccess` напрямую.

### Cross-module read orchestration (примеры)

**Network-aware feed (Content → Network):**

```
GET /api/content/feed (+ optional JWT)
  → ContentManagementService
  → INetworkClient.UserGraph.GetUserNetworkUserIdsAsync (если JWT)
  → IPostResource.GetFeedPostsAsync(GetFeedPostsParameters { AuthorUserIds, ViewerUserId })
  → PostService (Content schema)
```

**Events list enrichment (Events facade):**

```
GET /api/events (discover)
  → EventsManagementService
  → IEventResource.DiscoverEventsAsync + attendee counts из core
  → при JWT: IsAttending вычисляется в facade по attending set
```

Такой orchestration **не** нарушает границу модулей: facade координирует, core владеет данными своей schema.

### Facade.API как composition root

`Facade.API/Program.cs` — host-level composition root: регистрация core modules, facades, JWT, Swagger, **и** `ApplyMigrationsAsync` для всех 9 `DbContext` в фиксированном порядке (см. «Порядок migrations» ниже). Отдельного migration runner проекта нет.

## Domain events (loose coupling)

Модули обмениваются side-effects через **domain events** без прямых ссылок между feature modules:

- **Publisher:** core service после успешного `SaveChangesAsync` вызывает `IDomainEventPublisher.PublishAsync(...)`.
- **Consumer:** модуль-подписчик регистрирует `IDomainEventHandler<TEvent>` в своём DI.
- **Contracts:** payload events живут в отдельных `*.Events.Contracts` проектах (без DbContext, DTO facade, SignalR).

**Пример (реализовано):** Content `CommentService` публикует `CommentCreatedEvent` → Notifications `CreateNotificationOnCommentCreatedHandler` создаёт notification для автора поста (кроме self-comment). Content **не зависит** от Notifications.

**Пример (реализовано):** Content `ReactionService` публикует `ReactionUpsertedEvent` только при **первой** реакции пользователя на пост → Notifications `CreateNotificationOnReactionUpsertedHandler` создаёт notification для автора поста (кроме self-reaction; update типа реакции event не публикует). Content **не зависит** от Notifications.

**Пример (реализовано):** Network `ContactService` публикует `ContactRequestSentEvent` → Notifications `CreateNotificationOnContactRequestSentHandler` создаёт notification для получателя request (кроме self-request). Network **не зависит** от Notifications.

**Пример (реализовано):** Network `ContactService` публикует `ContactRequestAcceptedEvent` → Notifications `CreateNotificationOnContactRequestAcceptedHandler` создаёт notification для отправителя request (requester). Network **не зависит** от Notifications.

**Текущий transport:** in-memory (`InMemoryDomainEventPublisher` в Identity.DI). При выделении microservices — заменить publisher на broker/outbox; handlers и event contracts остаются на границе модулей.

### AI module (microservice readiness note)

`AIManagement` регистрирует `IAIService` напрямую в facade DI (`AddAIManagementFacade`), без `AI.Client` / `I*Resource`. Для выделения AI в отдельный сервис потребуется client boundary по тому же паттерну, что у остальных модулей.

## Порядок migrations

`ApplyMigrationsAsync`:

1. Identity
2. Profile
3. Professional
4. Network
5. Content
6. Messaging
7. Jobs
8. Notifications
9. Events

## Паттерны (реально в коде)

- interface-based programming (`I*Service`, `I*Client`, `I*Resource`)
- dependency inversion (facade зависит от `I*Client`, не от DbContext)
- dependency injection (extension methods `Add*Module`, `Add*ManagementFacade`)
- separation of concerns (Controller / Facade Service / Core Service / DataAccess)
- DTO + Request/Response + Parameters/Results
- service layer
- client/resource pattern
- feature-based controllers
- partial facade services
- DataAnnotations validation
- error mapping (`MapErrors` в base controllers)
- DbContext per module, schema per module
- soft delete
- domain events (`UserRegisteredEvent`)
- async/await

## Почему не Repository/UoW как у преподавателя

В проекте используется связка `DbContext + Services + Client/Resource`, потому что:

- граница — модуль и его schema
- меньше лишних абстракций
- удобнее выносить модуль в микросервис позже

## Что нельзя ломать

- controllers только в facade
- core не ссылается на facade
- facade/core не ссылаются на чужой DataAccess
- не переносить бизнес-логику в controller
- не менять net8.0 без отдельного решения


---

<!-- merged from: 02_ARCHITECTURE_AND_MODULES.md -->

# Core-модули

# 03. Core-модули

## Общий шаблон core

`Contracts + DataAccess + Services + Client.Contracts + Client + DI`  
Identity дополнительно имеет `Events + Events.Contracts`.

## Identity (`identity`)

- сервисы: `IAuthenticationService`, `IUserService`, `ITokenService`, `IExternalAuthService`, `IRoleService`, `IUserAdminService`
- клиент: `IIdentityClient` (`Users`, `Authentication`, `ExternalAuth`); admin-операции также через `IUserResource` (users/roles/stats)
- сущности: `ApplicationUser`, `RefreshToken` (+ ASP.NET Identity `AspNetRoles`, `AspNetUserRoles`)
- domain event: `UserRegisteredEvent`
- роли: `IdentityRoleNames.Admin`, `IdentityRoleNames.User`
- seed: `IdentityDataSeeder` (роли Admin/User), `AdminSeed` из конфигурации (первый admin только при настроенном Email/Password)
- регистрация: после `CreateAsync` пользователь получает роль `User` (при ошибке назначения роли — rollback через `DeleteAsync`)
- admin users: `IUserAdminService` — list/get/lock/unlock/soft delete/restore, filters (email, role, isDeleted, isLocked, sort), `RevokeAllUserTokensAsync` при lock/delete
- stats: `IdentityStatsDto` + `GetIdentityStatsAsync` (total/deleted/active users)
- JWT: `ClaimTypes.Role` для каждой роли пользователя (см. `04_API_REFERENCE.md`)

## Profile (`profile`)

- сервисы: `IProfileService`, `IMessageSettingsService`, `IProfileViewService`
- сущности: `UserProfile`, `MessageSettings`, `ProfileView`
- логика: пустой профиль создается через событие регистрации (fallback есть в flow `/api/profile/me`)
- **people search:** `IProfileService.SearchAsync(SearchProfilesParameters)` → `SearchProfilesResult` с `ProfileSearchItemDto` (query, location, paging); публичный read через facade `GET /api/profile/search`

## Professional (`professional`)

- сущности: company/experience/education/certificate/skill/language/recommendation и связки
- сервисы: `ICompanyService`, `IExperienceService`, `IEducationService`, `ICertificateService`, `ISkillService`, `IUserSkillService`, `ILanguageService`, `IUserLanguageService`, `ICertificateSkillService`, `IRecommendedSkillByPositionService`, `IRecommendationService`

## Network (`network`)

- сущности: contacts, follows, blocked_users, user_groups, group_members, group_posts, pages, page_admins, page_followers
- `group_posts` привязывает group к postId; ownership поста оркестрируется facade-слоем через Content client
- **contacts (paged):** `IContactService.GetMyContactsAsync` → `ContactsPageResult`; filters: `status`, `direction` (incoming/outgoing pending)
- **cancel outgoing pending:** `IContactService.CancelAsync(CancelContactRequestParameters)` — только исходящий pending; accepted не отменяется через cancel
- **pending badges:** `IContactService.GetContactPendingCountsAsync` → `ContactPendingCountsDto` (`incomingCount`, `outgoingCount`)
- **user graph (feed):** `INetworkUserGraphService.GetUserNetworkUserIdsAsync(GetUserNetworkUserIdsParameters)` → `NetworkUserGraphService`; author IDs для network-aware feed (contacts accepted + following)

## Content (`content`)

- сущности: posts, media, post_media, comments, reactions, hashtags, post_hashtags, user_hashtag_follows, saved_posts, reposts, post_views, mentions
- ключевые правила: visibility, reaction upsert, repost_count, soft delete (`DeletedAt`)
- user delete поста: ownership по `UserId` (`IPostService.DeleteAsync`)
- **public user posts:** `IPostService.GetUserPublicPostsAsync(GetUserPublicPostsParameters)` → `MyPostsResult` (paged public posts по `userId`)
- **feed:** `IPostService.GetFeedPostsAsync(GetFeedPostsParameters)` → `FeedPostsResult`; если `AuthorUserIds` задан и не пуст — посты только от этих авторов (+ private own posts для `ViewerUserId`); иначе все public posts
- platform admin posts: `GetAdminPostsAsync`, `AdminSoftDeletePostAsync` / `AdminRestorePostAsync`
- platform admin comments: `ICommentService.GetAdminCommentsAsync(GetAdminCommentsParameters)` → `AdminCommentsResult` (`AdminCommentDto`); `AdminSoftDeleteCommentAsync` / `AdminRestoreCommentAsync` (soft delete; `post.CommentCount` корректируется)
- stats: `ContentStatsDto` + `GetContentStatsAsync` (total/deleted/active posts)

## Messaging (`messaging`)

- сущности: chats, chat_members, messages, message_reads, message_media
- v1: без realtime

## Jobs (`jobs`)

- сущности: vacancies, user_vacancies_favorites, job_applications, job_search_queries, job_search_results, recommended_job_queries
- v1: company validation через Professional не реализована
- **public vacancies list (paged):** `IVacancyService.GetVacanciesAsync(GetVacanciesParameters)` → `VacanciesPageResult`; filters: `query` / `search` alias, `sortBy`, `sortDirection`, `fromCreatedAt`, `toCreatedAt`
- user delete вакансии: ownership по `PostedBy` (`IVacancyService.DeleteAsync`)
- platform admin: `GetAdminVacanciesAsync`, `AdminSoftDeleteVacancyAsync` / `AdminRestoreVacancyAsync`
- **recommended job queries**: глобальный справочник; **write** только через Admin API; user API — только `GET /api/jobs/recommended-queries`
- stats: `JobsStatsDto` + `GetJobsStatsAsync` (vacancies + `TotalRecommendedJobQueries`)

## Notifications (`notifications`)

- сущности: notifications, user_activity
- notifications soft delete; user_activity append-only
- **my notifications (paged):** `INotificationService.GetMyNotificationsAsync(GetMyNotificationsParameters)` → `NotificationsPageResult`; filters: `isRead`, `fromCreatedAt`, `toCreatedAt` (facade может маппить `limit` → `pageSize` на page 1)

## Events (`events`)

- сущности: events, event_attendees, event_schedule, event_speakers, event_speaker_map
- не путать с Identity domain events
- **discover (public):** `IEventService.DiscoverEventsAsync(DiscoverEventsParameters)` → `EventsPageResult`; filters: `query`, `fromStartAt`, `toStartAt`, `location`, `isOnline`; core `EventDto.AttendeeCount`
- **attending list:** `IEventService.GetAttendingEventsAsync(GetAttendingEventsParameters)` → `EventsPageResult` (JWT user)
- **speakers catalog (public paged):** `IEventSpeakerService.GetSpeakersAsync` → `EventSpeakersPageResult`
- facade enrichment: `IsAttending` вычисляется в `EventsManagementService` (не поле БД)
- platform admin: `GetAdminEventsAsync`, `AdminSoftDeleteEventAsync`, `AdminRestoreEventAsync`; stats: `GetEventsStatsAsync` → `EventsStatsDto` (`TotalEvents`, `ActiveEvents`, `DeletedEvents`, `UpcomingEvents`)

## Связи между модулями

- через `I*Client` / `I*Resource`
- через `Identity.Events.Contracts` (регистрация → профиль)
- **read-time orchestration:** ContentManagement → `INetworkClient.UserGraph` → network author IDs для feed (`GetFeedPostsParameters.AuthorUserIds`)
- **admin moderation:** AdminManagement → `IPostResource`, `ICommentResource` (Content), `IEventResource` (Events), `IVacancyResource` (Jobs), `IUserResource` (Identity)
- без прямых ссылок на чужой DataAccess


---

<!-- merged from: 02_ARCHITECTURE_AND_MODULES.md -->

# Facade-модули

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

См. `05_CONFIGURATION_AND_UPLOADS.md` — `IFileStorageService`, local/S3, 11 upload endpoints, `FileUploadConstants`, `FileUploadValidation`.

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


---

<!-- merged from: 02_ARCHITECTURE_AND_MODULES.md -->

# Паттерны и принципы

# 20. Patterns and Principles (from this project)

> Не абстрактная теория — только то, что реально видно в коде LinkedInDiplom.

---

## Modular Monolith

**Что:** один deployable (`Facade.API`), но логически разделён на bounded contexts (Identity, Profile, Content, …).

**Зачем:** проще deploy чем microservices, но границы модулей позволяют позже extract service.

**Пример:** `Content.Services` не ссылается на `Network.DataAccess` — только на `INetworkClient`.

---

## Facade Pattern

**Что:** `Facade.*Management` модули — тонкий API-слой над core.

**Зачем:** 
- HTTP concerns (controllers, DTO mapping, auth attributes)
- Orchestration нескольких core clients
- BFF-like aggregation (feed + network graph)

**Пример:** `ProfileManagementService.Media.cs` — проверяет JWT user, вызывает `IFileStorageService`, затем `IProfileClient`.

**Admin facade:** `Facade.AdminManagement` — platform admin без своего DbContext.

---

## DTO Pattern

**Что:** Request/Response/Dto классы в `*.Contracts` проектах.

**Зачем:** не expose EF entities наружу; stable API contract.

**Пример:** `CreatePostRequest` → `PostService` → `Post` entity → `PostDto` response.

---

## Client / Resource Abstraction

**Что:** Core modules expose `I*Client` with `I*Resource` interfaces.

**Зачем:** другие modules вызывают через contract, не через DbContext.

**Пример:** `ContentManagementService` → `INetworkClient.UserGraph.GetUserNetworkUserIdsAsync()` для network-aware feed.

**Исключение:** `AIManagement` вызывает `IAIService` напрямую (architectural debt для future extraction).

---

## Dependency Injection

**Что:** все services/clients/handlers регистрируются в `*.DI` projects.

**Пример:** `Program.cs`:
```csharp
builder.Services.AddIdentityModule(...);
builder.Services.AddProfileManagementFacade(...);
```

---

## Options Pattern

**Что:** strongly-typed config classes bound from `appsettings`.

**Примеры:**
- `JwtSettings` — token signing
- `DemoSeedOptions` — seed configuration
- `AdminSeedOptions` — admin user on first run
- `UploadsOptions` / `AwsS3Options` — file storage

---

## Domain Events

См. [07_REALTIME_AND_DOMAIN_EVENTS.md](07_REALTIME_AND_DOMAIN_EVENTS.md).

**Пример:** `UserRegisteredEvent` → auto-create empty profile.

---

## Soft Delete

**Что:** nullable `DeletedAt` timestamp вместо physical DELETE.

**Где:** posts, comments, users, vacancies, events, profiles, …

**Важно:** нет global EF query filter — каждый service фильтрует `DeletedAt == null` в queries.

**Admin restore:** `PATCH .../restore` clears `DeletedAt`.

---

## Pagination

**Contract:** `Facade.Shared.Contracts` — `PagedRequest`, `PagedResponse<T>`, `Pagination` helper.

**Пример:** `GET /api/jobs/vacancies?page=1&pageSize=20` → `{ items, totalCount, page, pageSize }`.

**Defaults:** typically page=1, pageSize=20; max pageSize enforced in helper.

---

## Result / Response Wrappers

**Что:** facade services return typed responses with `Success`, `Errors`, `Data`.

**Пример:** `ProfileResponse { Success, Errors, Profile }`

Controllers map via `MapErrors()` in base classes → 400/404.

---

## CQRS-like Requests

**Что:** query/request classes для complex reads.

**Примеры:**
- `GetVacanciesQueryRequest` — filters + pagination
- `GetFeedParameters` — feed paging
- `AdminUsersQueryRequest` — admin search/filter

Не full CQRS (нет MediatR), но separation read parameters от write requests.

---

## Separation of Concerns

| Layer | Responsibility |
|-------|----------------|
| Controllers | HTTP, auth attributes, model binding |
| Facade Services | Orchestration, DTO mapping, permissions |
| Core Services | Business rules, DbContext access |
| DataAccess | EF entities, migrations |

**Правило:** controllers не содержат business logic.

---

## SOLID (видимые примеры)

- **S:** `CommentService` — только comments; `ReactionService` — только reactions
- **O:** new notification types via new handlers, не меняя CommentService
- **L:** `IFileStorageService` — local и S3 interchangeable
- **I:** small interfaces: `IProfileClient`, `IUserResource`
- **D:** controllers depend on `IProfileManagementService`, not concrete class

---

## BFF / Facade API

`Facade.API` — единая точка входа для frontend:
- Aggregates data from multiple modules
- Single JWT validation
- Single CORS policy
- Swagger documentation

При microservices → Facade becomes API Gateway or stays as BFF.
