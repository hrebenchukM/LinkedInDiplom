

---

<!-- merged from: 06_INFRASTRUCTURE_AND_DEVELOPMENT.md -->

# Docker и compose

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


---

<!-- merged from: 06_INFRASTRUCTURE_AND_DEVELOPMENT.md -->

# Development и запуск

# 10. Разработка: запуск и расширение

## Запуск через Docker

```bash
docker-compose up -d
docker-compose ps
docker-compose logs -f api
```

Swagger: `http://localhost:5000/swagger`

## Локальный запуск

```bash
cd backend/Facade.API
dotnet run
```

Порты локально: смотрите `backend/Facade.API/Properties/launchSettings.json`.

По умолчанию `dotnet run` без профиля использует первый profile **`http`** (`http://localhost:5282`). Для HTTPS см. раздел ниже.

## Backend HTTPS local run

Backend-only HTTPS flow для локальной разработки и тестов (Postman/Swagger). **Frontend не обязан** переходить на HTTPS.

### 1. Проверить dev certificate

```bash
dotnet dev-certs https --check
```

### 2. Если сертификат не trusted

```bash
dotnet dev-certs https --trust
```

(Windows/macOS — подтвердить trust в системном диалоге.)

### 3. Запустить backend через HTTPS profile

```bash
cd backend/Facade.API
dotnet run --launch-profile https
```

Profile **`https`** слушает `https://localhost:7011` и `http://localhost:5282` (см. `launchSettings.json`). `UseHttpsRedirection()` перенаправляет HTTP → HTTPS.

### 4. Открыть Swagger

```
https://localhost:7011/swagger
```

### 5. Smoke REST check

```http
POST https://localhost:7011/api/auth/login
Content-Type: application/json

{ "email": "...", "password": "..." }
```

Или через Swagger UI на том же host.

### 6. Frontend остаётся HTTP — это нормально

| Компонент | URL |
|-----------|-----|
| Frontend (Vite) | `http://localhost:5173` |
| Backend API | `https://localhost:7011` |

**HTTP frontend → HTTPS backend** работает в браузере (mixed content **не** блокируется).

**HTTPS frontend → HTTP backend** может быть заблокирован браузером как mixed content — такой сценарий для dev не рекомендуется.

`DevelopmentCors` уже разрешает `http://localhost:5173` (и `https://localhost:5173`) с `AllowCredentials`.

Для REST из браузера при HTTP frontend задайте в frontend env (когда frontend-команда подключит API): `VITE_API_BASE_URL=https://localhost:7011`. На этом шаге frontend **не меняем** — проверка через Swagger/Postman.

## Сборка и тесты

```bash
dotnet build LinkedIn.sln
dotnet test LinkedIn.sln
```

## Как добавить новый модуль (когда разрешено менять код)

1. создать 6 core-проектов (Contracts/DataAccess/Services/Client.Contracts/Client/DI)
2. добавить DbContext и migrations
3. добавить `Add*Module`
4. при необходимости добавить facade-модуль (4 проекта)
5. подключить в Facade.API (Program.cs + ApplicationPart + migration order)

## Как добавить фичу

1. entity + migration в своем DataAccess
2. interface + parameters/results в Contracts
3. service logic
4. resource/client
5. facade request/response + controller endpoint
