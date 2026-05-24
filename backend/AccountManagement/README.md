# Facade.AccountManagement

BFF (Backend for Frontend) facade for **authentication and account operations**. Orchestrates the **Identity** core module via `IIdentityClient` and exposes REST API at **`/api/auth`**.

Part of the **modular monolith** — prepared for microservices via the Client.Contracts seam, deployed in-process today.

## Project Structure

```
AccountManagement/
├── Facade.AccountManagement.Contracts/     # Facade DTOs, Requests, Responses
├── Facade.AccountManagement.Services/      # Orchestration + DTO mapping
├── Facade.AccountManagement.Controllers/   # REST API (AccountController)
└── Facade.AccountManagement.DI/            # AddAccountManagementFacade()
```

## Architecture Pattern

This facade implements the **BFF** pattern by:

1. **Translating** Identity results into client-friendly facade DTOs
2. **Orchestrating** Identity module calls through `IIdentityClient`
3. **Validating** requests with data annotations
4. **Exposing** REST controllers consumed by Facade.API

Profile data is **not** created here. After registration, Identity publishes `UserRegisteredEvent`; the Profile core module creates an empty profile via an event handler.

## Authentication Endpoints

All routes use prefix **`/api/auth`**:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/login` | POST | Login with email and password |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Revoke refresh token |
| `/api/auth/me` | GET | Current account (JWT required) |

## DTO Mapping

**Core → Facade:**
- `UserDto` → `AccountDto` (id, email, createdAt, updatedAt)
- `TokenDto` → `AuthTokenDto` (accessToken, refreshToken, expiresAt, tokenType)

### RegisterRequest (facade)

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Fields: `email` (required, email format), `password` (required, min 6 characters).  
UserName in Identity is set from email during registration.

### AccountDto (facade response)

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": null
}
```

## Example: Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "account": {
    "id": "user-id",
    "email": "user@example.com",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": null
  },
  "errors": []
}
```

## Example: Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

Response includes `account` and `token` (JWT + refresh token).

## Data Flow

```
HTTP Request
  ↓
AccountController (/api/auth)
  ↓
AccountManagementService
  ↓
IIdentityClient (Identity.Client.Contracts)
  ↓
Identity Core Module
  ↓
PostgreSQL (identity schema)
```

## Dependencies

- `Identity.Client.Contracts` — `IIdentityClient`
- `Identity.Contracts` — parameters (e.g. `RegisterUserParameters`)

## Microservice-Ready

- **Today**: in-process `IdentityClient`
- **Future**: replace Client registration with HTTP implementation; facade service code stays oriented on `IIdentityClient`

## Integration in Facade.API

```csharp
builder.Services.AddAccountManagementFacade();

builder.Services.AddControllers()
    .AddApplicationPart(typeof(AccountController).Assembly);
```

## Related modules

- **ProfileManagement** facade — `/api/profile` (separate BFF)
- **ProfessionalManagement** facade — `/api/professional`

## Future Enhancements (not in this facade)

- Email verification
- Password reset
- Two-factor authentication
- Account deletion

Profile CRUD and file upload live in **ProfileManagement**, not AccountManagement.
