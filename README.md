# LinkedIn Clone - Modular Monolith Backend

A modular monolith backend for LinkedIn Clone built with **.NET 8**, implementing layered architecture with Backend-for-Frontend (BFF) pattern. The solution is **prepared for microservices** (in-process clients and domain events today; not deployed as separate services).

## 🚀 Quick Start with Docker

The fastest way to run the application:

```bash
# Start the application
docker-compose up -d

# Access Swagger UI (Development)
# Open browser to http://localhost:5000/swagger
```

That's it! The application will:
- ✅ Start PostgreSQL database
- ✅ Build and start the API
- ✅ Apply database migrations automatically (Identity, Profile, Professional, Network, Content)
- ✅ Be ready to accept requests

### Stop the application

```bash
docker-compose down
```

## 📋 Prerequisites

### For Docker (Recommended)
- **Docker Desktop** installed and running
- That's all you need!

### For Local Development
- **.NET 8 SDK**
- PostgreSQL 15+
- Your favorite IDE (Visual Studio, VS Code, Rider)

## 🏗️ Architecture

This project implements a **microservice-ready modular monolith** with:

- ✅ **Modular Monolith** - Independent domain modules in one deploy unit (`Facade.API`)
- ✅ **Layered Architecture** - Concentric layers with dependency inversion
- ✅ **Backend for Frontend (BFF)** - Client-optimized facade layer
- ✅ **Loose Coupling** - Communication through contracts and domain events
- ✅ **Database per Module** - Logical separation with DbContexts and PostgreSQL schemas
- ✅ **Resource / Client Pattern** - Seam for future HTTP-based microservice clients

### Project Structure

```
LinkedInDiplom/
├── backend/
│   ├── Identity/                    # Core: authentication (8 projects)
│   │   ├── Identity.Contracts
│   │   ├── Identity.Services
│   │   ├── Identity.DataAccess      # schema: identity
│   │   ├── Identity.Client.Contracts
│   │   ├── Identity.Client
│   │   ├── Identity.Events.Contracts
│   │   ├── Identity.Events
│   │   └── Identity.DI
│   │
│   ├── Profile/                     # Core: user profiles (6 projects)
│   │   ├── Profile.Contracts
│   │   ├── Profile.Services
│   │   ├── Profile.DataAccess       # schema: profile
│   │   ├── Profile.Client.Contracts
│   │   ├── Profile.Client
│   │   └── Profile.DI
│   │
│   ├── Professional/                # Core: career profile data (6 projects)
│   │   ├── Professional.Contracts
│   │   ├── Professional.Services
│   │   ├── Professional.DataAccess # schema: professional
│   │   ├── Professional.Client.Contracts
│   │   ├── Professional.Client
│   │   └── Professional.DI
│   │
│   ├── Network/                     # Core: social graph (6 projects)
│   │   ├── Network.Contracts
│   │   ├── Network.Services
│   │   ├── Network.DataAccess       # schema: network
│   │   ├── Network.Client.Contracts
│   │   ├── Network.Client
│   │   └── Network.DI
│   │
│   ├── Content/                     # Core: posts & media (6 projects)
│   │   ├── Content.Contracts
│   │   ├── Content.Services
│   │   ├── Content.DataAccess       # schema: content
│   │   ├── Content.Client.Contracts
│   │   ├── Content.Client
│   │   └── Content.DI
│   │
│   ├── AccountManagement/           # Facade: auth BFF (4 projects)
│   ├── ProfileManagement/           # Facade: profile BFF (4 projects)
│   ├── ProfessionalManagement/      # Facade: career BFF (4 projects)
│   ├── NetworkManagement/           # Facade: social graph BFF (4 projects)
│   ├── ContentManagement/           # Facade: posts & media BFF (4 projects)
│   │
│   └── Facade.API/                  # Host: single entry point
│
├── docker-compose.yml
├── Dockerfile
└── LinkedIn.sln                     # 53 projects
```

Each **Core module** follows: `Contracts` → `Services` → `DataAccess`, plus `Client.Contracts` / `Client` (resource pattern) and `DI`.

Each **Facade module** follows: `Facade.*.Contracts` → `Facade.*.Services` → `Facade.*.Controllers` + `Facade.*.DI`.

## 🔌 API Endpoints (overview)

| Route prefix | Purpose |
|--------------|---------|
| `/api/auth` | Register, login, refresh, logout, current account |
| `/api/profile` | Profile CRUD, avatar/header upload, message settings, profile views |
| `/api/professional` | Career data: companies, experience, education, certificates, skills, languages, certificate skills, recommended skills by position, text recommendations |
| `/api/network` | Social graph: contacts, follows, blocked users, groups, pages (JWT only) |
| `/api/content` | Posts, media metadata, post-media links, comments, reactions, hashtags, post hashtags, hashtag follows (JWT only) |

### Auth (`/api/auth`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user account |
| `/api/auth/login` | POST | Login and receive JWT tokens |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Revoke refresh token |
| `/api/auth/me` | GET | Current account (JWT required) |

Full API documentation (Development): **http://localhost:5000/swagger**

### Network (`/api/network`)

**Modular monolith** core + **NetworkManagement** BFF (`TargetFramework net8.0`, schema **`network`**). All routes require **JWT**. Current `userId` is taken **only from JWT** (not from body). Bodies must **not** contain `currentUserId`, `requesterId`, `followerId`, or `ownerId`.

**Tables:** `contacts`, `follows`, `blocked_users`, `user_groups`, `group_members`, `pages`, `page_admins`, `page_followers`. **`group_posts`** is deferred until the Content/Posts module (`posts.post_id`).

#### Contacts

| Endpoint | Method |
|----------|--------|
| `/api/network/me/contacts` | POST, GET |
| `/api/network/me/contacts/{contactId}` | GET |
| `/api/network/me/contacts/{contactId}/accept` | PATCH |
| `/api/network/me/contacts/{contactId}/reject` | PATCH |
| `/api/network/me/contacts/{contactId}` | DELETE |

#### Follows

| Endpoint | Method |
|----------|--------|
| `/api/network/me/following` | POST, GET |
| `/api/network/me/following/{followingId}` | DELETE |
| `/api/network/me/followers` | GET |

#### Blocked users

| Endpoint | Method |
|----------|--------|
| `/api/network/me/blocked-users` | POST, GET |
| `/api/network/me/blocked-users/{blockedUserId}` | DELETE |

#### Groups

| Endpoint | Method |
|----------|--------|
| `/api/network/me/groups` | POST, GET |
| `/api/network/me/groups/{groupId}` | GET, PATCH, DELETE |
| `/api/network/me/groups/{groupId}/join` | POST |
| `/api/network/me/groups/{groupId}/membership` | DELETE |
| `/api/network/me/groups/{groupId}/members` | GET |

#### Pages

| Endpoint | Method |
|----------|--------|
| `/api/network/me/pages` | POST, GET |
| `/api/network/me/pages/{pageId}` | GET, PATCH, DELETE |
| `/api/network/me/pages/{pageId}/admins` | POST, GET |
| `/api/network/me/pages/{pageId}/admins/{adminUserId}` | DELETE |
| `/api/network/me/pages/{pageId}/follow` | POST, DELETE |
| `/api/network/me/pages/following` | GET |
| `/api/network/me/pages/{pageId}/followers` | GET |

**Rules:** no self contact/follow/block; duplicate active contact/follow/block → **400**; disallowed or foreign rows → **404**; block prevents contact/follow; unfollow/unblock use `unfollowed_at`/`unblocked_at`; group/page owner created on create; owner cannot leave group; delete group soft-deletes members; page admin add/remove owner-only; `group_posts` deferred.

Details: [Network module README](./backend/Network/README.md).

### Content (`/api/content`)

**Modular monolith prepared for microservices** core + **ContentManagement** BFF (`TargetFramework net8.0`, schema **`content`**). All routes require **JWT**. `authorId` / `userId` is taken **only from JWT** (not from body). Bodies must **not** contain the current user's `userId` or `authorId`.

**Tables:** `posts`, `media`, `post_media`, `comments`, `reactions`, `hashtags`, `post_hashtags`, `user_hashtag_follows`. Migrations: **`AddContentModule`**, **`AddContentCommentsAndReactions`**, **`AddContentHashtagsAndFollows`**.

**Not in v3:** `saved_posts`, `reposts`, `post_views`, `mentions`. **`group_posts`** deferred until Content + Network integration.

#### Media

| Endpoint | Method |
|----------|--------|
| `/api/content/me/media` | POST |
| `/api/content/media/{mediaId}` | GET |

#### Posts

| Endpoint | Method |
|----------|--------|
| `/api/content/me/posts` | POST, GET |
| `/api/content/posts/{postId}` | GET |
| `/api/content/me/posts/{postId}` | PATCH, DELETE |

#### Post media

| Endpoint | Method |
|----------|--------|
| `/api/content/me/posts/{postId}/media` | POST, GET |
| `/api/content/me/posts/{postId}/media/{mediaId}` | DELETE |

#### Comments

| Endpoint | Method |
|----------|--------|
| `/api/content/posts/{postId}/comments` | POST, GET |
| `/api/content/me/comments/{commentId}` | PATCH, DELETE |

#### Reactions

| Endpoint | Method |
|----------|--------|
| `/api/content/posts/{postId}/reactions` | PUT, DELETE |
| `/api/content/posts/{postId}/reactions/me` | GET |
| `/api/content/posts/{postId}/reactions` | GET |

#### Hashtags

| Endpoint | Method |
|----------|--------|
| `/api/content/hashtags` | POST |
| `/api/content/hashtags/{hashtagId}` | GET |

#### Post hashtags

| Endpoint | Method |
|----------|--------|
| `/api/content/me/posts/{postId}/hashtags` | POST |
| `/api/content/posts/{postId}/hashtags` | GET |
| `/api/content/me/posts/{postId}/hashtags/{hashtagId}` | DELETE |

#### User hashtag follows

| Endpoint | Method |
|----------|--------|
| `/api/content/me/hashtags/{hashtagId}/follow` | POST, DELETE |
| `/api/content/me/hashtags/following` | GET |

**Rules:** all endpoints require JWT; `userId`/`authorId` is taken only from JWT; visibility v1 `public` / `private`; private post visible only to author; deleted post does not accept comments/reactions; media stores **Url** and **Type** only (no blob); post delete is soft delete (`deleted_at`); comment update/delete author-only and delete is soft delete (`deleted_at`); reaction works via upsert with one reaction per post/user and repeated PUT updates `reaction_type`; reaction DELETE removes row; hashtag name normalized trim + lower; duplicate hashtag name → **400**; post hashtag attach/detach post owner only; duplicate post hashtag → **400**; user hashtag follow/unfollow JWT user only; duplicate active follow → **400**; re-follow after unfollow reactivates row; `comment_count` / `reaction_count` updated in service; `"Post not found."` / `"Media not found."` / `"Post media not found."` / `"Comment not found."` / `"Reaction not found."` / `"Hashtag not found."` / `"Post hashtag not found."` / `"Hashtag follow not found."` → **404**; other business errors → **400**.

Details: [Content module README](./backend/Content/README.md).

## 🛠️ Development

### Run Locally (without Docker)

1. **Start PostgreSQL**

2. **Update connection string** in `backend/Facade.API/appsettings.Development.json`

3. **Run the API** (migrations apply automatically on startup):
```bash
cd backend/Facade.API
dotnet run
```

4. **Access Swagger**: http://localhost:5000/swagger

Optional manual migrations:
```bash
cd backend/Identity/Identity.DataAccess
dotnet ef database update --context IdentityDbContext
```

### Build Solution

```bash
dotnet build LinkedIn.sln
```

## 🔐 Authentication

The API uses JWT Bearer token authentication with:

- **Access Tokens**: Short-lived (15 min in production, 60 min in development)
- **Refresh Tokens**: Long-lived (7 days in production, 30 days in development)
- **Token Rotation**: Old refresh token revoked when refreshed
- **Secure Storage**: Refresh tokens stored in PostgreSQL (`identity` schema)

### Example: Login and Use Token

1. **Register/Login** via `/api/auth/register` or `/api/auth/login`
2. **Copy the access token** from response
3. Open **Swagger** at `/swagger`, click **Authorize**
4. **Enter**: `Bearer <your-access-token>`
5. Use protected endpoints (`/api/auth/me`, `/api/profile/me`, `/api/network/me/contacts`, etc.)

## 📦 Modules

### Identity (Core)
- User registration, JWT, refresh tokens
- ASP.NET Core Identity
- Publishes `UserRegisteredEvent` after registration
- PostgreSQL schema: `identity`

### Profile (Core)
- **Modular monolith** core module (**TargetFramework net8.0**); PostgreSQL schema: **`profile`** — **fully implemented**
- Tables: **`user_profiles`** (public profile data), **`message_settings`** (private messaging preferences), **`profile_views`** (append-only view event log)
- `user_profiles` created via **`UserRegisteredEvent`** after registration; **`GET /api/profile/me`** creates an empty profile as fallback if the handler did not run (soft-deleted profiles are not auto-restored)
- Exposed via **ProfileManagement** facade (`IProfileClient` in-process; microservice-ready seam)
- See [backend/Profile/README.md](./backend/Profile/README.md) for architecture, security rules, and Swagger routes

### Professional (Core)
- **Modular monolith** core module (**TargetFramework net8.0**); PostgreSQL schema: `professional` — **fully implemented** for all career tables in `DB_SCHEMA.md` sections 2–3
- Entities: **Companies**, **Experiences**, **Academies**, **Educations**, **Certificates**, **Skills**, **UserSkills**, **CertificateSkills**, **Languages**, **UserLanguages**, **RecommendedSkillsByPosition**, **Recommendations**
- Exposed via **ProfessionalManagement** facade (`IProfessionalClient` in-process; microservice-ready seam)
- See [backend/Professional/README.md](./backend/Professional/README.md) for architecture, security rules, and Swagger routes

### AccountManagement (Facade / BFF)
- Client-facing auth API at `/api/auth`
- Maps facade DTOs ↔ Identity via `IIdentityClient`

### ProfileManagement (Facade / BFF)
- Profile API at `/api/profile` (.NET 8, modular monolith BFF)
- Profile CRUD, avatar/header upload (`/uploads/...`)
- **Message settings:** JWT-only `/api/profile/me/message-settings` (GET get-or-create, PUT/PATCH)
- **Profile views:** public `POST /api/profile/{profileOwnerId}/views?source=`; JWT `GET /api/profile/me/profile-views` (owner only)
- Maps via `IProfileClient`

### Network (Core)
- **Modular monolith prepared for microservices** (**TargetFramework net8.0**); PostgreSQL schema: **`network`**
- Tables: **`contacts`**, **`follows`**, **`blocked_users`**, **`user_groups`**, **`group_members`**, **`pages`**, **`page_admins`**, **`page_followers`**
- Migrations: `AddNetworkModule`, `AddNetworkGroups`, `AddNetworkPages`
- Services/resources: `ContactService`/`ContactResource` through `PageFollowerService`/`PageFollowerResource`; facade uses **`INetworkClient`** (`Contacts`, `Follows`, `BlockedUsers`, `UserGroups`, `GroupMembers`, `Pages`, `PageAdmins`, `PageFollowers`)
- **`group_posts`** not implemented — deferred until Content/Posts module (`posts.post_id`)
- No EF reference to Identity/Profile; target user existence is not validated
- Exposed via **NetworkManagement** facade (in-process client; microservice-ready seam)
- See [backend/Network/README.md](./backend/Network/README.md) for architecture, security rules, and full endpoint list

### NetworkManagement (Facade / BFF)
- Social graph API at `/api/network` (.NET 8, modular monolith BFF)
- **All routes require JWT**; `userId` from JWT only (never `ownerId`/`requesterId`/`followerId` in body)
- v1: contacts, follows, blocked users
- v2: user groups, group membership (join/leave/members)
- v3: pages, page admins, page followers
- Maps via `INetworkClient`

### Content (Core)
- **Modular monolith prepared for microservices** (**TargetFramework net8.0**); PostgreSQL schema: **`content`**
- Tables: **`posts`**, **`media`**, **`post_media`**, **`comments`**, **`reactions`**, **`hashtags`**, **`post_hashtags`**, **`user_hashtag_follows`**
- Migrations: **`AddContentModule`**, **`AddContentCommentsAndReactions`**, **`AddContentHashtagsAndFollows`**
- Services/resources: `PostService`/`PostResource`, `MediaService`/`MediaResource`, `PostMediaService`/`PostMediaResource`, `CommentService`/`CommentResource`, `ReactionService`/`ReactionResource`, `HashtagService`/`HashtagResource`, `PostHashtagService`/`PostHashtagResource`, `UserHashtagFollowService`/`UserHashtagFollowResource`; facade uses **`IContentClient`** (`Posts`, `Media`, `PostMedia`, `Comments`, `Reactions`, `Hashtags`, `PostHashtags`, `UserHashtagFollows`)
- Visibility v1: `public` / `private`; media URL + type only; post/comment soft delete; reaction upsert + hard delete
- **`group_posts`** deferred until Content + Network integration
- Exposed via **ContentManagement** facade (in-process client; microservice-ready seam)
- See [backend/Content/README.md](./backend/Content/README.md) for architecture, security rules, and full endpoint list

### ContentManagement (Facade / BFF)
- Posts, comments, reactions, hashtags and media API at `/api/content` (.NET 8, modular monolith BFF)
- **All routes require JWT**; `authorId`/`userId` from JWT only (never in body)
- Hashtags: create/get; post hashtags attach/list/detach; user hashtag follow/unfollow/list following
- Maps via `IContentClient`

### ProfessionalManagement (Facade / BFF)
- Career API at `/api/professional` (.NET 8, modular monolith BFF)
- Catalog v1 (Academy, Skill, Language): JWT `POST` + public `GET` by id
- User data: full CRUD under `/api/professional/me/...`; `userId` from JWT only
- **Certificate skills:** `/api/professional/me/certificates/{certificateId}/skills` (JWT; link certificate ↔ skill catalog)
- **Recommended skills by position:** public `GET ?position=`; JWT `POST` / `DELETE /{rspId}`
- **Recommendations:** public `GET /users/{userId}/recommendations` and `GET /recommendations/{id}`; JWT `POST` / `PATCH` / `DELETE` (author from JWT; soft delete)
- Maps via `IProfessionalClient`

### Facade.API (Host)
- Composition root: registers all Core + Facade modules
- JWT, CORS (dev/prod), Swagger (Development only)
- Static files for uploads

## 🔄 Data Flow

```
Client Application
    ↓ HTTP
Facade.API (Host)
    ↓
Facade Modules (BFF): AccountManagement | ProfileManagement | ProfessionalManagement | NetworkManagement | ContentManagement
    ↓ I*Client (in-process, microservice-ready seam)
Core Modules: Identity | Profile | Professional | Network | Content
    ↓ EF Core (separate DbContext per module)
PostgreSQL (schemas: identity, profile, professional, network, content)
```

Registration side-effect (event architecture; Identity does not call Profile directly):
```
Identity.UserService → UserRegisteredEvent → Profile handler → empty user_profiles row
```
Fallback if the handler did not create a row: **`GET /api/profile/me`** (JWT) → `CreateEmptyAsync` for the current user.

## 🐳 Docker Details

### Services
- **linkedin-postgres**: PostgreSQL 16 Alpine
- **linkedin-api**: .NET 8 API

### Volumes
- **postgres_data**: Database persistence
- **profile_uploads**: Uploaded profile files

See [DOCKER.md](./DOCKER.md) for details.

## 📚 Documentation

- **[Docker Setup](./DOCKER.md)** - Complete Docker guide
- **[Facade.API](./backend/Facade.API/README.md)** - Host API documentation
- **[Facade.API Integration](./backend/Facade.API/INTEGRATION.md)** - Module integration overview
- **[AccountManagement Facade](./backend/AccountManagement/README.md)** - Auth facade details
- **[Profile Module](./backend/Profile/README.md)** - Profile core module and `/api/profile` endpoints
- **[Professional Module](./backend/Professional/README.md)** - Career core module and `/api/professional` endpoints
- **[Network Module](./backend/Network/README.md)** - Social graph core module and `/api/network` endpoints
- **[Content Module](./backend/Content/README.md)** - Posts & media core module and `/api/content` endpoints

## 🧪 Testing

### Using Swagger UI

1. Navigate to http://localhost:5000/swagger
2. Expand `POST /api/auth/register`
3. Click "Try it out", send `{ "email": "...", "password": "..." }`
4. Use returned token for authorized endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

## 🚦 Status

✅ **Identity Core Module** - Authentication and events  
✅ **Profile Core Module** - Full `profile` schema: user profiles, message settings, profile views  
✅ **Professional Core Module** - Full `professional` schema: companies, experience, education, certificates, skills, languages, certificate skills, recommended skills by position, recommendations  
✅ **AccountManagement Facade** - `/api/auth`  
✅ **ProfileManagement Facade** - `/api/profile` + uploads + message settings + profile views  
✅ **ProfessionalManagement Facade** - `/api/professional`  
✅ **Network Core Module** - Schema `network`: contacts, follows, blocked users, groups, pages (8 tables; `group_posts` deferred)  
✅ **NetworkManagement Facade** - `/api/network` (JWT-only; 33 endpoints)  
✅ **Content Core Module** - Schema `content`: posts, media, post_media, comments, reactions, hashtags, post_hashtags, user_hashtag_follows (`saved_posts/reposts/post_views/mentions/group_posts` deferred)  
✅ **ContentManagement Facade** - `/api/content` (JWT-only; hashtags/post hashtags/hashtag follows endpoints added)  
✅ **Facade.API** - Single host, all modules integrated  
✅ **Docker Support** - docker-compose with PostgreSQL and uploads volume  
✅ **Database Migrations** - Automatic on startup  
✅ **JWT Authentication** - Access + refresh tokens  

## 🛣️ Roadmap

- [ ] Email verification
- [ ] Password reset flow
- [ ] Automated test projects
- [ ] Health check endpoints
- [ ] Outbox / message bus for domain events (future microservice split)
- [ ] Admin panel
- [ ] Analytics and monitoring

## 💡 Tech Stack

- **.NET 8** / ASP.NET Core Web API
- **Entity Framework Core 8** + Npgsql
- **PostgreSQL 16**
- **ASP.NET Core Identity** + JWT Bearer
- **Swagger/OpenAPI** (Development)
- **Docker** + Docker Compose

## 📝 License

This project is for educational purposes.

---

**Built with modular monolith architecture — prepared for microservices, deployed as a single application.**
