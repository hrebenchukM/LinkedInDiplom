# Professional Module

Core module of the LinkedIn Clone **modular monolith** (.NET 8). It owns career-related data in PostgreSQL schema `professional` and is consumed by the **ProfessionalManagement** facade at `/api/professional`.

The module is **not** deployed as a separate microservice today. Boundaries are enforced via projects, contracts, and `IProfessionalClient` — the same seam can later be replaced with HTTP clients without changing the facade surface.

## Architecture

```
HTTP Client
    ↓
Facade.API
    ↓
Facade.ProfessionalManagement (BFF)
    ProfessionalController  →  /api/professional/*
    ProfessionalManagementService
    ↓
IProfessionalClient (in-process)
    ↓
Professional.Client (Resources)
    ↓
Professional.Services
    ↓
Professional.DataAccess (ProfessionalDbContext)
    ↓
PostgreSQL  schema: professional
```

### Projects

| Project | Role |
|---------|------|
| `Professional.Contracts` | DTOs, parameters, results, service interfaces |
| `Professional.DataAccess` | Entities, EF Core, migrations |
| `Professional.Services` | Business logic |
| `Professional.Client.Contracts` | `IProfessionalClient`, `I*Resource` |
| `Professional.Client` | Resource implementations (delegate to services) |
| `Professional.DI` | `AddProfessionalModule` registration |

Facade layer (separate folder `backend/ProfessionalManagement/`):

| Project | Role |
|---------|------|
| `Facade.ProfessionalManagement.Contracts` | Facade DTOs, requests, responses |
| `Facade.ProfessionalManagement.Services` | Maps facade ↔ `IProfessionalClient` |
| `Facade.ProfessionalManagement.Controllers` | `ProfessionalController` |
| `Facade.ProfessionalManagement.DI` | `AddProfessionalManagementFacade` |

## Implemented entities

All tables live in schema **`professional`**. User-scoped rows store `user_id` as a string (Identity user id) **without** an EF relationship to `AspNetUsers`, so the Professional module does not reference Identity.DataAccess.

| Entity | Table | Scope | API pattern (Facade) |
|--------|-------|-------|----------------------|
| **Company** | `companies` | Owner + public read | `/me/companies` CRUD; `GET /companies/{id}` public |
| **Experience** | `experiences` | Per user | `/me/experiences` full CRUD |
| **Academy** | `academies` | Global catalog | v1: `POST /academies`, `GET /academies/{id}` |
| **Education** | `educations` | Per user | `/me/educations` full CRUD |
| **Certificate** | `certificates` | Per user | `/me/certificates` full CRUD |
| **Skill** | `skills` | Global catalog | v1: `POST /skills`, `GET /skills/{id}` |
| **UserSkill** | `user_skills` | Per user | `/me/skills` full CRUD |
| **Language** | `languages` | Global catalog | v1: `POST /languages`, `GET /languages/{id}` |
| **UserLanguage** | `user_languages` | Per user | `/me/languages` full CRUD |

Not implemented yet (see `docs/database/DB_SCHEMA.md`): Recommendations, `certificate_skills`, Posts, Jobs, Messaging, etc.

### Catalog v1 (Academy, Skill, Language)

Shared rules:

- **Create** — `POST`, JWT required (authenticated user creates a catalog entry).
- **Get by id** — `GET /{id}`, **public** (no JWT).
- No `PUT` / `PATCH` / `DELETE` on catalog entities in v1.

### User-owned entities (`/me/...`)

- Full CRUD: list, get by id, create, update, patch, delete.
- **`userId` is taken only from JWT** claims (`ClaimTypes.NameIdentifier` or `sub`) in the facade controller — never from the request body.
- Cannot read or modify another user's rows; foreign `userSkillId` / `userLanguageId` / etc. returns **404**.
- **POST** duplicate catalog link (same `skill_id` or `language_id` twice) → **400** with message like `"Skill already added."` / `"Language already added."`.
- **DELETE** on user junction tables is **hard delete** (no `deleted_at` in schema).
- **PATCH** merges only sent fields (nullable parameters in service; omitted fields are not overwritten).

## Swagger endpoints (`ProfessionalController`)

Base route: **`/api/professional`**.  
Interactive list: **http://localhost:5000/swagger** (Development).

### Companies & experience

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/me/companies` | Yes |
| GET | `/api/professional/companies/{companyId}` | No |
| POST | `/api/professional/me/companies` | Yes |
| PUT | `/api/professional/me/companies/{companyId}` | Yes |
| PATCH | `/api/professional/me/companies/{companyId}` | Yes |
| DELETE | `/api/professional/me/companies/{companyId}` | Yes |
| GET | `/api/professional/me/experiences` | Yes |
| GET | `/api/professional/me/experiences/{experienceId}` | Yes |
| POST | `/api/professional/me/experiences` | Yes |
| PUT | `/api/professional/me/experiences/{experienceId}` | Yes |
| PATCH | `/api/professional/me/experiences/{experienceId}` | Yes |
| DELETE | `/api/professional/me/experiences/{experienceId}` | Yes |

### Academies (catalog v1)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/academies/{academyId}` | No |
| POST | `/api/professional/academies` | Yes |

### Educations

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/me/educations` | Yes |
| GET | `/api/professional/me/educations/{educationId}` | Yes |
| POST | `/api/professional/me/educations` | Yes |
| PUT | `/api/professional/me/educations/{educationId}` | Yes |
| PATCH | `/api/professional/me/educations/{educationId}` | Yes |
| DELETE | `/api/professional/me/educations/{educationId}` | Yes |

### Certificates

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/me/certificates` | Yes |
| GET | `/api/professional/me/certificates/{certificateId}` | Yes |
| POST | `/api/professional/me/certificates` | Yes |
| PUT | `/api/professional/me/certificates/{certificateId}` | Yes |
| PATCH | `/api/professional/me/certificates/{certificateId}` | Yes |
| DELETE | `/api/professional/me/certificates/{certificateId}` | Yes |

### Skills (catalog v1)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/skills/{skillId}` | No |
| POST | `/api/professional/skills` | Yes |

### User skills

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/me/skills` | Yes |
| GET | `/api/professional/me/skills/{userSkillId}` | Yes |
| POST | `/api/professional/me/skills` | Yes |
| PUT | `/api/professional/me/skills/{userSkillId}` | Yes |
| PATCH | `/api/professional/me/skills/{userSkillId}` | Yes |
| DELETE | `/api/professional/me/skills/{userSkillId}` | Yes |

### Languages (catalog v1)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/languages/{languageId}` | No |
| POST | `/api/professional/languages` | Yes |

### User languages

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/me/languages` | Yes |
| GET | `/api/professional/me/languages/{userLanguageId}` | Yes |
| POST | `/api/professional/me/languages` | Yes |
| PUT | `/api/professional/me/languages/{userLanguageId}` | Yes |
| PATCH | `/api/professional/me/languages/{userLanguageId}` | Yes |
| DELETE | `/api/professional/me/languages/{userLanguageId}` | Yes |

There is **no** public API to list another user's skills, languages, educations, or certificates — only catalog lookups and the authenticated `/me/*` routes.

## Registration in Facade.API

```csharp
builder.Services.AddProfessionalModule(configuration, connectionString);
builder.Services.AddProfessionalManagementFacade();

builder.Services.AddControllers()
    .AddApplicationPart(typeof(ProfessionalController).Assembly);
```

Migrations for `ProfessionalDbContext` are applied on API startup together with Identity and Profile (see root [DOCKER.md](../../DOCKER.md) and [Facade.API README](../Facade.API/README.md)).

## Manual test flow (Swagger)

1. Register / login via `/api/auth/*`, authorize in Swagger with `Bearer <token>`.
2. Create catalog entries: `POST /api/professional/academies`, `/skills`, `/languages`.
3. `GET` catalog by id **without** token to confirm public read.
4. Link to profile: `POST /api/professional/me/educations`, `/me/certificates`, `/me/skills`, `/me/languages`.
5. Retry duplicate `skillId` / `languageId` on POST → expect **400**.

## Related documentation

- [DB schema](../../docs/database/DB_SCHEMA.md) — section 2 (career) and section 3 (skills & languages)
- [Facade.API README](../Facade.API/README.md) — host and route overview
- [Facade.API INTEGRATION](../Facade.API/INTEGRATION.md) — module wiring
- [Root README](../../README.md) — solution-wide overview
