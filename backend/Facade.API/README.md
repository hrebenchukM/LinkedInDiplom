# Facade.API

The main entry point for the LinkedIn Clone backend. This **modular monolith host** aggregates all facade modules and core modules into a single deployable ASP.NET Core Web API (.NET 8).

## Overview

Facade.API:
- Hosts facade controllers (`AccountManagement`, `ProfileManagement`, `ProfessionalManagement`, `NetworkManagement`)
- Registers core modules via DI (`Identity`, `Profile`, `Professional`, `Network`)
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
    └── Facade.NetworkManagement      → /api/network
    ↓ I*Client (in-process, microservice-ready seam)
Core Modules
    ├── Identity      (schema: identity)
    ├── Profile       (schema: profile)
    ├── Professional  (schema: professional)
    └── Network       (schema: network)
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

Social graph BFF over the **Network** core module. The solution is a **modular monolith** on **.NET 8** (`TargetFramework net8.0`); the Network core owns PostgreSQL schema **`network`**: `contacts`, `follows`, `blocked_users` (see [Network module README](../Network/README.md)).

`userId` for all routes comes **only from JWT** (`NameIdentifier` / `sub`). **All endpoints require JWT** in v1 (no public routes).

| Area | Method | Path | Auth |
|------|--------|------|------|
| Contacts | POST | `/api/network/me/contacts` | Yes (`receiverId` in body) |
| Contacts | GET | `/api/network/me/contacts` | Yes |
| Contacts | GET | `/api/network/me/contacts/{contactId}` | Yes (not participant → 404) |
| Contacts | PATCH | `/api/network/me/contacts/{contactId}/accept` | Yes (receiver, pending) |
| Contacts | PATCH | `/api/network/me/contacts/{contactId}/reject` | Yes (receiver, pending) |
| Contacts | DELETE | `/api/network/me/contacts/{contactId}` | Yes (cancel pending / remove accepted) |
| Following | POST | `/api/network/me/following` | Yes (`followingId` in body) |
| Following | DELETE | `/api/network/me/following/{followingId}` | Yes (unfollow → `unfollowed_at`; not found → 404) |
| Following | GET | `/api/network/me/following` | Yes (active only) |
| Followers | GET | `/api/network/me/followers` | Yes (active only) |
| Blocked users | POST | `/api/network/me/blocked-users` | Yes (`blockedUserId` in body) |
| Blocked users | DELETE | `/api/network/me/blocked-users/{blockedUserId}` | Yes (unblock → `unblocked_at`; not found → 404) |
| Blocked users | GET | `/api/network/me/blocked-users` | Yes (active only) |

**Rules:** cannot contact/follow/block yourself → **400**; active block in either direction blocks new contact/follow → **400**; duplicate active contact/follow/block → **400**; foreign or non-participant rows → **404**.

Full rules and table details: [Network module README](../Network/README.md).

## Module Integration (Program.cs)

```csharp
builder.Services.AddIdentityModule(configuration, connectionString);
builder.Services.AddProfileModule(configuration, connectionString);
builder.Services.AddProfessionalModule(configuration, connectionString);
builder.Services.AddNetworkModule(configuration, connectionString);

builder.Services.AddAccountManagementFacade();
builder.Services.AddProfileManagementFacade();
builder.Services.AddProfessionalManagementFacade();
builder.Services.AddNetworkManagementFacade();

builder.Services.AddControllers()
    .AddApplicationPart(typeof(AccountController).Assembly)
    .AddApplicationPart(typeof(ProfileController).Assembly)
    .AddApplicationPart(typeof(ProfessionalController).Assembly)
    .AddApplicationPart(typeof(NetworkController).Assembly);
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
✅ **Network module** — schema `network` (`contacts`, `follows`, `blocked_users`) at `/api/network`  

## Related docs

- [INTEGRATION.md](./INTEGRATION.md) — integration and data flow details
- [AccountManagement facade](../AccountManagement/README.md)
- [Profile module](../Profile/README.md)
- [Professional module](../Professional/README.md)
- [Network module](../Network/README.md)
