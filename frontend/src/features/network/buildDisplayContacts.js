import { initialNetworkPeople } from "../../shared/constants/mockData";

export const NETWORK_TARGET_CONTACTS = 8;

/**
 * API accepted contacts first, then demo people until NETWORK_TARGET_CONTACTS.
 */
export function buildDisplayContacts(apiAccepted = []) {
  const api = (Array.isArray(apiAccepted) ? apiAccepted : []).filter(
    (person) => person && typeof person === "object",
  );

  if (api.length >= NETWORK_TARGET_CONTACTS) {
    return api;
  }

  const seen = new Set(api.map((person) => String(person.id)));
  const fillers = initialNetworkPeople.filter((person) => !seen.has(String(person.id)));

  return [...api, ...fillers].slice(0, Math.max(NETWORK_TARGET_CONTACTS, api.length));
}
