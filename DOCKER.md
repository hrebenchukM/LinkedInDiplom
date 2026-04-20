# Docker Setup Guide

This guide explains how to run the LinkedIn Clone API using Docker and Docker Compose.

## Prerequisites

- **Docker Desktop** installed and running
  - Windows: [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - Mac: [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - Linux: [Docker Engine](https://docs.docker.com/engine/install/)
- **Docker Compose** (included with Docker Desktop)

## Quick Start

### 1. Start the application

From the project root directory, run:

```bash
docker-compose up -d
```

This will:
- Pull the PostgreSQL 16 Alpine image
- Build the Facade.API Docker image
- Create and start both containers
- Apply database migrations automatically
- Make the API available at http://localhost:5000

### 2. Check the status

```bash
docker-compose ps
```

You should see two containers running:
- `linkedin-postgres` - PostgreSQL database
- `linkedin-api` - .NET API

### 3. View logs

```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# Database only
docker-compose logs -f postgres
```

### 4. Access the API

- **Swagger UI**: http://localhost:5000
- **API Base URL**: http://localhost:5000/api

### 5. Stop the application

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

## Architecture

### Container Services

```
┌─────────────────────────────────────┐
│         Docker Host                  │
│                                      │
│  ┌──────────────────────────────┐   │
│  │  linkedin-api                │   │
│  │  Port: 5000 → 8080           │   │
│  │  .NET 10 Runtime              │   │
│  │  Auto-applies migrations      │   │
│  └──────────┬───────────────────┘   │
│             │                        │
│             │ tcp://postgres:5432    │
│             ↓                        │
│  ┌──────────────────────────────┐   │
│  │  linkedin-postgres           │   │
│  │  Port: 5432                  │   │
│  │  PostgreSQL 16 Alpine        │   │
│  │  Volume: postgres_data       │   │
│  └──────────────────────────────┘   │
│                                      │
└─────────────────────────────────────┘
```

### Docker Network

Both containers run on a custom bridge network `linkedin-network`, allowing them to communicate using service names.

### Volumes

- `postgres_data` - Persists PostgreSQL data between container restarts

## Configuration

### Environment Variables (docker-compose.yml)

#### PostgreSQL
```yaml
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres
POSTGRES_DB: linkedin_dev
```

#### API
```yaml
ASPNETCORE_ENVIRONMENT: Development
ConnectionStrings__DefaultConnection: Host=postgres;Port=5432;Database=linkedin_dev;Username=postgres;Password=postgres
JwtSettings__SecretKey: docker-development-secret-key-min-32-characters-for-testing
JwtSettings__Issuer: LinkedInAPI
JwtSettings__Audience: LinkedInClients
JwtSettings__AccessTokenExpirationMinutes: 60
JwtSettings__RefreshTokenExpirationDays: 30
```

### Customization

To customize configuration, edit `docker-compose.yml`:

```yaml
api:
  environment:
    - JwtSettings__AccessTokenExpirationMinutes=15  # Change token expiration
    - ASPNETCORE_ENVIRONMENT=Production             # Change environment
```

## Multi-Stage Docker Build

The `Dockerfile` uses a multi-stage build for optimization:

### Stage 1: Build
- Base: `mcr.microsoft.com/dotnet/sdk:10.0`
- Restores NuGet packages
- Builds the solution
- Publishes the application

### Stage 2: Runtime
- Base: `mcr.microsoft.com/dotnet/aspnet:10.0`
- Copies published artifacts
- Exposes ports 8080 and 8081
- Applies migrations on startup
- Runs the application

## Database Migrations

### Automatic Migrations

Migrations are automatically applied on API startup via `DatabaseExtensions.ApplyMigrationsAsync()`.

### Manual Migration Application

If needed, you can apply migrations manually:

```bash
# Connect to the API container
docker-compose exec api bash

# Apply migrations
dotnet ef database update --project /src/backend/Identity/Identity.DataAccess --context IdentityDbContext
```

### Create New Migration

```bash
cd backend/Identity/Identity.DataAccess
dotnet ef migrations add MigrationName --context IdentityDbContext
```

Then rebuild and restart:

```bash
docker-compose down
docker-compose up -d --build
```

## Troubleshooting

### Container won't start

Check logs:
```bash
docker-compose logs api
docker-compose logs postgres
```

### Database connection errors

1. Ensure PostgreSQL container is healthy:
```bash
docker-compose ps
```

2. Check if database is ready:
```bash
docker-compose exec postgres pg_isready -U postgres
```

3. Verify connection string in `docker-compose.yml`

### Port conflicts

If port 5000 is already in use, change it in `docker-compose.yml`:

```yaml
api:
  ports:
    - "5001:8080"  # Change 5000 to 5001
```

### API not accessible

1. Check if containers are running:
```bash
docker-compose ps
```

2. Check API logs:
```bash
docker-compose logs api
```

3. Verify network connectivity:
```bash
docker-compose exec api ping postgres
```

### Rebuild from scratch

Remove everything and start fresh:

```bash
# Stop and remove containers, networks, and volumes
docker-compose down -v

# Remove Docker images
docker rmi linkedin-facade-api

# Rebuild and start
docker-compose up -d --build
```

## Development Workflow

### 1. Code Changes

After making code changes:

```bash
# Rebuild and restart
docker-compose up -d --build
```

### 2. Database Changes

After adding a migration:

```bash
# Rebuild API container
docker-compose up -d --build api
```

### 3. View Real-time Logs

```bash
docker-compose logs -f api
```

### 4. Access Database

```bash
# Using psql
docker-compose exec postgres psql -U postgres -d linkedin_dev

# Or connect from host
psql -h localhost -U postgres -d linkedin_dev
```

## Production Considerations

### Security

1. **Change default passwords**:
```yaml
environment:
  POSTGRES_PASSWORD: ${DB_PASSWORD}  # Use environment variables
```

2. **Use secrets management**:
```bash
docker secret create db_password password.txt
```

3. **Enable HTTPS**:
```yaml
environment:
  - ASPNETCORE_URLS=https://+:8443;http://+:8080
  - ASPNETCORE_Kestrel__Certificates__Default__Path=/https/cert.pfx
  - ASPNETCORE_Kestrel__Certificates__Default__Password=${CERT_PASSWORD}
```

### Performance

1. **Resource limits**:
```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '0.5'
        memory: 512M
```

2. **Health checks**:
```yaml
api:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

### Scaling

Use Docker Swarm or Kubernetes for production scaling:

```bash
# Docker Swarm
docker stack deploy -c docker-compose.yml linkedin

# Scale API instances
docker service scale linkedin_api=3
```

## Useful Commands

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart a service
docker-compose restart api

# View running containers
docker-compose ps

# Remove all stopped containers
docker-compose rm
```

### Image Management

```bash
# Build images
docker-compose build

# Pull latest images
docker-compose pull

# List images
docker images | grep linkedin

# Remove unused images
docker image prune
```

### Data Management

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres linkedin_dev > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres linkedin_dev < backup.sql

# List volumes
docker volume ls

# Remove all volumes
docker-compose down -v
```

### Debugging

```bash
# Access container shell
docker-compose exec api bash

# Run command in container
docker-compose exec api dotnet --info

# Check container stats
docker stats linkedin-api linkedin-postgres

# Inspect container
docker inspect linkedin-api
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose run api dotnet test
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker-compose push
```

## Testing with Docker

### Run Integration Tests

```bash
# Start test environment
docker-compose -f docker-compose.test.yml up -d

# Run tests
docker-compose -f docker-compose.test.yml run api dotnet test

# Cleanup
docker-compose -f docker-compose.test.yml down -v
```

## Support

For issues or questions:
- Check container logs: `docker-compose logs`
- Verify Docker Desktop is running
- Ensure ports 5000 and 5432 are available
- Review Docker documentation: https://docs.docker.com

## Version Information

- **Docker Compose File Version**: 3.8
- **.NET Version**: 10.0
- **PostgreSQL Version**: 16 (Alpine)
- **Base Images**:
  - Build: `mcr.microsoft.com/dotnet/sdk:10.0`
  - Runtime: `mcr.microsoft.com/dotnet/aspnet:10.0`
  - Database: `postgres:16-alpine`
