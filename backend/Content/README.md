# Content Module

Core module of the LinkedIn Clone **modular monolith**, **prepared for microservices** (.NET 8, `TargetFramework net8.0`). It owns posts and media metadata in PostgreSQL schema **`content`** and is consumed by the **ContentManagement** facade at `/api/content`.

The module is **not** deployed as a separate microservice today. Boundaries are enforced via projects, contracts, and `IContentClient` — the same seam can later be replaced with HTTP clients without changing the facade surface.

**Status (v1):** Schema **`content`** implements **`posts`**, **`media`**, and **`post_media`** from `DB_SCHEMA.md` (posts and attachments only; engagement and feed tables are out of scope).

## Architecture

```
HTTP Client
    ↓
Facade.API
    ↓
Facade.ContentManagement (BFF)
    ContentController  →  /api/content/*
    ContentManagementService
    ↓
IContentClient (in-process)
    ↓
Content.Client (Resources)
    ↓
Content.Services
    ↓
Content.DataAccess (ContentDbContext)
    ↓
PostgreSQL  schema: content
```

### Core projects

| Project | Role |
|---------|------|
| `Content.Contracts` | DTOs, parameters, results, service interfaces |
| `Content.DataAccess` | Entities, EF Core, migrations |
| `Content.Services` | Business logic (3 domain services) |
| `Content.Client.Contracts` | `IContentClient`, `I*Resource` |
| `Content.Client` | Resource implementations (delegate to services) |
| `Content.DI` | `AddContentModule` registration |

### Facade layer (`backend/ContentManagement/`)

| Project | Role |
|---------|------|
| `Facade.ContentManagement.Contracts` | Facade DTOs, requests, responses |
| `Facade.ContentManagement.Services` | Maps facade ↔ `IContentClient` |
| `Facade.ContentManagement.Controllers` | `ContentController` |
| `Facade.ContentManagement.DI` | `AddContentManagementFacade` |

## Implemented tables (schema `content`)

All tables store user ids as **string** (Identity user id) **without** an EF relationship to `AspNetUsers`. The Content module does **not** reference Identity, Profile, or Network projects (no existence check for target users).

| Entity | Table | Purpose |
|--------|-------|---------|
| **Post** | `posts` | User-authored post; visibility `public` / `private`; soft delete via `deleted_at` |
| **Media** | `media` | Media metadata (`url`, `type` only — no blob storage) |
| **PostMedia** | `post_media` | Many-to-many link between post and media; unique `(post_id, media_id)` |

### `posts`

- Columns include `content`, `visibility`, `reaction_count`, `comment_count`, `repost_count`, `created_at`, `edited_at`, `deleted_at`.
- **Visibility v1:** `public` (default if omitted/empty) or `private`.
- **Private post:** visible only to the author (`user_id`).
- **Public post:** any authenticated user may read (`GET /api/content/posts/{postId}`).
- **Delete:** soft delete — sets `deleted_at = UtcNow` (row retained).
- **Update:** author only; sets `edited_at`.
- **Create:** optional `mediaIds` — all must exist in `media` or `"Media not found."` → **404** at facade.
- Counter fields (`reaction_count`, `comment_count`, `repost_count`) are stored but **not** updated by v1 APIs.

### `media`

- Stores **`url`** and **`type`** only (no file upload / blob in this module).
- **Type v1:** `image`, `video`, or `document`.
- Create does not associate media with a user; ownership is implied via post attachment.

### `post_media`

- **Attach / detach:** post owner only (`authorId` from JWT at facade).
- **Get by post:** returns links (with nested `media`) for authorized viewers; empty list if post is private and viewer is not the author.
- Duplicate attach → business error **400** (`"Media is already attached to this post."`).

### Deferred (not in Content module v1)

| Feature | Reason |
|---------|--------|
| **`comments`**, **`reactions`**, **`hashtags`**, **`saved_posts`**, **`reposts`**, **`post_views`**, **`mentions`** | Not implemented in v1; counters on `posts` are placeholders |
| **`group_posts`** | Deferred until **Content + Network** integration (`user_groups` ↔ `posts`); see [Network module README](../Network/README.md) |

## Services and resources

| Service | Resource | Domain |
|---------|----------|--------|
| `PostService` | `PostResource` | Posts (CRUD v1, soft delete) |
| `MediaService` | `MediaResource` | Media metadata |
| `PostMediaService` | `PostMediaResource` | Attach / detach / list post media |

Resources delegate to services only (no business logic in the client layer).

### `IContentClient`

In-process entry point for facades and other modules:

| Property | Resource |
|----------|----------|
| `Posts` | `IPostResource` |
| `Media` | `IMediaResource` |
| `PostMedia` | `IPostMediaResource` |

Registered in `Content.DI` via `AddContentModule`.

## Migrations

| Migration | Description |
|-----------|-------------|
| `AddContentModule` | Schema `content`, tables `posts`, `media`, `post_media` |

Applied at startup from `Facade.API` (`ContentDbContext`). History table: `content.__EFMigrationsHistory`.

## Security and business rules

| Rule | Behavior |
|------|----------|
| All `/api/content/*` routes | **JWT required** — no public endpoints |
| Current user id / author id | Taken **only from JWT** (`ClaimTypes.NameIdentifier` or `sub`) in `ContentController` — never from request body |
| Request bodies | Must **not** contain `userId`, `authorId`, or `currentUserId` for the authenticated user |
| **Visibility v1** | `public` or `private` only |
| **Private post** | Readable only by author |
| **Public post** | Readable by any authenticated user |
| **Media** | URL + type only; no blob storage in Content module |
| **Post delete** | Soft delete via `deleted_at` |
| **Post media** | Attach/detach allowed only for post owner |
| **Not found** | `"Post not found."`, `"Media not found."`, `"Post media not found."` → **404** at facade |
| Other business errors | **400** at facade |
| Target user existence | **Not** validated (no call to Identity/Profile) |
| **`group_posts`** | **Not implemented** — deferred until Content + Network integration |

## API endpoints (Facade)

Base route: **`/api/content`**. All routes require JWT.

### Media

| Method | Path |
|--------|------|
| POST | `/api/content/me/media` |
| GET | `/api/content/media/{mediaId}` |

### Posts

| Method | Path |
|--------|------|
| POST | `/api/content/me/posts` |
| GET | `/api/content/me/posts` |
| GET | `/api/content/posts/{postId}` |
| PATCH | `/api/content/me/posts/{postId}` |
| DELETE | `/api/content/me/posts/{postId}` |

### Post media

| Method | Path |
|--------|------|
| POST | `/api/content/me/posts/{postId}/media` |
| GET | `/api/content/me/posts/{postId}/media` |
| DELETE | `/api/content/me/posts/{postId}/media/{mediaId}` |

### Request bodies (facade)

| Operation | Body fields |
|-----------|-------------|
| Create post | `content`, optional `visibility`, optional `mediaIds` |
| Update post | `content`, `visibility` |
| Create media | `url`, `type` |
| Attach post media | `mediaId` only |

## Host integration

Registered in `Facade.API`:

```csharp
builder.Services.AddContentModule(configuration, connectionString);
builder.Services.AddContentManagementFacade();

builder.Services.AddControllers()
    // ...
    .AddApplicationPart(typeof(ContentController).Assembly);
```

Migrations: `ContentDbContext` in `ApplyMigrationsAsync` (after Network).

## Out of scope

- Comments, reactions, hashtags, saved posts, reposts, post views, mentions
- **`group_posts`** — deferred until Content + Network integration
- Public (unauthenticated) content endpoints
- Media file upload / blob storage (URL-only v1)
- Cross-module validation that users exist in Identity
- HTTP microservice deployment (in-process `IContentClient` only)

## Related docs

- [Facade.API README](../Facade.API/README.md) — host routes overview
- [Network module README](../Network/README.md) — `group_posts` dependency on `posts.post_id`
- [DB_SCHEMA.md](../../docs/database/DB_SCHEMA.md) — database design (`content` section)
