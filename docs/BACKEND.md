# LinkedInDiplom — полная документация backend

Единый документ: архитектура, host, все 9 core + 9 facade модулей, API, Docker, JWT, тесты. Стек: **.NET 8** (`net8.0`), **EF Core 8 + Npgsql**, **PostgreSQL 16**, host **`Facade.API`**.

**Схема таблиц:** [database/DB_SCHEMA.md](./database/DB_SCHEMA.md)  
**Быстрый старт Docker:** [../QUICKSTART.md](../QUICKSTART.md)

---

## Содержание

1. [Обзор и слои](#1-обзор-и-слои)
2. [Структура solution](#2-структура-solution)
3. [Паттерны и правила](#3-паттерны-и-правила)
4. [Facade.API (host)](#4-facadeapi-host)
5. [Интеграция модулей (DI, миграции)](#5-интеграция-модулей-di-миграции)
6. [Auth: Identity + AccountManagement](#6-auth-identity--accountmanagement)
7. [Profile + ProfileManagement](#7-profile--profilemanagement)
8. [Professional + ProfessionalManagement](#8-professional--professionalmanagement)
9. [Network + NetworkManagement](#9-network--networkmanagement)
10. [Content + ContentManagement](#10-content--contentmanagement)
11. [Messaging + MessagingManagement](#11-messaging--messagingmanagement)
12. [Jobs + JobsManagement](#12-jobs--jobsmanagement)
13. [Notifications + NotificationsManagement](#13-notifications--notificationsmanagement)
14. [Events + EventsManagement](#14-events--eventsmanagement)
15. [Docker и PostgreSQL](#15-docker-и-postgresql)
16. [Тесты, roadmap, v1](#16-тесты-roadmap-v1)

---

## 1. Обзор и слои

**LinkedInDiplom** — учебный backend «клон LinkedIn» как **модульный монолит** + **BFF**:

- **9 core-модулей** — бизнес-логика, своя PostgreSQL-схема, EF migrations.
- **9 facade-модулей** (`*Management`) — HTTP API, оркестрация, маппинг Request/Response.
- **1 host** — `Facade.API` (один процесс, один Docker-контейнер `linkedin-api`).

Микросервисы **не развёрнуты**; границы — через `I*Client` / `I*Resource` (сейчас in-process, позже HTTP).

```
┌─────────────────────────────────────────────────────────────┐
│  Facade.API — Program.cs, JWT, CORS, Swagger, migrations     │
└───────────────────────────┬─────────────────────────────────┘
                            │ Add*Module + Add*ManagementFacade
┌───────────────────────────▼─────────────────────────────────┐
│  Facade.*Management — Controllers → Services → I*Client       │
└───────────────────────────┬─────────────────────────────────┘
                            │ in-process
┌───────────────────────────▼─────────────────────────────────┐
│  Core — Client → Resource → Service → DbContext → schema      │
└─────────────────────────────────────────────────────────────┘
```

| Слой | Папка | Задача |
|------|-------|--------|
| Host | `backend/Facade.API/` | Composition root, pipeline |
| Facade | `backend/*Management/` | REST, JWT → userId, файлы uploads |
| Core | `backend/Identity/`, … | Parameters/Results, бизнес-правила |

**Контроллеры только в facade.** Core без HTTP.

### Поток запроса (профиль)

```
PUT /api/profile/me + Bearer JWT
  → ProfileProfilesController.GetCurrentUserId()
  → ProfileManagementService → IProfileClient.Profiles
  → ProfileService → ProfileDbContext → schema profile
```

### Поток регистрации

```
POST /api/auth/register
  → AccountController → IIdentityClient
  → UserRegisteredEvent (in-memory)
  → Profile handler → пустой user_profiles
```

Fallback: `GET /api/profile/me` (JWT) → `CreateEmptyAsync`, если событие не сработало.

---

## 2. Структура solution

`LinkedIn.sln` (~100 проектов):

```
backend/
├── Identity/          (+ Identity.Events*)
├── Profile/, Professional/, Network/, Content/
├── Messaging/, Jobs/, Notifications/, Events/
├── AccountManagement/, ProfileManagement/, … *Management/
├── Facade.API/
└── Tests/LinkedIn.Tests/
```

### Core (6 проектов + Events у Identity)

| Проект | Роль |
|--------|------|
| `{Module}.Contracts` | `I*Service`, Parameters, Results, DTO |
| `{Module}.DataAccess` | Entities, DbContext, migrations |
| `{Module}.Services` | Бизнес-логика |
| `{Module}.Client.Contracts` | `I{Module}Client`, `I*Resource` |
| `{Module}.Client` | In-process Client/Resource |
| `{Module}.DI` | `Add{Module}Module(configuration, connectionString)` |

Identity дополнительно: `Identity.Events`, `Identity.Events.Contracts`.

### Facade (4 проекта)

`Facade.{Name}.Contracts` | `.Services` | `.Controllers` | `.DI` → `Add{Name}ManagementFacade()`

---

## 3. Паттерны и правила

### Паттерны

| Паттерн | В проекте |
|---------|-----------|
| Modular Monolith | Один deploy, много модулей |
| BFF | Facade под frontend |
| Layered Architecture | Contracts → Services → DataAccess |
| Client / Resource | Шов для микросервисов |
| DbContext per module | Schema `identity`, `profile`, … |
| Domain events | `UserRegisteredEvent` (in-memory v1) |
| Soft delete | `deleted_at` |
| Feature controllers | `ContentPostsController`, не God controller |
| Partial facade services | `*.Posts.cs`, `*.Comments.cs` |

**Не используется (как у преподавателя):** общий Repository/UoW, God DbContext — ломает границы модулей.

### Ссылки между проектами

| ✅ | ❌ |
|----|-----|
| Facade → `*.Client.Contracts` | Core → Facade |
| Core → `Other.Client.Contracts` / Events.Contracts | Core → чужой DataAccess |
| Host → `*.DI`, migrate всех DbContext | Facade → чужой DataAccess |
| | Controller → DbContext |

### Стиль кода

- Имена: `IProfileService`, `GetProfileByIdParameters`, `AddProfileModule`
- Controllers тонкие; логика в core Services
- JWT `userId` на `/me/*` — только из claims, не из body

### Что нельзя ломать

Один host `Facade.API`; `net8.0`; маршруты `/api/auth` (не `/api/account`); Resource/Client — единственный вызов чужого модуля.

### Устаревшее

- `/api/account` → **`/api/auth`**
- `Services:ProfileApi` — **не используется**
- .NET 10 в старых заметках → **.NET 8**

---

## 4. Facade.API (host)

**Facade.API** — единственная точка входа.

| Делает | Не делает |
|--------|-----------|
| DI всех модулей, JWT, CORS | Бизнес-логика |
| `ApplyMigrationsAsync` | Controllers (они в facade) |
| Static `/uploads` | |

**Program.cs (порядок):** connection string → uploads → 9× `Add*Module` → 9× `Add*ManagementFacade` → `AddControllers` + 9× `AddApplicationPart` → JWT → Swagger (dev) → CORS → build → migrate → pipeline.

**JWT:** symmetric `JwtSettings:SecretKey`; validate issuer/audience/lifetime; `ClockSkew = Zero`; header `Authorization: Bearer <token>`.

**Refresh token:** в PostgreSQL (`identity`), не в JWT; ротация при refresh.

**Swagger:** только Development → http://localhost:5000/swagger (Docker).

**CORS:** dev — any origin; prod — `Cors:AllowedOrigins`.

**Uploads:** `FileStorage:UploadsRootPath` или `{ContentRoot}/uploads`; URL `/uploads`; Docker volume `profile_uploads`.

**Локально:** `cd backend/Facade.API && dotnet run` — порты в `launchSettings.json` (~5282 HTTP, ~7011 HTTPS).

**Конфиг:** `ConnectionStrings:DefaultConnection`, `JwtSettings:*`, `ASPNETCORE_ENVIRONMENT`, `ASPNETCORE_URLS` (Docker: `http://+:8080`).

---

## 5. Интеграция модулей (DI, миграции)

### Core registration

| # | Модуль | Extension | DbContext | Schema |
|---|--------|-----------|-----------|--------|
| 1 | Identity | `AddIdentityModule` | `IdentityDbContext` | `identity` |
| 2 | Profile | `AddProfileModule` | `ProfileDbContext` | `profile` |
| 3 | Professional | `AddProfessionalModule` | `ProfessionalDbContext` | `professional` |
| 4 | Network | `AddNetworkModule` | `NetworkDbContext` | `network` |
| 5 | Content | `AddContentModule` | `ContentDbContext` | `content` |
| 6 | Messaging | `AddMessagingModule` | `MessagingDbContext` | `messaging` |
| 7 | Jobs | `AddJobsModule` | `JobsDbContext` | `jobs` |
| 8 | Notifications | `AddNotificationsModule` | `NotificationsDbContext` | `notifications` |
| 9 | Events | `AddEventsModule` | `EventsDbContext` | `events` |

### Facade registration

| Facade | Extension | API | ApplicationPart (пример) |
|--------|-----------|-----|--------------------------|
| AccountManagement | `AddAccountManagementFacade` | `/api/auth` | `AccountController` |
| ProfileManagement | `AddProfileManagementFacade` | `/api/profile` | `ProfileProfilesController` |
| ProfessionalManagement | `AddProfessionalManagementFacade` | `/api/professional` | `ProfessionalExperiencesController` |
| NetworkManagement | `AddNetworkManagementFacade` | `/api/network` | `NetworkContactsController` |
| ContentManagement | `AddContentManagementFacade` | `/api/content` | `ContentPostsController` |
| MessagingManagement | `AddMessagingManagementFacade` | `/api/messaging` | `MessagingChatsController` |
| JobsManagement | `AddJobsManagementFacade` | `/api/jobs` | `JobsVacanciesController` |
| NotificationsManagement | `AddNotificationsManagementFacade` | `/api/notifications` | `NotificationsItemsController` |
| EventsManagement | `AddEventsManagementFacade` | `/api/events` | `EventsEventsController` |

### Миграции (`DatabaseExtensions.ApplyMigrationsAsync`)

Порядок: Identity → Profile → Professional → Network → Content → Messaging → Jobs → Notifications → Events.

`init-db.sql` (Docker) создаёт только schema `identity`; остальное — EF.

Ручной пример: `dotnet ef database update --context IdentityDbContext` в `Identity.DataAccess`.

### Cross-module

| Откуда | Куда | Зачем |
|--------|------|--------|
| Profile.Services | Identity.Events.Contracts | `UserRegisteredEvent` |
| Facade.NetworkManagement | IContentClient | владелец post для group_posts |
| Facade.AccountManagement | IIdentityClient | auth |

`user_id` — string, без FK на AspNetUsers между схемами.

---

## 6. Auth: Identity + AccountManagement

### Core — Identity

**Папка:** `backend/Identity/` (8 проектов с Events).

**Назначение:** регистрация, ASP.NET Identity, JWT access/refresh, Google/Facebook, `UserRegisteredEvent`.

**Проекты:** Contracts, DataAccess, Services, Client.Contracts, Client, DI, Events, Events.Contracts.

**Интерфейсы:** `IAuthenticationService`, `IUserService`, `ITokenService`, `IExternalAuthService`, `IIdentityClient` (Users, Authentication, ExternalAuth).

**DataAccess:** `IdentityDbContext`, schema `identity`, `ApplicationUser`, `RefreshToken`, AspNet* tables.

**DI:** `AddIdentityModule(configuration, connectionString)`.

**Связи:** Profile подписан на событие; Identity **не** ссылается на Profile.DataAccess.

**v1:** нет email confirm/reset; in-memory events; symmetric JWT.

**Запреты:** controllers в core; создавать профиль в UserService напрямую.

### Facade — AccountManagement

**Папка:** `backend/AccountManagement/`.

**BFF:** `/api/auth`; `AccountController` **не** наследует `*ManagementControllerBase`.

**Сервис:** `IAccountManagementService` → `IIdentityClient`; маппинг `UserDto`→`AccountDto`, `TokenDto`→`AuthTokenDto`.

**DI:** `AddAccountManagementFacade()`.

**Endpoints:**

| Метод | Путь | JWT |
|-------|------|-----|
| POST | `/api/auth/register` | нет |
| POST | `/api/auth/login` | нет |
| POST | `/api/auth/google`, `/facebook` | нет |
| POST | `/api/auth/refresh` | нет |
| POST | `/api/auth/logout` | нет |
| GET | `/api/auth/me` | да |

**Errors:** register → 400; login → 401; ModelState → 400.

---

## 7. Profile + ProfileManagement

### Core — Profile

**Schema `profile`:** `user_profiles`, `message_settings`, `profile_views`.

**Сервисы:** `IProfileService`, `IMessageSettingsService`, `IProfileViewService`, `IProfileClient`.

**Миграции:** `AddProfileModule`, `AddProfileMessageSettings`, `AddProfileProfileViews`.

**Логика:** пустой профиль по событию; get-or-create message settings; views append-only (GET owner last 100).

### Facade — ProfileManagement

**Controllers:** `ProfileProfilesController`, `ProfileMediaController`, `ProfileMessageSettingsController`, `ProfileViewsController`; base `[Route("api/profile")]`, `MapProfileError`.

**Файлы:** avatar/header → disk, `/uploads`; IP/UA для views из `HttpContext`.

**Endpoints:**

| Метод | Путь | JWT |
|-------|------|-----|
| GET/PUT/PATCH | `/api/profile/me` | да |
| GET | `/api/profile/{userId}` | нет |
| POST | `/api/profile/me/avatar`, `/header` | да |
| GET/PUT/PATCH | `/api/profile/me/message-settings` | да |
| POST | `/api/profile/{profileOwnerId}/views` | опц. |
| GET | `/api/profile/me/profile-views` | да |

**v1:** локальный диск; soft-deleted профиль не auto-restore.

---

## 8. Professional + ProfessionalManagement

### Core — Professional

**Schema `professional`:** Academy, Certificate, CertificateSkill, Company, Education, Experience, Language, Recommendation, RecommendedSkillByPosition, Skill, UserLanguage, UserSkill (12 entities).

**Сервисы:** `ICompanyService`, `IExperienceService`, … `IProfessionalClient` + Resources.

**DI:** `AddProfessionalModule`.

### Facade — ProfessionalManagement

**Controllers:** Experiences, Companies, Educations, Certificates, Skills, Languages, Academies, Recommendations; service — partial classes.

**API `/api/professional`:** каталоги (POST+GET by id) и `/me/...` CRUD.

**Группы endpoints:** experiences, companies, educations, certificates (+skills), skills (+recommended-skills), languages, recommendations (`GET users/{userId}/...`, JWT mutate).

**v1:** Jobs не валидирует CompanyId через Professional; recommended skills без admin.

---

## 9. Network + NetworkManagement

### Core — Network

**Schema `network`:** contacts, follows, blocked_users, user_groups, group_members, **group_posts**, pages, page_admins, page_followers.

**Сервисы:** Contact … PageFollower + `INetworkClient` (9 resources).

**Миграции:** `AddNetworkModule`, `AddNetworkGroups`, `AddNetworkGroupPosts`, `AddNetworkPages`.

**Правила v1:** no self action; duplicates → 400; block blocks contact/follow; unfollow/unblock timestamps.

### Facade — NetworkManagement

**JWT-only;** `userId` только из token; body без requesterId/followerId/ownerId.

**Оркестрация:** `group_posts` + `IContentClient.Posts` (владелец post).

**Endpoints (все под `/api/network/me/...` unless noted):**

- **Contacts:** POST/GET contacts, GET/PATCH accept/reject/DELETE `{contactId}`
- **Follows:** POST/GET following, DELETE `{followingId}`, GET followers
- **Blocked:** POST/GET blocked-users, DELETE `{blockedUserId}`
- **Groups:** POST/GET groups, GET/PATCH/DELETE `{groupId}`, join, membership, members, posts `{postId}`
- **Pages:** POST/GET pages, following list, GET/PATCH/DELETE `{pageId}`, admins, follow, followers

**v1:** не проверяется существование target user в Identity.

---

## 10. Content + ContentManagement

### Core — Content

**Schema `content`:** posts, media, post_media, comments, reactions, hashtags, post_hashtags, user_hashtag_follows, saved_posts, reposts, post_views, mentions.

**Миграции:** `AddContentModule`, `AddContentCommentsAndReactions`, `AddContentHashtagsAndFollows`, `AddContentSavedRepostsViewsMentions`.

**Правила:** public/private visibility; reaction upsert; saved/repost reactivation; repost_count; views append-only; no self-mention.

**Тесты:** `PostServiceTests`, `HashtagServiceTests` (LinkedIn.Tests).

### Facade — ContentManagement

**JWT;** authorId/userId/viewerUserId только из JWT.

**Controllers:** Posts, Media, Comments, Reactions, Hashtags, SavedPosts, Reposts, PostViews, Mentions.

**Основные маршруты:**

- Media: `POST /api/content/me/media`, `GET .../media/{mediaId}`
- Posts: `POST/GET /me/posts`, `GET /posts/{postId}`, PATCH/DELETE `/me/posts/{postId}`
- Post media, comments, reactions (PUT upsert), hashtags, saved, reposts, views (`?source=`), mentions

**v1:** нет feed ranking; `group_posts` в schema network.

---

## 11. Messaging + MessagingManagement

### Core — Messaging

**Schema `messaging`:** chats, chat_members, messages, message_reads, message_media.

**Правила:** active membership; send/read for members; edit/delete by sender; read idempotent; media = URL only.

### Facade — MessagingManagement

**`/api/messaging`**, ~20 routes: chats, join/membership, messages, read, message media.

**Поведение ответов:** списки могут `200 []`; single GET/мутации — `404` без доступа.

**v1:** **нет SignalR**; open join; edit own message after leave allowed.

---

## 12. Jobs + JobsManagement

### Core — Jobs

**Schema `jobs`:** vacancies, user_vacancies_favorites, job_applications, job_search_queries, job_search_results, recommended_job_queries.

**Правила:** owner PostedBy; no apply to own vacancy; duplicate favorite/application → error.

### Facade — JobsManagement

**Endpoints:** `POST/GET /api/jobs/me/vacancies`, public `GET /vacancies`, favorites, apply, search-queries/results, recommended-queries.

**v1:** CompanyId без Professional; recommended queries без admin role.

---

## 13. Notifications + NotificationsManagement

### Core — Notifications

**Schema `notifications`:** notifications (soft delete), user_activity (append-only).

**Create notification:** core/client only in v1 (не публичный POST facade).

### Facade — NotificationsManagement

**`/api/notifications/me`:** GET list/item, PATCH read, PATCH read-all, DELETE.

**Activity:** `POST/GET /api/notifications/me/activity`.

**v1:** нет push/SignalR; owner-only.

---

## 14. Events + EventsManagement

> Модуль **Events** = мероприятия. **Identity.Events** = domain events — разные вещи.

### Core — Events

**Schema `events`:** events, event_attendees, event_schedule, event_speakers, event_speaker_map.

**Правила:** OrganizerId JWT; OrganizerType request; event/schedule owner-only; attendee duplicate → 400; speaker map owner-only.

### Facade — EventsManagement

**`/api/events`:** CRUD `/me`, join/leave attendance, schedule, speakers, event-speaker map.

**v1:** speaker CRUD без ownership model; нет интеграции Notifications/Content/Network.

---

## 15. Docker и PostgreSQL

| Сервис | Порт | Примечание |
|--------|------|------------|
| linkedin-postgres | 5432 | DB `linkedin_dev`, postgres/postgres |
| linkedin-api | 5000→8080 | Facade.API |

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f api
docker-compose down -v   # сброс БД и volumes
```

**DBeaver/Beekeeper:** localhost:5432, `linkedin_dev`, схемы см. [раздел 5](#5-интеграция-модулей-di-миграции).

---

## 16. Тесты, roadmap, v1

### Тесты

`backend/Tests/LinkedIn.Tests` — xUnit, Moq, EF InMemory, **26 тестов:** ProfileService, PostService, HashtagService.

```bash
dotnet build LinkedIn.sln
dotnet test LinkedIn.sln
```

Не покрыто: facade/API, Identity JWT, Network, Messaging, Jobs, Events, Notifications.

### Как добавить фичу

1. Entity + migration в **своём** DataAccess.  
2. `I*Service` + Parameters в Contracts.  
3. Service + Resource + Client.  
4. Facade Request/Response + controller.  
5. Не трогать чужой DataAccess.

### Путь к микросервисам

Вынести модуль → HTTP `I*Client` → facade без изменений контрактов HTTP.

### Roadmap

Email verification, password reset, health checks, больше тестов, outbox/events bus, realtime (вне v1).

### Ограничения v1 (сводка)

- Один процесс; нет SignalR/realtime.
- In-memory domain events.
- Слабая кросс-валидация user/company.
- Нет публичного POST create notification.
- Swagger только Development.

---

*Полный перечень HTTP-маршрутов (~197 actions) — в Swagger: http://localhost:5000/swagger*
