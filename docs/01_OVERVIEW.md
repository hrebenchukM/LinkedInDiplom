# 01. Обзор проекта

> Обновлено: 2026-06-17 — demo seed enrichment, API overview, frontend integration guide.

## Что это

LinkedInDiplom backend — **microservice-ready modular monolith + BFF** на `.NET 8 (net8.0)`.

- один host: `backend/Facade.API`
- 9 core-модулей: Identity, Profile, Professional, Network, Content, Messaging, Jobs, Notifications, Events
- facade-модулей: AccountManagement, ProfileManagement, ProfessionalManagement, NetworkManagement, ContentManagement, MessagingManagement, JobsManagement, NotificationsManagement, EventsManagement, **AdminManagement**, **AIManagement**
- shared infrastructure: **FileStorage** (`Facade.FileStorage.*`) — uploads local/S3 для 6 feature facades

## Техстек

- ASP.NET Core Web API
- EF Core 8 + Npgsql
- PostgreSQL 16
- JWT Bearer
- Swagger (только Development)
- Docker / docker-compose

## Структура solution

`LinkedIn.sln` содержит backend и тестовый проект `backend/Tests/LinkedIn.Tests`.

Типичный core-модуль:

- `{Module}.Contracts`
- `{Module}.DataAccess`
- `{Module}.Services`
- `{Module}.Client.Contracts`
- `{Module}.Client`
- `{Module}.DI`

Identity дополнительно:

- `Identity.Events.Contracts`
- `Identity.Events`

Типичный facade-модуль:

- `Facade.*.Contracts`
- `Facade.*.Services`
- `Facade.*.Controllers`
- `Facade.*.DI`

## Актуальные route prefixes

- `/api/auth`
- `/api/profile`
- `/api/professional`
- `/api/network`
- `/api/content`
- `/api/messaging`
- `/api/jobs`
- `/api/notifications`
- `/api/events`
- `/api/admin` (platform admin; роль JWT `Admin`)
- `/api/ai` (рекомендации / career advice; Gemini + fallback)

## File uploads (backend)

11 multipart endpoints через `IFileStorageService`; в БД только URL. Подробно: [05_CONFIGURATION_AND_UPLOADS.md](05_CONFIGURATION_AND_UPLOADS.md).

## Устаревшие вещи

- `/api/account` — не используется, актуально `/api/auth`
- `.NET 10` — неактуально, проект на `net8.0`
- `Services:ProfileApi` — в текущем коде не используется
