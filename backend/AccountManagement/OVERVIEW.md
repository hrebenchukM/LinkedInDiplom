# Facade.AccountManagement Overview

## Summary

The Facade.AccountManagement module provides a client-optimized REST API for **authentication** in a **modular monolith prepared for microservices**. It follows the BFF pattern and delegates business logic to the Identity core module.

## What Was Created

### Four Projects (Facade Architecture)

- **Facade.AccountManagement.Contracts** — DTOs, requests, responses
- **Facade.AccountManagement.Services** — Orchestration via `IIdentityClient`
- **Facade.AccountManagement.Controllers** — `AccountController` at `/api/auth`
- **Facade.AccountManagement.DI** — `AddAccountManagementFacade()`

### API Endpoints

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/register` | POST | Register account |
| `/api/auth/login` | POST | Login |
| `/api/auth/refresh` | POST | Refresh token |
| `/api/auth/logout` | POST | Logout |
| `/api/auth/me` | GET | Current account (authorized) |

### DTO Mapping

- `UserDto` → `AccountDto` (`id`, `email`, `createdAt`, `updatedAt`)
- `TokenDto` → `AuthTokenDto`
- `RegisterRequest`: `email`, `password` only

### Registration and Profile

AccountManagement does **not** create profiles directly. Identity publishes `UserRegisteredEvent`; Profile module handler creates an empty profile.

## Architecture Benefits

### Loose Coupling
- Facade calls Identity through **`IIdentityClient`**
- Uses **`Identity.Contracts`** for request parameters
- Identity implementation can be swapped (e.g. HTTP client in future)

### Microservice-Ready Seam
- Current: in-process client
- Future: HTTP-based `IIdentityClient` without changing controller/facade contract shape

## Data Flow

```
Client → AccountController (/api/auth)
      → AccountManagementService
      → IIdentityClient
      → Identity Core
      → identity schema (PostgreSQL)
```

## Example Registration

```http
POST /api/auth/register
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

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

## Integration with Facade.API

```csharp
builder.Services.AddIdentityModule(configuration, connectionString);
builder.Services.AddAccountManagementFacade();

builder.Services.AddControllers()
    .AddApplicationPart(typeof(AccountController).Assembly);
```

Also registered in production host together with Profile, Professional, and their facades.

## Project Dependencies

```
Facade.AccountManagement.DI
    ├── Facade.AccountManagement.Services
    │   ├── Facade.AccountManagement.Contracts
    │   ├── Identity.Client.Contracts
    │   └── Identity.Contracts
    └── Facade.AccountManagement.Controllers
```

## Success Metrics

✅ Four facade projects building in solution  
✅ REST API at `/api/auth`  
✅ BFF mapping layer  
✅ Integrated into Facade.API host  
✅ Loosely coupled via `IIdentityClient`  

## Notes

- Business logic remains in **Identity.Services**
- **ProfileManagement** is a separate facade for `/api/profile`
- Solution architecture: **Facade + Core + Client.Contracts + DI**, single PostgreSQL with module schemas

## Future Enhancements

- Email verification, password reset (Identity/facade extensions)
- Automated unit/integration tests

Profile management and uploads: see **ProfileManagement** module.
