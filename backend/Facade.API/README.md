# Facade.API

The main entry point for the LinkedIn Clone backend API. This project aggregates all facade modules and provides a unified REST API.

## Overview

Facade.API is an ASP.NET Core Web API project that:
- Hosts all facade module controllers
- Configures JWT authentication
- Provides Swagger/OpenAPI documentation
- Manages dependency injection for all modules
- Serves as the single deployment unit (modular monolith)

## Architecture

```
Client (Web/Mobile)
    ↓ HTTPS
Facade.API (Entry Point)
    ├── AccountManagement Controllers
    ├── JWT Authentication Middleware
    ├── Swagger UI
    └── CORS Configuration
    ↓
Facade Modules (BFF Layer)
    ├── Facade.AccountManagement
    └── (Future: Other Facades)
    ↓
Core Modules
    ├── Identity Module
    └── (Future: Other Core Modules)
    ↓
PostgreSQL Database
```

## Features

### Authentication & Authorization
- **JWT Bearer Token** authentication
- Configured token validation
- Token expiration and refresh support
- Secure password hashing via ASP.NET Core Identity

### API Documentation
- **Swagger UI** at root URL (http://localhost:5000)
- Interactive API testing
- Request/Response schemas
- Authentication testing with Bearer tokens

### CORS Support
- Configured for cross-origin requests
- Allows any origin in development (configure for production)

### Configuration Management
- Environment-specific settings (Development/Production)
- JWT settings configuration
- Database connection strings
- Logging configuration

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=linkedin_dev;Username=postgres;Password=postgres"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-min-32-characters-long-change-this-in-production",
    "Issuer": "LinkedInAPI",
    "Audience": "LinkedInClients",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7
  }
}
```

### appsettings.Development.json

```json
{
  "JwtSettings": {
    "SecretKey": "development-secret-key-min-32-characters-for-testing-only",
    "AccessTokenExpirationMinutes": 60,
    "RefreshTokenExpirationDays": 30
  }
}
```

## Running the API

### Prerequisites

1. **.NET 10 SDK** installed
2. **PostgreSQL 15+** running
3. Database connection configured in appsettings.json

### Steps

1. **Apply database migrations**:
```bash
cd backend/Identity/Identity.DataAccess
dotnet ef database update --context IdentityDbContext
```

2. **Run the API**:
```bash
cd backend/Facade.API
dotnet run
```

3. **Access Swagger UI**:
- Open browser to: https://localhost:5001
- Or: http://localhost:5000

## API Endpoints

### Account Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/account/register` | POST | Register new user | No |
| `/api/account/login` | POST | Login and get tokens | No |
| `/api/account/refresh` | POST | Refresh access token | No |
| `/api/account/logout` | POST | Revoke refresh token | No |

### Example Requests

#### Register
```bash
curl -X POST https://localhost:5001/api/account/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "userName": "johndoe",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login
```bash
curl -X POST https://localhost:5001/api/account/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### Use Access Token
```bash
curl -X GET https://localhost:5001/api/protected-endpoint \
  -H "Authorization: Bearer <your-access-token>"
```

## Project Structure

```
Facade.API/
├── Program.cs                 # Application entry point and configuration
├── appsettings.json           # Production configuration
├── appsettings.Development.json # Development configuration
└── Properties/
    └── launchSettings.json    # Development server settings
```

## Module Integration

The API integrates modules through dependency injection:

```csharp
// Register Identity core module
builder.Services.AddIdentityModule(configuration, connectionString);

// Register AccountManagement facade
builder.Services.AddAccountManagementFacade();

// Register controllers from facade modules
builder.Services.AddControllers()
    .AddApplicationPart(typeof(AccountController).Assembly);
```

## Middleware Pipeline

1. **HTTPS Redirection** - Redirects HTTP to HTTPS
2. **CORS** - Handles cross-origin requests
3. **Authentication** - JWT token validation
4. **Authorization** - Role/claim-based access
5. **Controllers** - Route to appropriate endpoints

## Security Considerations

### Development
- HTTPS not required for local development
- Long token expiration for testing convenience
- Permissive CORS policy

### Production (Recommendations)
- **RequireHttpsMetadata = true** in JWT configuration
- **Short access token lifetime** (15 minutes)
- **Specific CORS origins** instead of AllowAny
- **Strong secret key** (use environment variables)
- **Connection string** from secure configuration
- **Enable rate limiting**
- **Add request validation**
- **Implement logging and monitoring**

## Adding New Facades

To integrate a new facade module:

1. **Add project reference**:
```bash
dotnet add reference ../NewModule/Facade.NewModule.DI/Facade.NewModule.DI.csproj
dotnet add reference ../NewModule/Facade.NewModule.Controllers/Facade.NewModule.Controllers.csproj
```

2. **Register in Program.cs**:
```csharp
builder.Services.AddNewModuleFacade();
builder.Services.AddControllers()
    .AddApplicationPart(typeof(NewModuleController).Assembly);
```

3. **Run and test** - controllers automatically discovered

## Environment Variables

You can override appsettings.json with environment variables:

```bash
export ConnectionStrings__DefaultConnection="Host=prod-db;Database=linkedin_prod;..."
export JwtSettings__SecretKey="production-secret-key"
dotnet run
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string in appsettings.json
- Ensure database exists or migrations are applied

### JWT Token Issues
- Verify SecretKey is at least 32 characters
- Check token expiration settings
- Ensure clocks are synchronized (server/client)

### Swagger Not Loading
- Check if running in Development environment
- Verify Swashbuckle.AspNetCore package is installed
- Check browser console for errors

## Development Tips

### Hot Reload
```bash
dotnet watch run
```

### Debug Logging
In appsettings.Development.json, set:
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug"
    }
  }
}
```

### Database Migrations
Always create migrations from the DataAccess project:
```bash
cd backend/Identity/Identity.DataAccess
dotnet ef migrations add MigrationName --context IdentityDbContext
dotnet ef database update --context IdentityDbContext
```

## Deployment

### Docker (Future)
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Facade.API.dll"]
```

### Azure/Cloud
- Configure environment variables for secrets
- Use managed identity for database connections
- Enable Application Insights for monitoring
- Configure auto-scaling

## Testing

### Integration Tests
```csharp
public class ApiIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ApiIntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Register_ReturnsSuccess()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/account/register", 
            new { email = "test@test.com", ... });
        
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
```

## Status

✅ API successfully created and building  
✅ JWT authentication configured  
✅ Swagger UI integrated  
✅ AccountManagement facade integrated  
✅ CORS configured  
✅ Ready for database migration and testing  

## Next Steps

1. Apply database migrations
2. Test API endpoints with Swagger
3. Add more facade modules as they're developed
4. Configure production settings
5. Add API versioning
6. Implement rate limiting
7. Add health check endpoints
8. Configure logging and monitoring
