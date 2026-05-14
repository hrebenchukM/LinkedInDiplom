# Identity Module

This module implements authentication and user management functionality following the Layered Architecture pattern with JWT-based authentication using access and refresh tokens.

## Project Structure

```
Identity/
├── Identity.Contracts/              # DTOs, Parameters, Results, Service Interfaces
│   ├── Configuration/
│   │   └── JwtSettings.cs
│   ├── DTOs/
│   │   ├── UserDto.cs
│   │   └── TokenDto.cs
│   ├── Parameters/
│   │   ├── GetUserByIdParameters.cs
│   │   ├── RegisterUserParameters.cs
│   │   ├── LoginParameters.cs
│   │   ├── RefreshTokenParameters.cs
│   │   └── RevokeTokenParameters.cs
│   ├── Results/
│   │   ├── RegisterUserResult.cs
│   │   ├── LoginResult.cs
│   │   ├── RefreshTokenResult.cs
│   │   └── RevokeTokenResult.cs
│   └── Services/
│       ├── IUserService.cs
│       ├── IAuthenticationService.cs
│       └── ITokenService.cs
│
├── Identity.Services/               # Business logic implementation
│   ├── UserService.cs
│   ├── AuthenticationService.cs
│   └── TokenService.cs
│
├── Identity.DataAccess/             # EF Core DbContext, Entities, Migrations
│   ├── Entities/
│   │   ├── ApplicationUser.cs
│   │   └── RefreshToken.cs
│   └── IdentityDbContext.cs
│
├── Identity.Client/                 # Internal API wrapper (Resource pattern)
│   ├── Resources/
│   │   ├── UserResource.cs
│   │   └── AuthenticationResource.cs
│   └── IdentityClient.cs
│
├── Identity.Client.Contracts/       # Client resource interfaces
│   ├── Resources/
│   │   ├── IUserResource.cs
│   │   └── IAuthenticationResource.cs
│   └── IIdentityClient.cs
│
├── Identity.Events.Contracts/       # Domain events for pub/sub
│   └── Events/
│       └── UserRegisteredEvent.cs
│
├── Identity.Events/                 # Event handlers implementations
│   └── Handlers/
│       └── .gitkeep.cs
│
└── Identity.DI/                     # Dependency injection composition
    └── IdentityModuleServiceCollectionExtensions.cs
```

## Features

### User Management
- User registration with ASP.NET Core Identity
- User retrieval by ID
- Password validation and hashing
- Email uniqueness validation

### Authentication
- **Login** - Email and password authentication
- **JWT Access Tokens** - Short-lived tokens (configurable, default 15 minutes)
- **Refresh Tokens** - Long-lived tokens (configurable, default 7 days)
- **Token Refresh** - Exchange refresh token for new access token
- **Token Revocation** - Revoke individual or all user tokens
- **Automatic Cleanup** - Expired tokens are automatically removed

### Security Features
- Password requirements (length, complexity)
- Account lockout after failed attempts
- Refresh token rotation (old token revoked when refreshed)
- Token validation and expiration handling
- Database isolation with dedicated schema (`identity`)

## Usage

### 1. Configure appsettings.json

```json
{
  "JwtSettings": {
    "SecretKey": "your-secret-key-min-32-characters-long",
    "Issuer": "YourApp",
    "Audience": "YourAppUsers",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=yourdb;Username=user;Password=pass"
  }
}
```

### 2. Register the module in your application

```csharp
services.AddIdentityModule(
    configuration, 
    configuration.GetConnectionString("DefaultConnection"));
```

### 3. Use the client in other modules

```csharp
public class SomeService
{
    private readonly IIdentityClient _identityClient;

    public SomeService(IIdentityClient identityClient)
    {
        _identityClient = identityClient;
    }

    // Register a new user
    public async Task<RegisterUserResult> RegisterAsync()
    {
        return await _identityClient.Users.RegisterAsync(new RegisterUserParameters
        {
            Email = "user@example.com",
            UserName = "username",
            Password = "SecurePass123",
            FirstName = "John",
            LastName = "Doe"
        });
    }

    // Login
    public async Task<LoginResult> LoginAsync()
    {
        return await _identityClient.Authentication.LoginAsync(new LoginParameters
        {
            Email = "user@example.com",
            Password = "SecurePass123"
        });
    }

    // Refresh access token
    public async Task<RefreshTokenResult> RefreshAsync(string refreshToken)
    {
        return await _identityClient.Authentication.RefreshTokenAsync(
            new RefreshTokenParameters { RefreshToken = refreshToken });
    }

    // Revoke a token
    public async Task<RevokeTokenResult> RevokeAsync(string refreshToken)
    {
        return await _identityClient.Authentication.RevokeTokenAsync(
            new RevokeTokenParameters { RefreshToken = refreshToken });
    }

    // Revoke all user tokens (e.g., on logout from all devices)
    public async Task<RevokeTokenResult> LogoutAllDevicesAsync(string userId)
    {
        return await _identityClient.Authentication.RevokeAllUserTokensAsync(userId);
    }
}
```

## Database Migrations

Create a migration:
```bash
cd Identity.DataAccess
dotnet ef migrations add AddRefreshTokens --context IdentityDbContext
```

Apply migrations:
```bash
cd Identity.DataAccess
dotnet ef database update --context IdentityDbContext
```

## Architecture Layers

1. **Contracts Layer** - Public API surface with DTOs, parameters, results, and service interfaces
2. **Services Layer** - Business logic implementation
   - `UserService` - User management operations
   - `AuthenticationService` - Login, token refresh, and revocation
   - `TokenService` - JWT generation and validation
3. **DataAccess Layer** - EF Core DbContext and entities
   - `ApplicationUser` - Extended Identity user
   - `RefreshToken` - Refresh token storage with expiration tracking
4. **Client Layer** - Resource pattern implementation for internal API
5. **Client.Contracts Layer** - Resource interfaces for loose coupling
6. **Events Layer** - Domain event handlers (future implementation)
7. **DI Layer** - Service registration and module bootstrapping

## Token Flow

### Login Flow
1. User provides email and password
2. Credentials validated against database
3. Access token (JWT) generated with user claims
4. Refresh token generated and stored in database
5. Both tokens returned to client

### Token Refresh Flow
1. Client sends refresh token
2. Refresh token validated (not expired, not revoked)
3. Old refresh token revoked
4. New access token and refresh token generated
5. New tokens returned to client

### Token Revocation Flow
1. Client sends refresh token to revoke
2. Token marked as revoked in database
3. Token cannot be used for future refreshes

## Database Schema

The module uses a dedicated `identity` schema in PostgreSQL to maintain logical separation from other modules.

### Tables
- `AspNetUsers` - User accounts (extended with FirstName, LastName, ProfilePictureUrl, etc.)
- `AspNetRoles` - User roles
- `AspNetUserRoles` - User-role mapping
- `AspNetUserClaims` - User claims
- `AspNetUserLogins` - External login providers
- `AspNetUserTokens` - Identity tokens
- `RefreshTokens` - JWT refresh tokens with expiration and revocation tracking

## Dependencies

- Microsoft.AspNetCore.Identity.EntityFrameworkCore 10.0.6
- Microsoft.EntityFrameworkCore 10.0.6
- Npgsql.EntityFrameworkCore.PostgreSQL 10.0.1
- System.IdentityModel.Tokens.Jwt 8.17.0
- Microsoft.Extensions.Options 10.0.6
- Microsoft.Extensions.Configuration.Abstractions 10.0.6

## Security Considerations

1. **Secret Key** - Must be at least 32 characters for HMACSHA256
2. **HTTPS Required** - Always use HTTPS in production
3. **Token Storage** - Store refresh tokens securely on client (HttpOnly cookies recommended)
4. **Token Expiration** - Keep access tokens short-lived (15 minutes recommended)
5. **Refresh Token Rotation** - Old refresh tokens are automatically revoked when refreshed
6. **Cleanup** - Expired tokens are automatically cleaned up to prevent database bloat
