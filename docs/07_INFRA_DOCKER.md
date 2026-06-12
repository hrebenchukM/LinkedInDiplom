# 07. Docker

## Dockerfile

- build stage: `mcr.microsoft.com/dotnet/sdk:8.0`
- runtime stage: `mcr.microsoft.com/dotnet/aspnet:8.0`
- build/publish `backend/Facade.API/Facade.API.csproj`
- expose `8080`
- entrypoint: `dotnet Facade.API.dll`

## docker-compose

### postgres

- image: `postgres:16-alpine`
- container: `linkedin-postgres`
- port: `5432:5432`
- db: `linkedin_dev`
- user/pass: `postgres/postgres`
- volume: `postgres_data`
- init script: `./init-db.sql`
- healthcheck: `pg_isready`

### api

- container: `linkedin-api`
- build: root Dockerfile
- port: `5000:8080`
- depends_on postgres healthy
- volume: `uploads_data:/app/uploads` (FileStorage local mode)

env:

- `ASPNETCORE_ENVIRONMENT=Development`
- `ASPNETCORE_URLS=http://+:8080`
- `ConnectionStrings__DefaultConnection=Host=postgres;...`
- `JwtSettings__*`

## init-db.sql

Создает только schema `identity` и grants. Остальные схемы создаются EF migrations.
