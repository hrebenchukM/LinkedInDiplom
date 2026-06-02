import { readJson, writeJson } from "./storage";

const PENDING_AI_WELCOME_KEY = "pendingAiWelcome";
const AI_WELCOME_DELIVERED_KEY = "aiWelcomeDeliveredUsers";

export function getAiWelcomeUserKey() {
  const session = readJson("authSession", {});
  const account = readJson("registeredAccount", {});
  const user = session?.user && typeof session.user === "object" ? session.user : null;
  const email = String(user?.email || session?.email || account?.email || "").trim();
  const userName = String(user?.userName || session?.userName || account?.userName || "").trim();
  const id = String(user?.id || session?.id || account?.id || "").trim();
  return (email || userName || id).toLowerCase();
}

export function markPendingAiWelcome(userKey = getAiWelcomeUserKey()) {
  const key = String(userKey || getAiWelcomeUserKey() || "")
    .trim()
    .toLowerCase();
  if (!key) return;

  const delivered = new Set(readJson(AI_WELCOME_DELIVERED_KEY, []));
  delivered.delete(key);
  writeJson(AI_WELCOME_DELIVERED_KEY, [...delivered]);
  writeJson(PENDING_AI_WELCOME_KEY, { userKey: key, createdAt: Date.now() });
}

export function shouldShowAiWelcome(userKey = getAiWelcomeUserKey()) {
  const key = String(userKey || "").trim().toLowerCase();
  if (!key) return false;

  const pending = readJson(PENDING_AI_WELCOME_KEY, null);
  if (!pending || pending.userKey !== key) return false;

  const delivered = new Set(readJson(AI_WELCOME_DELIVERED_KEY, []));
  return !delivered.has(key);
}

export function markAiWelcomeDelivered(userKey = getAiWelcomeUserKey()) {
  const key = String(userKey || "").trim().toLowerCase();
  if (!key) return;

  const delivered = new Set(readJson(AI_WELCOME_DELIVERED_KEY, []));
  delivered.add(key);
  writeJson(AI_WELCOME_DELIVERED_KEY, [...delivered]);
  writeJson(PENDING_AI_WELCOME_KEY, null);
}

export const AI_WELCOME_NOTIFICATION_ID = "n-ai-welcome";
