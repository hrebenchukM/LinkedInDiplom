# 09. Конфигурация и uploads

## appsettings.json

Ключи:

- `ConnectionStrings:DefaultConnection`
- `JwtSettings:SecretKey/Issuer/Audience/AccessTokenExpirationMinutes/RefreshTokenExpirationDays`
- `FileStorage:UploadsRootPath`
- `Cors:AllowedOrigins`
- `Logging`

## appsettings.Development.json

- development connection string
- dev JWT key
- access token lifetime 60 min
- refresh lifetime 30 days

## appsettings.Production.json

- production CORS origins
- более короткие токены (пример: 15/7)

## env vars (docker)

- `ConnectionStrings__DefaultConnection`
- `JwtSettings__SecretKey`, `JwtSettings__Issuer`, `JwtSettings__Audience`
- `JwtSettings__AccessTokenExpirationMinutes`
- `JwtSettings__RefreshTokenExpirationDays`

## CORS

- Development: allow any
- Production: только `Cors:AllowedOrigins`, иначе блок

## Uploads

- путь берется из `FileStorage:UploadsRootPath`, если пусто → `ContentRoot/uploads`
- static files отдаются через `/uploads`
- docker volume: `profile_uploads`
