# Content Module

Core module of the LinkedIn Clone **modular monolith**, **prepared for microservices** (.NET 8, `TargetFramework net8.0`). It owns posts and media metadata in PostgreSQL schema **`content`** and is consumed by the **ContentManagement** facade at `/api/content`.

The module is **not** deployed as a separate microservice today. Boundaries are enforced via projects, contracts, and `IContentClient` — the same seam can later be replaced with HTTP clients without changing the facade surface.

**Status (v4 + group_posts integration):** Schema **`content`** implements **`posts`**, **`media`**, **`post_media`**, **`comments`**, **`reactions`**, **`hashtags`**, **`post_hashtags`**, **`user_hashtag_follows`**, **`saved_posts`**, **`reposts`**, **`post_views`**, and **`mentions`** from `DB_SCHEMA.md`. `group_posts` is implemented as a separate **Network + Content** phase in schema `network`.

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
| `Content.Services` | Business logic (12 domain services) |
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
| **SavedPost** | `saved_posts` | User saved post; soft unsave via `unsaved_at` |
| **Repost** | `reposts` | User repost of original post; soft remove via `removed_at` |
| **PostView** | `post_views` | Append-only post view event log |
| **Mention** | `mentions` | User mention in post; soft delete via `deleted_at` |

### `posts`

- Columns include `content`, `visibility`, `reaction_count`, `comment_count`, `repost_count`, `created_at`, `edited_at`, `deleted_at`.
- **Visibility v1:** `public` (default if omitted/empty) or `private`.
- **Private post:** visible only to the author (`user_id`).
- **Public post:** any authenticated user may read (`GET /api/content/posts/{postId}`).
- **Delete:** soft delete — sets `deleted_at = UtcNow` (row retained).
- **Update:** author only; sets `edited_at`.
- **Create:** optional `mediaIds` — all must exist in `media` or `"Media not found."` → **404** at facade.
- `reaction_count` and `comment_count` are updated in service (v2); `repost_count` is updated in service on repost/unrepost (v4).

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

### `saved_posts`

- **Save / unsave:** current JWT user only.
- Post must exist, not deleted, and be visible (private → author only).
- Active save: `unsaved_at == null`.
- Duplicate active save → **400** (`"Post already saved."`).
- Re-save after unsave reactivates row (`unsaved_at = null`, `saved_at = UtcNow`).

### `reposts`

- **Repost / unrepost:** current JWT user only; cannot repost own post → **400** (`"Cannot repost your own post."`).
- Active repost: `removed_at == null`.
- Duplicate active repost → **400** (`"Post already reposted."`).
- Re-repost after remove reactivates row and increments `posts.repost_count`.
- Unrepost sets `removed_at` and decrements `repost_count` (not below 0).

### `post_views`

- **Record:** append-only; JWT user only; post must be visible.
- `viewer_ip` from facade (`HttpContext`); empty → `"unknown"`.
- `viewer_user_agent` and optional `source` from facade.
- No `view_count` column on `posts`.
- **List:** post author only; last 100 views, `viewed_at` desc.

### `mentions`

- **Add / remove:** post author only (`authorId` from JWT).
- Self-mention → **400** (`"Cannot mention yourself."`).
- Active mention: `deleted_at == null`.
- Duplicate active mention → **400** (`"Mention already exists."`).
- Re-add after soft delete reactivates row.

### Cross-module integration (Network + Content)

| Feature | Reason |
|---------|--------|
| **`group_posts`** | Implemented in **Network** (`network.group_posts`, migration `AddNetworkGroupPosts`). `Facade.NetworkManagement` validates post ownership via `IContentClient.Posts.GetByIdAsync`; Content core itself stays decoupled from Network data access. |

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
| `SavedPostService` | `SavedPostResource` | Save / unsave / list my saved posts |
| `RepostService` | `RepostResource` | Repost / unrepost / list my reposts / list by post |
| `PostViewService` | `PostViewResource` | Record view / list views (author only) |
| `MentionService` | `MentionResource` | Add / remove / list mentions |

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
| `SavedPosts` | `ISavedPostResource` |
| `Reposts` | `IRepostResource` |
| `PostViews` | `IPostViewResource` |
| `Mentions` | `IMentionResource` |

Registered in `Content.DI` via `AddContentModule`.

## Migrations

| Migration | Description |
|-----------|-------------|
| `AddContentModule` | Schema `content`, tables `posts`, `media`, `post_media` |
| `AddContentCommentsAndReactions` | Tables `comments`, `reactions` |
| `AddContentHashtagsAndFollows` | Tables `hashtags`, `post_hashtags`, `user_hashtag_follows` |
| `AddContentSavedRepostsViewsMentions` | Tables `saved_posts`, `reposts`, `post_views`, `mentions` |

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
| **Saved posts** | Save/unsave JWT user only; duplicate active save → **400**; re-save reactivates row |
| **Reposts** | Repost/unrepost JWT user only; cannot repost own post; duplicate active repost → **400**; `repost_count` updated in service |
| **Post views** | Append-only record; IP/User-Agent from facade; list views author-only (last 100) |
| **Mentions** | Add/remove author only; self-mention → **400**; duplicate active mention → **400** |
| **Deleted post** | Does not accept save/repost/view/mention add; private/deleted rules apply to lists |
| **Counters** | `comment_count`, `reaction_count`, and `repost_count` are updated in service |
| **Not found** | `"Post not found."`, `"Media not found."`, `"Post media not found."`, `"Comment not found."`, `"Reaction not found."`, `"Hashtag not found."`, `"Post hashtag not found."`, `"Hashtag follow not found."`, `"Saved post not found."`, `"Repost not found."`, `"Mention not found."` → **404** at facade |
| Other business errors | **400** at facade |
| Target user existence | **Not** validated (no call to Identity/Profile) |
| **`group_posts`** | Implemented in Network schema; Content participates through facade orchestration only (`IContentClient` post checks) |

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

### Saved posts

| Method | Path |
|--------|------|
| POST | `/api/content/me/posts/{postId}/save` |
| DELETE | `/api/content/me/posts/{postId}/save` |
| GET | `/api/content/me/saved-posts` |

### Reposts

| Method | Path |
|--------|------|
| POST | `/api/content/me/posts/{postId}/repost` |
| DELETE | `/api/content/me/posts/{postId}/repost` |
| GET | `/api/content/me/reposts` |
| GET | `/api/content/posts/{postId}/reposts` |

### Post views

| Method | Path |
|--------|------|
| POST | `/api/content/posts/{postId}/views` |
| GET | `/api/content/me/posts/{postId}/views` |

### Mentions

| Method | Path |
|--------|------|
| POST | `/api/content/me/posts/{postId}/mentions` |
| DELETE | `/api/content/me/posts/{postId}/mentions/{mentionedUserId}` |
| GET | `/api/content/posts/{postId}/mentions` |

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
| Add mention | `mentionedUserId` only |

Post views: optional query `?source=`; no body. IP and User-Agent are taken from `HttpContext` at facade.

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

- Direct writes to `network.group_posts` from Content core (managed by Network core + `Facade.NetworkManagement` orchestration)
- Public (unauthenticated) content endpoints
- Media file upload / blob storage (URL-only v1)
- Cross-module validation that users exist in Identity
- HTTP microservice deployment (in-process `IContentClient` only)

## Related docs

- [Facade.API README](../Facade.API/README.md) — host routes overview
- [Network module README](../Network/README.md) — `group_posts` dependency on `posts.post_id`
- [DB_SCHEMA.md](../../docs/database/DB_SCHEMA.md) — database design (`content` section)
