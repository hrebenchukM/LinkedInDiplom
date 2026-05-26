# Network Module

Core module of the LinkedIn Clone **modular monolith**, **prepared for microservices** (.NET 8, `TargetFramework net8.0`). It owns social-graph data in PostgreSQL schema **`network`** and is consumed by the **NetworkManagement** facade at `/api/network`.

The module is **not** deployed as a separate microservice today. Boundaries are enforced via projects, contracts, and `INetworkClient` — the same seam can later be replaced with HTTP clients without changing the facade surface.

**Status (v1 + v2 + v3):** Schema **`network`** implements the social graph tables from `DB_SCHEMA.md` in scope: **`contacts`**, **`follows`**, **`blocked_users`**, **`user_groups`**, **`group_members`**, **`pages`**, **`page_admins`**, **`page_followers`**.

## Architecture

```
HTTP Client
    ↓
Facade.API
    ↓
Facade.NetworkManagement (BFF)
    NetworkController  →  /api/network/*
    NetworkManagementService
    ↓
INetworkClient (in-process)
    ↓
Network.Client (Resources)
    ↓
Network.Services
    ↓
Network.DataAccess (NetworkDbContext)
    ↓
PostgreSQL  schema: network
```

### Core projects

| Project | Role |
|---------|------|
| `Network.Contracts` | DTOs, parameters, results, service interfaces |
| `Network.DataAccess` | Entities, EF Core, migrations |
| `Network.Services` | Business logic (8 domain services) |
| `Network.Client.Contracts` | `INetworkClient`, `I*Resource` |
| `Network.Client` | Resource implementations (delegate to services) |
| `Network.DI` | `AddNetworkModule` registration |

### Facade layer (`backend/NetworkManagement/`)

| Project | Role |
|---------|------|
| `Facade.NetworkManagement.Contracts` | Facade DTOs, requests, responses |
| `Facade.NetworkManagement.Services` | Maps facade ↔ `INetworkClient` |
| `Facade.NetworkManagement.Controllers` | `NetworkController` |
| `Facade.NetworkManagement.DI` | `AddNetworkManagementFacade` |

## Implemented tables (schema `network`)

All tables store user ids as **string** (Identity user id) **without** an EF relationship to `AspNetUsers`. The Network module does **not** reference Identity or Profile projects (no existence check for target users).

| Entity | Table | Purpose |
|--------|-------|---------|
| **Contact** | `contacts` | Directed contact request (requester → receiver); status lifecycle |
| **Follow** | `follows` | One user follows another; soft unfollow via `unfollowed_at` |
| **BlockedUser** | `blocked_users` | User blocks another; soft unblock via `unblocked_at` |
| **UserGroup** | `user_groups` | User-owned group; soft delete via `deleted_at` |
| **GroupMember** | `group_members` | Group membership with role; soft leave via `deleted_at` |
| **Page** | `pages` | User-owned page; soft delete via `deleted_at` |
| **PageAdmin** | `page_admins` | Page administrator; revoke via `revoked_at` |
| **PageFollower** | `page_followers` | Page subscription; soft unfollow via `unfollowed_at` |

### Deferred (not in Network module yet)

| Table | Reason |
|-------|--------|
| **`group_posts`** | Depends on **`posts.post_id`** from the future **Content/Posts** module. Will link `user_groups` ↔ `posts` when Posts exists. Documented in [DB_SCHEMA.md](../../docs/database/DB_SCHEMA.md) only. |

### `contacts`

- Unique pair `(requester_id, receiver_id)`.
- Status values: `pending`, `accepted`, `rejected`, `cancelled`.
- **Send:** creates `pending` with `requested_at = UtcNow`.
- **Accept / reject:** receiver only, `pending` only.
- **Cancel:** requester only, `pending` only (facade maps to `DELETE` when status is `pending`).
- **Remove:** either party when `accepted` (facade maps to `DELETE` when status is `accepted`).
- Re-send after `rejected` / `cancelled` reactivates the same row to `pending`.

### `follows`

- Unique pair `(follower_id, following_id)`.
- Active follow: `unfollowed_at IS NULL`.
- **Unfollow** sets `unfollowed_at = UtcNow` (row retained).
- Re-follow after unfollow reactivates the row (`unfollowed_at = null`, new `followed_at`).

### `blocked_users`

- Unique pair `(user_id, blocked_user_id)`.
- Active block: `unblocked_at IS NULL`.
- **Unblock** sets `unblocked_at = UtcNow` (row retained).
- Re-block after unblock reactivates the row (`unblocked_at = null`, new `blocked_at`).

### `user_groups` / `group_members`

- **Create group:** inserts `user_groups` row and `group_members` row for owner with `role = owner`.
- **Get my groups:** groups where current user is an active member (`deleted_at IS NULL` on member and group).
- **Update / delete group:** owner only (`owner_id` from JWT).
- **Delete group:** soft-deletes group (`deleted_at`) and all active members.
- **Join / leave:** member soft-leave via `deleted_at`; **owner cannot leave**.
- **Members list:** only for active members of a non-deleted group (unauthorized → empty list).

### `pages` / `page_admins` / `page_followers`

- **Create page:** inserts `pages` row and `page_admins` row for owner with `role = owner`.
- **Get my pages:** pages owned by current user (`owner_id`, not deleted).
- **Get page by id:** owner, active admin, or active follower may read.
- **Update / delete page:** owner only.
- **Delete page:** soft-deletes page; revokes active admins (`revoked_at`) and unfollows active followers (`unfollowed_at`).
- **Add / remove admin:** owner only; cannot add page owner as admin again; cannot remove owner admin row.
- **Follow / unfollow page:** `followed_at` / `unfollowed_at` (row retained); re-follow reactivates.
- **My followed pages:** pages with active follow for current user.
- **Page followers list:** owner or active admin only (unauthorized → empty list).

## Services and resources

| Service | Resource | Domain |
|---------|----------|--------|
| `ContactService` | `ContactResource` | Contacts |
| `FollowService` | `FollowResource` | User follows |
| `BlockedUserService` | `BlockedUserResource` | Blocked users |
| `UserGroupService` | `UserGroupResource` | Groups |
| `GroupMemberService` | `GroupMemberResource` | Group membership |
| `PageService` | `PageResource` | Pages |
| `PageAdminService` | `PageAdminResource` | Page admins |
| `PageFollowerService` | `PageFollowerResource` | Page followers |

Resources delegate to services only (no business logic in the client layer).

### `INetworkClient`

In-process entry point for facades and other modules:

| Property | Resource |
|----------|----------|
| `Contacts` | `IContactResource` |
| `Follows` | `IFollowResource` |
| `BlockedUsers` | `IBlockedUserResource` |
| `UserGroups` | `IUserGroupResource` |
| `GroupMembers` | `IGroupMemberResource` |
| `Pages` | `IPageResource` |
| `PageAdmins` | `IPageAdminResource` |
| `PageFollowers` | `IPageFollowerResource` |

Registered in `Network.DI` via `AddNetworkModule`.

## Migrations

| Migration | Description |
|-----------|-------------|
| `AddNetworkModule` | Schema `network`, tables `contacts`, `follows`, `blocked_users` |
| `AddNetworkGroups` | Tables `user_groups`, `group_members` |
| `AddNetworkPages` | Tables `pages`, `page_admins`, `page_followers` |

Applied at startup from `Facade.API` (`NetworkDbContext`). History table: `network.__EFMigrationsHistory`.

## Security and business rules

| Rule | Behavior |
|------|----------|
| All `/api/network/*` routes | **JWT required** — no public endpoints |
| Current user id | Taken **only from JWT** (`ClaimTypes.NameIdentifier` or `sub`) in `NetworkController` — never from request body |
| Request bodies | Must **not** contain `currentUserId`, `requesterId`, `followerId`, or `ownerId`. Bodies carry **target** ids only where needed (`receiverId`, `followingId`, `blockedUserId`, group/page fields, `userId` for new page admin, etc.) |
| Self-action | Cannot contact, follow, or block **yourself** → **400** |
| Block vs contact/follow | Active block in **either direction** prevents new contact requests and follows → **400** |
| Duplicate active contact / follow / block | Same active relationship → **400** |
| Foreign / not allowed rows | Contact, follow, block, group, page, admin, or follow row not visible or not allowed → **404** (e.g. `"Contact not found."`, `"Follow not found."`, `"Block not found."`, `"Group not found."`, `"Page not found."`, `"Page admin not found."`, `"Page follow not found."`) |
| Unfollow / unblock | Does **not** delete the row; sets `unfollowed_at` / `unblocked_at` |
| Group owner | Created as `group_member` with `role = owner`; **cannot leave** group |
| Delete group | Soft-deletes group and all active members |
| Page owner | Created as `page_admin` with `role = owner` |
| Update / delete page | **Owner only** |
| Add / remove page admin | **Owner only** |
| Page follow / unfollow | Via `followed_at` / `unfollowed_at` on `page_followers` |
| `group_posts` | **Not implemented** until Content/Posts module |
| Target user existence | **Not** validated (no call to Identity/Profile) |

## API endpoints (Facade)

Base route: **`/api/network`**. All routes require JWT.

### Contacts

| Method | Path |
|--------|------|
| POST | `/api/network/me/contacts` |
| GET | `/api/network/me/contacts` |
| GET | `/api/network/me/contacts/{contactId}` |
| PATCH | `/api/network/me/contacts/{contactId}/accept` |
| PATCH | `/api/network/me/contacts/{contactId}/reject` |
| DELETE | `/api/network/me/contacts/{contactId}` |

### Follows

| Method | Path |
|--------|------|
| POST | `/api/network/me/following` |
| DELETE | `/api/network/me/following/{followingId}` |
| GET | `/api/network/me/following` |
| GET | `/api/network/me/followers` |

### Blocked users

| Method | Path |
|--------|------|
| POST | `/api/network/me/blocked-users` |
| DELETE | `/api/network/me/blocked-users/{blockedUserId}` |
| GET | `/api/network/me/blocked-users` |

### Groups

| Method | Path |
|--------|------|
| POST | `/api/network/me/groups` |
| GET | `/api/network/me/groups` |
| GET | `/api/network/me/groups/{groupId}` |
| PATCH | `/api/network/me/groups/{groupId}` |
| DELETE | `/api/network/me/groups/{groupId}` |
| POST | `/api/network/me/groups/{groupId}/join` |
| DELETE | `/api/network/me/groups/{groupId}/membership` |
| GET | `/api/network/me/groups/{groupId}/members` |

### Pages

| Method | Path |
|--------|------|
| POST | `/api/network/me/pages` |
| GET | `/api/network/me/pages` |
| GET | `/api/network/me/pages/{pageId}` |
| PATCH | `/api/network/me/pages/{pageId}` |
| DELETE | `/api/network/me/pages/{pageId}` |
| POST | `/api/network/me/pages/{pageId}/admins` |
| DELETE | `/api/network/me/pages/{pageId}/admins/{adminUserId}` |
| GET | `/api/network/me/pages/{pageId}/admins` |
| POST | `/api/network/me/pages/{pageId}/follow` |
| DELETE | `/api/network/me/pages/{pageId}/follow` |
| GET | `/api/network/me/pages/following` |
| GET | `/api/network/me/pages/{pageId}/followers` |

## Host integration

Registered in `Facade.API`:

```csharp
builder.Services.AddNetworkModule(configuration, connectionString);
builder.Services.AddNetworkManagementFacade();

builder.Services.AddControllers()
    // ...
    .AddApplicationPart(typeof(NetworkController).Assembly);
```

Migrations: `NetworkDbContext` in `ApplyMigrationsAsync` (after Professional).

## Out of scope

- **`group_posts`** — deferred until Content/Posts module (`posts.post_id`)
- Public (unauthenticated) network endpoints
- Cross-module validation that target users exist in Identity
- HTTP microservice deployment (in-process `INetworkClient` only)
- Connection suggestions and feed/content features

## Related docs

- [Facade.API README](../Facade.API/README.md) — host routes overview
- [DB_SCHEMA.md](../../docs/database/DB_SCHEMA.md) — database design (`network` section)
