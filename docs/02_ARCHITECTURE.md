# 02. Архитектура, ООП и правила

## Слои

Frontend  
↓ HTTP  
Facade.API  
↓ Controllers (`Facade.*.Controllers`)  
Facade services (`Facade.*.Services`)  
↓ `I*Client` / Resource  
Core services (`*.Services`)  
↓ `*DbContext` (`*.DataAccess`)  
PostgreSQL schema

## Program.cs (факт)

Facade.API регистрирует:

- 9 core модулей: `AddIdentityModule ... AddEventsModule`
- 9 facade модулей: `AddAccountManagementFacade ... AddEventsManagementFacade`
- controllers через `AddApplicationPart(...)`
- JWT, CORS, Swagger (dev), static files `/uploads`

## Порядок migrations

`ApplyMigrationsAsync`:

1. Identity
2. Profile
3. Professional
4. Network
5. Content
6. Messaging
7. Jobs
8. Notifications
9. Events

## Паттерны (реально в коде)

- interface-based programming (`I*Service`, `I*Client`, `I*Resource`)
- dependency inversion (facade зависит от `I*Client`, не от DbContext)
- dependency injection (extension methods `Add*Module`, `Add*ManagementFacade`)
- separation of concerns (Controller / Facade Service / Core Service / DataAccess)
- DTO + Request/Response + Parameters/Results
- service layer
- client/resource pattern
- feature-based controllers
- partial facade services
- DataAnnotations validation
- error mapping (`MapErrors` в base controllers)
- DbContext per module, schema per module
- soft delete
- domain events (`UserRegisteredEvent`)
- async/await

## Почему не Repository/UoW как у преподавателя

В проекте используется связка `DbContext + Services + Client/Resource`, потому что:

- граница — модуль и его schema
- меньше лишних абстракций
- удобнее выносить модуль в микросервис позже

## Что нельзя ломать

- controllers только в facade
- core не ссылается на facade
- facade/core не ссылаются на чужой DataAccess
- не переносить бизнес-логику в controller
- не менять net8.0 без отдельного решения
