# Backend Architecture

## Overview

This is a **microservice-ready modular monolith** built with .NET, implementing Layered Architecture with Backend-for-Frontend (BFF) pattern. The architecture prioritizes loose coupling and future scalability while maintaining development simplicity.

## Architecture Principles

- ✅ **Modular Monolith** - Independent domain modules that can be extracted into microservices
- ✅ **Layered Architecture** - Concentric layers with dependency inversion
- ✅ **Backend for Frontend (BFF)** - Facade layer tailored for client needs
- ✅ **Loose Coupling** - Modules communicate through contracts and events
- ✅ **Database per Module** - Logical separation with independent DbContexts
- ✅ **Event-Driven** - Async communication via domain events

## Module Structure

### Core Modules (Business Logic)
- `Identity.*` - Authentication & User Management

### Facade Modules (Orchestration/BFF)
- `Facade.IdentityManagement.*`

### Entry Point
- `Facade.API` - ASP.NET Core Web API that composes all modules

## Project Layering

Each **Core Module** follows this structure:

```
{Module}.Contracts/             # DTOs, Parameters, Results, Service Interfaces
{Module}.Services/              # Business logic implementation
{Module}.DataAccess/            # EF Core DbContext, Entities, Migrations
{Module}.Client/                # Internal API wrapper (Resource pattern)
{Module}.Client.Contracts/      # Client resource interfaces
{Module}.Events.Contracts/      # Domain events for pub/sub
{Module}.Events                 # Event handlers implementations
{Module}.DI/                    # Dependency injection composition (bootstraps core module)
```

Each **Facade Module** follows this structure:

```
Facade.{Module}Management.Contracts/    # Facade DTOs, Parameters, Results
Facade.{Module}Management.Services/     # Orchestration + DTO mapping
Facade.{Module}Management.Controllers/  # REST API endpoints
Facade.{Module}Management.DI/           # Dependency injection composition (bootstraps facade module)
```

## Data Flow (7 Layers)

```
HTTP Request
  ↓
Controller (Facade Layer)
  ↓
Facade Service (Orchestration + DTO Translation)
  ↓
Core Client (Resources Aggregator)
  ↓
Resource Interface (Public API Surface)
  ↓
Resource Implementation (Adapter - Microservice Seam)
  ↓
Core Service Interface (Business Contract)
  ↓
Core Service Implementation (Business Logic + DB Access)
  ↓
Database (PostgreSQL)
```

## Inter-Module Communication

### 1. Synchronous (Client Pattern)
```csharp
public class BoardManagementService(
    IBoardClient boardClient,
    IProjectClient projectClient)  // Cross-module dependency
{
    // Uses client contracts, not direct service references
}
```

### 2. Asynchronous (Event-Driven)
```csharp
// Publisher
await eventBus.PublishAsync(new UserInvitationAcceptedEvent { ... });

// Subscriber
public class UserInvitationAcceptedEventHandler : IEventHandler<UserInvitationAcceptedEvent>
{
    public async Task HandleAsync(UserInvitationAcceptedEvent @event) { }
}
```

## Microservice Migration Path

**Resource layer is the key migration seam:**

**Current (Monolith):**
```csharp
public class UserResource(IUserService userService) : IUserResource
{
    public Task<UserDto> GetAsync(GetUserByIdParameters parameters)
        => userService.GetAsync(parameters);
}
```

**Future (Microservices):**
```csharp
public class HttpUserResource(HttpClient httpClient) : IUserResource
{
    public async Task<UserDto> GetAsync(GetUserByIdParameters parameters)
    {
        var response = await httpClient.GetAsync($"/api/users/{parameters.Id}");
        return await response.Content.ReadFromJsonAsync<UserDto>();
    }
}
```

**No changes to Facade services** - just swap DI registration!

## Getting Started

### Prerequisites
- .NET 10 SDK or later
- PostgreSQL 15+

### Setup

1. Update database connection string in `Facade.API/appsettings.Development.json`

2. Run migrations for all modules:
```bash
# From repository root
./scripts/apply_all_migrations_local.sh
```

This script automatically discovers all `*.DataAccess` projects and applies migrations.

3. Start the API:
```bash
cd src/backend/CoreAPI/Facade.API
dotnet run
```

## Adding a New Feature

1. Define database entities and migrations in `{Module}.DataAccess`
2. Define contract in `{Module}.Contracts`
3. Implement in `{Module}.Services`
4. Expose via `{Module}.Client`
5. Create Facade service in `Facade.{Module}Management.Services`
6. Add controller endpoint in `Facade.{Module}Management.Controllers`
7. Register dependencies in DI modules
