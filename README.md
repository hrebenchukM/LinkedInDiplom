# LinkedIn Clone - Modular Monolith Backend

A modular monolith backend for LinkedIn Clone built with .NET 10, implementing layered architecture with Backend-for-Frontend (BFF) pattern.

## 🚀 Quick Start with Docker

The fastest way to run the application:

```bash
# Start the application
docker-compose up -d

# Access Swagger UI
# Open browser to http://localhost:5000
```

That's it! The application will:
- ✅ Start PostgreSQL database
- ✅ Build and start the API
- ✅ Apply database migrations automatically
- ✅ Be ready to accept requests

### Stop the application

```bash
docker-compose down
```

## 📋 Prerequisites

### For Docker (Recommended)
- **Docker Desktop** installed and running
- That's all you need!

### For Local Development
- .NET 10 SDK
- PostgreSQL 15+
- Your favorite IDE (Visual Studio, VS Code, Rider)

## 🏗️ Architecture

This project implements a **microservice-ready modular monolith** with:

- ✅ **Modular Monolith** - Independent domain modules
- ✅ **Layered Architecture** - Concentric layers with dependency inversion
- ✅ **Backend for Frontend (BFF)** - Client-optimized facade layer
- ✅ **Loose Coupling** - Communication through contracts
- ✅ **Database per Module** - Logical separation with DbContexts
- ✅ **Resource Pattern** - Microservice migration seam

### Project Structure

```
LinkedInDiplom/
├── backend/
│   ├── Identity/                    # Core Identity Module (8 projects)
│   │   ├── Identity.Contracts       # DTOs, Parameters, Results
│   │   ├── Identity.Services        # Business logic
│   │   ├── Identity.DataAccess      # EF Core, Entities, Migrations
│   │   ├── Identity.Client          # Resource pattern implementation
│   │   ├── Identity.Client.Contracts # Resource interfaces
│   │   ├── Identity.Events.Contracts # Domain events
│   │   ├── Identity.Events          # Event handlers
│   │   └── Identity.DI              # DI composition
│   │
│   ├── AccountManagement/           # AccountManagement Facade (4 projects)
│   │   ├── Facade.AccountManagement.Contracts    # Facade DTOs
│   │   ├── Facade.AccountManagement.Services     # Orchestration
│   │   ├── Facade.AccountManagement.Controllers  # REST API
│   │   └── Facade.AccountManagement.DI           # DI composition
│   │
│   └── Facade.API/                  # Main API Entry Point
│       ├── Program.cs               # Application bootstrap
│       └── appsettings.json         # Configuration
│
├── docker-compose.yml               # Docker Compose configuration
├── Dockerfile                       # Multi-stage Docker build
└── LinkedIn.sln                     # Solution file
```

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/account/register` | POST | Register new user account |
| `/api/account/login` | POST | Login and receive JWT tokens |
| `/api/account/refresh` | POST | Refresh access token |
| `/api/account/logout` | POST | Revoke refresh token |

Full API documentation available at: **http://localhost:5000** (Swagger UI)

## 🛠️ Development

### Run Locally (without Docker)

1. **Start PostgreSQL**

2. **Update connection string** in `backend/Facade.API/appsettings.Development.json`

3. **Apply migrations**:
```bash
cd backend/Identity/Identity.DataAccess
dotnet ef database update --context IdentityDbContext
```

4. **Run the API**:
```bash
cd backend/Facade.API
dotnet run
```

5. **Access the API**: http://localhost:5000

### Build Solution

```bash
dotnet build LinkedIn.sln
```

### Run Tests

```bash
dotnet test LinkedIn.sln
```

## 🔐 Authentication

The API uses JWT Bearer token authentication with:

- **Access Tokens**: Short-lived (15 min in production, 60 min in development)
- **Refresh Tokens**: Long-lived (7 days in production, 30 days in development)
- **Token Rotation**: Old refresh token revoked when refreshed
- **Secure Storage**: Refresh tokens stored in PostgreSQL

### Example: Login and Use Token

1. **Register/Login** to get tokens
2. **Copy the access token** from response
3. **Click "Authorize"** in Swagger UI
4. **Enter**: `Bearer <your-access-token>`
5. **Use protected endpoints**

## 📦 Modules

### Identity Module (Core)
- User registration and management
- JWT token generation and validation
- Refresh token management
- ASP.NET Core Identity integration
- PostgreSQL database with `identity` schema

### AccountManagement Facade (BFF)
- Client-optimized DTOs
- Request validation
- DTO mapping from Identity module
- REST API controllers
- Orchestration layer

## 🐳 Docker Details

### Services
- **linkedin-postgres**: PostgreSQL 16 Alpine
- **linkedin-api**: .NET 10 API

### Volumes
- **postgres_data**: Persists database data

### Networks
- **linkedin-network**: Bridge network for service communication

### Configuration
All configuration via environment variables in `docker-compose.yml`

For detailed Docker documentation, see [DOCKER.md](./DOCKER.md)

## 📚 Documentation

- **[Architecture Documentation](./backend/README.md)** - Detailed architecture overview
- **[Docker Setup](./DOCKER.md)** - Complete Docker guide
- **[Identity Module](./backend/Identity/README.md)** - Identity module details
- **[Facade.API](./backend/Facade.API/README.md)** - API documentation
- **[AccountManagement Facade](./backend/AccountManagement/README.md)** - Facade details

## 🔄 Data Flow

```
Client Application
    ↓ HTTP
Facade.API (Entry Point)
    ↓
AccountManagement Facade (BFF Layer)
    ↓
Identity Module (Core Layer)
    ↓
PostgreSQL Database
```

## 🧪 Testing

### Using Swagger UI

1. Navigate to http://localhost:5000
2. Expand `POST /api/account/register`
3. Click "Try it out"
4. Fill in the request body
5. Click "Execute"
6. Use the returned token for authenticated endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/account/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "testuser",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:5000/api/account/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

## 🚦 Status

✅ **Identity Core Module** - Complete with authentication  
✅ **AccountManagement Facade** - Complete with REST API  
✅ **Facade.API** - Complete and integrated  
✅ **Docker Support** - Complete with docker-compose  
✅ **Database Migrations** - Automatic on startup  
✅ **JWT Authentication** - Complete with refresh tokens  
✅ **Swagger Documentation** - Interactive API docs  

## 🛣️ Roadmap

- [ ] Profile management endpoints
- [ ] Email verification
- [ ] Password reset flow
- [ ] Social media integration modules
- [ ] Real-time notifications
- [ ] File upload for profile pictures
- [ ] Admin panel
- [ ] Analytics and monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## 📝 License

This project is for educational purposes.

## 💡 Tech Stack

- **.NET 10** - Latest .NET framework
- **ASP.NET Core** - Web API framework
- **Entity Framework Core 10** - ORM
- **PostgreSQL 16** - Database
- **ASP.NET Core Identity** - Authentication
- **JWT Bearer Tokens** - Stateless auth
- **Swagger/OpenAPI** - API documentation
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 📞 Support

For issues or questions:
- Check the documentation files
- Review logs: `docker-compose logs api`
- Check Swagger UI for API details
- Verify database connectivity

---

**Built with ❤️ using .NET 10 and Clean Architecture principles**
