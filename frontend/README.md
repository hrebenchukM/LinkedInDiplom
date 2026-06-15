# LinkedIn Diplom — Frontend

React + Vite SPA for the .NET backend (`https://localhost:7011` by default).

## Setup

```bash
npm install
```

Copy environment variables into **`frontend/.env.local`** (next to `package.json`):

```bash
cp .env.example .env.local
```

Vite loads `.env.local` automatically in dev/build. **`.env.example` is not loaded** — it is documentation only.

Edit `.env.local` if your API or SignalR hub runs on a different host/port. Restart `npm run dev` after changing env files.

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

## Environment variables

See `.env.example`:

- `VITE_API_BASE_URL` — REST API base URL
- `VITE_SIGNALR_HUB_URL` — messaging hub URL
- `VITE_UPLOADS_BASE_URL` — optional uploads CDN/base path
- `VITE_DEFAULT_PAGE_SIZE` — default list page size
- `VITE_TOKEN_REFRESH_MARGIN_MS` — access token refresh margin
