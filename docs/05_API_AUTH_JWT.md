# 05. API Auth / JWT

## Auth endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/facebook`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me` (JWT)

## Access token

- JWT Bearer в заголовке `Authorization: Bearer <token>`
- настройки: `JwtSettings:SecretKey/Issuer/Audience/AccessTokenExpirationMinutes`

## Refresh token

- хранится в PostgreSQL (`identity` schema, `RefreshToken`)
- refresh endpoint выдает новую пару токенов
- logout отзывает refresh token

## AccountController чем особенный

- отдельный controller без `*ManagementControllerBase`
- auth errors в основном дают `401`
- `me` требует `[Authorize]`

## Роли платформы (Admin / User)

- роли хранятся в ASP.NET Identity (`AspNetRoles`, `AspNetUserRoles`)
- константы: `IdentityRoleNames.Admin`, `IdentityRoleNames.User`
- `IdentityDataSeeder` при старте создаёт роли, если их ещё нет (идемпотентно)
- при регистрации (`IUserService.RegisterAsync`) новому пользователю назначается роль **User**; при сбое — откат создания пользователя

### AdminSeed (только для разработки)

- секция `AdminSeed` в `appsettings.Development.json` (Email / Password / UserName)
- пример локального admin: `admin@local.dev` / `Admin123!` — **только Development**
- в production `appsettings.json` **не должен** содержать пароль admin; используйте User Secrets, переменные окружения или отдельный безопасный процесс bootstrap
- если Email или Password пустые — seeder пропускает создание admin с warning в логах

### Role claims в JWT

При login/refresh в access token добавляются claims ролей:

- `ClaimTypes.Role` = `Admin` / `User` (см. `AuthenticationService.GetUserClaimsAsync`)

Защита admin API:

```csharp
[Authorize(Roles = IdentityRoleNames.Admin)]
```

на контроллерах `Facade.AdminManagement` (`/api/admin/*`).

### Важно после смены роли

Если admin назначил/снял роль пользователю, **текущий access token не обновляется автоматически**.  
Нужен новый `POST /api/auth/login` или `POST /api/auth/refresh`, чтобы получить JWT с актуальными role claims.

### Soft-deleted и locked users

- login отклоняет пользователя с `DeletedAt != null` (как invalid credentials)
- refresh отклоняет soft-deleted пользователя
- lock проверяется через `UserManager.IsLockedOutAsync`

## Защищенные endpoints

Почти все `/api/*/me/...` в остальных фасадах требуют JWT.

Все `/api/admin/*` требуют JWT **и** роль **Admin**. Обычный пользователь с ролью User получит **403 Forbidden**.
