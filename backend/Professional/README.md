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
| **CertificateSkill** | `certificate_skills` | Per certificate (owner via `certificates.user_id`) | `/me/certificates/{certificateId}/skills` list, get, create, delete |
| **RecommendedSkillByPosition** | `recommended_skills_by_position` | Global recommendations by job title | `GET /recommended-skills?position=` public; `POST` / `DELETE /{rspId}` JWT |

Not implemented yet (see `docs/database/DB_SCHEMA.md`): Recommendations (text endorsements), Posts, Jobs, Messaging, etc.

### Catalog v1 (Academy, Skill, Language)

Shared rules:

- **Create** — `POST`, JWT required (authenticated user creates a catalog entry).
- **Get by id** — `GET /{id}`, **public** (no JWT).
- No `PUT` / `PATCH` / `DELETE` on catalog entities in v1.

### User-owned entities (`/me/...`)

- Full CRUD: list, get by id, create, update, patch, delete.
- **`userId` is taken only from JWT** claims (`ClaimTypes.NameIdentifier` or `sub`) in the facade controller — never from the request body.
- Cannot read or modify another user's rows; foreign `userSkillId` / `userLanguageId` / `certificateSkillId` / etc. returns **404**.
- **POST** duplicate catalog link (same `skill_id` or `language_id` twice on user profile) → **400** with message like `"Skill already added."` / `"Language already added."`.
- **DELETE** on `user_skills`, `user_languages`, and `certificate_skills` is **hard delete** (no `deleted_at` in schema). Certificates themselves use soft delete (`deleted_at`).
- **PATCH** merges only sent fields (nullable parameters in service; omitted fields are not overwritten).

### Certificate skills (Certificate ↔ Skill)

Junction table linking a **user-owned certificate** to a **skill** from the global catalog (`skills`). There is no `user_id` on `certificate_skills`; ownership is enforced by verifying `certificates.user_id` matches the JWT user.

| Rule | Behavior |
|------|----------|
| Auth | **JWT only** on all routes — no public endpoints |
| `userId` | Taken **only from JWT** (`NameIdentifier` / `sub`), never from the request body |
| Ownership | Skill can be linked **only to the current user's certificate**; foreign or missing certificate → **404** |
| Skill exists | `skill_id` must exist in catalog; otherwise **400** (`"Skill not found."`) |
| Duplicate | Same `skill_id` on the same `certificate_id` twice → **400** (`"Skill already added to certificate."`) |
| Mutations | **POST** (create link) and **DELETE** (hard delete) only — no PUT/PATCH (no extra fields in schema) |
| List / GET | If certificate is not found or not owned → **404** (empty list is not returned for invalid certificates) |

### Recommended skills by position (global catalog)

Global reference data: which **skills** from the catalog are recommended for a given **position** (job title string, e.g. `"Software Engineer"`). There is **no** `user_id` — not user profile data, so there are **no** `/me/*` routes.

| Rule | Behavior |
|------|----------|
| Auth | **GET** — public (no JWT). **POST** / **DELETE** — JWT required |
| `userId` | **Not used** (not user-scoped) |
| `position` | Required; trimmed in service; empty after trim → **400** (`"Position is required."`) on POST; GET without query or with blank `position` → **400** |
| Skill exists | `skillId` must exist in `skills`; otherwise **400** (`"Skill not found."`) |
| Duplicate | Same `skillId` for the same `position` twice → **400** (`"Skill already added for this position."`); unique index on `(position, skill_id)` |
| Mutations | **POST** (create link) and **DELETE** (hard delete by `rspId`) only — no PUT/PATCH |
| DELETE not found | Unknown `rspId` → **404** (`"Recommended skill not found."`) |
| GET list | Returns all rows for the given `position`, sorted by `created_at` desc; empty array if none |

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

### Certificate skills (Certificate ↔ Skill, JWT only)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/me/certificates/{certificateId}/skills` | Yes |
| GET | `/api/professional/me/certificates/{certificateId}/skills/{certificateSkillId}` | Yes |
| POST | `/api/professional/me/certificates/{certificateId}/skills` | Yes |
| DELETE | `/api/professional/me/certificates/{certificateId}/skills/{certificateSkillId}` | Yes |

POST body: `{ "skillId": "<guid>" }`. POST checks **ModelState**. Duplicate skill on the same certificate → **400**. Certificate not found or not owned → **404**.

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

### Recommended skills by position (global, not `/me`)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/professional/recommended-skills?position={position}` | No |
| POST | `/api/professional/recommended-skills` | Yes |
| DELETE | `/api/professional/recommended-skills/{rspId}` | Yes |

GET requires non-empty query `position` (URL-encode spaces, e.g. `Software%20Engineer`). POST body: `{ "position": "...", "skillId": "<guid>" }`. POST checks **ModelState**. Duplicate `(position, skillId)` → **400**. Unknown skill → **400**. DELETE unknown `rspId` → **404**.

There is **no** public API to list another user's skills, languages, educations, certificates, or certificate–skill links — only catalog lookups (`academies`, `skills`, `languages`, `companies`, **recommended skills by position**), and authenticated `/me/*` routes.

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
5. On your certificate: `POST /api/professional/me/certificates/{certificateId}/skills` with a catalog `skillId` → **200**; repeat → **400** (`Skill already added to certificate.`).
6. `GET` / `DELETE` certificate skills on your certificate; use another user's `certificateId` → **404**.
7. Retry duplicate `skillId` / `languageId` on user profile POST → expect **400**.
8. **Recommended skills by position:** `GET /api/professional/recommended-skills?position=Software%20Engineer` **without** token → **200** (may be `[]`). `POST /api/professional/recommended-skills` with JWT and catalog `skillId` → **200**; repeat same `position` + `skillId` → **400**; invalid `skillId` → **400**. `DELETE /api/professional/recommended-skills/{rspId}` with JWT → **200**; missing `rspId` → **404**. GET without `position` → **400**.

## Related documentation

- [DB schema](../../docs/database/DB_SCHEMA.md) — section 2 (career) and section 3 (skills & languages)
- [Facade.API README](../Facade.API/README.md) — host and route overview
- [Facade.API INTEGRATION](../Facade.API/INTEGRATION.md) — module wiring
- [Root README](../../README.md) — solution-wide overview
