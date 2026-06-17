# LinkedInDiplom docs

Документация в папке `docs` (+ подпапки `docs/api`, `docs/postman`).

**Главный индекс:** [00_README.md](00_README.md) — навигация для защиты диплома.

## Файлы

0. `00_README.md` — главная навигация (обновлено 2026-06-17)
1. `README.md` — этот файл
2. `01_OVERVIEW.md` — что за проект, структура, модули
3. `02_ARCHITECTURE.md` — слои, правила, паттерны, request flow
4. `03_CORE_MODULES.md` — 9 core-модулей подробно
5. `04_FACADE_MODULES.md` — facade-модули, **Admin-only catalog writes**, AdminManagement `/api/admin`
6. `05_API_AUTH_JWT.md` — auth/JWT/roles/AdminSeed/refresh/logout/current user
7. `06_API_VALIDATION_ERRORS_SWAGGER.md` — validation, error handling, Swagger
8. `07_INFRA_DOCKER.md` — Dockerfile, compose, init-db, порты, volume
9. `08_INFRA_DB_MIGRATIONS.md` — PostgreSQL schemas, migration order, EF
10. `09_CONFIG_UPLOADS.md` — FileStorage module, local/S3 uploads, 11 endpoints, env vars, limits
11. `10_DEVELOPMENT.md` — запуск, добавление модуля/фичи
12. `11_TESTS_AND_TROUBLESHOOTING.md` — тесты и типовые проблемы
13. `12_DB_SCHEMA.md` — логическая схема таблиц (сжатый обзор)
14. `13_V1_LIMITATIONS.md` — ограничения v1 (legacy index)
15. `06_API_OVERVIEW.md` — каталог всех API endpoints
16. `18_SIGNALR_CHAT.md` — SignalR hub и realtime events
17. `19_DOMAIN_EVENTS_NOTIFICATIONS.md` — domain events → notifications
18. `20_PATTERNS.md` — паттерны на примерах проекта
19. `22_SEED_DATA.md` — demo seed orchestrator (актуально)
20. `24_CONFIGURATION.md` — appsettings reference
21. `25_FRONTEND_INTEGRATION_GUIDE.md` — интеграция frontend
22. `26_LIMITATIONS_AND_TODO.md` — limitations + TODO (актуально)
23. `api/POSTMAN_TESTING.md` — таблицы endpoint-ов и upload smoke checklist
24. `postman/` — Postman collection + environment + README

В `docs/`: **22+** markdown-файлов + `api/` + `postman/`.

## API capabilities (актуально после Steps 1–9)

Краткий список реализованных возможностей backend (подробности — в `03_CORE_MODULES.md`, `04_FACADE_MODULES.md`, `13_V1_LIMITATIONS.md`):

| Область | Что добавлено |
|---|---|
| **Profile** | People search: `GET /api/profile/search` |
| **Professional** | Public sections: `GET /api/professional/users/{userId}/experiences|educations|skills` |
| **Content** | Network-aware feed (JWT) / public feed (anonymous); `GET /api/content/users/{userId}/posts` |
| **Events** | Discover `GET /api/events`, attending `GET /api/events/me/attending`, speakers `GET /api/events/speakers`; `attendeeCount`, `isAttending` |
| **Network** | Paged contacts + cancel / incoming / outgoing / pending-counts |
| **Jobs / Notifications** | `PagedResponse` на vacancies и notifications |
| **Admin** | Events moderation, comments moderation, event stats в overview |
| **Validation** | Events dates, admin role/lock, query date ranges (см. `06_API_VALIDATION_ERRORS_SWAGGER.md`) |
| **Postman** | Collection + `api/POSTMAN_TESTING.md` синхронизированы (Step 9); папки `11 AI`, `12 Validation / Negative cases` |
| **Demo seed** | 24-step orchestrator: skills catalog, jobs catalog, bot content, bot network — см. `22_SEED_DATA.md` |
| **Jobs filter** | `minSalaryFrom` на `GET /api/jobs/vacancies` |

**V1 limitations** — см. `26_LIMITATIONS_AND_TODO.md` (актуально) или `13_V1_LIMITATIONS.md` (legacy).
