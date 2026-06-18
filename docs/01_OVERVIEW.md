# 01. Обзор проекта

> Обновлено: 2026-06-18 — frontend integration status после последних wiring (repost, portfolio, withdraw, admin queries, SignalR).

## Что это

LinkedInDiplom — **microservice-ready modular monolith backend** + **React SPA frontend**.

- Backend host: `backend/Facade.API`
- Frontend: `frontend/` (Vite + React), entry `main.jsx` → `App.jsx`
- 9 core-модулей + facade modules + FileStorage + AI
- **Backend шире frontend** — часть API готова для post-defense UI; client-only demo фичи не являются backend capabilities

## Frontend ↔ Backend (summary)

| Интегрировано (2026-06-18) | Частично / после защиты |
|----------------------------|-------------------------|
| Auth, profile, feed, comments, reactions, save | Repost UI на Home |
| Messaging + `/hubs/messaging` | Mention/hashtag add UI |
| Notifications + `/hubs/notifications` | Message settings modal → API |
| Portfolio certs/languages | Events/network create UI |
| Jobs apply/withdraw | Career advice AI UI |
| Admin + recommended queries (8 seeded) | Admin catalog UI, recruiter applications |

**Demo seed:** catalog recommended queries, pre-seeded application for withdraw demo, rolling showcase event — [08_SEED_DATA.md](08_SEED_DATA.md).

Детали: [10_FRONTEND_INTEGRATION.md](10_FRONTEND_INTEGRATION.md).

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

## Тесты (backend)

Проект `backend/Tests/LinkedIn.Tests` — **111 unit-тестов** в **11 классах** (xUnit + Moq + EF InMemory). Подробно: [09_TESTING_AND_POSTMAN.md](09_TESTING_AND_POSTMAN.md).

## Realtime (messaging + notifications)

- **Messaging:** HTTP `/api/messaging` + SignalR `/hubs/messaging` (groups `chat:{chatId}`)
- **Notifications:** HTTP `/api/notifications` + SignalR `/hubs/notifications` (groups `user:{userId}`)
- Frontend: `signalRService.js`, `notificationsSignalRService.js`

См. [07_REALTIME_AND_DOMAIN_EVENTS.md](07_REALTIME_AND_DOMAIN_EVENTS.md).

## AI module (v1)

Отличается от core-модулей: нет `AI.Client`, facade вызывает `IAIService` напрямую — осознанное упрощение для stateless Gemini integration. См. [02_ARCHITECTURE_AND_MODULES.md](02_ARCHITECTURE_AND_MODULES.md).

## Устаревшие вещи

- `/api/account` — не используется, актуально `/api/auth`
- `.NET 10` — неактуально, проект на `net8.0`
- `Services:ProfileApi` — в текущем коде не используется
