# Facade.AccountManagement Overview

## Summary

The Facade.AccountManagement module has been successfully created following the modular monolith architecture with Backend-for-Frontend (BFF) pattern. It provides a client-optimized REST API for account management and authentication.

## What Was Created

### 1. Four Projects Following Facade Architecture

- **Facade.AccountManagement.Contracts** - Client-friendly DTOs, requests, and responses
- **Facade.AccountManagement.Services** - Service layer that orchestrates Identity module
- **Facade.AccountManagement.Controllers** - REST API controllers
- **Facade.AccountManagement.DI** - Dependency injection configuration

### 2. Complete API Endpoints

All endpoints are in `AccountController` under `/api/account`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Register a new user account |
| `/login` | POST | Authenticate with email/password |
| `/refresh` | POST | Refresh access token using refresh token |
| `/logout` | POST | Revoke refresh token |

### 3. DTO Mapping Layer

The facade translates between core Identity DTOs and client-friendly DTOs:

**Core → Facade Mappings:**
- `UserDto` → `AccountDto` (adds computed `FullName` property)
- `TokenDto` → `AuthTokenDto` (simplified structure)
- Core results → Facade responses (consistent format)

### 4. Request Validation

All request DTOs include validation attributes:
- `[Required]`, `[EmailAddress]`, `[MinLength]`, `[MaxLength]`
- ASP.NET Core model validation integrated

## Architecture Benefits

### Loose Coupling
- Depends only on `Identity.Client.Contracts`, not implementation
- Can swap Identity implementation without changing facade
- Easy to mock for testing

### Client-Optimized
- Simplified DTOs with computed fields
- Consistent response format
- Validation built-in
- RESTful API design

### Microservice-Ready
The facade is the **seam** for microservice migration:
- Current: Calls `IIdentityClient` in-process
- Future: Swap with HTTP client calling Identity microservice
- **No facade code changes needed**

## Data Flow

```
Client Application
    ↓ HTTP
AccountController
    ↓ Method Call
AccountManagementService (Facade)
    ↓ Interface Call
IIdentityClient (Resource Pattern)
    ↓ In-Process
Identity Core Module
    ↓ EF Core
PostgreSQL Database
```

## Example Usage

### Registration Flow

```http
POST /api/account/register
{
  "email": "john@example.com",
  "userName": "johndoe",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "account": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "profilePictureUrl": null,
    "createdAt": "2024-01-15T10:00:00Z"
  },
  "errors": []
}
```

### Login Flow

```http
POST /api/account/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "success": true,
  "account": { /* same as above */ },
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "Rt8F3k2LmN5pQ7sT9uV1wX3yZ5",
    "expiresAt": "2024-01-15T10:15:00Z",
    "tokenType": "Bearer"
  },
  "errors": []
}
```

## Integration with Facade.API

When you create `Facade.API`, integrate this module:

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Register Identity module (core)
builder.Services.AddIdentityModule(
    builder.Configuration,
    builder.Configuration.GetConnectionString("DefaultConnection"));

// Register AccountManagement facade
builder.Services.AddAccountManagementFacade();

// Register controllers
builder.Services.AddControllers()
    .AddApplicationPart(typeof(AccountController).Assembly);

var app = builder.Build();

app.MapControllers();
app.Run();
```

## Testing Strategy

### Unit Tests - Service Layer
```csharp
var mockIdentityClient = new Mock<IIdentityClient>();
var service = new AccountManagementService(mockIdentityClient.Object);
var result = await service.LoginAsync(new LoginRequest { ... });
```

### Integration Tests - API Layer
```csharp
var client = _factory.CreateClient();
var response = await client.PostAsJsonAsync("/api/account/login", request);
var result = await response.Content.ReadFromJsonAsync<LoginResponse>();
```

## Project Dependencies

```
Facade.AccountManagement.DI
    ├── Facade.AccountManagement.Services
    │   ├── Facade.AccountManagement.Contracts
    │   │   └── Identity.Contracts (transitive)
    │   └── Identity.Client.Contracts
    │       └── Identity.Contracts
    └── Facade.AccountManagement.Controllers
        ├── Facade.AccountManagement.Contracts
        └── Facade.AccountManagement.Services
```

## Future Enhancements

Potential features to add to the facade:

1. **Profile Management**
   - Update profile endpoint
   - Upload profile picture
   - Change password

2. **Email Verification**
   - Send verification email
   - Verify email token

3. **Password Reset**
   - Request password reset
   - Reset password with token

4. **Account Management**
   - Get current account details
   - Delete account
   - Deactivate account

5. **Session Management**
   - List active sessions
   - Revoke all sessions
   - Revoke specific session

## Success Metrics

✅ All 4 projects created and building successfully  
✅ Added to LinkedIn.sln under AccountManagement folder  
✅ Complete DTO mapping layer implemented  
✅ 4 REST API endpoints ready  
✅ Validation attributes on all requests  
✅ Comprehensive documentation created  
✅ Follows BFF pattern as per architecture  
✅ Loosely coupled via IIdentityClient interface  
✅ Ready for integration with Facade.API  

## Notes

- The facade layer is **thin** - it primarily maps and orchestrates
- Business logic stays in the Identity core module
- This separation allows the core module to be:
  - Reused by multiple facades
  - Extracted to microservices
  - Tested independently
  - Versioned separately
