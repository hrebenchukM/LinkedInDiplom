/**
 * Dev/demo-only in-browser auth shim. Loaded only when VITE_USE_MOCK_AUTH=true (see authApi.js).
 * Production builds alias this module to mockAuthApi.stub.js (see vite.config.js).
 */
import { AUTH } from "../../shared/api/paths";
import { USE_MOCK_AUTH } from "../../shared/config/features";

const MOCK_USERS_KEY = "mockAuthUsers";

function readMockUsers() {
  try {
    const users = JSON.parse(window.localStorage.getItem(MOCK_USERS_KEY) || "[]");
    return Array.isArray(users) ? users : [];
  } catch {
    return [];
  }
}

function writeMockUsers(users) {
  try {
    window.localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function mockAuthFetch(method, path, body) {
  if (!USE_MOCK_AUTH) {
    return { ok: false, status: 503, data: { message: "Mock auth is disabled." } };
  }

  await wait(200);
  const users = readMockUsers();

  if (method === "POST" && path === AUTH.register) {
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const userName = String(body?.userName || "").trim();
    const firstName = String(body?.firstName || "").trim();
    const lastName = String(body?.lastName || "").trim();

    if (!email || !password) {
      return { ok: false, status: 400, data: { errors: ["Email and password are required."] } };
    }
    if (users.some((user) => user.email === email)) {
      return { ok: false, status: 400, data: { errors: ["User already exists."] } };
    }
    const user = {
      id: String(Date.now()),
      email,
      userName: userName || email.split("@")[0],
      firstName,
      lastName,
      password,
    };
    users.push(user);
    writeMockUsers(users);
    return { ok: true, status: 200, data: { success: true, account: { id: user.id, email: user.email } } };
  }

  if (method === "POST" && path === AUTH.login) {
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) {
      return { ok: false, status: 401, data: { errors: ["Invalid email or password."] } };
    }
    return {
      ok: true,
      status: 200,
      data: {
        success: true,
        account: user,
        token: { accessToken: `mock-access-${user.id}`, refreshToken: `mock-refresh-${user.id}` },
      },
    };
  }

  if (method === "GET" && path === AUTH.me) {
    const token = window.localStorage.getItem("authAccessToken") || "";
    const id = token.replace("mock-access-", "");
    const user = users.find((item) => String(item.id) === id);
    if (!user) {
      return { ok: false, status: 401, data: { errors: ["Unauthorized"] } };
    }
    return { ok: true, status: 200, data: { id: user.id, email: user.email } };
  }

  if (method === "POST" && (path === AUTH.logout || path === AUTH.refresh)) {
    return { ok: true, status: 200, data: { success: true } };
  }

  return { ok: false, status: 404, data: { message: "Mock endpoint not found." } };
}
