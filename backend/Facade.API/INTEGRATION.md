# Facade.API — Module Integration

Overview of how **Facade.API** hosts the modular monolith: three **Core** modules, three **Facade (BFF)** modules, one PostgreSQL database with separate schemas.

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
| Facade | AccountManagement | `AddAccountManagementFacade` |
| Facade | ProfileManagement | `AddProfileManagementFacade` |
| Facade | ProfessionalManagement | `AddProfessionalManagementFacade` |

Controllers are discovered via `AddApplicationPart` from each facade Controllers assembly.

## API Routes

| Prefix | Controller | Examples |
|--------|------------|----------|
| `/api/auth` | AccountController | register, login, refresh, logout, me |
| `/api/profile` | ProfileController | me, {userId}, avatar, header |
| `/api/professional` | ProfessionalController | me/experiences, me/companies |

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

After registration, Identity publishes `UserRegisteredEvent`; Profile module creates an empty profile asynchronously.

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

## Cross-Module Event

```
Identity.UserService.Register
    → UserRegisteredEvent
    → InMemoryDomainEventPublisher
    → CreateEmptyProfileWhenUserRegisteredHandler (Profile module)
    → ProfileDbContext
```

## Technology Stack

- **.NET 8**, ASP.NET Core, EF Core 8, Npgsql
- **PostgreSQL 16** — schemas: `identity`, `profile`, `professional`
- **JWT** + ASP.NET Core Identity
- **Swashbuckle** (Development)

## Database

- One connection string (`DefaultConnection`)
- Separate `DbContext` per module
- Migrations applied on startup for all three contexts

## Project Dependencies (simplified)

```
Facade.API
├── Identity.DI, Profile.DI, Professional.DI
├── Facade.AccountManagement.DI
├── Facade.ProfileManagement.DI
├── Facade.ProfessionalManagement.DI
└── Facade.*.Controllers (ApplicationPart)
```

## Microservice-Ready Seams (not deployed as microservices today)

| Seam | Current | Future option |
|------|---------|---------------|
| `IIdentityClient` / `IProfileClient` / `IProfessionalClient` | In-process | HTTP SDK |
| `Identity.Events.Contracts` | In-memory publisher | Message bus |
| DbContext per module | Shared PostgreSQL | Split databases |

## Success Metrics

✅ **33 projects** in `LinkedIn.sln`  
✅ **3 core + 3 facade** modules integrated  
✅ **JWT** authentication  
✅ **Swagger** at `/swagger` (Development)  
✅ **Modular monolith** with BFF + resource/client pattern  

## Manual Testing Checklist

1. Register via `/api/auth/register`
2. Login and copy access token
3. `GET /api/auth/me`
4. `GET /api/profile/me` (profile created via event)
5. Upload avatar via `/api/profile/me/avatar`
6. Refresh and logout tokens

## Future (roadmap, not implemented)

- Automated test projects
- Health checks, rate limiting
- Outbox pattern for reliable events
- Optional HTTP-based module clients when splitting services

## Related Documentation

- [Facade.API README](./README.md)
- [AccountManagement facade](../AccountManagement/README.md)
- [Root README](../../README.md)
