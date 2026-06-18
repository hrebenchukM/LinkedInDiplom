# LinkedInDiplom — документация backend

> **Проект:** дипломная работа — профессиональная социальная сеть (аналог LinkedIn)  
> **Backend:** `.NET 8` modular monolith, host `Facade.API`  
> **БД:** PostgreSQL 16, одна база, 9 schema  
> **Frontend:** React (Vite), отдельная папка `frontend/`  
> **Обновлено:** 2026-06-18

---

## Для защиты диплома — с чего начать

1. **[01_OVERVIEW.md](01_OVERVIEW.md)** — обзор системы  
2. **[02_ARCHITECTURE_AND_MODULES.md](02_ARCHITECTURE_AND_MODULES.md)** — архитектура, backend vs frontend v1  
3. **[10_FRONTEND_INTEGRATION.md](10_FRONTEND_INTEGRATION.md)** — что wired, что partial, client-only  
4. **[08_SEED_DATA.md](08_SEED_DATA.md)** — demo seed  
5. **[11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md)** — roadmap до/после защиты  
6. **[09_TESTING_AND_POSTMAN.md](09_TESTING_AND_POSTMAN.md)** — build/test + manual QA checklist  

---

## Возможности проекта (кратко)

| Слой | Статус |
|------|--------|
| **Backend** | ~200 REST endpoints, 9 DB schemas, 2 SignalR hubs, domain events, admin, AI (Gemini) |
| **Frontend wired** | Auth, feed, save, messaging+SignalR, notifications+SignalR, jobs apply/withdraw, portfolio, admin |
| **Frontend partial** | Repost UI (не на Home), mentions/hashtags panel (read-only), message settings modal |
| **Client-only demo** | Chat archive/favorites/spam/drafts, AI assistant chat, fake calls, local resume — **не backend** |
| **Backend-ready, UI later** | Career advice, events create, network create, recruiter applications, admin catalog |

**Demo seed (2026-06-18):** recommended job queries, Marya job application (withdraw demo), rolling showcase event dates — [08_SEED_DATA.md](08_SEED_DATA.md).

Подробно: [10_FRONTEND_INTEGRATION.md](10_FRONTEND_INTEGRATION.md), [11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md).

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
| 09 | [09_TESTING_AND_POSTMAN.md](09_TESTING_AND_POSTMAN.md) | Тесты, Postman, manual QA |
| — | [api/POSTMAN_TESTING.md](api/POSTMAN_TESTING.md) | **Postman guide** (import, flows, SignalR) |
| 10 | [10_FRONTEND_INTEGRATION.md](10_FRONTEND_INTEGRATION.md) | Frontend ↔ backend |
| 11 | [11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md) | Limitations, TODO, защита |

**Postman JSON:** `docs/postman/LinkedInDiplom.postman_collection.json` + environment.

---

## Быстрые команды

```bash
cd backend/Facade.API
dotnet run --launch-profile https
dotnet build LinkedIn.sln
dotnet test backend/Tests/LinkedIn.Tests/LinkedIn.Tests.csproj   # 111 unit-тестов, 11 классов
# Swagger: https://localhost:7011/swagger
```

**Postman:** импорт `docs/postman/LinkedInDiplom.postman_collection.json` + environment — см. **[api/POSTMAN_TESTING.md](api/POSTMAN_TESTING.md)** и [09_TESTING_AND_POSTMAN.md](09_TESTING_AND_POSTMAN.md).

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
| `/hubs/messaging` | SignalR (chat) |
| `/hubs/notifications` | SignalR (notifications) |

Подробности — [04_API_REFERENCE.md](04_API_REFERENCE.md).
