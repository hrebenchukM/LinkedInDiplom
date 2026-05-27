# Facade.API

The main entry point for the LinkedIn Clone backend. This **modular monolith host** aggregates all facade modules and core modules into a single deployable ASP.NET Core Web API (.NET 8).

## Overview

Facade.API:
- Hosts facade controllers (`AccountManagement`, `ProfileManagement`, `ProfessionalManagement`, `NetworkManagement`, `ContentManagement`, `MessagingManagement`, `JobsManagement`, `NotificationsManagement`, `EventsManagement`)
- Registers core modules via DI (`Identity`, `Profile`, `Professional`, `Network`, `Content`, `Messaging`, `Jobs`, `Notifications`, `Events`)
- Configures JWT authentication, CORS (Development vs Production), Swagger (Development only)
- Applies EF Core migrations on startup
- Serves uploaded files from `/uploads`

## Architecture

```
Client (Web/Mobile)
    ↓ HTTP
Facade.API (Host / composition root)
    ├── JWT, CORS, Swagger (dev), static /uploads
    ↓
Facade Modules (BFF)
    ├── Facade.AccountManagement      → /api/auth
    ├── Facade.ProfileManagement      → /api/profile
    ├── Facade.ProfessionalManagement → /api/professional
    ├── Facade.NetworkManagement      → /api/network
    ├── Facade.ContentManagement      → /api/content
    ├── Facade.MessagingManagement    → /api/messaging
    ├── Facade.JobsManagement         → /api/jobs
    └── Facade.NotificationsManagement → /api/notifications
    └── Facade.EventsManagement        → /api/events
    ↓ I*Client (in-process, microservice-ready seam)
Core Modules
    ├── Identity      (schema: identity)
    ├── Profile       (schema: profile)
    ├── Professional  (schema: professional)
    ├── Network       (schema: network)
    ├── Content       (schema: content)
    ├── Messaging     (schema: messaging)
    ├── Jobs          (schema: jobs)
    ├── Notifications (schema: notifications)
    └── Events        (schema: events)
    ↓
PostgreSQL (single database, logical separation by schema)
```

## Features

### Authentication & Authorization
- JWT Bearer access tokens + refresh tokens
- ASP.NET Core Identity (password hashing, user store)

### API Documentation
- **Swagger UI** (Development only): http://localhost:5000/swagger
- JWT **Authorize** button for testing protected endpoints

### CORS
- **Development**: permissive policy for local frontend
- **Production**: origins from `Cors:AllowedOrigins` in configuration

### Configuration
- `appsettings.json`, `appsettings.Development.json`, `appsettings.Production.json`
- JWT, connection string, file storage (`FileStorage:UploadsRootPath`)

## Running the API

### Prerequisites
- **.NET 8 SDK**
- PostgreSQL 15+

### Local run

```bash
cd backend/Facade.API
dotnet run
```

Swagger: http://localhost:5000/swagger

Migrations run automatically on startup. Optional manual run:

```bash
cd backend/Identity/Identity.DataAccess
dotnet ef database update --context IdentityDbContext
```

## API Routes (hosted controllers)

### Auth — `/api/auth`

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/auth/register` | POST | No |
| `/api/auth/login` | POST | No |
| `/api/auth/refresh` | POST | No |
| `/api/auth/logout` | POST | No |
| `/api/auth/me` | GET | Yes |

### Profile — `/api/profile`

BFF over the **Profile** core module. The solution is a **modular monolith** on **.NET 8** (`TargetFramework net8.0`); the Profile core owns the full PostgreSQL **`profile`** schema: `user_profiles`, `message_settings`, `profile_views` (see [Profile module README](../Profile/README.md)).

`userId` for `/me/*` routes comes **only from JWT** (`NameIdentifier` / `sub`).

**Profile views:** public `POST` to record a view (optional JWT sets `viewerUserId`; IP and User-Agent from `HttpContext`, not body). Owner-only `GET` list (last 100, newest first).

**Message settings:** private to the owner — all routes under `/me/message-settings` require JWT; not included in public `GET /api/profile/{userId}`.

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/profile/me` | GET, PUT, PATCH | Yes |
| `/api/profile/{userId}` | GET | No |
| `/api/profile/me/avatar` | POST | Yes |
| `/api/profile/me/header` | POST | Yes |
| `/api/profile/me/message-settings` | GET, PUT, PATCH | Yes |
| `/api/profile/{profileOwnerId}/views?source=` | POST | No (optional JWT for `viewerUserId`) |
| `/api/profile/me/profile-views` | GET | Yes |

### Professional — `/api/professional`

Career BFF over the **Professional** core module. The solution is a **modular monolith** on **.NET 8** (`TargetFramework net8.0`); the Professional core owns the full PostgreSQL **`professional`** schema (see [Professional module README](../Professional/README.md)).

`userId` for `/me/*` routes comes **only from JWT** (`NameIdentifier` / `sub`). For recommendations, **`authorId` is JWT-only**; POST body `userId` is the **recipient**.

**Catalog v1** (authenticated create, public get-by-id): Academy, Skill, Language — no catalog update/delete in v1.

**Recommended skills by position** (global): public `GET ?position=`; JWT `POST` / `DELETE /{rspId}`.

**Recommendations** (text endorsements): public `GET` list for a user and `GET` by id; JWT `POST` / `PATCH` / `DELETE` (author-only mutations, soft delete).

**User-owned** (full CRUD under `/me/...`): experiences, companies, educations, certificates, user skills, user languages; **certificate skills** nested under `/me/certificates/{certificateId}/skills`.

| Area | Method | Path | Auth |
|------|--------|------|------|
| Companies | GET | `/api/professional/me/companies` | Yes |
| Companies | GET | `/api/professional/companies/{companyId}` | No |
| Companies | POST, PUT, PATCH, DELETE | `/api/professional/me/companies[/{companyId}]` | Yes |
| Experiences | GET, POST, PUT, PATCH, DELETE | `/api/professional/me/experiences[/{experienceId}]` | Yes |
| Academies | GET | `/api/professional/academies/{academyId}` | No |
| Academies | POST | `/api/professional/academies` | Yes |
| Educations | GET, POST, PUT, PATCH, DELETE | `/api/professional/me/educations[/{educationId}]` | Yes |
| Certificates | GET, POST, PUT, PATCH, DELETE | `/api/professional/me/certificates[/{certificateId}]` | Yes |
| Certificate skills | GET | `/api/professional/me/certificates/{certificateId}/skills` | Yes |
| Certificate skills | GET | `/api/professional/me/certificates/{certificateId}/skills/{certificateSkillId}` | Yes |
| Certificate skills | POST | `/api/professional/me/certificates/{certificateId}/skills` | Yes (body: `skillId`; duplicate → 400; not owned cert → 404) |
| Certificate skills | DELETE | `/api/professional/me/certificates/{certificateId}/skills/{certificateSkillId}` | Yes (hard delete) |
| Skills | GET | `/api/professional/skills/{skillId}` | No |
| Skills | POST | `/api/professional/skills` | Yes |
| User skills | GET, POST, PUT, PATCH, DELETE | `/api/professional/me/skills[/{userSkillId}]` | Yes |
| Languages | GET | `/api/professional/languages/{languageId}` | No |
| Languages | POST | `/api/professional/languages` | Yes |
| User languages | GET, POST, PUT, PATCH, DELETE | `/api/professional/me/languages[/{userLanguageId}]` | Yes |
| Recommended skills by position | GET | `/api/professional/recommended-skills?position={position}` | No (requires `position`; blank → 400) |
| Recommended skills by position | POST | `/api/professional/recommended-skills` | Yes (`position` + `skillId`; skill must exist; duplicate → 400) |
| Recommended skills by position | DELETE | `/api/professional/recommended-skills/{rspId}` | Yes (not found → 404) |
| Recommendations | GET | `/api/professional/users/{userId}/recommendations` | No (active only; soft-deleted hidden) |
| Recommendations | GET | `/api/professional/recommendations/{recommendationId}` | No |
| Recommendations | POST | `/api/professional/recommendations` | Yes (`userId` = recipient, `text`; author from JWT; self → 400) |
| Recommendations | PATCH | `/api/professional/recommendations/{recommendationId}` | Yes (author only, `text` only; else → 404) |
| Recommendations | DELETE | `/api/professional/recommendations/{recommendationId}` | Yes (author only, soft delete; else → 404) |

Full tables, security rules, and Swagger flows: [Professional module README](../Professional/README.md).

### Network — `/api/network`

Social graph BFF over the **Network** core module. The solution is a **modular monolith prepared for microservices** on **.NET 8** (`TargetFramework net8.0`); the Network core owns PostgreSQL schema **`network`**: `contacts`, `follows`, `blocked_users`, `user_groups`, `group_members`, `group_posts`, `pages`, `page_admins`, `page_followers` (see [Network module README](../Network/README.md)).

`group_posts` is implemented as a separate **Network + Content** phase: table/entity/service/resource live in Network; post ownership is verified in `Facade.NetworkManagement` via `IContentClient`.

`userId` for all routes comes **only from JWT** (`NameIdentifier` / `sub`). **All endpoints require JWT** (no public routes). Request bodies must **not** contain `currentUserId`, `requesterId`, `followerId`, or `ownerId`.

#### Contacts

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/network/me/contacts` | Yes (`receiverId` in body) |
| GET | `/api/network/me/contacts` | Yes |
| GET | `/api/network/me/contacts/{contactId}` | Yes (not participant → 404) |
| PATCH | `/api/network/me/contacts/{contactId}/accept` | Yes (receiver, pending) |
| PATCH | `/api/network/me/contacts/{contactId}/reject` | Yes (receiver, pending) |
| DELETE | `/api/network/me/contacts/{contactId}` | Yes (cancel pending / remove accepted) |

#### Follows

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/network/me/following` | Yes (`followingId` in body) |
| DELETE | `/api/network/me/following/{followingId}` | Yes (unfollow → `unfollowed_at`; not found → 404) |
| GET | `/api/network/me/following` | Yes (active only) |
| GET | `/api/network/me/followers` | Yes (active only) |

#### Blocked users

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/network/me/blocked-users` | Yes (`blockedUserId` in body) |
| DELETE | `/api/network/me/blocked-users/{blockedUserId}` | Yes (unblock → `unblocked_at`; not found → 404) |
| GET | `/api/network/me/blocked-users` | Yes (active only) |

#### Groups

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/network/me/groups` | Yes |
| GET | `/api/network/me/groups` | Yes |
| GET | `/api/network/me/groups/{groupId}` | Yes (not member → 404) |
| PATCH | `/api/network/me/groups/{groupId}` | Yes (owner only) |
| DELETE | `/api/network/me/groups/{groupId}` | Yes (owner only; soft delete group + members) |
| POST | `/api/network/me/groups/{groupId}/join` | Yes |
| DELETE | `/api/network/me/groups/{groupId}/membership` | Yes (owner cannot leave) |
| GET | `/api/network/me/groups/{groupId}/members` | Yes (active members only) |
| POST | `/api/network/me/groups/{groupId}/posts/{postId}` | Yes (JWT user must own post) |
| GET | `/api/network/me/groups/{groupId}/posts` | Yes (active member only) |
| DELETE | `/api/network/me/groups/{groupId}/posts/{postId}` | Yes (JWT user must own post) |

#### Pages

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/network/me/pages` | Yes |
| GET | `/api/network/me/pages` | Yes (owned pages) |
| GET | `/api/network/me/pages/{pageId}` | Yes (owner / admin / follower) |
| PATCH | `/api/network/me/pages/{pageId}` | Yes (owner only) |
| DELETE | `/api/network/me/pages/{pageId}` | Yes (owner only) |
| POST | `/api/network/me/pages/{pageId}/admins` | Yes (owner only; `userId` = target admin) |
| DELETE | `/api/network/me/pages/{pageId}/admins/{adminUserId}` | Yes (owner only) |
| GET | `/api/network/me/pages/{pageId}/admins` | Yes |
| POST | `/api/network/me/pages/{pageId}/follow` | Yes |
| DELETE | `/api/network/me/pages/{pageId}/follow` | Yes |
| GET | `/api/network/me/pages/following` | Yes |
| GET | `/api/network/me/pages/{pageId}/followers` | Yes (owner or active admin) |

**Rules:** cannot contact/follow/block yourself → **400**; active block in either direction blocks new contact/follow → **400**; duplicate active contact/follow/block → **400**; foreign or disallowed rows → **404**; unfollow/unblock retain rows (`unfollowed_at` / `unblocked_at`); group/page owner rows created on create; for `group_posts` all endpoints are JWT-only, `userId` comes only from JWT, group must be active, user must be active member, post must exist and belong to current user, deleted post cannot be attached, duplicate group_post → **400**, foreign group/no membership/foreign post → **404**.

Migrations: `AddNetworkModule`, `AddNetworkGroups`, `AddNetworkGroupPosts`, `AddNetworkPages` (applied via `NetworkDbContext` on startup).

Full rules, services, and `INetworkClient`: [Network module README](../Network/README.md).

### Content — `/api/content`

Posts, comments, reactions, hashtags, saved posts, reposts, post views, mentions and media BFF over the **Content** core module. The solution is a **modular monolith prepared for microservices** on **.NET 8** (`TargetFramework net8.0`); the Content core owns PostgreSQL schema **`content`**: `posts`, `media`, `post_media`, `comments`, `reactions`, `hashtags`, `post_hashtags`, `user_hashtag_follows`, `saved_posts`, `reposts`, `post_views`, `mentions` (see [Content module README](../Content/README.md)).

`group_posts` is handled by **NetworkManagement** endpoints under `/api/network`; Content remains owner of posts while ownership checks are done through `IContentClient`.

`userId` / `authorId` / `viewerUserId` for all routes comes **only from JWT** (`NameIdentifier` / `sub`). **All endpoints require JWT** (no public routes). Request bodies must **not** contain the current user's `userId`, `authorId`, or `viewerUserId`.

#### Media

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/me/media` | Yes (`url`, `type` in body) |
| GET | `/api/content/media/{mediaId}` | Yes |

#### Posts

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/me/posts` | Yes (`content`, optional `visibility`, optional `mediaIds`) |
| GET | `/api/content/me/posts` | Yes (author's posts) |
| GET | `/api/content/posts/{postId}` | Yes (public: any JWT user; private: author only) |
| PATCH | `/api/content/me/posts/{postId}` | Yes (author only; `content`, `visibility`) |
| DELETE | `/api/content/me/posts/{postId}` | Yes (author only; soft delete via `deleted_at`) |

#### Post media

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/me/posts/{postId}/media` | Yes (`mediaId` in body; owner only) |
| GET | `/api/content/me/posts/{postId}/media` | Yes |
| DELETE | `/api/content/me/posts/{postId}/media/{mediaId}` | Yes (owner only) |

#### Comments

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/posts/{postId}/comments` | Yes (`content`, optional `parentCommentId`) |
| GET | `/api/content/posts/{postId}/comments` | Yes |
| PATCH | `/api/content/me/comments/{commentId}` | Yes (author only; `content`) |
| DELETE | `/api/content/me/comments/{commentId}` | Yes (author only; soft delete) |

#### Reactions

| Method | Path | Auth |
|--------|------|------|
| PUT | `/api/content/posts/{postId}/reactions` | Yes (`reactionType`; upsert) |
| DELETE | `/api/content/posts/{postId}/reactions` | Yes (delete own reaction row) |
| GET | `/api/content/posts/{postId}/reactions/me` | Yes (returns my reaction or 404) |
| GET | `/api/content/posts/{postId}/reactions` | Yes |

#### Hashtags

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/hashtags` | Yes (`name` in body; normalized trim + lower in service) |
| GET | `/api/content/hashtags/{hashtagId}` | Yes |

#### Post hashtags

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/me/posts/{postId}/hashtags` | Yes (`hashtagId` in body; post owner only) |
| GET | `/api/content/posts/{postId}/hashtags` | Yes (private post: empty list for non-author) |
| DELETE | `/api/content/me/posts/{postId}/hashtags/{hashtagId}` | Yes (post owner only; hard delete link) |

#### User hashtag follows

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/me/hashtags/{hashtagId}/follow` | Yes (JWT user only) |
| DELETE | `/api/content/me/hashtags/{hashtagId}/follow` | Yes (soft unfollow) |
| GET | `/api/content/me/hashtags/following` | Yes (active follows only) |

#### Saved posts

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/me/posts/{postId}/save` | Yes (JWT user only) |
| DELETE | `/api/content/me/posts/{postId}/save` | Yes |
| GET | `/api/content/me/saved-posts` | Yes (active saves only) |

#### Reposts

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/me/posts/{postId}/repost` | Yes (cannot repost own post) |
| DELETE | `/api/content/me/posts/{postId}/repost` | Yes |
| GET | `/api/content/me/reposts` | Yes |
| GET | `/api/content/posts/{postId}/reposts` | Yes (private post: empty list for non-author) |

#### Post views

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/posts/{postId}/views` | Yes (`?source=` optional; IP/User-Agent from `HttpContext`) |
| GET | `/api/content/me/posts/{postId}/views` | Yes (post author only) |

#### Mentions

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/content/me/posts/{postId}/mentions` | Yes (`mentionedUserId` in body; author only) |
| DELETE | `/api/content/me/posts/{postId}/mentions/{mentionedUserId}` | Yes (author only) |
| GET | `/api/content/posts/{postId}/mentions` | Yes (private post: empty list for non-author) |

**Rules:** all content routes require JWT; `userId`/`authorId`/`viewerUserId` comes only from JWT; private post visible only to author; saved posts save/unsave with reactivation; duplicate active save → **400**; repost own post forbidden; duplicate active repost → **400**; `repost_count` updated in service; post views append-only; record view IP/User-Agent from `HttpContext`; GET post views author-only; mentions add/remove author-only; self-mention → **400**; duplicate active mention → **400**; hashtag/reaction/comment rules unchanged; `"Post not found."` / `"Saved post not found."` / `"Repost not found."` / `"Mention not found."` / other listed not-found messages → **404**; other business errors → **400**.

Migrations: `AddContentModule`, `AddContentCommentsAndReactions`, `AddContentHashtagsAndFollows`, `AddContentSavedRepostsViewsMentions` (applied via `ContentDbContext` on startup; history in schema `content`).

Full rules, services, and `IContentClient`: [Content module README](../Content/README.md).

### Messaging — `/api/messaging`

Chats/messages BFF over the **Messaging** core module. The solution is a **modular monolith prepared for microservices** on **.NET 8** (`TargetFramework net8.0`); the Messaging core owns PostgreSQL schema **`messaging`**: `chats`, `chat_members`, `messages`, `message_reads`, `message_media` (see [Messaging module README](../Messaging/README.md)).

`userId` for all routes comes **only from JWT** (`NameIdentifier` / `sub`). **All endpoints require JWT** (no public routes). Request bodies must **not** contain current user id.
Messaging audit status: **passed** (critical issues not found).

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/messaging/me/chats` | Yes |
| GET | `/api/messaging/me/chats` | Yes |
| GET | `/api/messaging/me/chats/{chatId}` | Yes |
| DELETE | `/api/messaging/me/chats/{chatId}` | Yes |
| POST | `/api/messaging/me/chats/{chatId}/join` | Yes |
| DELETE | `/api/messaging/me/chats/{chatId}/membership` | Yes |
| GET | `/api/messaging/me/chats/{chatId}/members` | Yes |
| POST | `/api/messaging/me/chats/{chatId}/messages` | Yes |
| GET | `/api/messaging/me/chats/{chatId}/messages` | Yes |
| GET | `/api/messaging/me/messages/{messageId}` | Yes |
| PATCH | `/api/messaging/me/messages/{messageId}` | Yes |
| DELETE | `/api/messaging/me/messages/{messageId}` | Yes |
| POST | `/api/messaging/me/messages/{messageId}/read` | Yes |
| GET | `/api/messaging/me/messages/{messageId}/reads` | Yes |
| POST | `/api/messaging/me/messages/{messageId}/media` | Yes |
| GET | `/api/messaging/me/messages/{messageId}/media` | Yes |
| DELETE | `/api/messaging/me/messages/{messageId}/media/{messageMediaId}` | Yes |

**Rules:** user sees only own active chats; send/mark read only for active chat members; edit/delete only by sender (v1: sender can edit/delete own message after leaving chat); message read is idempotent; media attach only by sender and stores URL/reference only (no blob); join chat in v1 is open by `chatId` (no invite/approval); SignalR/WebSocket and real-time delivery are not implemented.

**Response behavior:** list GET endpoints may return **`200` + empty array** for inaccessible or empty resources:
- `GET /api/messaging/me/chats/{chatId}/members`
- `GET /api/messaging/me/chats/{chatId}/messages`
- `GET /api/messaging/me/messages/{messageId}/reads`
- `GET /api/messaging/me/messages/{messageId}/media`

Single-resource endpoints and mutations return **`404`** for foreign/inaccessible resources:
- `GET /api/messaging/me/chats/{chatId}`
- `GET /api/messaging/me/messages/{messageId}`
- `POST` message/read/media when access is missing

Migrations: `AddMessagingModule` (applied via `MessagingDbContext` on startup; history in schema `messaging`).

Full rules, services, and `IMessagingClient`: [Messaging module README](../Messaging/README.md).

### Jobs — `/api/jobs`

Jobs BFF over the **Jobs** core module. The solution is a **modular monolith prepared for microservices** on **.NET 8** (`TargetFramework net8.0`); the Jobs core owns PostgreSQL schema **`jobs`**: `vacancies`, `user_vacancies_favorites`, `job_applications`, `job_search_queries`, `job_search_results`, `recommended_job_queries` (see [Jobs module README](../Jobs/README.md)).

`userId` for all routes comes **only from JWT** (`NameIdentifier` / `sub`). **All endpoints require JWT** (no public routes). Request bodies must **not** contain current user id.

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/jobs/me/vacancies` | Yes |
| GET | `/api/jobs/vacancies` | Yes |
| GET | `/api/jobs/vacancies/{vacancyId}` | Yes |
| PATCH | `/api/jobs/me/vacancies/{vacancyId}` | Yes |
| DELETE | `/api/jobs/me/vacancies/{vacancyId}` | Yes |
| POST | `/api/jobs/me/favorites/{vacancyId}` | Yes |
| DELETE | `/api/jobs/me/favorites/{vacancyId}` | Yes |
| GET | `/api/jobs/me/favorites` | Yes |
| POST | `/api/jobs/me/vacancies/{vacancyId}/apply` | Yes |
| DELETE | `/api/jobs/me/applications/{applicationId}` | Yes |
| GET | `/api/jobs/me/applications` | Yes |
| GET | `/api/jobs/me/vacancies/{vacancyId}/applications` | Yes |
| POST | `/api/jobs/me/search-queries` | Yes |
| GET | `/api/jobs/me/search-queries` | Yes |
| GET | `/api/jobs/me/search-queries/{searchId}` | Yes |
| DELETE | `/api/jobs/me/search-queries/{searchId}` | Yes |
| GET | `/api/jobs/me/search-queries/{searchId}/results` | Yes |
| POST | `/api/jobs/recommended-queries` | Yes |
| GET | `/api/jobs/recommended-queries` | Yes |
| DELETE | `/api/jobs/recommended-queries/{recommendedQueryId}` | Yes |

Rules:
- vacancy create/update/delete — only owner via `PostedBy` (from JWT);
- `CompanyId` in v1 is passed from request, without Company service validation;
- favorite/apply actions are current-user only;
- duplicate favorite/application returns `400`;
- cannot apply to own vacancy (`400`);
- search queries and search results are scoped to current user;
- recommended queries in v1 are JWT-only (no admin-role check);
- foreign/inaccessible records return `404` (`Vacancy/Favorite/Application/Search query/Recommended query not found`), other business errors return `400`.

Migration: `AddJobsModule` (applied via `JobsDbContext` on startup; history in schema `jobs`).

### Notifications — `/api/notifications`

Notifications BFF over the **Notifications** core module. The solution is a **modular monolith prepared for microservices** on **.NET 8** (`TargetFramework net8.0`); the Notifications core owns PostgreSQL schema **`notifications`**: `notifications`, `user_activity` (see [Notifications module README](../Notifications/README.md)).

`userId` for all routes comes **only from JWT** (`NameIdentifier` / `sub`). **All endpoints require JWT** (no public routes). Request bodies must **not** contain current user id.

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/notifications/me` | Yes |
| GET | `/api/notifications/me/{notificationId}` | Yes |
| PATCH | `/api/notifications/me/{notificationId}/read` | Yes |
| PATCH | `/api/notifications/me/read-all` | Yes |
| DELETE | `/api/notifications/me/{notificationId}` | Yes |
| POST | `/api/notifications/me/activity` | Yes |
| GET | `/api/notifications/me/activity` | Yes |

Rules:
- notifications are owner-only;
- mark read/delete are owner-only;
- delete notification is soft delete (`deleted_at`);
- mark read is idempotent;
- mark all read returns success even with 0 unread rows;
- `user_activity` is append-only;
- list GET endpoints may return `200` + empty array;
- single/mutation for foreign records return `404`;
- public `POST /api/notifications` is intentionally not added in v1;
- notification creation remains available through core/client for future cross-module calls;
- SignalR/WebSocket/realtime are not implemented in v1.

Migration: `AddNotificationsModule` (applied via `NotificationsDbContext` on startup; history in schema `notifications`).

### Events — `/api/events`

Events BFF over the **Events** core module. The solution is a **modular monolith prepared for microservices** on **.NET 8** (`TargetFramework net8.0`); the Events core owns PostgreSQL schema **`events`**: `events`, `event_attendees`, `event_schedule`, `event_speakers`, `event_speaker_map` (see [Events module README](../Events/README.md)).

`userId` for all routes comes **only from JWT** (`NameIdentifier` / `sub`). **All endpoints require JWT**. Request bodies must **not** contain current user id. `OrganizerId` is set from JWT on the facade; `OrganizerType` comes from create/update request.

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/events/me` | Yes |
| GET | `/api/events/me` | Yes |
| GET | `/api/events/{eventId}` | Yes |
| PATCH | `/api/events/me/{eventId}` | Yes |
| DELETE | `/api/events/me/{eventId}` | Yes |
| POST | `/api/events/me/{eventId}/join` | Yes |
| DELETE | `/api/events/me/{eventId}/attendance` | Yes |
| GET | `/api/events/{eventId}/attendees` | Yes |
| POST | `/api/events/me/{eventId}/schedule` | Yes |
| GET | `/api/events/{eventId}/schedule` | Yes |
| PATCH | `/api/events/me/{eventId}/schedule/{scheduleId}` | Yes |
| DELETE | `/api/events/me/{eventId}/schedule/{scheduleId}` | Yes |
| POST | `/api/events/me/speakers` | Yes |
| GET | `/api/events/me/speakers/{speakerId}` | Yes |
| PATCH | `/api/events/me/speakers/{speakerId}` | Yes |
| DELETE | `/api/events/me/speakers/{speakerId}` | Yes |
| POST | `/api/events/me/{eventId}/speakers` | Yes |
| DELETE | `/api/events/me/{eventId}/speakers/{speakerId}` | Yes |
| GET | `/api/events/{eventId}/speakers` | Yes |

Rules:
- create/update/delete event — owner-only (`OrganizerId` from JWT);
- join/leave attendee — current user only;
- duplicate attendee returns `400`;
- schedule create/update/delete — owner-only;
- speaker create/update/delete — JWT-only in v1 (no speaker ownership model);
- speaker map attach/detach — owner-only;
- duplicate speaker map returns `400`;
- foreign/inaccessible single-resource and mutations return `404`;
- integrations with Notifications/Content/Network are not added in v1.

Migration: `AddEventsModule` (applied via `EventsDbContext` on startup; history in schema `events`).

## Module Integration (Program.cs)

```csharp
builder.Services.AddIdentityModule(configuration, connectionString);
builder.Services.AddProfileModule(configuration, connectionString);
builder.Services.AddProfessionalModule(configuration, connectionString);
builder.Services.AddNetworkModule(configuration, connectionString);
builder.Services.AddContentModule(configuration, connectionString);
builder.Services.AddMessagingModule(configuration, connectionString);
builder.Services.AddJobsModule(configuration, connectionString);
builder.Services.AddNotificationsModule(configuration, connectionString);
builder.Services.AddEventsModule(configuration, connectionString);

builder.Services.AddAccountManagementFacade();
builder.Services.AddProfileManagementFacade();
builder.Services.AddProfessionalManagementFacade();
builder.Services.AddNetworkManagementFacade();
builder.Services.AddContentManagementFacade();
builder.Services.AddMessagingManagementFacade();
builder.Services.AddJobsManagementFacade();
builder.Services.AddNotificationsManagementFacade();
builder.Services.AddEventsManagementFacade();

builder.Services.AddControllers()
    .AddApplicationPart(typeof(AccountController).Assembly)
    .AddApplicationPart(typeof(ProfileController).Assembly)
    .AddApplicationPart(typeof(ProfessionalController).Assembly)
    .AddApplicationPart(typeof(NetworkController).Assembly)
    .AddApplicationPart(typeof(ContentController).Assembly)
    .AddApplicationPart(typeof(MessagingController).Assembly)
    .AddApplicationPart(typeof(JobsController).Assembly)
    .AddApplicationPart(typeof(NotificationsController).Assembly)
    .AddApplicationPart(typeof(EventsController).Assembly);
```

## Middleware Pipeline

1. Swagger (Development)
2. HTTPS redirection
3. CORS
4. Static files (`/uploads`)
5. Authentication / Authorization
6. Controllers

## Security

### Development
- Permissive CORS, `RequireHttpsMetadata = false`
- Longer JWT lifetime in `appsettings.Development.json`

### Production
- CORS from configured origins
- `RequireHttpsMetadata = true`
- Swagger disabled
- Secrets via environment variables (not committed)

## Docker

Docker is supported via root `Dockerfile` and `docker-compose.yml` (.NET 8 runtime). See [DOCKER.md](../../DOCKER.md).

## Status

✅ All core and facade modules integrated  
✅ JWT + refresh tokens  
✅ Swagger at `/swagger` (Development)  
✅ Profile uploads + static file serving  
✅ Dev/Production security split  
✅ **Profile module** — full `profile` schema (`user_profiles`, `message_settings`, `profile_views`)  
✅ **Professional module** — full `professional` schema (companies through recommendations)  
✅ **Network module** — schema `network` (contacts, follows, blocked users, groups, `group_posts`, pages) at `/api/network`  
✅ **Content module** — schema `content` (`posts`, `media`, `post_media`, `comments`, `reactions`, `hashtags`, `post_hashtags`, `user_hashtag_follows`, `saved_posts`, `reposts`, `post_views`, `mentions`) at `/api/content` (`group_posts` orchestration via NetworkManagement + `IContentClient`)  
✅ **Messaging module** — schema `messaging` (`chats`, `chat_members`, `messages`, `message_reads`, `message_media`) at `/api/messaging`  
✅ **Jobs module** — schema `jobs` (`vacancies`, `user_vacancies_favorites`, `job_applications`, `job_search_queries`, `job_search_results`, `recommended_job_queries`) at `/api/jobs`  
✅ **Notifications module** — schema `notifications` (`notifications`, `user_activity`) at `/api/notifications`  
✅ **Events module** — schema `events` (`events`, `event_attendees`, `event_schedule`, `event_speakers`, `event_speaker_map`) at `/api/events`  

## Related docs

- [INTEGRATION.md](./INTEGRATION.md) — integration and data flow details
- [AccountManagement facade](../AccountManagement/README.md)
- [Profile module](../Profile/README.md)
- [Professional module](../Professional/README.md)
- [Network module](../Network/README.md)
- [Content module](../Content/README.md)
- [Messaging module](../Messaging/README.md)
- [Jobs module](../Jobs/README.md)
- [Notifications module](../Notifications/README.md)
- [Events module](../Events/README.md)
