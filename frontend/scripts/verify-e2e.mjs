/**
 * Stage 8 — automated API smoke test (no backend changes).
 * Run: npm run verify:e2e
 * Requires backend at http://localhost:5282
 */

const API = process.env.VITE_API_BASE_URL || "http://localhost:5282";
const FRONTEND = process.env.VITE_VERIFY_FRONTEND || "http://localhost:5173";

const ADMIN = { email: "admin@local.dev", password: "Admin123!" };
const USER = { email: "andrii.rotar@gmail.com", password: "LinkUpDemo2024!" };

const results = [];

function pass(name, detail = "") {
  results.push({ name, ok: true, detail });
  console.log(`✅ PASS  ${name}${detail ? ` — ${detail}` : ""}`);
}

function fail(name, detail = "") {
  results.push({ name, ok: false, detail });
  console.error(`❌ FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

function skip(name, detail = "") {
  results.push({ name, ok: true, skipped: true, detail });
  console.log(`⏭️  SKIP  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function jsonFetch(path, { method = "GET", token, body } = {}) {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

async function login(creds) {
  const res = await jsonFetch("/api/auth/login", {
    method: "POST",
    body: { email: creds.email, password: creds.password },
  });
  const token = res.data?.token?.accessToken;
  if (!res.ok || !token) throw new Error(`login failed (${res.status})`);
  return token;
}

async function main() {
  console.log(`\nLinkedInDiplom E2E smoke — API ${API}, SPA ${FRONTEND}\n`);

  // Frontend up
  try {
    const spa = await fetch(FRONTEND, { method: "GET" });
    if (spa.ok) pass("Frontend reachable", FRONTEND);
    else fail("Frontend reachable", `HTTP ${spa.status}`);
  } catch (e) {
    fail("Frontend reachable", e.message);
  }

  // Backend swagger/health
  try {
    const sw = await fetch(`${API}/swagger/index.html`, { method: "GET" });
    if (sw.ok) pass("Backend reachable", API);
    else fail("Backend reachable", `HTTP ${sw.status}`);
  } catch (e) {
    fail("Backend reachable", e.message);
    console.log("\nStart backend first, then re-run: npm run verify:e2e\n");
    process.exit(1);
  }

  let adminToken;
  let userToken;

  try {
    adminToken = await login(ADMIN);
    pass("Auth — admin login");
  } catch (e) {
    fail("Auth — admin login", e.message);
  }

  try {
    userToken = await login(USER);
    pass("Auth — user login (andrii)");
  } catch (e) {
    fail("Auth — user login (andrii)", e.message);
  }

  if (userToken) {
    const forbidden = await jsonFetch("/api/admin/stats/overview", { token: userToken });
    if (forbidden.status === 403) pass("Admin guard — non-admin gets 403");
    else fail("Admin guard — non-admin gets 403", `got ${forbidden.status}`);
  }

  if (adminToken) {
    const stats = await jsonFetch("/api/admin/stats/overview", { token: adminToken });
    if (stats.ok && stats.data?.activeUsers != null) {
      pass("Admin — stats overview", `users=${stats.data.activeUsers}`);
    } else fail("Admin — stats overview", `HTTP ${stats.status}`);

    const roles = await jsonFetch("/api/admin/roles", { token: adminToken });
    if (roles.ok) pass("Admin — roles list");
    else fail("Admin — roles list", `HTTP ${roles.status}`);
  }

  if (userToken) {
    const profile = await jsonFetch("/api/profile/me", { token: userToken });
    if (profile.ok) pass("Profile — GET /api/profile/me");
    else fail("Profile — GET /api/profile/me", `HTTP ${profile.status}`);

    const feed = await jsonFetch("/api/content/feed?page=1&pageSize=5", { token: userToken });
    if (feed.ok) {
      const count = feed.data?.items?.length ?? feed.data?.Items?.length ?? 0;
      pass("Feed — GET /api/content/feed", `${count} items`);
    } else fail("Feed — GET /api/content/feed", `HTTP ${feed.status}`);

    const postRes = await jsonFetch("/api/content/me/posts", {
      method: "POST",
      token: userToken,
      body: { content: `e2e-verify-${Date.now()}` },
    });
    const createdPost = postRes.data?.post ?? postRes.data?.Post ?? postRes.data;
    const postId =
      createdPost?.id ??
      createdPost?.Id ??
      postRes.data?.id ??
      postRes.data?.Id ??
      postRes.data?.postId;
    if (postRes.ok && postId) {
      pass("Feed — create post", postId);
      const del = await jsonFetch(`/api/content/me/posts/${postId}`, { method: "DELETE", token: userToken });
      if (!del.ok) fail("Feed — cleanup test post", `HTTP ${del.status}`);
    } else if (postRes.ok) {
      pass("Feed — create post", "created (no id in response)");
      fail("Feed — cleanup test post", "missing post id");
    } else {
      fail("Feed — create post", `HTTP ${postRes.status}`);
    }

    // Remove leftover e2e-verify posts from earlier failed cleanups.
    const myPosts = await jsonFetch("/api/content/me/posts?page=1&pageSize=50", { token: userToken });
    const stale = (myPosts.data?.items ?? myPosts.data?.Items ?? []).filter((item) =>
      String(item.content ?? item.Content ?? "").includes("e2e-verify"),
    );
    for (const item of stale) {
      const id = item.id ?? item.Id;
      if (!id) continue;
      await jsonFetch(`/api/content/me/posts/${id}`, { method: "DELETE", token: userToken });
    }
    if (stale.length) pass("Feed — stale e2e posts cleaned", String(stale.length));

    const contacts = await jsonFetch(
      "/api/network/me/contacts/pending-counts",
      { token: userToken },
    );
    const incoming = await jsonFetch("/api/network/me/contacts/incoming?page=1&pageSize=5", {
      token: userToken,
    });
    if (contacts.ok && incoming.ok) {
      pass(
        "Network — contacts API",
        `incoming pending=${contacts.data?.incomingCount ?? 0}, list=${incoming.data?.totalCount ?? 0}`,
      );
    } else {
      fail("Network — contacts API", `counts=${contacts.status}, incoming=${incoming.status}`);
    }

    const jobs = await jsonFetch(
      "/api/jobs/vacancies?page=1&pageSize=5&sortBy=createdAt&sortDirection=desc",
      { token: userToken },
    );
    if (jobs.ok) {
      const n = jobs.data?.totalCount ?? jobs.data?.items?.length ?? 0;
      pass("Jobs — vacancies list", `total=${n}`);
    } else fail("Jobs — vacancies list", `HTTP ${jobs.status}`);

    const events = await jsonFetch("/api/events?page=1&pageSize=5", { token: userToken });
    if (events.ok) {
      const n = events.data?.totalCount ?? events.data?.items?.length ?? 0;
      pass("Events — discover", `total=${n}`);
    } else fail("Events — discover", `HTTP ${events.status}`);

    const chats = await jsonFetch("/api/messaging/me/chats?page=1&pageSize=5", { token: userToken });
    if (chats.ok) pass("Chat — list chats");
    else fail("Chat — list chats", `HTTP ${chats.status}`);

    const notif = await jsonFetch("/api/notifications/me?limit=10", { token: userToken });
    if (notif.ok) {
      const items = notif.data?.items ?? notif.data ?? [];
      const list = Array.isArray(items) ? items : [];
      const unread = list.filter((n) => !n.isRead);
      pass("Notifications — GET list", `${list.length} total, ${unread.length} unread`);

      if (unread.length > 0) {
        const id = unread[0].id;
        const mark = await jsonFetch(`/api/notifications/me/${id}/read`, {
          method: "PATCH",
          token: userToken,
        });
        if (mark.ok) pass("Notifications — mark one read", id);
        else fail("Notifications — mark one read", `HTTP ${mark.status}`);
      } else {
        skip("Notifications — mark one read", "no unread items (UI still OK)");
      }

      const markAll = await jsonFetch("/api/notifications/me/read-all", {
        method: "PATCH",
        token: userToken,
      });
      if (markAll.ok) pass("Notifications — mark all read");
      else fail("Notifications — mark all read", `HTTP ${markAll.status}`);
    } else {
      fail("Notifications — GET list", `HTTP ${notif.status}`);
    }
  }

  const failed = results.filter((r) => !r.ok);
  console.log("\n" + "—".repeat(50));
  console.log(`Results: ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log("\nFailed:");
    failed.forEach((r) => console.log(`  • ${r.name}: ${r.detail}`));
    console.log(`\nOpen manual checklist: ${FRONTEND}/verify.html\n`);
    process.exit(1);
  }

  console.log(`\nAll API checks passed.`);
  console.log(`Manual UI checklist: ${FRONTEND}/verify.html\n`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
