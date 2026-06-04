/**
 * Maps backend AccountDto (+ optional UI profile fields) to SPA user model.
 * AccountDto from API: { id, email, createdAt?, updatedAt? }
 */
export function mapAccountToUser(account = {}, profileFallback = {}) {
  const id = String(account.id || profileFallback.id || "").trim();
  const email = String(account.email || profileFallback.email || "").trim();
  const userName = String(
    account.userName || account.username || profileFallback.userName || email.split("@")[0] || "",
  ).trim();
  const firstName = String(account.firstName || profileFallback.firstName || "").trim();
  const lastName = String(account.lastName || profileFallback.lastName || "").trim();
  const name =
    `${firstName} ${lastName}`.trim() ||
    String(profileFallback.name || account.name || userName || email || "User").trim();

  return {
    id: id || "unknown",
    email: email || undefined,
    userName: userName || undefined,
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    name,
    headline: String(profileFallback.headline || account.headline || "Member").trim(),
    avatarDataUrl:
      String(account.avatarDataUrl || profileFallback.avatarDataUrl || profileFallback.avatarUrl || "")
        .trim() || undefined,
    authProvider: profileFallback.authProvider || account.authProvider || null,
    isGuest: Boolean(profileFallback.isGuest),
  };
}

export { readRegisteredAccount as readProfileFallback } from "../../shared/lib/registeredAccount";
