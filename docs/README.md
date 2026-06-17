# LinkedInDiplom — документация backend

> **Проект:** дипломная работа — профессиональная социальная сеть (аналог LinkedIn)  
> **Backend:** `.NET 8` modular monolith, host `Facade.API`  
> **БД:** PostgreSQL 16, одна база, 9 schema  
> **Frontend:** React (Vite), отдельная папка `frontend/`  
> **Обновлено:** 2026-06-17

---

## Для защиты диплома — с чего начать

1. **[01_OVERVIEW.md](01_OVERVIEW.md)** — обзор системы  
2. **[02_ARCHITECTURE_AND_MODULES.md](02_ARCHITECTURE_AND_MODULES.md)** — архитектура и модули  
3. **[08_SEED_DATA.md](08_SEED_DATA.md)** — demo seed  
4. **[11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md)** — что готово / что частично  

---

## Карта документов (12 файлов)

| № | Файл | О чём |
|---|------|--------|
| — | **README.md** (этот файл) | Навигация |
| 01 | [01_OVERVIEW.md](01_OVERVIEW.md) | Обзор, tech stack, route prefixes |
| 02 | [02_ARCHITECTURE_AND_MODULES.md](02_ARCHITECTURE_AND_MODULES.md) | Архитектура, core/facade модули, паттерны |
| 03 | [03_DATABASE.md](03_DATABASE.md) | Миграции, schema, таблицы |
| 04 | [04_API_REFERENCE.md](04_API_REFERENCE.md) | Auth/JWT, endpoints, validation, Swagger |
| 05 | [05_CONFIGURATION_AND_UPLOADS.md](05_CONFIGURATION_AND_UPLOADS.md) | appsettings, FileStorage, S3 |
| 06 | [06_INFRASTRUCTURE_AND_DEVELOPMENT.md](06_INFRASTRUCTURE_AND_DEVELOPMENT.md) | Docker, запуск, добавление фич |
| 07 | [07_REALTIME_AND_DOMAIN_EVENTS.md](07_REALTIME_AND_DOMAIN_EVENTS.md) | SignalR, domain events |
| 08 | [08_SEED_DATA.md](08_SEED_DATA.md) | Demo seed orchestrator |
| 09 | [09_TESTING_AND_POSTMAN.md](09_TESTING_AND_POSTMAN.md) | Тесты, Postman collection |
| 10 | [10_FRONTEND_INTEGRATION.md](10_FRONTEND_INTEGRATION.md) | Frontend ↔ backend |
| 11 | [11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md) | Limitations, TODO, защита |

**Postman JSON:** `docs/postman/LinkedInDiplom.postman_collection.json` + environment.

---

## Быстрые команды

```bash
cd backend/Facade.API
dotnet run --launch-profile https
dotnet build LinkedIn.sln
dotnet test backend/Tests/LinkedIn.Tests/LinkedIn.Tests.csproj
# Swagger: https://localhost:7011/swagger
```

---

## API prefixes

| Prefix | Модуль |
|--------|--------|
| `/api/auth` | Auth, JWT |
| `/api/profile` | Profile, media |
| `/api/professional` | Skills, experience |
| `/api/network` | Contacts, groups, pages |
| `/api/content` | Posts, feed |
| `/api/messaging` | Chats, messages |
| `/api/jobs` | Vacancies |
| `/api/events` | Events |
| `/api/notifications` | Notifications |
| `/api/admin` | Platform admin |
| `/api/ai` | Gemini AI |
| `/hubs/messaging` | SignalR |

Подробности — [04_API_REFERENCE.md](04_API_REFERENCE.md).
