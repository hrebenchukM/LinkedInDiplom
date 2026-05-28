# 08. PostgreSQL / EF migrations

## Database

- PostgreSQL database: `linkedin_dev`
- модули в отдельных schemas:
  `identity`, `profile`, `professional`, `network`, `content`, `messaging`, `jobs`, `notifications`, `events`

## DbContext per module

- IdentityDbContext
- ProfileDbContext
- ProfessionalDbContext
- NetworkDbContext
- ContentDbContext
- MessagingDbContext
- JobsDbContext
- NotificationsDbContext
- EventsDbContext

## Migration order при старте API

Identity → Profile → Professional → Network → Content → Messaging → Jobs → Notifications → Events

Реализовано в `Facade.API/Extensions/DatabaseExtensions.cs`.

## Как пересоздать dev DB

```bash
docker-compose down -v
docker-compose up -d
```

## Проверка через DBeaver/Beekeeper

- host: `localhost`
- port: `5432`
- database: `linkedin_dev`
- user/pass: `postgres/postgres`
