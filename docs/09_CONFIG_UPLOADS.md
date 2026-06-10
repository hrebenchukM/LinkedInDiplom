# 09. Конфигурация, FileStorage и uploads

## appsettings (ключи)

- `ConnectionStrings:DefaultConnection`
- `JwtSettings:SecretKey`, `Issuer`, `Audience`, `AccessTokenExpirationMinutes`, `RefreshTokenExpirationDays`
- `FileStorage:UploadsRootPath` — корневая папка для **локального** режима (пусто → `{ContentRootPath}/uploads`)
- `AwsS3:BucketName`, `Region`, `AccessKeyId`, `SecretAccessKey`
- `Gemini:ApiKey`, `Model` (модуль AI)
- `Cors:AllowedOrigins`
- `AdminSeed:*` (Development seed admin)
- `Logging`

## appsettings.Development.json

- development connection string
- dev JWT key
- access token lifetime 60 min
- refresh lifetime 30 days
- `AwsS3:BucketName` обычно **пустой** → uploads идут на локальный диск

## appsettings.Production.json

- production CORS origins
- более короткие токены (пример: 15/7)
- **секреты (JWT, RDS, AWS, Gemini) должны приходить из environment variables / secrets manager**, а не из файла в git

## Environment variables (production / Docker)

| Переменная | Назначение |
|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL |
| `JwtSettings__SecretKey` | JWT signing key (обязателен в Production) |
| `JwtSettings__Issuer` | JWT issuer |
| `JwtSettings__Audience` | JWT audience |
| `JwtSettings__AccessTokenExpirationMinutes` | TTL access token |
| `JwtSettings__RefreshTokenExpirationDays` | TTL refresh token |
| `FileStorage__UploadsRootPath` | override локальной папки uploads |
| `AwsS3__BucketName` | S3 bucket (пусто → local mode) |
| `AwsS3__Region` | AWS region |
| `AwsS3__AccessKeyId` | опционально, если не в appsettings |
| `AwsS3__SecretAccessKey` | опционально, если не в appsettings |
| `AWS_ACCESS_KEY_ID` | fallback для S3 client (если пусто в appsettings) |
| `AWS_SECRET_ACCESS_KEY` | fallback для S3 client |
| `Gemini__ApiKey` | Google Gemini API key (модуль AI) |

### Security hygiene

- **Не хранить** реальные AWS keys, RDS password, production JWT secret в `appsettings*.json`, коммитящихся в git.
- Если секреты уже попали в историю git — **ротировать** ключи в AWS/RDS и обновить deployment secrets.
- `appsettings.json` в репозитории должен содержать только placeholders или пустые значения для чувствительных полей.

## CORS

- Development: `AllowAnyOrigin`
- Production: только `Cors:AllowedOrigins`, иначе блок

---

## FileStorage module (shared infrastructure)

Инфраструктурный модуль, **не** core bounded context. Проекты:

| Проект | Назначение |
|---|---|
| `backend/FileStorage/Facade.FileStorage.Contracts` | `IFileStorageService`, `FileStoragePathOptions`, `FileUploadConstants`, `FileUploadValidation`, options |
| `backend/FileStorage/Facade.FileStorage.Services` | `FileStorageService` (local disk или S3) |
| `backend/FileStorage/Facade.FileStorage.DI` | `AddFileStorage(configuration)` |

### Регистрация в host

`Facade.API/Program.cs`:

```csharp
builder.Services.AddFileStorage(configuration);
```

Static files: `UseStaticFiles` с `RequestPath = "/uploads"` отдаёт файлы из той же папки, что и `FileStorage:UploadsRootPath`.

### Архитектура upload flow

```
Controller (IFormFile, multipart/form-data)
  → Facade *ManagementService (permission check → SaveAsync → update URL via client)
    → IFileStorageService.SaveAsync
      → S3 PutObject, если AwsS3:BucketName задан и IAmazonS3 зарегистрирован
      → local disk под UploadsRootPath, если S3 не настроен
    → Core client/service сохраняет только URL string в БД
```

### Правила зависимостей

- `FileStorageService` **не зависит** от Profile/Content/Professional/Network/Events/Messaging.
- Feature facade services ссылаются только на `Facade.FileStorage.Contracts` (не на `Facade.FileStorage.Services` напрямую).
- В БД **не хранятся** файлы, base64 или blob — только URL (`AvatarUrl`, `LogoUrl`, `MediaUrl`, `DownloadRef`, …).

### Shared upload helpers

- `FileUploadConstants` — лимиты размера и allowed extensions/content-types (централизованно).
- `FileUploadValidation` — controller-level проверка `file` required / not empty / max size (возвращает текст ошибки; controller формирует `BadRequest` в своём стиле).

---

## Local / S3 fallback

| Условие | Поведение |
|---|---|
| `AwsS3:BucketName` пустой или S3 client не зарегистрирован | **Local mode**: файл на диске, URL вида `/uploads/...` |
| `AwsS3:BucketName` задан + `IAmazonS3` в DI | **S3 mode**: `PutObject`, absolute HTTPS URL |

Local URL строится как `/uploads/{module}/{ownerId}/[{entityId}/]{entityName}/{guid}{ext}`.

S3 object key: `{module}/{entityName}/{ownerId}/{entityId}/{guid}{ext}` (порядок сегментов отличается от local path — это ожидаемо).

### Примеры local paths

| Модуль | Пример URL |
|---|---|
| Profile avatar | `/uploads/profile/{userId}/avatar/{guid}.jpg` |
| Profile header | `/uploads/profile/{userId}/header/{guid}.png` |
| Content media | `/uploads/content/{userId}/media/{guid}.jpg` |
| Company logo | `/uploads/professional/{userId}/{companyId}/company-logo/{guid}.png` |
| Academy logo | `/uploads/professional/{userId}/{academyId}/academy-logo/{guid}.png` |
| Certificate file | `/uploads/professional/{userId}/{certificateId}/certificate-file/{guid}.pdf` |
| Page logo | `/uploads/network/{userId}/{pageId}/page-logo/{guid}.webp` |
| Group avatar | `/uploads/network/{userId}/{groupId}/group-avatar/{guid}.jpg` |
| Event cover | `/uploads/events/{userId}/{eventId}/event-cover/{guid}.jpg` |
| Speaker avatar | `/uploads/events/{userId}/{speakerId}/speaker-avatar/{guid}.png` |
| Message media | `/uploads/messaging/{userId}/{messageId}/message-media/{guid}.pdf` |

---

## File limits and allowed types

Значения централизованы в `FileUploadConstants` + controller checks через `FileUploadValidation`. Service-level validation в `FileStorageService` дублирует extensions/content-types из `FileStoragePathOptions`.

| Категория | Max size | Extensions | Content-Types | Где используется |
|---|---|---|---|---|
| Profile images | 5 MB | jpg, jpeg, png, webp (**без gif**) | image/jpeg, image/png, image/webp | Profile avatar/header |
| General images | 5 MB | jpg, jpeg, png, webp, gif | + image/gif | Content, Network, Events, Professional logos |
| Certificate / documents | 10 MB | pdf, jpg, jpeg, png, webp | application/pdf, image/jpeg, image/png, image/webp | Certificate file, Messaging media |
| Messaging media | 10 MB | images + gif + pdf | images + gif + application/pdf | Message media upload |

---

## Backend upload endpoints (11)

Все используют `multipart/form-data`, поле **`file`**, JWT `[Authorize]` (кроме отсутствия auth — нет публичных upload endpoints).

| # | Method / Path | Auth | Response | DB field | Limit | Allowed types | Permission-before-save | Local path segment |
|---|---|---|---|---|---|---|---|---|
| 1 | `POST /api/profile/me/avatar` | User JWT | `ProfileResponse` | `UserProfile.AvatarUrl` | 5 MB | Profile (no gif) | N/A (own profile) | `profile/{userId}/avatar/` |
| 2 | `POST /api/profile/me/header` | User JWT | `ProfileResponse` | `UserProfile.HeaderUrl` | 5 MB | Profile (no gif) | N/A (own profile) | `profile/{userId}/header/` |
| 3 | `POST /api/content/me/media/upload` | User JWT | `MediaResponse` | `Media.Url` (+ создаёт Media row) | 5 MB | General images | N/A | `content/{userId}/media/` |
| 4 | `POST /api/professional/me/companies/{companyId}/logo` | User JWT | `CompanyResponse` | `Company.LogoUrl` | 5 MB | General images | Owner company check | `professional/{userId}/{companyId}/company-logo/` |
| 5 | `POST /api/professional/academies/{academyId}/logo` | **Admin** JWT | `AcademyResponse` | `Academy.LogoUrl` | 5 MB | General images | Academy exists | `professional/{userId}/{academyId}/academy-logo/` |
| 6 | `POST /api/professional/me/certificates/{certificateId}/file` | User JWT | `CertificateResponse` | `Certificate.DownloadRef` | 10 MB | Certificate set | Own certificate | `professional/{userId}/{certificateId}/certificate-file/` |
| 7 | `POST /api/network/me/pages/{pageId}/logo` | User JWT | `PageResponse` | `Page.LogoUrl` | 5 MB | General images | Own page | `network/{userId}/{pageId}/page-logo/` |
| 8 | `POST /api/network/me/groups/{groupId}/avatar` | User JWT | `UserGroupResponse` | `UserGroup.AvatarUrl` | 5 MB | General images | Own group | `network/{userId}/{groupId}/group-avatar/` |
| 9 | `POST /api/events/me/{eventId}/cover` | User JWT | `EventResponse` | `Event.CoverImageUrl` | 5 MB | General images | Organizer == user | `events/{userId}/{eventId}/event-cover/` |
| 10 | `POST /api/events/me/speakers/{speakerId}/avatar` | **Admin** JWT | `EventSpeakerResponse` | `EventSpeaker.AvatarUrl` | 5 MB | General images | Speaker exists | `events/{userId}/{speakerId}/speaker-avatar/` |
| 11 | `POST /api/messaging/me/messages/{messageId}/media/upload` | User JWT | `MessageMediaResponse` | `MessageMedia.MediaUrl` | 10 MB | Messaging set | Sender + chat access | `messaging/{userId}/{messageId}/message-media/` |

**Admin-only uploads (глобальный каталог):** academy logo, speaker avatar. Остальные 9 upload endpoints — user-owned / own-entity checks.

**EventSpeaker:** глобальный справочник без `OwnerId`; write + avatar — Admin-only; read — User JWT (см. `04_FACADE_MODULES.md`, `13_V1_LIMITATIONS.md`).

### Связанные JSON endpoints (не multipart upload)

- `POST /api/content/me/media` — создать Media по **URL** в JSON (`CreateMediaRequest`), без `IFormFile`.
- `POST /api/messaging/me/messages/{messageId}/media` — attach media по **URL** в JSON (`AttachMessageMediaRequest`).

---

## Permission-before-save (текущий порядок)

Для entity-scoped uploads facade service выполняет:

1. **Проверка существования / доступа** (через существующий client/service flow).
2. **`IFileStorageService.SaveAsync`**.
3. **Обновление URL в БД** (Patch/Update/Attach).

Реализовано для: company logo, academy logo, certificate file, page logo, group avatar, event cover, speaker avatar (existence; endpoint Admin-only), messaging media (`ValidateAttachAccessAsync`).

Profile avatar/header и content media upload проверяют только auth user; entity ownership не требуется на том же уровне.

---

## Docker volume

`docker-compose.yml`:

- volume: `uploads_data:/app/uploads` (не `profile_uploads`)
- mount в API container: `/app/uploads`

---

## Upload smoke test checklist (Postman / Swagger)

Для любого upload endpoint из таблицы выше:

1. **401** без `Authorization: Bearer` JWT.
2. **400** `{ success: false, errors: ["File is empty."] }` — без файла или пустой `file`.
3. **400** `errors: ["File is too large. Maximum size is 5 MB."]` (или 10 MB) — файл больше лимита.
4. **404 / 400** с business error — чужая или несуществующая сущность (**до** сохранения файла, orphan не создаётся).
5. **200** — валидный файл ≤ лимита; в response есть URL; в БД обновилось соответствующее поле.
6. **Local mode**: открыть `/uploads/...` URL в браузере (после upload) — файл отдаётся static middleware.

Multipart в Postman: Body → form-data → key **`file`**, type **File**.

**Catalog upload smoke (Admin):**

- `POST .../academies/{id}/logo` с User token → **403**; с `adminToken` → **200**
- `POST .../speakers/{id}/avatar` с User token → **403**; с `adminToken` → **200**
