# LinkedIn Clone - Modular Monolith Backend

A modular monolith backend for LinkedIn Clone built with **.NET 8**, implementing layered architecture with Backend-for-Frontend (BFF) pattern. The solution is **prepared for microservices** (in-process clients and domain events today; not deployed as separate services).

## 🚀 Quick Start with Docker

The fastest way to run the application:

```bash
# Start the application
docker-compose up -d

# Access Swagger UI (Development)
# Open browser to http://localhost:5000/swagger
```

That's it! The application will:
- ✅ Start PostgreSQL database
- ✅ Build and start the API
- ✅ Apply database migrations automatically (Identity, Profile, Professional)
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
- **.NET 8 SDK**
- PostgreSQL 15+
- Your favorite IDE (Visual Studio, VS Code, Rider)

## 🏗️ Architecture

This project implements a **microservice-ready modular monolith** with:

- ✅ **Modular Monolith** - Independent domain modules in one deploy unit (`Facade.API`)
- ✅ **Layered Architecture** - Concentric layers with dependency inversion
- ✅ **Backend for Frontend (BFF)** - Client-optimized facade layer
- ✅ **Loose Coupling** - Communication through contracts and domain events
- ✅ **Database per Module** - Logical separation with DbContexts and PostgreSQL schemas
- ✅ **Resource / Client Pattern** - Seam for future HTTP-based microservice clients

### Project Structure

```
LinkedInDiplom/
├── backend/
│   ├── Identity/                    # Core: authentication (8 projects)
│   │   ├── Identity.Contracts
│   │   ├── Identity.Services
│   │   ├── Identity.DataAccess      # schema: identity
│   │   ├── Identity.Client.Contracts
│   │   ├── Identity.Client
│   │   ├── Identity.Events.Contracts
│   │   ├── Identity.Events
│   │   └── Identity.DI
│   │
│   ├── Profile/                     # Core: user profiles (6 projects)
│   │   ├── Profile.Contracts
│   │   ├── Profile.Services
│   │   ├── Profile.DataAccess       # schema: profile
│   │   ├── Profile.Client.Contracts
│   │   ├── Profile.Client
│   │   └── Profile.DI
│   │
│   ├── Professional/                # Core: career profile data (6 projects)
│   │   ├── Professional.Contracts
│   │   ├── Professional.Services
│   │   ├── Professional.DataAccess # schema: professional
│   │   ├── Professional.Client.Contracts
│   │   ├── Professional.Client
│   │   └── Professional.DI
│   │
│   ├── AccountManagement/           # Facade: auth BFF (4 projects)
│   ├── ProfileManagement/           # Facade: profile BFF (4 projects)
│   ├── ProfessionalManagement/      # Facade: career BFF (4 projects)
│   │
│   └── Facade.API/                  # Host: single entry point
│
├── docker-compose.yml
├── Dockerfile
└── LinkedIn.sln                     # 33 projects
```

Each **Core module** follows: `Contracts` → `Services` → `DataAccess`, plus `Client.Contracts` / `Client` (resource pattern) and `DI`.

Each **Facade module** follows: `Facade.*.Contracts` → `Facade.*.Services` → `Facade.*.Controllers` + `Facade.*.DI`.

## 🔌 API Endpoints (overview)

| Route prefix | Purpose |
|--------------|---------|
| `/api/auth` | Register, login, refresh, logout, current account |
| `/api/profile` | Profile CRUD, avatar/header upload |
| `/api/professional` | Career data: companies, experience, education, certificates, skills, languages |

### Auth (`/api/auth`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user account |
| `/api/auth/login` | POST | Login and receive JWT tokens |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Revoke refresh token |
| `/api/auth/me` | GET | Current account (JWT required) |

Full API documentation (Development): **http://localhost:5000/swagger**

## 🛠️ Development

### Run Locally (without Docker)

1. **Start PostgreSQL**

2. **Update connection string** in `backend/Facade.API/appsettings.Development.json`

3. **Run the API** (migrations apply automatically on startup):
```bash
cd backend/Facade.API
dotnet run
```

4. **Access Swagger**: http://localhost:5000/swagger

Optional manual migrations:
```bash
cd backend/Identity/Identity.DataAccess
dotnet ef database update --context IdentityDbContext
```

### Build Solution

```bash
dotnet build LinkedIn.sln
```

## 🔐 Authentication

The API uses JWT Bearer token authentication with:

- **Access Tokens**: Short-lived (15 min in production, 60 min in development)
- **Refresh Tokens**: Long-lived (7 days in production, 30 days in development)
- **Token Rotation**: Old refresh token revoked when refreshed
- **Secure Storage**: Refresh tokens stored in PostgreSQL (`identity` schema)

### Example: Login and Use Token

1. **Register/Login** via `/api/auth/register` or `/api/auth/login`
2. **Copy the access token** from response
3. Open **Swagger** at `/swagger`, click **Authorize**
4. **Enter**: `Bearer <your-access-token>`
5. Use protected endpoints (`/api/auth/me`, `/api/profile/me`, etc.)

## 📦 Modules

### Identity (Core)
- User registration, JWT, refresh tokens
- ASP.NET Core Identity
- Publishes `UserRegisteredEvent` after registration
- PostgreSQL schema: `identity`

### Profile (Core)
- User profiles (name, headline, location, etc.)
- Created automatically via `UserRegisteredEvent` handler
- PostgreSQL schema: `profile`

### Professional (Core)
- Modular monolith core module; PostgreSQL schema: `professional`
- Entities: Companies, Experiences, Academies, Educations, Certificates, Skills, UserSkills, Languages, UserLanguages
- Exposed to clients via **ProfessionalManagement** facade (`IProfessionalClient` in-process)
- See [backend/Professional/README.md](./backend/Professional/README.md) for architecture and Swagger routes

### AccountManagement (Facade / BFF)
- Client-facing auth API at `/api/auth`
- Maps facade DTOs ↔ Identity via `IIdentityClient`

### ProfileManagement (Facade / BFF)
- Profile API at `/api/profile`
- Avatar and header file upload (`/uploads/...`)
- Maps via `IProfileClient`

### ProfessionalManagement (Facade / BFF)
- Career API at `/api/professional` (.NET 8)
- Catalog v1 (Academy, Skill, Language): authenticated `POST` + public `GET` by id
- User data: full CRUD under `/api/professional/me/...`; `userId` from JWT only
- Maps via `IProfessionalClient`

### Facade.API (Host)
- Composition root: registers all Core + Facade modules
- JWT, CORS (dev/prod), Swagger (Development only)
- Static files for uploads

## 🔄 Data Flow

```
Client Application
    ↓ HTTP
Facade.API (Host)
    ↓
Facade Modules (BFF): AccountManagement | ProfileManagement | ProfessionalManagement
    ↓ I*Client (in-process, microservice-ready seam)
Core Modules: Identity | Profile | Professional
    ↓ EF Core (separate DbContext per module)
PostgreSQL (schemas: identity, profile, professional)
```

Registration side-effect:
```
Identity.UserService → UserRegisteredEvent → Profile handler → empty profile
```

## 🐳 Docker Details

### Services
- **linkedin-postgres**: PostgreSQL 16 Alpine
- **linkedin-api**: .NET 8 API

### Volumes
- **postgres_data**: Database persistence
- **profile_uploads**: Uploaded profile files

See [DOCKER.md](./DOCKER.md) for details.

## 📚 Documentation

- **[Docker Setup](./DOCKER.md)** - Complete Docker guide
- **[Facade.API](./backend/Facade.API/README.md)** - Host API documentation
- **[Facade.API Integration](./backend/Facade.API/INTEGRATION.md)** - Module integration overview
- **[AccountManagement Facade](./backend/AccountManagement/README.md)** - Auth facade details
- **[Professional Module](./backend/Professional/README.md)** - Career core module and `/api/professional` endpoints

## 🧪 Testing

### Using Swagger UI

1. Navigate to http://localhost:5000/swagger
2. Expand `POST /api/auth/register`
3. Click "Try it out", send `{ "email": "...", "password": "..." }`
4. Use returned token for authorized endpoints

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

## 🚦 Status

✅ **Identity Core Module** - Authentication and events  
✅ **Profile Core Module** - Profiles and event-driven creation  
✅ **Professional Core Module** - Companies, experience, education, certificates, skills, languages  
✅ **AccountManagement Facade** - `/api/auth`  
✅ **ProfileManagement Facade** - `/api/profile` + uploads  
✅ **ProfessionalManagement Facade** - `/api/professional`  
✅ **Facade.API** - Single host, all modules integrated  
✅ **Docker Support** - docker-compose with PostgreSQL and uploads volume  
✅ **Database Migrations** - Automatic on startup  
✅ **JWT Authentication** - Access + refresh tokens  

## 🛣️ Roadmap

- [ ] Email verification
- [ ] Password reset flow
- [ ] Automated test projects
- [ ] Health check endpoints
- [ ] Outbox / message bus for domain events (future microservice split)
- [ ] Admin panel
- [ ] Analytics and monitoring

## 💡 Tech Stack

- **.NET 8** / ASP.NET Core Web API
- **Entity Framework Core 8** + Npgsql
- **PostgreSQL 16**
- **ASP.NET Core Identity** + JWT Bearer
- **Swagger/OpenAPI** (Development)
- **Docker** + Docker Compose

## 📝 License

This project is for educational purposes.

---

**Built with modular monolith architecture — prepared for microservices, deployed as a single application.**
