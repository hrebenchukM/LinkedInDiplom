import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { formatBlockedDate } from "../../features/network/blockedUsersApi";
import {
  getRelationshipStatusLabels,
  getUserRelationship,
  RELATIONSHIP_STATE,
  resolvePersonCardActions,
} from "../../features/network/mapNetwork";
import * as eventsApi from "../../features/events/eventsApi";
import { formatEventDateTime } from "../../features/events/mapEvents";
import * as pagesGroupsApi from "../../features/network/pagesGroupsApi";
import { useNetworkStore } from "../../features/network/NetworkStore";
import { fetchProfilesByUserIds, searchProfiles } from "../../features/profile/profileApi";
import { useAuth } from "../../features/auth/AuthContext";
import { useChatStore } from "../../features/chat/ChatStore";
import { useUiSettings } from "../../app/providers/AppProviders";
import { LoadStatus } from "../../shared/ui/LoadStatus";

const NETWORK_SECTIONS = [
  { id: "connections", labelKey: "network.section.connections", fallback: "Connections", icon: "connections" },
  { id: "following", labelKey: "network.section.following", fallback: "Following", icon: "following" },
  { id: "followers", labelKey: "network.section.followers", fallback: "Followers", icon: "followers" },
  { id: "blocked", labelKey: "network.section.blocked", fallback: "Blocked", icon: "blocked" },
  { id: "groups", labelKey: "network.section.groups", fallback: "Groups", icon: "groups" },
  { id: "events", labelKey: "network.section.events", fallback: "Events", icon: "events" },
  { id: "pages", labelKey: "network.section.pages", fallback: "Pages", icon: "pages" },
];

function NetworkNavIcon({ type }) {
  const common = { viewBox: "0 0 24 24", fill: "currentColor", focusable: "false" };
  if (type === "connections") {
    return (
      <svg {...common}>
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    );
  }
  if (type === "following") {
    return (
      <svg {...common}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.2-7.9 1.4-1.4 1.4 1.4 1.4-1.4-1.4-1.4 1.4-1.4-1.4-1.4-1.4 1.4-1.4-1.4-1.4 1.4 1.4 1.4z" />
      </svg>
    );
  }
  if (type === "followers") {
    return (
      <svg {...common}>
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
      </svg>
    );
  }
  if (type === "blocked") {
    return (
      <svg {...common}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" />
      </svg>
    );
  }
  if (type === "groups") {
    return (
      <svg {...common}>
        <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.75V19H6v-2.6c0-1.19.68-2.27 1.76-2.75 1.17-.52 2.61-.9 4.24-.9zM12 2C9.79 2 8 3.79 8 6s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm-5 8.6c0-1.19.68-2.27 1.76-2.75C9.93 7.39 11.37 7 13 7c.34 0 .67.02 1 .05C12.67 5.79 11.43 5 10 5 7.79 5 6 6.79 6 9c0 .34.04.67.1.98C6.67 9.65 6.34 9.6 6 9.6 4.57 9.6 3.33 10.39 2.1 11.98 2.04 11.67 2 11.34 2 11v2.6h5V11.6zm14 0c0-.34-.04-.67-.1-.98-1.23 1.59-2.47 2.38-3.9 2.38-.34 0-.67-.05-1-.1.06-.31.1-.64.1-.98 0-2.21-1.79-4-4-4-1.43 0-2.67.79-3.9 2.05.33-.03.66-.05 1-.05 1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.75V19h5v-2.6z" />
      </svg>
    );
  }
  if (type === "events") {
    return (
      <svg {...common}>
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

const PROFILE_SEARCH_MIN_LENGTH = 2;

export function NetworkPage() {
  const navigate = useNavigate();
  const { t, lang } = useUiSettings();
  const { session } = useAuth();
  const currentUserId = session?.user?.id ?? session?.user?.userId ?? null;
  const {
    people,
    incomingContacts,
    outgoingContacts,
    pendingContactCounts,
    connect,
    connectWithUser,
    acceptContact,
    rejectContact,
    isLoading,
    loadError,
    useApi,
    reloadFromApi,
    followingPeople,
    followerPeople,
    blockedPeople,
    getRelationship,
    relationshipIndex,
    followUser,
    unfollowUser,
    blockUser,
    unblockUser,
    pages,
    groups,
    followPage,
    unfollowPage,
  } = useNetworkStore();
  const { chats, setActiveChat, ensureChat } = useChatStore();
  const [section, setSection] = useState("connections");
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("discover");
  const [eventSearch, setEventSearch] = useState("");
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const [createEventSubmitting, setCreateEventSubmitting] = useState(false);
  const [createEventError, setCreateEventError] = useState("");
  const [createEventCover, setCreateEventCover] = useState(null);
  const [createEventForm, setCreateEventForm] = useState({
    title: "",
    description: "",
    location: "",
    isOnline: false,
    startAt: "",
    endAt: "",
  });
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");
  const [eventsActionId, setEventsActionId] = useState("");
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [activeGroupMembers, setActiveGroupMembers] = useState([]);
  const [groupMembersLoading, setGroupMembersLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchTotalCount, setSearchTotalCount] = useState(0);
  const [searchRetry, setSearchRetry] = useState(0);

  const validSections = useMemo(() => new Set(NETWORK_SECTIONS.map((item) => item.id)), []);

  const selectSection = useCallback(
    (nextSection) => {
      setSection(nextSection);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextSection === "connections") next.delete("section");
          else next.set("section", nextSection);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const fromUrl = searchParams.get("section");
    if (fromUrl && validSections.has(fromUrl) && fromUrl !== section) {
      setSection(fromUrl);
    }
  }, [searchParams, validSections, section]);

  const normalizedPeopleQuery = query.trim().toLowerCase();
  const isApiProfileSearch = useApi && normalizedPeopleQuery.length >= PROFILE_SEARCH_MIN_LENGTH;

  const filteredPeople = useMemo(() => {
    if (!normalizedPeopleQuery) return people;
    return people.filter((person) => {
      const blob = [
        person.name,
        person.role,
        String(person.handle || ""),
        String(person.keywords || ""),
        `${person.name.replace(/\s+/g, "")}`,
        `${person.mutual || ""}`,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(normalizedPeopleQuery);
    });
  }, [people, normalizedPeopleQuery]);

  useEffect(() => {
    if (!isApiProfileSearch) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      setSearchTotalCount(0);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      setSearchError("");
      try {
        const result = await searchProfiles({
          query: query.trim(),
          page: 1,
          pageSize: 20,
          currentUserId,
        });
        if (cancelled) return;
        setSearchResults(result.items);
        setSearchTotalCount(result.totalCount);
      } catch (error) {
        if (cancelled) return;
        setSearchResults([]);
        setSearchTotalCount(0);
        setSearchError(error?.message || t("network.search.error", "Profile search failed."));
      } finally {
        if (!cancelled) setSearchLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isApiProfileSearch, query, currentUserId, searchRetry, t]);

  const displayPeople = useMemo(() => {
    if (isApiProfileSearch) {
      return searchResults.filter((person) => !getUserRelationship(relationshipIndex, person.userId).isBlocked);
    }
    return filteredPeople;
  }, [isApiProfileSearch, searchResults, filteredPeople, relationshipIndex]);

  const showPeopleSearchStats = normalizedPeopleQuery.length > 0;
  const peopleSearchHeading = isApiProfileSearch
    ? t("network.searchResultsHeading", "Search results")
    : showPeopleSearchStats
      ? t("network.searchResultsHeading", "Search results")
      : t("network.people.headingContacts", "Your contacts");
  const peopleSearchStatsText = isApiProfileSearch
    ? tf(
        "network.searchStats",
        { visible: String(displayPeople.length), total: String(searchTotalCount) },
        `${displayPeople.length} / ${searchTotalCount}`,
      )
    : tf(
        "network.searchStats",
        { visible: String(displayPeople.length), total: String(people.length) },
        `${displayPeople.length} / ${people.length}`,
      );
  const showPeopleEmpty =
    displayPeople.length === 0 &&
    !searchLoading &&
    (isApiProfileSearch || people.length > 0) &&
    normalizedPeopleQuery.length > 0;
  const showPeopleNoContacts =
    displayPeople.length === 0 &&
    people.length === 0 &&
    !isLoading &&
    !searchLoading &&
    !normalizedPeopleQuery;

  const messagesPreview = useMemo(() => {
    const peopleByUserId = new Map(
      people.filter((person) => person.userId).map((person) => [String(person.userId), person]),
    );

    return chats.map((chat) => {
      const contact = chat.peerUserId ? peopleByUserId.get(String(chat.peerUserId)) : null;
      return {
        id: chat.id,
        name: chat.peer,
        avatar: chat.avatar || contact?.avatar || "",
        preview:
          chat.messages?.[chat.messages.length - 1]?.text ||
          t("network.messages.noneYet", "No messages yet"),
      };
    });
  }, [chats, people, t]);

  const reloadEvents = useCallback(async () => {
    if (!useApi) {
      setEvents([]);
      return;
    }
    setEventsLoading(true);
    setEventsError("");
    try {
      const result =
        eventFilter === "attending"
          ? await eventsApi.fetchAttendingEvents({ page: 1, pageSize: 30 })
          : await eventsApi.discoverEvents({
              page: 1,
              pageSize: 30,
              isOnline: eventFilter === "online" ? true : undefined,
              query: eventSearch.trim() || undefined,
            });
      setEvents(result.items);
    } catch {
      setEvents([]);
      setEventsError(t("network.events.loadFailed", "Could not load events."));
    } finally {
      setEventsLoading(false);
    }
  }, [useApi, eventFilter, eventSearch, t]);
  const activeGroup = useMemo(
    () => groups.find((group) => group.id === activeGroupId) || groups[0] || null,
    [groups, activeGroupId],
  );

  function tf(key, vars, fallback) {
    if (typeof window.uiTmpl === "function") return window.uiTmpl(key, vars, fallback);
    let out = fallback || key;
    Object.keys(vars || {}).forEach((name) => {
      out = out.replaceAll(`{{${name}}}`, String(vars[name]));
    });
    return out;
  }

  function avatarUrl(seed) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed || "group")}`;
  }

  function pageLogoUrl(seed) {
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed || "page")}`;
  }

  async function onToggleEventAttendance(event) {
    if (!useApi || !event?.id || eventsActionId) return;
    setEventsActionId(event.id);
    try {
      if (event.isAttending) await eventsApi.leaveEvent(event.id);
      else await eventsApi.joinEvent(event.id);
      await reloadEvents();
    } catch {
      setEventsError(t("network.events.actionFailed", "Could not update attendance."));
    } finally {
      setEventsActionId("");
    }
  }

  async function submitCreateEvent(event) {
    event.preventDefault();
    if (!useApi || createEventSubmitting) return;
    const title = createEventForm.title.trim();
    const startAt = createEventForm.startAt ? new Date(createEventForm.startAt) : null;
    if (!title || !startAt || Number.isNaN(startAt.getTime())) {
      setCreateEventError(t("network.events.createRequired", "Title and start date are required."));
      return;
    }
    const endAt = createEventForm.endAt ? new Date(createEventForm.endAt) : null;
    if (endAt && endAt <= startAt) {
      setCreateEventError(t("network.events.endAfterStart", "End time must be after start time."));
      return;
    }

    setCreateEventSubmitting(true);
    setCreateEventError("");
    try {
      const created = await eventsApi.createEvent({
        organizerType: "user",
        title,
        description: createEventForm.description.trim() || undefined,
        location: createEventForm.location.trim() || undefined,
        isOnline: createEventForm.isOnline,
        visibility: "public",
        startAt: startAt.toISOString(),
        endAt: endAt ? endAt.toISOString() : undefined,
      });
      if (created?.id && createEventCover) {
        await eventsApi.uploadEventCover(created.id, createEventCover);
      }
      setCreateEventOpen(false);
      setCreateEventCover(null);
      setCreateEventForm({
        title: "",
        description: "",
        location: "",
        isOnline: false,
        startAt: "",
        endAt: "",
      });
      setEventFilter("discover");
      await reloadEvents();
    } catch {
      setCreateEventError(t("network.events.createFailed", "Could not create event."));
    } finally {
      setCreateEventSubmitting(false);
    }
  }

  function eventBadge(event) {
    if (event.isAttending) return t("network.events.badge.attending", "Attending");
    if (event.isOnline) return t("network.events.badge.online", "Online");
    return t("network.events.badge.inPerson", "In person");
  }

  function canonicalHandle(value) {
    return String(value || "").replace(/^@+/, "").trim().toLowerCase();
  }

  async function onConnectUser(person) {
    if (!person?.userId) return;
    await connectWithUser(person.userId);
  }

  function onConnect(person) {
    connect(person.id);

    const peerId = person.userId || person.handle || person.seed || person.name;
    const avatar = person.avatar || avatarUrl(person.seed || person.name);

    if (typeof window.connectPerson === "function") {
      window.connectPerson({
        id: peerId,
        name: person.name,
        seed: person.seed || person.name,
        avatar,
      });
    }

    ensureChat({
      peer: person.name,
      peerId,
      avatar: person.avatar,
      avatarSeed: person.seed,
    });
  }

  function onMessageFollowing(person) {
    const peerId = person.userId || person.handle || person.seed || person.name;
    const byPeerId = person.userId
      ? chats.find((chat) => String(chat.peerUserId || chat.peerId || "") === String(person.userId))
      : null;
    const handle = canonicalHandle(person.handle);
    const byHandle = chats.find((chat) => canonicalHandle(chat.peer) === handle);
    const byName = chats.find((chat) => canonicalHandle(chat.peer) === canonicalHandle(person.name));
    const target = byPeerId || byHandle || byName;
    if (target) {
      setActiveChat(target.id);
    } else {
      ensureChat({
        peer: person.name,
        peerId,
        avatar: person.avatar,
        avatarSeed: person.seed,
      });
    }
    navigate("/chat");
  }

  function onOpenPerson(person) {
    if (useApi && person.userId) {
      navigate(`/profile/${person.userId}`);
      return;
    }
    if (useApi) {
      onMessageFollowing(person);
      return;
    }
    onConnect(person);
  }

  async function onUnfollow(person) {
    if (!useApi || !person.userId) return;
    await unfollowUser(person.userId);
  }

  async function onFollowContact(person) {
    if (!useApi || !person.userId) return;
    await followUser(person.userId);
  }

  async function onBlockUser(person) {
    if (!useApi || !person.userId) return;
    await blockUser(person.userId);
  }

  async function onUnblockUser(person) {
    if (!useApi || !person.userId) return;
    await unblockUser(person.userId);
  }

  async function onTogglePageFollow(page) {
    if (!useApi || page.isOwned) return;
    if (page.isFollowing) await unfollowPage(page.id);
    else await followPage(page.id);
  }

  useEffect(() => {
    if (section === "groups" && useApi && !activeGroupId && groups.length > 0) {
      setActiveGroupId(groups[0].id);
    }
  }, [section, activeGroupId, useApi, groups]);

  useEffect(() => {
    if (section === "events" && useApi) reloadEvents();
  }, [section, useApi, reloadEvents]);

  useEffect(() => {
    if (!useApi || !activeGroupId) {
      setActiveGroupMembers([]);
      return undefined;
    }

    let cancelled = false;
    setGroupMembersLoading(true);
    pagesGroupsApi
      .fetchGroupMembers(activeGroupId)
      .then(async (members) => {
        if (cancelled) return;
        const userIds = members.map((member) => member.userId).filter(Boolean);
        const profiles = await fetchProfilesByUserIds(userIds);
        setActiveGroupMembers(
          members.map((member) => {
            const profile = profiles[member.userId];
            const name =
              profile?.fullName?.trim() ||
              `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
              `User ${String(member.userId).slice(0, 8)}`;
            return {
              id: String(member.id),
              userId: member.userId,
              name,
              role: member.role || profile?.headline || "Member",
            };
          }),
        );
      })
      .catch(() => {
        if (!cancelled) setActiveGroupMembers([]);
      })
      .finally(() => {
        if (!cancelled) setGroupMembersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [useApi, activeGroupId]);

  return (
    <section className="page network-page-legacy">
      <div className="home-shell home-shell--vacancies">
        <aside className="home-col-left home-card vac-sidebar">
          <h2 className="vac-sidebar__title">{t("network.sidebar.title", "Manage your network")}</h2>
          <nav className="vac-sidebar__nav">
            {NETWORK_SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={
                  section === item.id
                    ? `vac-sidebar__link vac-sidebar__link--active vac-sidebar__link--${item.icon}`
                    : `vac-sidebar__link vac-sidebar__link--${item.icon}`
                }
                onClick={() => selectSection(item.id)}
              >
                <span className={`vac-sidebar__icon vac-sidebar__icon--${item.icon}`} aria-hidden="true">
                  <NetworkNavIcon type={item.icon} />
                </span>
                <span className="vac-sidebar__label">{t(item.labelKey, item.fallback)}</span>
                {useApi && item.id === "connections" && pendingContactCounts.incomingCount > 0 ? (
                  <span className="vac-sidebar__badge" aria-label={t("network.pending.incomingBadge", "Incoming invitations")}>
                    {pendingContactCounts.incomingCount}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </aside>

        <main className="home-col-feed vac-page-main">
          {section === "connections" && (
            <section className="home-card vac-people">
              <div className="vac-people__search-wrap">
                <input
                  id="networkPeopleSearch"
                  className="vac-people__search"
                  type="search"
                  placeholder={t("network.search.placeholder", "Search people by name, role, or @handle")}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              {useApi && pendingContactCounts.incomingCount > 0 ? (
                <div className="vac-people__pending">
                  <h4 className="vac-people__pending-title">
                    {t("network.pending.incomingHeading", "Incoming invitations")}
                    <span className="vac-people__pending-count">{pendingContactCounts.incomingCount}</span>
                  </h4>
                  <ul className="vac-people__pending-list">
                    {incomingContacts.map((person) => (
                      <li key={person.id} className="vac-people__pending-item">
                        <span className="vac-people__pending-name">
                          {person.name}
                          <small>{t("network.pending.incoming", "wants to connect")}</small>
                        </span>
                        <span className="vac-people__pending-actions">
                          <button type="button" className="vac-people__pending-accept" onClick={() => acceptContact(person.id)}>
                            {t("network.pending.accept", "Accept")}
                          </button>
                          <button type="button" className="vac-people__pending-decline" onClick={() => rejectContact(person.id)}>
                            {t("network.pending.reject", "Decline")}
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {useApi && pendingContactCounts.outgoingCount > 0 ? (
                <div className="vac-people__pending vac-people__pending--outgoing">
                  <h4 className="vac-people__pending-title">
                    {t("network.pending.outgoingHeading", "Sent invitations")}
                    <span className="vac-people__pending-count">{pendingContactCounts.outgoingCount}</span>
                  </h4>
                  <ul className="vac-people__pending-list">
                    {outgoingContacts.map((person) => (
                      <li key={person.id} className="vac-people__pending-item">
                        <span className="vac-people__pending-name">
                          {person.name}
                          <small>{t("network.pending.outgoing", "request sent")}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {useApi ? (
                <LoadStatus
                  isLoading={isLoading}
                  loadError={loadError}
                  onRetry={reloadFromApi}
                  t={t}
                />
              ) : (
                <p className="vac-people__empty">
                  {t("network.people.apiOnly", "Sign in with your account to manage contacts and search people.")}
                </p>
              )}
              {isApiProfileSearch ? (
                <LoadStatus
                  isLoading={searchLoading}
                  loadError={searchError}
                  onRetry={() => setSearchRetry((count) => count + 1)}
                  t={t}
                />
              ) : null}
              <h3 className="vac-people__heading" id="networkPeopleHeading">
                {peopleSearchHeading}
              </h3>
              {showPeopleSearchStats ? (
                <p className="vac-people__stats" id="networkPeopleStats">
                  {peopleSearchStatsText}
                </p>
              ) : null}
              <div className="vac-people__grid" id="networkPeopleGrid">
                {displayPeople.length > 0 ? (
                  displayPeople.map((person) => {
                    const relationship = useApi && person.userId ? getRelationship(person.userId) : null;
                    const actionPlan = relationship
                      ? resolvePersonCardActions(relationship, {
                          isSearchResult: Boolean(person._searchResult || isApiProfileSearch),
                        })
                      : null;
                    const statusLabels =
                      relationship && useApi ? getRelationshipStatusLabels(relationship, t) : [];
                    return (
                      <article
                        key={person.id}
                        className="vac-person-card vac-person vac-person-card--with-actions"
                        data-network-person={person.id}
                        data-relationship={actionPlan?.stateKey || RELATIONSHIP_STATE.NONE}
                        data-keywords={`${person.name} ${person.role} ${person.handle || ""} ${person.keywords || ""}`}
                      >
                        <button
                          type="button"
                          className="vac-person-card__open"
                          onClick={() => onOpenPerson(person)}
                          aria-label={
                            useApi && person.userId
                              ? `${person.name}, ${t("network.people.viewProfile", "view profile")}`
                              : useApi
                                ? `${person.name}, ${t("network.people.openChat", "open chat")}`
                                : `${person.name}, ${t("network.people.tapConnect", "connect")}`
                          }
                        >
                          <img
                            className="vac-person-card__avatar"
                            src={person.avatar || avatarUrl(person.seed || person.name)}
                            width="40"
                            height="40"
                            alt=""
                          />
                          <div className="vac-person-card__body">
                            <span className="vac-person-card__name">{person.name}</span>
                            <span className="vac-person-card__meta">
                              {person.role}
                              {person.mutual
                                ? ` · ${tf("network.people.mutualShort", { count: String(person.mutual) }, `${person.mutual} mutual`)}`
                                : ""}
                            </span>
                            {statusLabels.length > 0 ? (
                              <span className="vac-person-card__status" aria-label={statusLabels.join(", ")}>
                                {statusLabels.map((label) => (
                                  <span key={label} className="vac-person-card__status-pill">
                                    {label}
                                  </span>
                                ))}
                              </span>
                            ) : null}
                          </div>
                          <span className="vac-person-card__chevron" aria-hidden="true">
                            ›
                          </span>
                        </button>
                        {useApi && person.userId && actionPlan ? (
                          <div className="vac-person-card__actions">
                            {actionPlan.kind === "connect" || actionPlan.kind === "pendingOutgoing" ? (
                              <button
                                type="button"
                                className="vac-person-card__follow"
                                disabled={actionPlan.kind === "pendingOutgoing"}
                                onClick={() => onConnectUser(person)}
                              >
                                {actionPlan.kind === "pendingOutgoing"
                                  ? t("network.pending.outgoing", "request sent")
                                  : t("network.people.connect", "Connect")}
                              </button>
                            ) : actionPlan.kind === "unblock" ? (
                              <button
                                type="button"
                                className="vac-person-card__follow vac-person-card__follow--active"
                                onClick={() => onUnblockUser(person)}
                              >
                                {t("network.unblock", "Unblock")}
                              </button>
                            ) : actionPlan.kind === "contact" ? (
                              <>
                                <button
                                  type="button"
                                  className={
                                    actionPlan.isFollowed
                                      ? "vac-person-card__follow vac-person-card__follow--active"
                                      : "vac-person-card__follow"
                                  }
                                  onClick={() =>
                                    actionPlan.isFollowed ? onUnfollow(person) : onFollowContact(person)
                                  }
                                >
                                  {actionPlan.isFollowed ? t("network.unfollow", "Unfollow") : t("network.follow", "Follow")}
                                </button>
                                <button
                                  type="button"
                                  className="vac-person-card__block"
                                  onClick={() => onBlockUser(person)}
                                >
                                  {t("network.block", "Block")}
                                </button>
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </article>
                    );
                  })
                ) : showPeopleNoContacts ? (
                  <p className="vac-people__empty" id="networkPeopleNone">
                    {useApi
                      ? t("network.people.none", "No contacts yet. Accept a request above or connect with someone new.")
                      : t("network.people.apiOnly", "Sign in with your account to manage contacts and search people.")}
                  </p>
                ) : (
                  <p className="vac-people__empty" id="networkPeopleEmpty" hidden={!showPeopleEmpty}>
                    {t("network.people.empty", "No people match your search. Try a different name, role, or keyword.")}
                  </p>
                )}
              </div>
            </section>
          )}

          {section === "following" && (
            <section className="home-card vac-following">
              <h3 className="vac-following__heading">{t("network.following.heading", "People you follow")}</h3>
              <p className="vac-following__sub">{t("network.following.sub", "Updates from contacts you follow appear in your feed.")}</p>
              {useApi ? (
                <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reloadFromApi} t={t} />
              ) : (
                <p className="vac-following__sub">
                  {t("network.following.apiOnly", "Sign in with your account to see who you follow.")}
                </p>
              )}
              {useApi ? (
              <div className="vac-following-list">
                {followingPeople.length > 0 ? (
                  followingPeople.map((person) => {
                    const relationship = person.userId ? getRelationship(person.userId) : null;
                    const statusLabels = relationship ? getRelationshipStatusLabels(relationship, t) : [];
                    return (
                    <article className="vac-following-row" key={person.id}>
                      <img
                        className="vac-following-row__avatar"
                        src={person.avatar || avatarUrl(person.seed || person.name)}
                        width="56"
                        height="56"
                        alt=""
                      />
                      <div className="vac-following-row__body">
                        {useApi && person.userId ? (
                          <h4 className="vac-following-row__name">
                            <Link to={`/profile/${person.userId}`}>{person.name}</Link>
                          </h4>
                        ) : (
                          <h4 className="vac-following-row__name">{person.name}</h4>
                        )}
                        <p className="vac-following-row__role">{person.role}</p>
                        <p className="vac-following-row__handle">@{person.handle}</p>
                        {statusLabels.length > 0 ? (
                          <p className="vac-following-row__status">{statusLabels.join(" · ")}</p>
                        ) : null}
                      </div>
                      <div className="vac-following-row__actions">
                        <button type="button" className="vac-following-row__msg" onClick={() => onMessageFollowing(person)}>
                          {t("network.message", "Message")}
                        </button>
                        <button type="button" className="vac-following-row__unfollow" onClick={() => onUnfollow(person)}>
                          {t("network.unfollow", "Unfollow")}
                        </button>
                      </div>
                    </article>
                    );
                  })
                ) : !isLoading ? (
                  <p className="vac-following__sub">{t("network.following.empty", "You are not following anyone right now.")}</p>
                ) : null}
              </div>
              ) : null}
            </section>
          )}

          {section === "followers" && (
            <section className="home-card vac-following vac-followers">
              <h3 className="vac-following__heading">{t("network.followers.heading", "Your followers")}</h3>
              <p className="vac-following__sub">
                {t("network.followers.sub", "People who follow you on LinkUp.")}
              </p>
              {useApi ? (
                <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reloadFromApi} t={t} />
              ) : (
                <p className="vac-following__sub">{t("network.followers.apiOnly", "Sign in with your account to see followers.")}</p>
              )}
              {useApi ? (
                <div className="vac-following-list">
                  {followerPeople.length > 0 ? (
                    followerPeople.map((person) => {
                      const relationship = getRelationship(person.userId);
                      const isFollowed = relationship.isFollowed;
                      const isContact = relationship.contactStatus === "accepted";
                      const isPendingOutgoing =
                        relationship.contactStatus === "pending" && relationship.contactDirection === "outgoing";
                      return (
                        <article className="vac-following-row" key={person.id}>
                          <img
                            className="vac-following-row__avatar"
                            src={person.avatar || avatarUrl(person.seed || person.name)}
                            width="56"
                            height="56"
                            alt=""
                          />
                          <div className="vac-following-row__body">
                            <h4 className="vac-following-row__name">
                              <Link to={`/profile/${person.userId}`}>{person.name}</Link>
                            </h4>
                            <p className="vac-following-row__role">{person.role}</p>
                            <p className="vac-following-row__handle">@{person.handle}</p>
                            {getRelationshipStatusLabels(relationship, t).length > 0 ? (
                              <p className="vac-following-row__status">
                                {getRelationshipStatusLabels(relationship, t).join(" · ")}
                              </p>
                            ) : null}
                          </div>
                          <div className="vac-following-row__actions">
                            <button type="button" className="vac-following-row__msg" onClick={() => onMessageFollowing(person)}>
                              {t("network.message", "Message")}
                            </button>
                            {isContact ? (
                              <button
                                type="button"
                                className={
                                  isFollowed
                                    ? "vac-following-row__unfollow vac-following-row__unfollow--active"
                                    : "vac-following-row__unfollow"
                                }
                                onClick={() => (isFollowed ? onUnfollow(person) : onFollowContact(person))}
                              >
                                {isFollowed ? t("network.followingBack", "Following") : t("network.followBack", "Follow back")}
                              </button>
                            ) : isPendingOutgoing ? (
                              <span className="vac-following-row__state">{t("network.pending.outgoing", "request sent")}</span>
                            ) : (
                              <button
                                type="button"
                                className="vac-following-row__unfollow"
                                onClick={() => onConnectUser(person)}
                              >
                                {t("network.people.connect", "Connect")}
                              </button>
                            )}
                          </div>
                        </article>
                      );
                    })
                  ) : !isLoading ? (
                    <p className="vac-following__sub">{t("network.followers.empty", "No followers yet.")}</p>
                  ) : null}
                </div>
              ) : null}
            </section>
          )}

          {section === "blocked" && (
            <section className="home-card vac-following vac-blocked">
              <h3 className="vac-following__heading">{t("network.blocked.heading", "Blocked users")}</h3>
              <p className="vac-following__sub">
                {t("network.blocked.sub", "Blocked people cannot send you contact requests or follow you.")}
              </p>
              {useApi ? (
                <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reloadFromApi} t={t} />
              ) : (
                <p className="vac-following__sub">{t("network.blocked.apiOnly", "Sign in with your account to manage blocked users.")}</p>
              )}
              {useApi ? (
                <div className="vac-following-list">
                  {blockedPeople.length > 0 ? (
                    blockedPeople.map((person) => (
                      <article className="vac-following-row vac-blocked-row" key={person.id}>
                        <img
                          className="vac-following-row__avatar"
                          src={person.avatar || avatarUrl(person.seed || person.name)}
                          width="56"
                          height="56"
                          alt=""
                        />
                        <div className="vac-following-row__body">
                          <h4 className="vac-following-row__name">
                            <Link to={`/profile/${person.userId}`}>{person.name}</Link>
                          </h4>
                          <p className="vac-following-row__role">{person.role}</p>
                          <p className="vac-following-row__handle">
                            @{person.handle}
                            {person.blockedAt
                              ? ` · ${t("network.blocked.since", "Blocked")} ${formatBlockedDate(person.blockedAt, lang)}`
                              : ""}
                          </p>
                        </div>
                        <div className="vac-following-row__actions">
                          <button
                            type="button"
                            className="vac-following-row__unfollow"
                            onClick={() => onUnblockUser(person)}
                          >
                            {t("network.unblock", "Unblock")}
                          </button>
                        </div>
                      </article>
                    ))
                  ) : !isLoading ? (
                    <p className="vac-following__sub">{t("network.blocked.empty", "You have not blocked anyone.")}</p>
                  ) : null}
                </div>
              ) : null}
            </section>
          )}

          {section === "groups" && (
            <section className="home-card vac-groups">
              <h3 className="vac-groups__heading">{t("network.groups.heading", "Your groups")}</h3>
              <p className="vac-groups__sub">{t("network.groups.subApi", "Groups you belong to on LinkUp.")}</p>
              {useApi ? (
                <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reloadFromApi} t={t} />
              ) : (
                <p className="vac-groups__sub">{t("network.groups.apiOnly", "Sign in with your account to see your groups.")}</p>
              )}
              {useApi ? (
                <div className="vac-groups-layout">
                  <div className="vac-groups-list">
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <button
                          type="button"
                          className={group.id === activeGroup?.id ? "vac-group-card vac-group-card--active" : "vac-group-card"}
                          key={group.id}
                          onClick={() => setActiveGroupId(group.id)}
                        >
                          <img
                            className="vac-group-card__icon"
                            src={group.avatarUrl || avatarUrl(group.seed)}
                            width="44"
                            height="44"
                            alt=""
                          />
                          <span className="vac-group-card__body">
                            <span className="vac-group-card__name">{group.name}</span>
                            <span className="vac-group-card__preview">
                              {group.description || t("network.groupNoDescription", "No description")}
                            </span>
                            <span className="vac-group-card__count">
                              {tf(
                                "network.groupMemberCount",
                                { count: String(group.memberCount) },
                                `${group.memberCount} members`,
                              )}
                            </span>
                          </span>
                        </button>
                      ))
                    ) : !isLoading ? (
                      <p className="vac-groups__sub">{t("network.groups.empty", "You are not in any groups yet.")}</p>
                    ) : null}
                  </div>
                  {activeGroup ? (
                    <div className="vac-group-chat vac-group-detail">
                      <h4 className="vac-group-chat__title">{activeGroup.name}</h4>
                      <p className="vac-group-chat__meta">
                        {activeGroup.description || t("network.groupNoDescription", "No description")}
                      </p>
                      <h5 className="vac-group-detail__members-title">{t("network.groups.members", "Members")}</h5>
                      {groupMembersLoading ? (
                        <p className="vac-groups__sub">{t("common.loading", "Loading…")}</p>
                      ) : activeGroupMembers.length > 0 ? (
                        <ul className="vac-group-detail__members">
                          {activeGroupMembers.map((member) => (
                            <li key={member.id} className="vac-group-detail__member">
                              {member.userId ? (
                                <Link to={`/profile/${member.userId}`}>{member.name}</Link>
                              ) : (
                                <span>{member.name}</span>
                              )}
                              <small>{member.role}</small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="vac-groups__sub">{t("network.groups.noMembers", "No members to show.")}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </section>
          )}

          {section === "pages" && (
            <section className="home-card vac-pages">
              <h3 className="vac-pages__heading">{t("network.pages.heading", "Pages you follow")}</h3>
              <p className="vac-pages__sub">{t("network.pages.subApi", "Company and organization pages you own or follow.")}</p>
              {useApi ? (
                <LoadStatus isLoading={isLoading} loadError={loadError} onRetry={reloadFromApi} t={t} />
              ) : (
                <p className="vac-pages__sub">{t("network.pages.apiOnly", "Sign in with your account to see pages.")}</p>
              )}
              {useApi ? (
                <div className="vac-pages-list">
                  {pages.length > 0 ? (
                    pages.map((page) => (
                      <article className="vac-page-card" key={page.id}>
                        <img
                          className="vac-page-card__logo"
                          src={page.logoUrl || pageLogoUrl(page.seed)}
                          width="56"
                          height="56"
                          alt=""
                        />
                        <div className="vac-page-card__body">
                          <div className="vac-page-card__head">
                            <h4 className="vac-page-card__name">{page.name}</h4>
                            {page.isOwned ? (
                              <span className="vac-page-card__badge">{t("network.pages.yours", "Yours")}</span>
                            ) : null}
                          </div>
                          <p className="vac-page-card__desc">
                            {page.description || t("network.pages.noDescription", "No description yet.")}
                          </p>
                        </div>
                        {page.isOwned ? null : (
                          <button
                            type="button"
                            className={
                              page.isFollowing
                                ? "vac-page-card__follow vac-page-card__follow--active"
                                : "vac-page-card__follow"
                            }
                            onClick={() => onTogglePageFollow(page)}
                          >
                            {page.isFollowing ? t("network.pageFollowing", "Following") : t("network.pageFollow", "Follow")}
                          </button>
                        )}
                      </article>
                    ))
                  ) : !isLoading ? (
                    <p className="vac-pages__sub">{t("network.pages.empty", "No pages yet. Create a page or follow one from your network.")}</p>
                  ) : null}
                </div>
              ) : null}
            </section>
          )}

          {section === "events" && (
            <section className="home-card vac-event-card">
              <h3 className="vac-event-card__heading">{t("network.events.heading", "Events")}</h3>
              <p className="vac-event-card__sub">
                {t("network.events.sub", "Discover professional events and manage your attendance.")}
              </p>
              {useApi ? (
                <>
                  <div className="vac-event-toolbar">
                    <button
                      type="button"
                      className="vac-event-create-btn"
                      onClick={() => {
                        setCreateEventError("");
                        setCreateEventOpen(true);
                      }}
                    >
                      {t("network.events.create", "Create event")}
                    </button>
                  </div>
                  <div className="vac-event-search">
                    <input
                      type="search"
                      value={eventSearch}
                      onChange={(event) => setEventSearch(event.target.value)}
                      placeholder={t("network.events.search", "Search events by title or location")}
                      aria-label={t("network.events.search", "Search events by title or location")}
                    />
                  </div>
                  <div className="vac-event-filters">
                    <button
                      type="button"
                      className={
                        eventFilter === "discover" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"
                      }
                      onClick={() => setEventFilter("discover")}
                    >
                      {t("network.events.filter.discover", "Discover")}
                    </button>
                    <button
                      type="button"
                      className={
                        eventFilter === "attending" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"
                      }
                      onClick={() => setEventFilter("attending")}
                    >
                      {t("network.events.filter.attending", "Attending")}
                    </button>
                    <button
                      type="button"
                      className={
                        eventFilter === "online" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"
                      }
                      onClick={() => setEventFilter("online")}
                    >
                      {t("network.events.filter.online", "Online")}
                    </button>
                  </div>
                  <LoadStatus
                    isLoading={eventsLoading}
                    loadError={eventsError}
                    onRetry={reloadEvents}
                    t={t}
                  />
                  <div className="vac-event-list">
                    {events.length > 0 ? (
                      events.map((event) => (
                        <article className="vac-event-item" key={event.id}>
                          <img
                            className="vac-event-item__avatar"
                            src={
                              event.coverImageUrl ||
                              `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(event.seed)}`
                            }
                            width="42"
                            height="42"
                            alt=""
                          />
                          <div className="vac-event-item__body">
                            <span className="vac-event-item__badge">{eventBadge(event)}</span>
                            <h4>{event.title}</h4>
                            {event.description ? <p className="vac-event-item__desc">{event.description}</p> : null}
                            <p className="vac-event-item__meta">
                              {formatEventDateTime(event.startAt, lang)}
                              {event.location
                                ? ` · ${event.location}`
                                : event.isOnline
                                  ? ` · ${t("network.events.online", "Online")}`
                                  : ""}
                            </p>
                            <p className="vac-event-item__meta">
                              {tf(
                                "network.events.attendees",
                                { count: String(event.attendeeCount) },
                                `${event.attendeeCount} attending`,
                              )}
                            </p>
                          </div>
                          <button
                            type="button"
                            className={
                              event.isAttending
                                ? "vac-event-item__join vac-event-item__join--active"
                                : "vac-event-item__join"
                            }
                            onClick={() => onToggleEventAttendance(event)}
                            disabled={eventsActionId === event.id}
                          >
                            {eventsActionId === event.id
                              ? t("common.loading", "Loading…")
                              : event.isAttending
                                ? t("network.events.leave", "Leave")
                                : t("network.events.join", "Join")}
                          </button>
                        </article>
                      ))
                    ) : !eventsLoading ? (
                      <p className="vac-event-card__sub">
                        {eventFilter === "attending"
                          ? t("network.events.emptyAttending", "You are not attending any events yet.")
                          : t("network.events.empty", "No events match this filter.")}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="vac-event-card__sub">
                  {t("network.events.apiOnly", "Sign in with your account to browse and join events.")}
                </p>
              )}
            </section>
          )}
        </main>

        {createEventOpen ? (
          <div className="vac-event-modal-backdrop" role="presentation" onClick={() => !createEventSubmitting && setCreateEventOpen(false)}>
            <section
              className="vac-event-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-event-title"
              onClick={(event) => event.stopPropagation()}
            >
              <header className="vac-event-modal__head">
                <h3 id="create-event-title">{t("network.events.createTitle", "Create event")}</h3>
                <button type="button" className="vac-event-modal__close" onClick={() => setCreateEventOpen(false)} disabled={createEventSubmitting}>
                  ×
                </button>
              </header>
              <form className="vac-event-modal__form" onSubmit={submitCreateEvent}>
                <label>
                  <span>{t("network.events.field.title", "Title")}</span>
                  <input
                    type="text"
                    required
                    value={createEventForm.title}
                    onChange={(event) => setCreateEventForm((prev) => ({ ...prev, title: event.target.value }))}
                  />
                </label>
                <label>
                  <span>{t("network.events.field.description", "Description")}</span>
                  <textarea
                    rows={3}
                    value={createEventForm.description}
                    onChange={(event) => setCreateEventForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </label>
                <label>
                  <span>{t("network.events.field.location", "Location")}</span>
                  <input
                    type="text"
                    value={createEventForm.location}
                    onChange={(event) => setCreateEventForm((prev) => ({ ...prev, location: event.target.value }))}
                  />
                </label>
                <label className="vac-event-modal__check">
                  <input
                    type="checkbox"
                    checked={createEventForm.isOnline}
                    onChange={(event) => setCreateEventForm((prev) => ({ ...prev, isOnline: event.target.checked }))}
                  />
                  <span>{t("network.events.field.online", "Online event")}</span>
                </label>
                <label>
                  <span>{t("network.events.field.start", "Start")}</span>
                  <input
                    type="datetime-local"
                    required
                    value={createEventForm.startAt}
                    onChange={(event) => setCreateEventForm((prev) => ({ ...prev, startAt: event.target.value }))}
                  />
                </label>
                <label>
                  <span>{t("network.events.field.end", "End")}</span>
                  <input
                    type="datetime-local"
                    value={createEventForm.endAt}
                    onChange={(event) => setCreateEventForm((prev) => ({ ...prev, endAt: event.target.value }))}
                  />
                </label>
                <label>
                  <span>{t("network.events.field.cover", "Cover image")}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setCreateEventCover(event.target.files?.[0] || null)}
                  />
                </label>
                {createEventError ? <p className="vac-event-modal__error">{createEventError}</p> : null}
                <div className="vac-event-modal__actions">
                  <button type="button" className="vac-event-modal__btn" onClick={() => setCreateEventOpen(false)} disabled={createEventSubmitting}>
                    {t("common.cancel", "Cancel")}
                  </button>
                  <button type="submit" className="vac-event-modal__btn vac-event-modal__btn--primary" disabled={createEventSubmitting}>
                    {createEventSubmitting ? t("common.loading", "Loading…") : t("network.events.createSubmit", "Create")}
                  </button>
                </div>
              </form>
            </section>
          </div>
        ) : null}

        <aside className="home-col-right home-card home-messages">
          <div className="home-messages__head">
            <h2 className="home-messages__title">{t("network.messages.title", "Messages")}</h2>
          </div>
          <input className="home-messages__search" type="search" placeholder={t("network.messages.search", "Search messages")} />
          <div className="home-messages__list">
            {messagesPreview.length > 0 ? (
              messagesPreview.map((msg) => (
                <button key={msg.id} type="button" className="home-messages__item" onClick={() => navigate("/chat")}>
                  <img src={msg.avatar || avatarUrl(msg.name)} width="34" height="34" alt="" />
                  <span>
                    <strong>{msg.name}</strong>
                    <small>{msg.preview}</small>
                  </span>
                </button>
              ))
            ) : (
              <div className="home-messages__empty">
                <p>{t("network.messages.empty", "No messages yet. Send one to start a conversation.")}</p>
                <button type="button" className="home-messages__cta" onClick={() => navigate("/chat")}>
                  {t("network.messages.write", "Write a message")}
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

    </section>
  );
}
