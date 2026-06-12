/** Accepted contacts from the API (no demo filler). */
export function buildDisplayContacts(apiAccepted = []) {
  return (Array.isArray(apiAccepted) ? apiAccepted : []).filter(
    (person) => person && typeof person === "object",
  );
}
