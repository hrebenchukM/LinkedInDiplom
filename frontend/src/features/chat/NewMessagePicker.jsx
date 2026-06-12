import { useEffect, useMemo, useState } from "react";
import { searchProfiles } from "../profile/profileApi";
import { MESSAGING_CONTACTS } from "../../shared/constants/messagingContacts";
import { useUiSettings } from "../../app/providers/AppProviders";

function buildMockCandidates(people) {
  const seen = new Set();
  const items = [];

  people
    .filter((person) => person.userId || person.id)
    .forEach((person) => {
      const userId = String(person.userId || person.id);
      if (seen.has(userId)) return;
      seen.add(userId);
      items.push({
        userId,
        name: person.name,
        role: person.role || "",
        avatar: person.avatar || "",
        seed: person.seed || person.name,
      });
    });

  Object.entries(MESSAGING_CONTACTS).forEach(([id, meta]) => {
    const userId = String(id);
    if (seen.has(userId)) return;
    seen.add(userId);
    items.push({
      userId,
      name: meta.name,
      role: "",
      avatar: meta.avatar || "",
      seed: meta.seed || meta.name,
    });
  });

  return items;
}

export function NewMessagePicker({
  open,
  onClose,
  onSelect,
  useApi,
  currentUserId,
  localPeople = [],
  starting = false,
}) {
  const { t } = useUiSettings();
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const trimmedQuery = query.trim();
  const isApiSearch = useApi && trimmedQuery.length >= 2;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !isApiSearch) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const result = await searchProfiles({
          query: trimmedQuery,
          page: 1,
          pageSize: 20,
          currentUserId,
        });
        if (cancelled) return;
        setSearchResults(result.items);
      } catch (error) {
        if (cancelled) return;
        setSearchResults([]);
        setSearchError(error?.message || t("network.search.error", "Profile search failed."));
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, isApiSearch, trimmedQuery, currentUserId, t]);

  const localCandidates = useMemo(() => buildMockCandidates(localPeople), [localPeople]);

  const displayPeople = useMemo(() => {
    if (isApiSearch) return searchResults;
    const normalized = trimmedQuery.toLowerCase();
    if (!normalized) return localCandidates.slice(0, 12);
    return localCandidates
      .filter(
        (person) =>
          person.name.toLowerCase().includes(normalized) ||
          String(person.role || "").toLowerCase().includes(normalized),
      )
      .slice(0, 12);
  }, [isApiSearch, searchResults, localCandidates, trimmedQuery]);

  if (!open) return null;

  const showSearchHint = useApi && trimmedQuery.length > 0 && trimmedQuery.length < 2;
  const showEmpty =
    !searchLoading &&
    displayPeople.length === 0 &&
    !showSearchHint &&
    (isApiSearch || trimmedQuery.length > 0 || localCandidates.length === 0);

  return (
    <div
      className="msg-new-picker"
      role="dialog"
      aria-label={t("home.messages.pickUser", "New message")}
    >
      <div className="msg-new-picker__head">
        <h4 className="msg-new-picker__title">{t("home.messages.pickUser", "New message")}</h4>
        <button type="button" className="msg-new-picker__close" onClick={onClose} disabled={starting}>
          {t("home.close", "Close")}
        </button>
      </div>
      <input
        className="msg-new-picker__search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={t("home.messages.searchPeople", "Search people by name…")}
        autoFocus
        disabled={starting}
      />
      {useApi && !trimmedQuery ? (
        <p className="msg-new-picker__hint">
          {t("home.messages.searchHint", "Type at least 2 characters to search all users.")}
        </p>
      ) : null}
      {showSearchHint ? (
        <p className="msg-new-picker__hint">
          {t("home.messages.searchHint", "Type at least 2 characters to search all users.")}
        </p>
      ) : null}
      {searchError ? <p className="msg-new-picker__error">{searchError}</p> : null}
      {!isApiSearch && localCandidates.length > 0 && !trimmedQuery ? (
        <p className="msg-new-picker__section">{t("home.messages.contacts", "Your contacts")}</p>
      ) : null}
      <ul className="msg-new-picker__list">
        {searchLoading ? (
          <li>
            <p className="msg-new-picker__empty">{t("common.loading", "Loading…")}</p>
          </li>
        ) : displayPeople.length > 0 ? (
          displayPeople.map((person) => (
            <li key={person.userId || person.id || person.name}>
              <button
                type="button"
                className="msg-new-picker__person"
                disabled={starting}
                onClick={() => onSelect(person)}
              >
                <img
                  className="msg-new-picker__avatar"
                  src={person.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.seed || person.name)}`}
                  width="36"
                  height="36"
                  alt=""
                />
                <span className="msg-new-picker__person-body">
                  <strong>{person.name}</strong>
                  {person.role ? <small>{person.role}</small> : null}
                </span>
              </button>
            </li>
          ))
        ) : showEmpty ? (
          <li>
            <p className="msg-new-picker__empty">
              {t("home.messages.noPeople", "No people match your search.")}
            </p>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
