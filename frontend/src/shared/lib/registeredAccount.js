import { REGISTERED_ACCOUNT_KEY } from "./authSession";
import { readJson, writeJson } from "./storage";

export function readRegisteredAccount() {
  return readJson(REGISTERED_ACCOUNT_KEY, {});
}

export function patchRegisteredAccount(patch) {
  const prev = readRegisteredAccount();
  const next = { ...prev, ...patch };
  writeJson(REGISTERED_ACCOUNT_KEY, next);
  return next;
}
