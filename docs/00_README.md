# LinkedInDiplom — документация backend

> **Проект:** дипломная работа — профессиональная социальная сеть (аналог LinkedIn)  
> **Backend:** `.NET 8` modular monolith, host `Facade.API`  
> **БД:** PostgreSQL 16, одна база, 9 schema  
> **Frontend:** React (Vite), отдельная папка `frontend/`  
> **Обновлено:** 2026-06-17 — после demo seed enrichment (Steps 1–4 + BotNetwork)

---

## Для защиты диплома — с чего начать

1. **[01_OVERVIEW.md](01_OVERVIEW.md)** — что это за система одним абзацем  
2. **[02_ARCHITECTURE.md](02_ARCHITECTURE.md)** — почему modular monolith, слои, request flow  
3. **[22_SEED_DATA.md](22_SEED_DATA.md)** — как на пустой БД появляются demo-данные  
4. **[26_LIMITATIONS_AND_TODO.md](26_LIMITATIONS_AND_TODO.md)** — честно: что готово, что частично  

---

## Карта документов

| № | Файл | О чём |
|---|------|--------|
| 00 | **README.md** (этот файл) | Навигация |
| 01 | [01_OVERVIEW.md](01_OVERVIEW.md) | Обзор проекта, route prefixes, tech stack |
| 02 | [02_ARCHITECTURE.md](02_ARCHITECTURE.md) | Архитектура, слои, правила, admin, feed |
| 03 | [03_CORE_MODULES.md](03_CORE_MODULES.md) | 9 core-модулей подробно |
| 04 | [04_FACADE_MODULES.md](04_FACADE_MODULES.md) | Facade-модули, Admin, AI |
| 05 | [05_API_AUTH_JWT.md](05_API_AUTH_JWT.md) | JWT, роли, AdminSeed, refresh |
| 06 | [06_API_OVERVIEW.md](06_API_OVERVIEW.md) | **Каталог всех API endpoints** |
| — | [06_API_VALIDATION_ERRORS_SWAGGER.md](06_API_VALIDATION_ERRORS_SWAGGER.md) | Validation, errors, Swagger |
| 07 | [07_INFRA_DOCKER.md](07_INFRA_DOCKER.md) | Docker, compose, порты |
| 08 | [08_INFRA_DB_MIGRATIONS.md](08_INFRA_DB_MIGRATIONS.md) | Миграции, порядок schema |
| 09 | [09_CONFIG_UPLOADS.md](09_CONFIG_UPLOADS.md) | FileStorage, local/S3, uploads |
| 10 | [10_DEVELOPMENT.md](10_DEVELOPMENT.md) | Запуск backend/frontend |
| 11 | [11_TESTS_AND_TROUBLESHOOTING.md](11_TESTS_AND_TROUBLESHOOTING.md) | Тесты, типовые проблемы |
| 12 | [12_DB_SCHEMA.md](12_DB_SCHEMA.md) | Таблицы и связи (сжатый обзор) |
| 13 | [13_V1_LIMITATIONS.md](13_V1_LIMITATIONS.md) | Ограничения v1 (legacy index) |
| — | [22_SEED_DATA.md](22_SEED_DATA.md) | **Demo seed orchestrator (актуально)** |
| — | [25_FRONTEND_INTEGRATION_GUIDE.md](25_FRONTEND_INTEGRATION_GUIDE.md) | **Интеграция frontend ↔ backend** |
| — | [26_LIMITATIONS_AND_TODO.md](26_LIMITATIONS_AND_TODO.md) | **Limitations + TODO (актуально)** |
| — | [api/POSTMAN_TESTING.md](api/POSTMAN_TESTING.md) | **Postman: import, tokens, порядок тестов** |
| — | [postman/README.md](postman/README.md) | Postman quick start |
| — | [FRONTEND_BACKEND_SMOKE_REVIEW.md](FRONTEND_BACKEND_SMOKE_REVIEW.md) | Smoke-review совместимости |
| — | [DEMO_SEED_ENRICHMENT_PLAN.md](DEMO_SEED_ENRICHMENT_PLAN.md) | План enrichment (выполнен) |

---

## Быстрые команды

```bash
# Backend
cd backend/Facade.API
dotnet run

# Build + tests
dotnet build LinkedIn.sln
dotnet test backend/Tests/LinkedIn.Tests/LinkedIn.Tests.csproj

# Swagger (Development)
# http://localhost:5000/swagger  или  https://localhost:7011/swagger
```

---

## API prefixes (кратко)

| Prefix | Модуль |
|--------|--------|
| `/api/auth` | Регистрация, login, JWT, Google/Facebook |
| `/api/profile` | Профиль, avatar/header, views |
| `/api/professional` | Skills, experience, education, companies |
| `/api/network` | Contacts, follows, groups, pages |
| `/api/content` | Posts, feed, comments, reactions, hashtags |
| `/api/messaging` | Chats, messages |
| `/api/jobs` | Vacancies, applications, favorites |
| `/api/events` | Events, attendees, schedule |
| `/api/notifications` | Уведомления |
| `/api/admin` | Platform admin (роль Admin) |
| `/api/ai` | AI recommendations (Gemini) |
| `/hubs/messaging` | SignalR realtime chat |

Полный каталог endpoint — [api/POSTMAN_TESTING.md](api/POSTMAN_TESTING.md).
