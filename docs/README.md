# LinkedInDiplom docs

Документация в папке `docs` (+ подпапки `docs/api`, `docs/postman`).

## Файлы

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
14. `13_V1_LIMITATIONS.md` — ограничения v1 и что проверить позже
15. `api/POSTMAN_TESTING.md` — таблицы endpoint-ов и upload smoke checklist
16. `postman/` — Postman collection + environment + README

В `docs/`: **14** markdown-файлов + `api/` + `postman/`.
