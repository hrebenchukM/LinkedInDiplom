# LinkedInDiplom

Учебный backend «клон LinkedIn»: **модульный монолит + BFF**, **.NET 8**, **PostgreSQL 16**, один host **Facade.API**.

## Быстрый старт

```bash
docker-compose up -d
```

- API: http://localhost:5000  
- Swagger: http://localhost:5000/swagger  
- PostgreSQL: `localhost:5432` / `linkedin_dev` / `postgres` / `postgres`

Подробнее: [QUICKSTART.md](./QUICKSTART.md)

## Документация

| Документ | Содержание |
|----------|------------|
| **[docs/BACKEND.md](./docs/BACKEND.md)** | **Вся документация backend** (архитектура + все модули + API + Docker + JWT) |
| [QUICKSTART.md](./QUICKSTART.md) | Docker за несколько минут |
| [DOCKER.md](./DOCKER.md) | Контейнеры, volumes, логи |
| [docs/database/DB_SCHEMA.md](./docs/database/DB_SCHEMA.md) | Таблицы по доменам |

## Архитектура (кратко)

```
Frontend → Facade.API → Facade *Management (BFF) → Core I*Client → Services → PostgreSQL (schema per module)
```

9 core-модулей, 9 facade-модулей, API: `/api/auth`, `/api/profile`, `/api/professional`, `/api/network`, `/api/content`, `/api/messaging`, `/api/jobs`, `/api/notifications`, `/api/events`.

## Сборка и тесты

```bash
dotnet build LinkedIn.sln
dotnet test LinkedIn.sln
```

## Статус

Все модули и Docker интегрированы. Ограничения v1 (нет SignalR, in-memory events) — в [docs/BACKEND.md](./docs/BACKEND.md#16-тесты-roadmap-v1).

---

Учебный проект.
