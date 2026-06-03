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
- сервис: `IProfileManagementService` → `IProfileClient`
- uploads avatar/header и раздача `/uploads`

## ProfessionalManagement (`/api/professional`)

- controllers: experiences/companies/academies/educations/certificates/skills/languages/recommendations
- сервис: `IProfessionalManagementService` → `IProfessionalClient`

## NetworkManagement (`/api/network`)

- controllers: contacts/follows/blocked/groups/group members/group posts/pages/page admins/page followers
- сервис: `INetworkManagementService` → `INetworkClient`
- orchestration с `IContentClient` для group posts

## ContentManagement (`/api/content`)

- controllers: posts/media/comments/reactions/hashtags/saved/reposts/views/mentions
- сервис: `IContentManagementService` → `IContentClient`

## MessagingManagement (`/api/messaging`)

- controllers: chats/chat members/messages/message reads/message media
- сервис: `IMessagingManagementService` → `IMessagingClient`

## JobsManagement (`/api/jobs`)

- controllers: vacancies/favorites/applications/search queries/recommended queries (read-only для recommended)
- сервис: `IJobsManagementService` → `IJobsClient`
- recommended queries: user может только **GET**; POST/DELETE для recommended queries **удалены** из user API (перенесены в AdminManagement)

## AdminManagement (`/api/admin`)

Platform admin facade. Проекты: `Facade.AdminManagement.Contracts`, `.Services`, `.Controllers`, `.DI`.

- сервис: `IAdminManagementService` → `IUserResource` (Identity), `IPostResource` (Content), `IVacancyResource` + `IRecommendedJobQueryResource` (Jobs)
- отдельного core `AdminManagement` и своего DbContext **нет**
- все `/api/admin/*` требуют JWT с ролью `Admin` (`[Authorize(Roles = IdentityRoleNames.Admin)]`)

### Controllers

| Controller | Route prefix | Назначение |
|---|---|---|
| `AdminUsersController` | `/api/admin/users` | users, roles assignment, lock/unlock, soft delete |
| `AdminRolesController` | `/api/admin/roles` | список ролей платформы |
| `AdminContentController` | `/api/admin/content` | moderation постов (soft delete / restore) |
| `AdminJobsController` | `/api/admin/jobs` | moderation вакансий + CRUD recommended job queries |
| `AdminStatsController` | `/api/admin/stats` | сводная статистика |

### Admin endpoints (факт)

| Method | Route | Description | Access | Notes |
|---|---|---|---|---|
| GET | `/api/admin/roles` | Список ролей | Admin | |
| GET | `/api/admin/users` | Список пользователей (включая soft-deleted) | Admin | без pagination (v1) |
| GET | `/api/admin/users/{userId}` | Пользователь по id | Admin | not found → 400 `{ error }` |
| GET | `/api/admin/users/{userId}/roles` | Роли пользователя | Admin | |
| POST | `/api/admin/users/{userId}/roles` | Назначить роль | Admin | body: `{ "roleName": "..." }` → 204 |
| DELETE | `/api/admin/users/{userId}/roles/{roleName}` | Снять роль | Admin | self Admin → 400; last admin → 400 |
| PATCH | `/api/admin/users/{userId}/lock` | Заблокировать | Admin | self lock → 400; revoke refresh tokens |
| PATCH | `/api/admin/users/{userId}/unlock` | Разблокировать | Admin | |
| DELETE | `/api/admin/users/{userId}` | Soft delete пользователя | Admin | self delete → 400; lock + `DeletedAt` + revoke tokens |
| DELETE | `/api/admin/content/posts/{postId}` | Soft delete поста | Admin | 204; без ownership |
| PATCH | `/api/admin/content/posts/{postId}/restore` | Восстановить пост | Admin | 204 |
| DELETE | `/api/admin/jobs/vacancies/{vacancyId}` | Soft delete вакансии | Admin | 204 |
| PATCH | `/api/admin/jobs/vacancies/{vacancyId}/restore` | Восстановить вакансию | Admin | 204 |
| GET | `/api/admin/jobs/recommended-queries` | Список recommended queries | Admin | |
| POST | `/api/admin/jobs/recommended-queries` | Создать recommended query | Admin | body: `{ "query": "..." }` → 200 |
| DELETE | `/api/admin/jobs/recommended-queries/{id}` | Удалить recommended query | Admin | hard delete строки → 204 |
| GET | `/api/admin/stats/overview` | Сводка статистики | Admin | users/posts/vacancies/recommended count |

## NotificationsManagement (`/api/notifications`)

- controllers: notifications items, user activity
- сервис: `INotificationsManagementService` → `INotificationsClient`

## EventsManagement (`/api/events`)

- controllers: events/attendees/schedule/speakers/event-speakers
- сервис: `IEventsManagementService` → `IEventsClient`

## Общие правила facade

- JWT current user берется из claims, не из body
- validation через DataAnnotations + ModelState
- ошибки: MapErrors (404 vs 400) для большинства CRUD фасадов
- business logic остается в core services
