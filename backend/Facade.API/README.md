# Facade.API

The main entry point for the LinkedIn Clone backend. This **modular monolith host** aggregates all facade modules and core modules into a single deployable ASP.NET Core Web API (.NET 8).

## Overview

Facade.API:
- Hosts facade controllers (`AccountManagement`, `ProfileManagement`, `ProfessionalManagement`)
- Registers core modules via DI (`Identity`, `Profile`, `Professional`)
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
    └── Facade.ProfessionalManagement → /api/professional
    ↓ I*Client (in-process, microservice-ready seam)
Core Modules
    ├── Identity      (schema: identity)
    ├── Profile       (schema: profile)
    └── Professional  (schema: professional)
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

| Endpoint | Method | Auth |
|----------|--------|------|
| `/api/profile/me` | GET, PUT, PATCH | Yes |
| `/api/profile/{userId}` | GET | No |
| `/api/profile/me/avatar` | POST | Yes |
| `/api/profile/me/header` | POST | Yes |

### Professional — `/api/professional`

Experiences and companies under `/api/professional/me/...` (see Swagger for full list).

## Module Integration (Program.cs)

```csharp
builder.Services.AddIdentityModule(configuration, connectionString);
builder.Services.AddProfileModule(configuration, connectionString);
builder.Services.AddProfessionalModule(configuration, connectionString);

builder.Services.AddAccountManagementFacade();
builder.Services.AddProfileManagementFacade();
builder.Services.AddProfessionalManagementFacade();

builder.Services.AddControllers()
    .AddApplicationPart(typeof(AccountController).Assembly)
    .AddApplicationPart(typeof(ProfileController).Assembly)
    .AddApplicationPart(typeof(ProfessionalController).Assembly);
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

## Related docs

- [INTEGRATION.md](./INTEGRATION.md) — integration and data flow details
- [AccountManagement facade](../AccountManagement/README.md)
