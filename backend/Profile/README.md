# Profile Module

Core module of the LinkedIn Clone **modular monolith** (.NET 8, `TargetFramework net8.0`). It owns user profile data in PostgreSQL schema **`profile`** and is consumed by the **ProfileManagement** facade at `/api/profile`.

The module is **not** deployed as a separate microservice today. Boundaries are enforced via projects, contracts, and `IProfileClient` — the same seam can later be replaced with HTTP clients without changing the facade surface.

**Status:** The **`profile` schema from `DB_SCHEMA.md` (Profile module section)** is fully implemented — all tables below have DataAccess, services, client resources, and Facade endpoints.

## Architecture

```
HTTP Client
    ↓
Facade.API
    ↓
Facade.ProfileManagement (BFF)
    ProfileController  →  /api/profile/*
    ProfileManagementService
    ↓
IProfileClient (in-process)
    ↓
Profile.Client (Resources)
    ↓
Profile.Services
    ↓
Profile.DataAccess (ProfileDbContext)
    ↓
PostgreSQL  schema: profile
```

### Core projects

| Project | Role |
|---------|------|
| `Profile.Contracts` | DTOs, parameters, results, service interfaces |
| `Profile.DataAccess` | Entities, EF Core, migrations |
| `Profile.Services` | Business logic, `UserRegisteredEvent` handler |
| `Profile.Client.Contracts` | `IProfileClient`, `I*Resource` |
| `Profile.Client` | Resource implementations (delegate to services) |
| `Profile.DI` | `AddProfileModule` registration |

### Facade layer (`backend/ProfileManagement/`)

| Project | Role |
|---------|------|
| `Facade.ProfileManagement.Contracts` | Facade DTOs, requests, responses |
| `Facade.ProfileManagement.Services` | Maps facade ↔ `IProfileClient`; file uploads |
| `Facade.ProfileManagement.Controllers` | `ProfileController` |
| `Facade.ProfileManagement.DI` | `AddProfileManagementFacade` |

## Implemented tables (schema `profile`)

All tables store `user_id` / owner ids as **string** (Identity user id) **without** an EF relationship to `AspNetUsers`. Identity is integrated only via **`UserRegisteredEvent`** (`Identity.Events.Contracts`).

| Entity | Table | Purpose |
|--------|-------|---------|
| **UserProfile** | `user_profiles` | Main public profile (name, headline, avatar, location, etc.) |
| **MessageSettings** | `message_settings` | **Private** per-user messaging preferences (office absence, notifications) |
| **ProfileView** | `profile_views` | **Append-only** event log of profile page views (analytics) |

### `user_profiles`

- One row per active user (`user_id` unique).
- Soft-delete column `deleted_at` (queries exclude deleted rows).
- Created automatically on registration via `CreateEmptyProfileWhenUserRegisteredHandler`.

### `message_settings`

- One row per user (`user_id` unique).
- **GET** (owner only): get-or-create with defaults (`office_absence_enabled=false`, `notifications_enabled=true`).
- **PUT / PATCH** (owner only): update settings.

### `profile_views`

- Many rows per profile owner (no unique constraint on viewer — repeat visits allowed).
- **POST** (public): record a view; `viewer_user_id` nullable for anonymous visitors.
- **GET** (owner only): last **100** views, sorted by `viewed_at` desc.
- No UPDATE / PATCH / DELETE (event log).

## Migrations

| Migration | Description |
|-----------|-------------|
| `AddProfileModule` | Schema `profile`, table `user_profiles` |
| `AddProfileMessageSettings` | Table `message_settings`, unique `user_id` |
| `AddProfileProfileViews` | Table `profile_views`, indexes on `profile_owner_id` and `(profile_owner_id, viewed_at)` |

Applied at startup from `Facade.API` (`ProfileDbContext`). History table: `profile.__EFMigrationsHistory`.

## Security rules

| Rule | Behavior |
|------|----------|
| `/me/*` routes | `userId` taken **only from JWT** (`ClaimTypes.NameIdentifier` or `sub`) in `ProfileController` — never from request body |
| `message_settings` | **Owner only** — all routes under `/api/profile/me/message-settings` require JWT; not exposed on public `GET /api/profile/{userId}` |
| `profile_views` GET | **Owner only** — `GET /api/profile/me/profile-views`; filtered by JWT user as `profile_owner_id` |
| `profile_views` POST | **Public** (no required JWT). If JWT present → `viewer_user_id` from claims; otherwise `null` (anonymous) |
| IP / User-Agent on view POST | Set in **facade** from `HttpContext` (`RemoteIpAddress`, `User-Agent` header) — **not** accepted from body |
| `source` on view POST | Optional query: `?source=profile` (trimmed in service) |
| Profile existence before view | POST returns **404** if no non-deleted `user_profiles` row for `profileOwnerId` |
| Avatar / header upload | JWT only; files saved under `uploads/profile/{userId}/...`; public URLs served from `/uploads/...` |

## API endpoints (Facade)

Base route: **`/api/profile`**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profile/me` | JWT | Current user's profile |
| PUT | `/api/profile/me` | JWT | Update profile (partial merge) |
| PATCH | `/api/profile/me` | JWT | Partial update profile |
| GET | `/api/profile/{userId}` | **Public** | Read another user's profile |
| POST | `/api/profile/me/avatar` | JWT | Upload avatar (image, max 5 MB) |
| POST | `/api/profile/me/header` | JWT | Upload header/cover (image, max 5 MB) |
| GET | `/api/profile/me/message-settings` | JWT | Get settings (get-or-create defaults) |
| PUT | `/api/profile/me/message-settings` | JWT | Replace message settings |
| PATCH | `/api/profile/me/message-settings` | JWT | Partial update message settings |
| POST | `/api/profile/{profileOwnerId}/views?source=` | **Public** (optional JWT) | Record profile view |
| GET | `/api/profile/me/profile-views` | JWT | List own profile views (max 100) |

## Registration integration

```
Identity.UserService.RegisterAsync
    → UserRegisteredEvent (in-process)
    → CreateEmptyProfileWhenUserRegisteredHandler
    → ProfileService.CreateEmptyAsync(userId)
```

Profile module depends on **`Identity.Events.Contracts`** only — not on Identity.DataAccess or Identity.Services.

## Related docs

- [Facade.API README](../Facade.API/README.md) — host routes overview
- [Facade.API INTEGRATION.md](../Facade.API/INTEGRATION.md) — composition and flows
- [DB_SCHEMA.md](../../docs/database/DB_SCHEMA.md) — database design
