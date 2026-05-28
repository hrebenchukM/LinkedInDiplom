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

## Защищенные endpoints

Почти все `/api/*/me/...` в остальных фасадах требуют JWT.
