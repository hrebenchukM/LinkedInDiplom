# Demo social login (diploma / local demo)

Frontend supports three social sign-in paths on **AuthPage** (`/auth`). No backend changes required.

## Priority order

1. **Mock auth** (`VITE_USE_MOCK_AUTH=true`) — offline tokens in browser, no API.
2. **Real OAuth SDK** — Google/Facebook SDK → `POST /api/auth/google|facebook`.
3. **Demo fallback** — preset accounts via email/password on real API (default in dev).

## Demo fallback (recommended for defense)

When OAuth client IDs are **not** configured, dev builds use preset accounts:

| Provider | Email | Password (default) |
|----------|-------|--------------------|
| Google | `andrii.rotar@gmail.com` | `LinkUpDemo2024!` |
| Facebook | `timur.yamchuk@facebook.com` | `LinkUpDemo2024!` |

Override password: `VITE_DEMO_SOCIAL_PASSWORD` in `.env.local`.

### Enable / disable

```env
# Dev — on by default; set false to disable demo fallback
VITE_ENABLE_DEMO_SOCIAL_FALLBACK=false

# Production — off unless explicitly enabled at build time
VITE_ENABLE_DEMO_SOCIAL_FALLBACK=true
```

### Flow

1. User clicks **Continue with Google** or **Facebook**.
2. Frontend calls `apiDemoSocialLogin()` (`features/auth/socialAuth.js`).
3. Tries `loginWithPassword` for preset email; if user missing, `registerAndLogin`.
4. JWT stored; user lands on `/home` with profile avatar from public assets.

## Real OAuth (optional)

Set in `.env.local` before `npm run dev`:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=your-facebook-app-id
```

Backend endpoints (already implemented):

- `POST /api/auth/google` — body `{ "providerToken": "<id_token>" }`
- `POST /api/auth/facebook` — body `{ "providerToken": "<access_token>" }`

## Manual check

1. Start backend + frontend (mock auth **off**).
2. Open `/auth` — do **not** set `VITE_GOOGLE_CLIENT_ID`.
3. Click **Google** — should sign in as Andrii Rotar without OAuth popup.
4. Logout → click **Facebook** — should sign in as Timur Yamchuk.
