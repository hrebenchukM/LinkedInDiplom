# Content Module

Core module of the LinkedIn Clone **modular monolith**, **prepared for microservices** (.NET 8, `TargetFramework net8.0`). It owns posts and media metadata in PostgreSQL schema **`content`** and is consumed by the **ContentManagement** facade at `/api/content`.

The module is **not** deployed as a separate microservice today. Boundaries are enforced via projects, contracts, and `IContentClient` — the same seam can later be replaced with HTTP clients without changing the facade surface.

**Status (v3):** Schema **`content`** implements **`posts`**, **`media`**, **`post_media`**, **`comments`**, **`reactions`**, **`hashtags`**, **`post_hashtags`**, and **`user_hashtag_follows`** from `DB_SCHEMA.md` (`saved_posts` / `reposts` / `post_views` / `mentions` and `group_posts` are still out of scope).

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
| `Content.Services` | Business logic (8 domain services) |
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
| **Comment** | `comments` | Comment under a post; optional parent; soft delete via `deleted_at` |
| **Reaction** | `reactions` | User reaction to post; unique `(user_id, post_id)`; hard delete on unreact |
| **Hashtag** | `hashtags` | Normalized hashtag name; unique `name` |
| **PostHashtag** | `post_hashtags` | Many-to-many link between post and hashtag; unique `(post_id, hashtag_id)` |
| **UserHashtagFollow** | `user_hashtag_follows` | User subscription to hashtag; soft unfollow via `unfollowed_at` |

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

### `comments`

- Create only if post exists, not deleted, and viewer has access (private post: author only).
- `parent_comment_id` is optional.
- Update/delete allowed only for comment author.
- Delete is soft delete (`deleted_at`, `updated_at`).
- `posts.comment_count` is updated in service on create/delete.

### `reactions`

- Allowed reaction types v1: `like`, `celebrate`, `support`, `love`, `insightful`, `funny`.
- One reaction per `(user_id, post_id)` via unique index.
- `PUT` works as upsert: first call creates row; repeated call updates `reaction_type`.
- `DELETE` removes reaction row (hard delete).
- `posts.reaction_count` is updated in service on create/delete.

### `hashtags`

- **Name** is normalized in service: `trim` + `ToLowerInvariant`.
- Empty name after trim → `"Hashtag name is required."` → **400** at facade.
- Duplicate name → `"Hashtag already exists."` → **400** at facade.
- **Create:** `created_at = UtcNow`, `updated_at = null`.

### `post_hashtags`

- **Attach / detach:** post owner only (`authorId` from JWT at facade).
- **Get by post:** returns links (with nested `hashtag`) for authorized viewers; empty list if post is private and viewer is not the author.
- Duplicate attach → **400** (`"Post hashtag already exists."`).
- **Detach:** hard delete of link row.

### `user_hashtag_follows`

- **Follow / unfollow:** current JWT user only.
- Active follow: `unfollowed_at == null`.
- Duplicate active follow → **400** (`"Already following this hashtag."`).
- **Re-follow** after unfollow reactivates the existing row (`unfollowed_at = null`, `followed_at = UtcNow`).
- **Unfollow:** soft unfollow (`unfollowed_at = UtcNow`).

### Deferred (not in Content module v3)

| Feature | Reason |
|---------|--------|
| **`saved_posts`**, **`reposts`**, **`post_views`**, **`mentions`** | Not implemented in v3 |
| **`group_posts`** | Deferred until **Content + Network** integration (`user_groups` ↔ `posts`); see [Network module README](../Network/README.md) |

## Services and resources

| Service | Resource | Domain |
|---------|----------|--------|
| `PostService` | `PostResource` | Posts (CRUD v1, soft delete) |
| `MediaService` | `MediaResource` | Media metadata |
| `PostMediaService` | `PostMediaResource` | Attach / detach / list post media |
| `CommentService` | `CommentResource` | Comments (create/list/update/soft delete) |
| `ReactionService` | `ReactionResource` | Reactions (upsert/delete/list) |
| `HashtagService` | `HashtagResource` | Hashtags (create/get by id/get by name) |
| `PostHashtagService` | `PostHashtagResource` | Attach / detach / list post hashtags |
| `UserHashtagFollowService` | `UserHashtagFollowResource` | Follow / unfollow / list my hashtag follows |

Resources delegate to services only (no business logic in the client layer).

### `IContentClient`

In-process entry point for facades and other modules:

| Property | Resource |
|----------|----------|
| `Posts` | `IPostResource` |
| `Media` | `IMediaResource` |
| `PostMedia` | `IPostMediaResource` |
| `Comments` | `ICommentResource` |
| `Reactions` | `IReactionResource` |
| `Hashtags` | `IHashtagResource` |
| `PostHashtags` | `IPostHashtagResource` |
| `UserHashtagFollows` | `IUserHashtagFollowResource` |

Registered in `Content.DI` via `AddContentModule`.

## Migrations

| Migration | Description |
|-----------|-------------|
| `AddContentModule` | Schema `content`, tables `posts`, `media`, `post_media` |
| `AddContentCommentsAndReactions` | Tables `comments`, `reactions` |
| `AddContentHashtagsAndFollows` | Tables `hashtags`, `post_hashtags`, `user_hashtag_follows` |

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
| **Comments** | Create only for accessible post; update/delete only by comment author; delete is soft delete |
| **Reactions** | Upsert by `(user_id, post_id)`; repeated put updates `reaction_type`; delete removes row |
| **Hashtags** | Name normalized `trim` + lower; duplicate name → **400** |
| **Post hashtags** | Attach/detach allowed only for post owner; duplicate link → **400**; detach is hard delete |
| **User hashtag follows** | Follow/unfollow for JWT user only; duplicate active follow → **400**; re-follow after unfollow reactivates row |
| **Deleted post** | Does not accept comments/reactions; private/deleted post rules apply to hashtag lists |
| **Counters** | `comment_count` and `reaction_count` are updated in service |
| **Not found** | `"Post not found."`, `"Media not found."`, `"Post media not found."`, `"Comment not found."`, `"Reaction not found."`, `"Hashtag not found."`, `"Post hashtag not found."`, `"Hashtag follow not found."` → **404** at facade |
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

### Comments

| Method | Path |
|--------|------|
| POST | `/api/content/posts/{postId}/comments` |
| GET | `/api/content/posts/{postId}/comments` |
| PATCH | `/api/content/me/comments/{commentId}` |
| DELETE | `/api/content/me/comments/{commentId}` |

### Reactions

| Method | Path |
|--------|------|
| PUT | `/api/content/posts/{postId}/reactions` |
| DELETE | `/api/content/posts/{postId}/reactions` |
| GET | `/api/content/posts/{postId}/reactions/me` |
| GET | `/api/content/posts/{postId}/reactions` |

### Hashtags

| Method | Path |
|--------|------|
| POST | `/api/content/hashtags` |
| GET | `/api/content/hashtags/{hashtagId}` |

### Post hashtags

| Method | Path |
|--------|------|
| POST | `/api/content/me/posts/{postId}/hashtags` |
| GET | `/api/content/posts/{postId}/hashtags` |
| DELETE | `/api/content/me/posts/{postId}/hashtags/{hashtagId}` |

### User hashtag follows

| Method | Path |
|--------|------|
| POST | `/api/content/me/hashtags/{hashtagId}/follow` |
| DELETE | `/api/content/me/hashtags/{hashtagId}/follow` |
| GET | `/api/content/me/hashtags/following` |

### Request bodies (facade)

| Operation | Body fields |
|-----------|-------------|
| Create post | `content`, optional `visibility`, optional `mediaIds` |
| Update post | `content`, `visibility` |
| Create media | `url`, `type` |
| Attach post media | `mediaId` only |
| Create comment | `content`, optional `parentCommentId` |
| Update comment | `content` |
| Upsert reaction | `reactionType` |
| Create hashtag | `name` only |
| Attach post hashtag | `hashtagId` only |

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

- Saved posts, reposts, post views, mentions
- **`group_posts`** — deferred until Content + Network integration
- Public (unauthenticated) content endpoints
- Media file upload / blob storage (URL-only v1)
- Cross-module validation that users exist in Identity
- HTTP microservice deployment (in-process `IContentClient` only)

## Related docs

- [Facade.API README](../Facade.API/README.md) — host routes overview
- [Network module README](../Network/README.md) — `group_posts` dependency on `posts.post_id`
- [DB_SCHEMA.md](../../docs/database/DB_SCHEMA.md) — database design (`content` section)
