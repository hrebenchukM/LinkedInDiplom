# Facade.API — Module Integration

Overview of how **Facade.API** hosts the modular monolith: **six Core** modules, **six Facade (BFF)** modules, one PostgreSQL database with separate schemas.

## Summary

- **Type**: ASP.NET Core Web API (.NET 8)
- **Pattern**: Modular monolith **prepared for microservices** (in-process `I*Client` today; HTTP clients possible later)
- **Deploy unit**: Single `Facade.API` process — not separate microservices

## Registered Modules

| Layer | Module | DI extension |
|-------|--------|--------------|
| Core | Identity | `AddIdentityModule` |
| Core | Profile | `AddProfileModule` |
| Core | Professional | `AddProfessionalModule` |
| Core | Network | `AddNetworkModule` |
| Core | Content | `AddContentModule` |
| Core | Messaging | `AddMessagingModule` |
| Facade | AccountManagement | `AddAccountManagementFacade` |
| Facade | ProfileManagement | `AddProfileManagementFacade` |
| Facade | ProfessionalManagement | `AddProfessionalManagementFacade` |
| Facade | NetworkManagement | `AddNetworkManagementFacade` |
| Facade | ContentManagement | `AddContentManagementFacade` |
| Facade | MessagingManagement | `AddMessagingManagementFacade` |

Controllers are discovered via `AddApplicationPart` from each facade Controllers assembly.

## API Routes

| Prefix | Controller | Examples |
|--------|------------|----------|
| `/api/auth` | AccountController | register, login, refresh, logout, me |
| `/api/profile` | ProfileController | me, {userId}, avatar, header |
| `/api/professional` | ProfessionalController | career: companies, experiences, educations, certificates, skills, languages (see [Professional README](../Professional/README.md)) |
| `/api/network` | NetworkController | contacts, follows, blocked users, groups, group posts, pages |
| `/api/content` | ContentController | posts, media, comments, reactions, hashtags, saved posts, reposts, views, mentions |
| `/api/messaging` | MessagingController | chats, members, messages, reads, message media |

Swagger (Development): **http://localhost:5000/swagger**

## Auth Example

### Register

**Request:**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": null
  },
  "errors": []
}
```

After registration, Identity publishes **`UserRegisteredEvent`**; Profile module creates an empty profile **in-process** (same HTTP request as register). If that handler fails, **`GET /api/profile/me`** (JWT) creates an empty profile as a **fallback**; soft-deleted profiles are not auto-restored. Identity does not reference Profile projects — only the event contract.

### Login

```http
POST /api/auth/login
{ "email": "john@example.com", "password": "SecurePass123" }
```

Returns `account` + `token` (accessToken, refreshToken, expiresAt, tokenType).

## Architecture Flow (Auth)

```
HTTP → Facade.API
    → AccountController (/api/auth)
    → AccountManagementService
    → IIdentityClient
    → IdentityClient → Resources → IUserService / IAuthenticationService
    → IdentityDbContext → PostgreSQL (identity schema)
```

## Architecture Flow (Profile)

```
HTTP → ProfileController (/api/profile)
    → ProfileManagementService
    → IProfileClient
    → ProfileService → ProfileDbContext (profile schema)
```

## Architecture Flow (Professional)

```
HTTP → ProfessionalController (/api/professional)
    → ProfessionalManagementService
    → IProfessionalClient
    → *Resource → *Service → ProfessionalDbContext (professional schema)
```

- **Catalog v1** (`academies`, `skills`, `languages`): `POST` (JWT) + `GET /{id}` (public).
- **User data** (`/me/...`): JWT required; `userId` from claims only; PATCH merges omitted fields in the service layer.

## Architecture Flow (Messaging)

```
HTTP → MessagingController (/api/messaging)
    → MessagingManagementService
    → IMessagingClient
    → *Resource → *Service → MessagingDbContext (messaging schema)
```

- All messaging endpoints require JWT.
- `userId` is taken only from JWT claims (`NameIdentifier` / `sub`).
- Request bodies do not contain current user id.
- Message media stores only URL/reference (no blob).
- SignalR/WebSocket and real-time delivery are not implemented in v1.

### Messaging behavior (audit-verified)

- Messaging audit passed: **critical issues not found**.
- List GET endpoints may return **`200` + empty array** for inaccessible or empty resources:
  - `GET /api/messaging/me/chats/{chatId}/members`
  - `GET /api/messaging/me/chats/{chatId}/messages`
  - `GET /api/messaging/me/messages/{messageId}/reads`
  - `GET /api/messaging/me/messages/{messageId}/media`
- Single-resource endpoints and mutations return **`404`** for foreign/inaccessible resources:
  - `GET /api/messaging/me/chats/{chatId}`
  - `GET /api/messaging/me/messages/{messageId}`
  - `POST` message/read/media with no access
- v1 join is open by `chatId` (no invite/approval flow yet).
- v1 behavior: sender can edit/delete own message even if they left the chat later.

## Cross-Module Event

```
Identity.UserService.Register
    → UserRegisteredEvent
    → InMemoryDomainEventPublisher (in-process, await handlers)
    → CreateEmptyProfileWhenUserRegisteredHandler (Profile module)
    → ProfileService.CreateEmptyAsync → ProfileDbContext
```

**Fallback (no direct Identity → Profile call):** `GET /api/profile/me` → `ProfileManagementService.GetMyProfileAsync` → if no active profile, `CreateEmptyAsync` for JWT user.

**Boundaries:** Identity has no dependency on Profile; Profile depends only on `Identity.Events.Contracts`. Event-based integration is preserved.

## Technology Stack

- **.NET 8**, ASP.NET Core, EF Core 8, Npgsql
- **PostgreSQL 16** — schemas: `identity`, `profile`, `professional`
- **PostgreSQL 16** — schemas: `identity`, `profile`, `professional`, `network`, `content`, `messaging`
- **JWT** + ASP.NET Core Identity
- **Swashbuckle** (Development)

## Database

- One connection string (`DefaultConnection`)
- Separate `DbContext` per module
- Migrations applied on startup for all module contexts, including `MessagingDbContext`

## Project Dependencies (simplified)

```
Facade.API
├── Identity.DI, Profile.DI, Professional.DI, Network.DI, Content.DI, Messaging.DI
├── Facade.AccountManagement.DI
├── Facade.ProfileManagement.DI
├── Facade.ProfessionalManagement.DI
├── Facade.NetworkManagement.DI
├── Facade.ContentManagement.DI
├── Facade.MessagingManagement.DI
└── Facade.*.Controllers (ApplicationPart)
```

## Microservice-Ready Seams (not deployed as microservices today)

| Seam | Current | Future option |
|------|---------|---------------|
| `IIdentityClient` / `IProfileClient` / `IProfessionalClient` / `INetworkClient` / `IContentClient` / `IMessagingClient` | In-process | HTTP SDK |
| `Identity.Events.Contracts` | In-memory publisher | Message bus |
| DbContext per module | Shared PostgreSQL | Split databases |

## Success Metrics

✅ **53 projects** in `LinkedIn.sln`  
✅ **6 core + 6 facade** modules integrated  
✅ **JWT** authentication  
✅ **Swagger** at `/swagger` (Development)  
✅ **Modular monolith** with BFF + resource/client pattern  

## Manual Testing Checklist

1. Register via `/api/auth/register`
2. Login and copy access token
3. `GET /api/auth/me`
4. `GET /api/profile/me` (profile from event, or empty profile via fallback if event did not run)
5. Upload avatar via `/api/profile/me/avatar`
6. `POST /api/professional/languages` then `GET /api/professional/languages/{id}` (public)
7. `POST /api/professional/me/languages` with returned `languageId`
8. `POST /api/messaging/me/chats` → `POST /api/messaging/me/chats/{chatId}/messages`
9. `POST /api/messaging/me/messages/{messageId}/read` then `GET /api/messaging/me/messages/{messageId}/reads`
10. Refresh and logout tokens

## Future (roadmap, not implemented)

- Automated test projects
- Health checks, rate limiting
- Outbox pattern for reliable events
- Optional HTTP-based module clients when splitting services

## Related Documentation

- [Facade.API README](./README.md)
- [AccountManagement facade](../AccountManagement/README.md)
- [Professional module README](../Professional/README.md)
- [Network module README](../Network/README.md)
- [Content module README](../Content/README.md)
- [Messaging module README](../Messaging/README.md)
- [Root README](../../README.md)
