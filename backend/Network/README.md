# Network Module

Core module of the LinkedIn Clone **modular monolith** (.NET 8, `TargetFramework net8.0`). It owns social-graph data in PostgreSQL schema **`network`** and is consumed by the **NetworkManagement** facade at `/api/network`.

The module is **not** deployed as a separate microservice today. Boundaries are enforced via projects, contracts, and `INetworkClient` — the same seam can later be replaced with HTTP clients without changing the facade surface.

**Status (v1):** Schema **`network`** implements **`contacts`**, **`follows`**, and **`blocked_users`** from `DB_SCHEMA.md` (social graph section). Groups, pages, and other network tables are **not** implemented in v1.

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
| `Network.Services` | Business logic (`ContactService`, `FollowService`, `BlockedUserService`) |
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

All tables store user ids as **string** (Identity user id) **without** an EF relationship to `AspNetUsers`. The Network module does **not** reference Identity or Profile projects in v1 (no existence check for target users).

| Entity | Table | Purpose |
|--------|-------|---------|
| **Contact** | `contacts` | Directed contact request (requester → receiver); status lifecycle |
| **Follow** | `follows` | One user follows another; soft unfollow via `unfollowed_at` |
| **BlockedUser** | `blocked_users` | User blocks another; soft unblock via `unblocked_at` |

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

## Migrations

| Migration | Description |
|-----------|-------------|
| `AddNetworkModule` | Schema `network`, tables `contacts`, `follows`, `blocked_users` |

Applied at startup from `Facade.API` (`NetworkDbContext`). History table: `network.__EFMigrationsHistory`.

## Security and business rules

| Rule | Behavior |
|------|----------|
| All `/api/network/*` routes | **JWT required** — no public endpoints in v1 |
| Current user id | Taken **only from JWT** (`ClaimTypes.NameIdentifier` or `sub`) in `NetworkController` — never from request body |
| Request bodies | `SendContactRequest`: `receiverId` only; `FollowUserRequest`: `followingId` only; `BlockUserRequest`: `blockedUserId` only |
| Self-action | Cannot contact, follow, or block **yourself** → **400** |
| Block vs contact/follow | Active block in **either direction** prevents new contact requests and follows → **400** |
| Duplicate active contact | Same directed pair `pending` or `accepted`, or reverse `pending` → **400** |
| Duplicate active follow / block | Already following or already blocked (active row) → **400** |
| Not owner / not participant | Contact, follow, or block row not visible to current user → **404** (`"Contact not found."`, `"Follow not found."`, `"Block not found."`) |
| Unfollow / unblock | Does **not** delete the row; sets `unfollowed_at` / `unblocked_at` |
| Target user existence | **Not** validated in v1 (no call to Identity/Profile) |

## API endpoints (Facade)

Base route: **`/api/network`**

### Contacts

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/network/me/contacts` | Send contact request (`receiverId` in body) |
| GET | `/api/network/me/contacts` | List contacts where current user is requester or receiver |
| GET | `/api/network/me/contacts/{contactId}` | Get one contact (participant only) |
| PATCH | `/api/network/me/contacts/{contactId}/accept` | Accept pending request (receiver only) |
| PATCH | `/api/network/me/contacts/{contactId}/reject` | Reject pending request (receiver only) |
| DELETE | `/api/network/me/contacts/{contactId}` | Cancel if `pending` (requester); remove connection if `accepted` (either party) |

### Follows

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/network/me/following` | Follow user (`followingId` in body) |
| DELETE | `/api/network/me/following/{followingId}` | Unfollow (sets `unfollowed_at`) |
| GET | `/api/network/me/following` | Active following list (`unfollowed_at` is null) |
| GET | `/api/network/me/followers` | Active followers list (`unfollowed_at` is null) |

### Blocked users

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/network/me/blocked-users` | Block user (`blockedUserId` in body) |
| DELETE | `/api/network/me/blocked-users/{blockedUserId}` | Unblock (sets `unblocked_at`) |
| GET | `/api/network/me/blocked-users` | Active blocks list (`unblocked_at` is null) |

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

## Out of scope (v1)

- Groups, pages, connection suggestions
- Public (unauthenticated) network endpoints
- Cross-module validation that target users exist in Identity
- HTTP microservice deployment (in-process `INetworkClient` only)

## Related docs

- [Facade.API README](../Facade.API/README.md) — host routes overview
- [DB_SCHEMA.md](../../docs/database/DB_SCHEMA.md) — database design (`network` section)
