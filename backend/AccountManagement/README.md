# Facade.AccountManagement

This facade module provides account management and authentication functionality tailored for client applications. It orchestrates the Identity core module and provides a simplified, client-friendly API.

## Project Structure

```
AccountManagement/
├── Facade.AccountManagement.Contracts/     # Facade DTOs, Requests, Responses
│   ├── DTOs/
│   │   ├── AccountDto.cs
│   │   └── AuthTokenDto.cs
│   ├── Requests/
│   │   ├── RegisterRequest.cs
│   │   ├── LoginRequest.cs
│   │   └── RefreshTokenRequest.cs
│   ├── Responses/
│   │   ├── RegisterResponse.cs
│   │   ├── LoginResponse.cs
│   │   ├── RefreshTokenResponse.cs
│   │   └── LogoutResponse.cs
│   └── Services/
│       └── IAccountManagementService.cs
│
├── Facade.AccountManagement.Services/      # Orchestration + DTO mapping
│   └── Services/
│       └── AccountManagementService.cs
│
├── Facade.AccountManagement.Controllers/   # REST API endpoints
│   └── Controllers/
│       └── AccountController.cs
│
└── Facade.AccountManagement.DI/            # Dependency injection composition
    └── AccountManagementFacadeServiceCollectionExtensions.cs
```

## Architecture Pattern

This facade implements the **Backend for Frontend (BFF)** pattern by:

1. **Translating** between Identity module DTOs and client-friendly facade DTOs
2. **Orchestrating** multiple Identity module operations if needed
3. **Simplifying** the API surface for client applications
4. **Adding** client-specific fields (e.g., `FullName` computed from `FirstName` and `LastName`)
5. **Providing** REST API controllers ready for consumption

## Features

### Authentication Endpoints

- **POST /api/account/register** - Register a new user account
- **POST /api/account/login** - Login with email and password
- **POST /api/account/refresh** - Refresh access token
- **POST /api/account/logout** - Logout by revoking refresh token

### DTO Mapping

The facade translates between core Identity DTOs and facade-level DTOs:

- `UserDto` → `AccountDto` (adds `FullName` computed property)
- `TokenDto` → `AuthTokenDto` (simplified structure)
- Adds validation attributes to request DTOs
- Provides consistent error response format

## Usage

### 1. Register the facade in your API

```csharp
// In Program.cs or Startup.cs
services.AddAccountManagementFacade();
```

### 2. Register controllers

```csharp
services.AddControllers()
    .AddApplicationPart(typeof(AccountController).Assembly);
```

### 3. API Endpoints

#### Register a new account

```http
POST /api/account/register
Content-Type: application/json

{
  "email": "user@example.com",
  "userName": "johndoe",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "success": true,
  "account": {
    "id": "user-id",
    "userName": "johndoe",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "profilePictureUrl": null,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "errors": []
}
```

#### Login

```http
POST /api/account/login
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
    "userName": "johndoe",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe",
    "profilePictureUrl": null,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "token": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "base64-encoded-token",
    "expiresAt": "2024-01-15T10:45:00Z",
    "tokenType": "Bearer"
  },
  "errors": []
}
```

#### Refresh Token

```http
POST /api/account/refresh
Content-Type: application/json

{
  "refreshToken": "base64-encoded-refresh-token"
}
```

Response:
```json
{
  "success": true,
  "token": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "new-base64-encoded-token",
    "expiresAt": "2024-01-15T11:00:00Z",
    "tokenType": "Bearer"
  },
  "errors": []
}
```

#### Logout

```http
POST /api/account/logout
Content-Type: application/json

{
  "refreshToken": "base64-encoded-refresh-token"
}
```

Response:
```json
{
  "success": true,
  "errors": []
}
```

## Error Responses

When operations fail, the facade returns consistent error responses:

```json
{
  "success": false,
  "errors": [
    "Password must be at least 6 characters",
    "Email is already registered"
  ]
}
```

HTTP status codes:
- **200 OK** - Successful operation
- **400 Bad Request** - Validation errors
- **401 Unauthorized** - Authentication failed

## Architecture Benefits

### Loose Coupling
The facade depends only on `Identity.Client.Contracts`, not the implementation. This allows the Identity module to be:
- Deployed as a microservice without changing facade code
- Replaced with different implementation
- Mocked for testing

### Client-Optimized DTOs
- Computed fields like `FullName`
- Validation attributes on request DTOs
- Simplified response structures
- Consistent error handling

### Single Responsibility
Each layer has a clear purpose:
- **Contracts** - Define the API surface
- **Services** - Orchestrate and map data
- **Controllers** - Handle HTTP concerns
- **DI** - Bootstrap the module

## Data Flow

```
HTTP Request
  ↓
AccountController (REST API)
  ↓
AccountManagementService (Facade Service)
  ↓
IdentityClient (Core Module Client)
  ↓
Identity Core Module
  ↓
Database
```

## Dependencies

- Identity.Contracts (transitive through Identity.Client.Contracts)
- Identity.Client.Contracts (direct)
- Microsoft.AspNetCore.App (framework reference)
- Microsoft.Extensions.DependencyInjection.Abstractions

## Extending the Facade

To add new functionality:

1. **Add Request/Response** in `Contracts/Requests` and `Contracts/Responses`
2. **Update Service Interface** in `Contracts/Services/IAccountManagementService.cs`
3. **Implement Service Logic** in `Services/Services/AccountManagementService.cs`
4. **Add Controller Endpoint** in `Controllers/Controllers/AccountController.cs`

Example - Adding password reset:

```csharp
// 1. Add request/response
public record ResetPasswordRequest
{
    public string Email { get; init; } = default!;
}

public record ResetPasswordResponse
{
    public bool Success { get; init; }
    public IEnumerable<string> Errors { get; init; } = Array.Empty<string>();
}

// 2. Update interface
Task<ResetPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request);

// 3. Implement service
public async Task<ResetPasswordResponse> ResetPasswordAsync(ResetPasswordRequest request)
{
    // Orchestrate Identity module calls
}

// 4. Add controller endpoint
[HttpPost("reset-password")]
public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
{
    var response = await _accountManagementService.ResetPasswordAsync(request);
    return Ok(response);
}
```

## Testing

The facade can be tested independently:

```csharp
// Mock the Identity client
var mockIdentityClient = new Mock<IIdentityClient>();
mockIdentityClient
    .Setup(x => x.Users.RegisterAsync(It.IsAny<RegisterUserParameters>()))
    .ReturnsAsync(new RegisterUserResult { Succeeded = true, User = testUser });

var service = new AccountManagementService(mockIdentityClient.Object);
var result = await service.RegisterAsync(new RegisterRequest { ... });

Assert.True(result.Success);
Assert.NotNull(result.Account);
```

## Future Enhancements

Potential additions to the facade:
- Profile management endpoints
- Email verification workflow
- Password reset workflow
- Two-factor authentication
- Account deletion
- Session management
- Social login integration
