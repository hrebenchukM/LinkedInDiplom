# 24. Configuration Reference

> Все важные настройки `Facade.API` — что, зачем, где используется.

Файлы:
- `backend/Facade.API/appsettings.json` — base
- `backend/Facade.API/appsettings.Development.json` — dev overrides
- `backend/Facade.API/appsettings.Production.json` — production (if exists)

---

## ConnectionStrings

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=linkedin_dev;Username=postgres;Password=postgres"
}
```

| | |
|---|---|
| **Зачем** | PostgreSQL для всех 9 DbContext |
| **Где** | Each `*.DI` module registers DbContext with this connection |
| **Если не настроено** | Startup fails on first DB access |

Docker: см. [07_INFRA_DOCKER.md](07_INFRA_DOCKER.md).

---

## JwtSettings

```json
"JwtSettings": {
  "SecretKey": "...",
  "Issuer": "LinkedInDiplom",
  "Audience": "LinkedInDiplom",
  "AccessTokenExpirationMinutes": 15,
  "RefreshTokenExpirationDays": 7
}
```

| | |
|---|---|
| **Зачем** | Sign/validate JWT access tokens |
| **Где** | `Program.cs` JwtBearer configuration; `TokenService` |
| **Dev override** | 60 min access, 30 days refresh |
| **Если SecretKey пуст** | Auth fails |

**Claims:** `sub` (userId), `email`, `name`, `role` (Admin/User).

---

## AdminSeed

```json
"AdminSeed": {
  "Email": "admin@local.dev",
  "Password": "Admin123!",
  "UserName": "admin@local.dev"
}
```

| | |
|---|---|
| **Зачем** | Create platform admin on first Identity migration |
| **Где** | `IdentityDataSeeder.SeedAsync()` |
| **Если пусто** | Skip admin creation (warning in logs) |

---

## DemoSeed

```json
"DemoSeed": {
  "Enabled": true,
  "Reset": false,
  "MinUsers": 3,
  "DefaultUserPassword": "Test123!",
  "MarkerPrefix": "demo-seed:",
  "UserEmails": ["admin@local.dev", "test@example.com", "test2@example.com"]
}
```

| | |
|---|---|
| **Зачем** | Populate demo data in Development |
| **Где** | `DatabaseExtensions.cs` → `DemoSeedOrchestrator` |
| **Enabled=false** | Skip all demo seeders |
| **Reset=true** | Warning only — not implemented |

Подробно: [22_SEED_DATA.md](22_SEED_DATA.md).

---

## FileStorage

```json
"FileStorage": {
  "UploadsRootPath": ""
}
```

| | |
|---|---|
| **Зачем** | Local file storage root |
| **Default** | `{ContentRootPath}/uploads` |
| **URL prefix** | `/uploads/{module}/...` served via `UseStaticFiles` |

---

## AwsS3

```json
"AwsS3": {
  "BucketName": "",
  "Region": "us-east-1",
  "AccessKeyId": "",
  "SecretAccessKey": ""
}
```

| | |
|---|---|
| **Зачем** | S3 storage instead of local |
| **Где** | `FileStorageServiceCollectionExtensions` registers `IAmazonS3` |
| **Selection** | If `BucketName` non-empty → S3; else local |
| **Dev** | Bucket `linkedin-diplom-photos` configured in Development |

Подробно: [09_CONFIG_UPLOADS.md](09_CONFIG_UPLOADS.md).

---

## Gemini (AI)

```json
"Gemini": {
  "ApiKey": "",
  "Model": "gemini-2.0-flash"
}
```

| | |
|---|---|
| **Зачем** | AI recommendations (`/api/ai/*`) |
| **Где** | `AIService` in `AI.Services` |
| **Если ApiKey пуст** | AI endpoints return error |

---

## CORS

```json
"Cors": {
  "AllowedOrigins": []
}
```

| Environment | Policy |
|-------------|--------|
| Development | Hardcoded localhost:5173, 3000 + AllowCredentials |
| Production | From `AllowedOrigins`; empty = block all |

SignalR requires `AllowCredentials`.

---

## Logging

```json
"Logging": {
  "LogLevel": {
    "Default": "Information",
    "Microsoft.AspNetCore": "Warning"
  }
}
```

Dev adds `Microsoft.EntityFrameworkCore: Information` for SQL logging.

---

## External Auth (Google/Facebook)

Configured in Identity module options (check `Identity.DI` and appsettings sections if present).

Endpoints: `POST /api/auth/google`, `POST /api/auth/facebook`.

---

## launchSettings.json

Profiles:
- `http` → `http://localhost:5000`
- `https` → `https://localhost:7011` + `http://localhost:5000`

Frontend on HTTP can call HTTPS backend (no mixed content for API calls).

---

## Environment variables (production)

Override appsettings via:
- `ConnectionStrings__DefaultConnection`
- `JwtSettings__SecretKey`
- `AwsS3__AccessKeyId`, `AwsS3__SecretAccessKey`
- `Gemini__ApiKey`
- `Cors__AllowedOrigins__0`, `__1`, ...

**Never commit production secrets to git.**
