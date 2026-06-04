import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNetworkStore } from "../../features/network/NetworkStore";
import { useChatStore } from "../../features/chat/ChatStore";
import { useUiSettings } from "../../app/providers/AppProviders";

const NETWORK_SECTIONS = [
  { id: "connections", labelKey: "network.section.connections", fallback: "Connections", icon: "connections" },
  { id: "following", labelKey: "network.section.following", fallback: "Following", icon: "following" },
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

const UNFOLLOWED_KEY = "networkUnfollowedHandles";
const GROUP_CHATS_KEY = "networkGroupChats";
const FOLLOWED_PAGES_KEY = "networkPagesFollowed";
const FOLLOWING = [
  { id: "f1", name: "Duncan Callahan", role: "Senior UX Researcher", handle: "DuncanUX", seed: "DuncanCallahan" },
  { id: "f2", name: "Sarah Chen", role: "Product Designer · Figma", handle: "SarahChen", seed: "SarahChen" },
  { id: "f3", name: "Marcus Dias", role: "Senior Design Manager · Microsoft", handle: "MarcusDias", seed: "MarcusDias" },
];

const PAGES = [
  {
    id: "figma",
    name: "Figma",
    industryKey: "network.pageIndustryDesign",
    industryFallback: "Design · Software",
    seed: "Figma",
    followersKey: "network.pageFollowers124",
    followersFallback: "124K followers",
    descKey: "network.pageFigmaDesc",
    descFallback: "The collaborative interface design tool for teams building products together.",
    updateKey: "network.pageFigmaUpdate",
    updateFallback: "New: Dev Mode updates and improved design tokens workflow.",
  },
  {
    id: "microsoft",
    name: "Microsoft",
    industryKey: "network.pageIndustryTech",
    industryFallback: "Technology",
    seed: "Microsoft",
    followersKey: "network.pageFollowers22m",
    followersFallback: "22M followers",
    descKey: "network.pageMicrosoftDesc",
    descFallback: "Empowering every person and organization on the planet to achieve more.",
    updateKey: "network.pageMicrosoftUpdate",
    updateFallback: "We're hiring across Azure, Copilot, and design systems teams.",
  },
  {
    id: "stripe",
    name: "Stripe",
    industryKey: "network.pageIndustryFintech",
    industryFallback: "Financial technology",
    seed: "Stripe",
    followersKey: "network.pageFollowers890",
    followersFallback: "890K followers",
    descKey: "network.pageStripeDesc",
    descFallback: "Financial infrastructure for the internet — payments, billing, and more.",
    updateKey: "network.pageStripeUpdate",
    updateFallback: "Stripe Sessions 2026 registration is now open.",
  },
  {
    id: "atlassian",
    name: "Atlassian",
    industryKey: "network.pageIndustrySoftware",
    industryFallback: "Software",
    seed: "Atlassian",
    followersKey: "network.pageFollowers1m",
    followersFallback: "1.2M followers",
    descKey: "network.pageAtlassianDesc",
    descFallback: "Tools like Jira, Confluence, and Trello for agile teams worldwide.",
    updateKey: "network.pageAtlassianUpdate",
    updateFallback: "Tips for running effective sprint retrospectives with remote teams.",
  },
  {
    id: "datadog",
    name: "Datadog",
    industryKey: "network.pageIndustryDevops",
    industryFallback: "Cloud monitoring",
    seed: "Datadog",
    followersKey: "network.pageFollowers420",
    followersFallback: "420K followers",
    descKey: "network.pageDatadogDesc",
    descFallback: "Modern monitoring and security platform for cloud-scale applications.",
    updateKey: "network.pageDatadogUpdate",
    updateFallback: "Watch our webinar on SRE best practices for Kubernetes.",
  },
];

const GROUPS = [
  {
    id: "ux-design-hub",
    nameKey: "network.groupUxName",
    nameFallback: "UI/UX Design Hub",
    descKey: "network.groupUxDesc",
    descFallback: "Design critiques, Figma tips, and portfolio feedback.",
    members: [
      { name: "Sarah Chen", seed: "SarahChen" },
      { name: "Duncan Callahan", seed: "DuncanCallahan" },
      { name: "David Jonson", seed: "DavidJonson" },
    ],
    seed: "UxDesignHub",
    seedMessages: [
      { id: "m1", author: "Sarah Chen", authorSeed: "SarahChen", out: false, textKey: "network.groupUxMsg1", textFallback: "Anyone free for a quick design critique at 3pm?" },
      { id: "m2", author: "Duncan Callahan", authorSeed: "DuncanCallahan", out: false, textKey: "network.groupUxMsg2", textFallback: "I can join — share the Figma link here." },
    ],
    replyPool: [
      { author: "Sarah Chen", authorSeed: "SarahChen", textKey: "network.groupUxReply1", textFallback: "Great point — I'll update the mockups." },
      { author: "David Jonson", authorSeed: "DavidJonson", textKey: "network.groupUxReply2", textFallback: "Thanks! Let's sync on this tomorrow." },
    ],
  },
  {
    id: "frontend-circle",
    nameKey: "network.groupFeName",
    nameFallback: "Frontend Circle",
    descKey: "network.groupFeDesc",
    descFallback: "React, TypeScript, and code review for UI engineers.",
    members: [
      { name: "James Lee", seed: "JamesLee" },
      { name: "Elena Volkov", seed: "ElenaVolkov" },
      { name: "Alex Kim", seed: "AlexKim" },
    ],
    seed: "FrontendCircle",
    seedMessages: [
      { id: "m1", author: "James Lee", authorSeed: "JamesLee", out: false, textKey: "network.groupFeMsg1", textFallback: "Pushed a PR for the new filter component — reviews welcome." },
      { id: "m2", author: "Elena Volkov", authorSeed: "ElenaVolkov", out: false, textKey: "network.groupFeMsg2", textFallback: "Left a few comments on accessibility — overall looks solid." },
    ],
    replyPool: [
      { author: "Alex Kim", authorSeed: "AlexKim", textKey: "network.groupFeReply1", textFallback: "Merged — thanks for the quick review!" },
      { author: "James Lee", authorSeed: "JamesLee", textKey: "network.groupFeReply2", textFallback: "I'll pick that up in the next sprint." },
    ],
  },
];

const NETWORK_EVENTS = [
  { id: "ev-1", type: "career", name: "Marcus Dias", seed: "MarcusDias", role: "Senior Design Manager", company: "Microsoft", timeKey: "network.evTime1d", timeFallback: "1 day ago" },
  { id: "ev-2", type: "career", name: "Elena Volkov", seed: "ElenaVolkov", role: "Frontend Developer", company: "Stripe", timeKey: "network.evTime3d", timeFallback: "3 days ago" },
  { id: "ev-3", type: "career", name: "Ryan O'Brien", seed: "RyanOBrien", role: "Product Manager", company: "Atlassian", timeKey: "network.evTime1w", timeFallback: "1 week ago" },
  { id: "ev-4", type: "birthdays", name: "Sarah Chen", seed: "SarahChen", whenKey: "network.evBirthdayToday", whenFallback: "today", timeKey: "network.evTimeToday", timeFallback: "Today" },
  { id: "ev-5", type: "birthdays", name: "Joshua Cortez", seed: "JoshuaCortez", whenKey: "network.evBirthdayIn", whenFallback: "in 3 days", whenVars: { days: "3" }, timeKey: "network.evTimeSoon", timeFallback: "Coming up" },
  { id: "ev-6", type: "birthdays", name: "Maria Rodriguez", seed: "MariaRodriguez", whenKey: "network.evBirthdayIn", whenFallback: "in 5 days", whenVars: { days: "5" }, timeKey: "network.evTimeSoon", timeFallback: "Coming up" },
  { id: "ev-7", type: "education", name: "James Lee", seed: "JamesLee", program: "Advanced React Patterns", timeKey: "network.evTime4d", timeFallback: "4 days ago" },
  { id: "ev-8", type: "education", name: "Nina Petrova", seed: "NinaPetrova", program: "UX Research Certificate", timeKey: "network.evTime2w", timeFallback: "2 weeks ago" },
  { id: "ev-9", type: "education", name: "Priya Patel", seed: "PriyaPatel", program: "Kubernetes Administrator", timeKey: "network.evTime5d", timeFallback: "5 days ago" },
];

export function NetworkPage() {
  const navigate = useNavigate();
  const { t } = useUiSettings();
  const { people, pendingContacts, connect, acceptContact, rejectContact, isLoading, loadError, useApi, reloadFromApi } =
    useNetworkStore();
  const { chats, setActiveChat, ensureChat } = useChatStore();
  const [section, setSection] = useState("connections");
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("all");
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [groupInput, setGroupInput] = useState("");
  const [followedPageIds, setFollowedPageIds] = useState(() => {
    try {
      const raw = localStorage.getItem(FOLLOWED_PAGES_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length) return new Set(parsed.map(String));
    } catch {
      // ignore
    }
    return new Set(["figma", "microsoft", "stripe"]);
  });
  const [unfollowedHandles, setUnfollowedHandles] = useState(() => {
    try {
      const raw = localStorage.getItem(UNFOLLOWED_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
    } catch {
      return new Set();
    }
  });

  const normalizedPeopleQuery = query.trim().toLowerCase();
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
  const showPeopleSearchStats = normalizedPeopleQuery.length > 0;
  const peopleSearchHeading = showPeopleSearchStats
    ? t("network.searchResultsHeading", "Search results")
    : useApi
      ? t("network.people.headingContacts", "Your contacts")
      : t("network.people.heading", "People in UI/UX design you may know");
  const peopleSearchStatsText = tf(
    "network.searchStats",
    { visible: String(filteredPeople.length), total: String(people.length) },
    `${filteredPeople.length} / ${people.length}`,
  );
  const showPeopleEmpty = filteredPeople.length === 0 && people.length > 0;
  const showPeopleNoContacts =
    filteredPeople.length === 0 && people.length === 0 && !isLoading && !normalizedPeopleQuery;

  const messagesPreview = useMemo(
    () =>
      chats.map((chat) => ({
        id: chat.id,
        name: chat.peer,
        preview: chat.messages?.[chat.messages.length - 1]?.text || t("network.messages.noneYet", "No messages yet"),
      })),
    [chats, t],
  );

  const filteredEvents = useMemo(() => {
    if (eventFilter === "all") return NETWORK_EVENTS;
    return NETWORK_EVENTS.filter((event) => event.type === eventFilter);
  }, [eventFilter]);
  const activeFollowing = useMemo(
    () => FOLLOWING.filter((person) => !unfollowedHandles.has(person.handle)),
    [unfollowedHandles],
  );
  const activeGroup = useMemo(
    () => GROUPS.find((group) => group.id === activeGroupId) || GROUPS[0] || null,
    [activeGroupId],
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

  function readGroupStore() {
    try {
      const raw = localStorage.getItem(GROUP_CHATS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function writeGroupStore(data) {
    try {
      localStorage.setItem(GROUP_CHATS_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  function seedMessagesForGroup(group) {
    return (group?.seedMessages || []).map((message, idx) => ({
      id: message.id || `seed-${idx}`,
      author: message.author || "",
      authorSeed: message.authorSeed || "",
      out: !!message.out,
      text: t(message.textKey, message.textFallback || ""),
      ts: Date.now() - 3600000 + idx * 60000,
    }));
  }

  function getGroupMessages(groupId) {
    if (!groupId) return [];
    const store = readGroupStore();
    if (Array.isArray(store[groupId]) && store[groupId].length > 0) return store[groupId];
    const group = GROUPS.find((entry) => entry.id === groupId);
    if (!group) return [];
    const seeded = seedMessagesForGroup(group);
    store[groupId] = seeded;
    writeGroupStore(store);
    return seeded;
  }

  function persistGroupMessages(groupId, messages) {
    const store = readGroupStore();
    store[groupId] = messages;
    writeGroupStore(store);
  }

  const activeGroupMessages = useMemo(
    () => getGroupMessages(activeGroup?.id),
    [activeGroup?.id, t],
  );

  const groupList = useMemo(
    () =>
      GROUPS.map((group) => {
        const messages = getGroupMessages(group.id);
        const last = messages[messages.length - 1];
        const preview = !last
          ? t("network.groupNoMessages", "No messages yet")
          : last.out
            ? `${t("network.groupYouPrefix", "You")}: ${last.text}`
            : `${last.author}: ${last.text}`;
        return {
          ...group,
          preview: preview.length > 52 ? `${preview.slice(0, 52)}...` : preview,
        };
      }),
    [t, activeGroupMessages],
  );
  const pagesWithFollow = useMemo(
    () =>
      PAGES.map((page) => ({
        ...page,
        following: followedPageIds.has(page.id),
      })),
    [followedPageIds],
  );

  function typeLabel(type) {
    if (type === "career") return t("network.evCareer", "Job changes");
    if (type === "birthdays") return t("network.evBirth", "Birthdays");
    return t("network.evEdu", "Education");
  }

  function eventText(event) {
    if (event.type === "career") {
      return `${event.name} ${t("network.evCareerAs", "started a new role as")} ${event.role} ${t("network.evCareerAt", "at")} ${event.company}`;
    }
    if (event.type === "birthdays") {
      const when = event.whenVars
        ? t("network.evBirthdayIn", `in ${event.whenVars.days} days`).replace("{{days}}", event.whenVars.days)
        : t(event.whenKey, event.whenFallback || "today");
      return `${event.name} ${t("network.evBirthdayCelebrates", "celebrates a birthday")} ${when}`;
    }
    return `${event.name} ${t("network.evEduCompleted", "completed")} ${event.program}`;
  }

  function persistUnfollowed(nextSet) {
    setUnfollowedHandles(nextSet);
    try {
      localStorage.setItem(UNFOLLOWED_KEY, JSON.stringify([...nextSet]));
    } catch {
      // ignore
    }
  }

  function canonicalHandle(value) {
    return String(value || "").replace(/^@+/, "").trim().toLowerCase();
  }

  function onConnect(person) {
    connect(person.id);

    const peerId = person.handle || person.seed || person.name;
    const avatar =
      person.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.seed || person.name)}`;

    if (typeof window.connectPerson === "function") {
      window.connectPerson({
        id: peerId,
        name: person.name,
        seed: person.seed || person.name,
        avatar,
      });
    }

    ensureChat({ peer: person.name, peerId });
  }

  function onMessageFollowing(person) {
    const handle = canonicalHandle(person.handle);
    const byHandle = chats.find((chat) => canonicalHandle(chat.peer) === handle);
    const byName = chats.find((chat) => canonicalHandle(chat.peer) === canonicalHandle(person.name));
    const target = byHandle || byName;
    if (target) {
      setActiveChat(target.id);
    } else {
      ensureChat({ peer: person.name, peerId: person.handle || person.seed || person.name });
    }
    navigate("/chat");
  }

  function onOpenPerson(person) {
    if (useApi) {
      onMessageFollowing(person);
      return;
    }
    onConnect(person);
  }

  function onUnfollow(person) {
    const next = new Set(unfollowedHandles);
    next.add(person.handle);
    persistUnfollowed(next);
  }

  function persistFollowedPages(nextSet) {
    setFollowedPageIds(nextSet);
    try {
      localStorage.setItem(FOLLOWED_PAGES_KEY, JSON.stringify([...nextSet]));
    } catch {
      // ignore
    }
  }

  function togglePageFollow(pageId) {
    const next = new Set(followedPageIds);
    if (next.has(pageId)) next.delete(pageId);
    else next.add(pageId);
    persistFollowedPages(next);
  }

  function formatTime(ts) {
    if (!ts) return t("js.chatNow", "Now");
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60) return t("js.chatNow", "Now");
    if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return tf("js.minAgo", { n: String(minutes) }, `${minutes} min`);
    }
    const hours = Math.floor(diff / 3600);
    return tf("js.hourAgo", { n: String(hours) }, `${hours} hr`);
  }

  function appendGroupMessage(groupId, message) {
    const next = [...getGroupMessages(groupId), message];
    persistGroupMessages(groupId, next);
  }

  function maybeMockReply(group) {
    if (!group?.replyPool?.length) return;
    const pick = group.replyPool[Math.floor(Math.random() * group.replyPool.length)];
    window.setTimeout(() => {
      appendGroupMessage(group.id, {
        id: `r-${Date.now()}`,
        author: pick.author,
        authorSeed: pick.authorSeed,
        out: false,
        text: t(pick.textKey, pick.textFallback || ""),
        ts: Date.now(),
      });
      setActiveGroupId((prev) => prev || group.id);
    }, 1200 + Math.random() * 800);
  }

  function onSendGroupMessage(event) {
    event.preventDefault();
    const text = groupInput.trim();
    if (!text || !activeGroup) return;
    appendGroupMessage(activeGroup.id, {
      id: `u-${Date.now()}`,
      author: t("network.groupYou", "You"),
      out: true,
      text,
      ts: Date.now(),
    });
    setGroupInput("");
    maybeMockReply(activeGroup);
    setActiveGroupId((prev) => prev || activeGroup.id);
  }

  useEffect(() => {
    if (section === "groups" && !activeGroupId && GROUPS.length > 0) {
      setActiveGroupId(GROUPS[0].id);
    }
  }, [section, activeGroupId]);

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
                onClick={() => setSection(item.id)}
              >
                <span className={`vac-sidebar__icon vac-sidebar__icon--${item.icon}`} aria-hidden="true">
                  <NetworkNavIcon type={item.icon} />
                </span>
                <span className="vac-sidebar__label">{t(item.labelKey, item.fallback)}</span>
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
              {useApi && pendingContacts.length > 0 ? (
                <div className="vac-people__pending">
                  <h4 className="vac-people__pending-title">{t("network.pending.heading", "Pending invitations")}</h4>
                  <ul className="vac-people__pending-list">
                    {pendingContacts.map((person) => (
                      <li key={person.id} className="vac-people__pending-item">
                        <span className="vac-people__pending-name">
                          {person.name}
                          <small>
                            {person.isIncoming
                              ? t("network.pending.incoming", "wants to connect")
                              : t("network.pending.outgoing", "request sent")}
                          </small>
                        </span>
                        {person.isIncoming ? (
                          <span className="vac-people__pending-actions">
                            <button type="button" className="vac-people__pending-accept" onClick={() => acceptContact(person.id)}>
                              {t("network.pending.accept", "Accept")}
                            </button>
                            <button type="button" className="vac-people__pending-decline" onClick={() => rejectContact(person.id)}>
                              {t("network.pending.reject", "Decline")}
                            </button>
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {loadError ? (
                <div className="vac-people__alert" role="alert">
                  <p className="vac-people__alert-text">
                    {t("network.people.loadFailed", "Could not load contacts. Sign in again or try later.")}
                  </p>
                  <button type="button" className="vac-people__retry" onClick={() => reloadFromApi()}>
                    {t("common.retry", "Retry")}
                  </button>
                </div>
              ) : null}
              {isLoading ? <p className="vac-people__loading">{t("common.loading", "Loading…")}</p> : null}
              <h3 className="vac-people__heading" id="networkPeopleHeading">
                {peopleSearchHeading}
              </h3>
              {showPeopleSearchStats ? (
                <p className="vac-people__stats" id="networkPeopleStats">
                  {peopleSearchStatsText}
                </p>
              ) : null}
              <div className="vac-people__grid" id="networkPeopleGrid">
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      className="vac-person-card vac-person"
                      data-network-person={person.id}
                      data-keywords={`${person.name} ${person.role} ${person.handle || ""} ${person.keywords || ""}`}
                      onClick={() => onOpenPerson(person)}
                      aria-label={
                        useApi
                          ? `${person.name}, ${t("network.people.openChat", "open chat")}`
                          : `${person.name}, ${t("network.people.tapConnect", "connect")}`
                      }
                    >
                      <img
                        className="vac-person-card__avatar"
                        src={
                          person.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.seed || person.name)}`
                        }
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
                      </div>
                      <span className="vac-person-card__chevron" aria-hidden="true">
                        ›
                      </span>
                    </button>
                  ))
                ) : showPeopleNoContacts ? (
                  <p className="vac-people__empty" id="networkPeopleNone">
                    {t("network.people.none", "No contacts yet. Accept a request above or connect with someone new.")}
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
              <div className="vac-following-list">
                {activeFollowing.length > 0 ? (
                  activeFollowing.map((person) => (
                    <article className="vac-following-row" key={person.id}>
                      <img
                        className="vac-following-row__avatar"
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.seed || person.name)}`}
                        width="56"
                        height="56"
                        alt=""
                      />
                      <div className="vac-following-row__body">
                        <h4 className="vac-following-row__name">{person.name}</h4>
                        <p className="vac-following-row__role">{person.role}</p>
                        <p className="vac-following-row__handle">@{person.handle}</p>
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
                  ))
                ) : (
                  <p className="vac-following__sub">{t("network.following.empty", "You are not following anyone right now.")}</p>
                )}
              </div>
            </section>
          )}

          {section === "groups" && (
            <section className="home-card vac-groups">
              <h3 className="vac-groups__heading">{t("network.groups.heading", "Your groups")}</h3>
              <p className="vac-groups__sub">{t("network.groups.sub", "Mini group chats with people from your network.")}</p>
              <div className="vac-groups-layout">
                <div className="vac-groups-list">
                  {groupList.map((group) => (
                    <button
                      type="button"
                      className={group.id === activeGroup?.id ? "vac-group-card vac-group-card--active" : "vac-group-card"}
                      key={group.id}
                      onClick={() => setActiveGroupId(group.id)}
                    >
                      <img className="vac-group-card__icon" src={avatarUrl(group.seed)} width="44" height="44" alt="" />
                      <span className="vac-group-card__body">
                        <span className="vac-group-card__name">{t(group.nameKey, group.nameFallback)}</span>
                        <span className="vac-group-card__preview">{group.preview}</span>
                        <span className="vac-group-card__count">
                          {tf("network.groupMemberCount", { count: String(group.members.length) }, `${group.members.length} members`)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                {activeGroup ? (
                  <div className="vac-group-chat">
                    <h4 className="vac-group-chat__title">{t(activeGroup.nameKey, activeGroup.nameFallback)}</h4>
                    <p className="vac-group-chat__meta">{t(activeGroup.descKey, activeGroup.descFallback)}</p>
                    <div className="vac-group-chat__messages">
                      {activeGroupMessages.map((message) => (
                        <div
                          key={message.id}
                          className={
                            message.out
                              ? "vac-group-chat__msg vac-group-chat__msg--out"
                              : "vac-group-chat__msg vac-group-chat__msg--in"
                          }
                        >
                          {!message.out && (
                            <img className="vac-group-chat__msg-avatar" src={avatarUrl(message.authorSeed)} width="28" height="28" alt="" />
                          )}
                          <div>
                            {!message.out ? <div className="vac-group-chat__author">{message.author}</div> : null}
                            <div className="vac-group-chat__bubble">{message.text}</div>
                            <div className="vac-group-chat__time">{formatTime(message.ts)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form className="vac-group-chat__form" onSubmit={onSendGroupMessage}>
                      <input
                        className="vac-group-chat__input"
                        value={groupInput}
                        onChange={(event) => setGroupInput(event.target.value)}
                        placeholder={t("network.groupChatPlaceholder", "Write a message...")}
                        maxLength={500}
                      />
                      <button type="submit" className="vac-group-chat__send">
                        {t("network.groupSend", "Send")}
                      </button>
                    </form>
                  </div>
                ) : null}
              </div>
            </section>
          )}

          {section === "pages" && (
            <section className="home-card vac-pages">
              <h3 className="vac-pages__heading">{t("network.pages.heading", "Pages you follow")}</h3>
              <p className="vac-pages__sub">{t("network.pages.sub", "Company and organization pages from your professional network.")}</p>
              <div className="vac-pages-list">
                {pagesWithFollow.map((page) => (
                  <article className="vac-page-card" key={page.id}>
                    <img className="vac-page-card__logo" src={pageLogoUrl(page.seed)} width="56" height="56" alt="" />
                    <div className="vac-page-card__body">
                      <div className="vac-page-card__head">
                        <h4 className="vac-page-card__name">{page.name}</h4>
                        <span className="vac-page-card__followers">{t(page.followersKey, page.followersFallback)}</span>
                      </div>
                      <p className="vac-page-card__industry">{t(page.industryKey, page.industryFallback)}</p>
                      <p className="vac-page-card__desc">{t(page.descKey, page.descFallback)}</p>
                      <p className="vac-page-card__update">
                        <span>{t("network.pageLatest", "Latest")}: </span>
                        {t(page.updateKey, page.updateFallback)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={page.following ? "vac-page-card__follow vac-page-card__follow--active" : "vac-page-card__follow"}
                      onClick={() => togglePageFollow(page.id)}
                    >
                      {page.following ? t("network.pageFollowing", "Following") : t("network.pageFollow", "Follow")}
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {section === "events" && (
            <section className="home-card vac-event-card">
              <div className="vac-event-filters">
                <button
                  type="button"
                  className={eventFilter === "all" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"}
                  onClick={() => setEventFilter("all")}
                >
                  {t("network.events.filter.all", "All")}
                </button>
                <button
                  type="button"
                  className={eventFilter === "career" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"}
                  onClick={() => setEventFilter("career")}
                >
                  {t("network.events.filter.job", "Job changes")}
                </button>
                <button
                  type="button"
                  className={eventFilter === "birthdays" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"}
                  onClick={() => setEventFilter("birthdays")}
                >
                  {t("network.events.filter.birthdays", "Birthdays")}
                </button>
                <button
                  type="button"
                  className={eventFilter === "education" ? "vac-event-filter vac-event-filter--active" : "vac-event-filter"}
                  onClick={() => setEventFilter("education")}
                >
                  {t("network.events.filter.education", "Education")}
                </button>
              </div>
              <div className="vac-event-list">
                {filteredEvents.map((event) => (
                  <article className="vac-event-item" key={event.id}>
                    <img
                      className="vac-event-item__avatar"
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(event.seed || event.name)}`}
                      width="42"
                      height="42"
                      alt=""
                    />
                    <div className="vac-event-item__body">
                      <span className="vac-event-item__badge">{typeLabel(event.type)}</span>
                      <h4>{eventText(event)}</h4>
                      <p>{t(event.timeKey, event.timeFallback)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside className="home-col-right home-card home-messages">
          <div className="home-messages__head">
            <h2 className="home-messages__title">{t("network.messages.title", "Messages")}</h2>
          </div>
          <input className="home-messages__search" type="search" placeholder={t("network.messages.search", "Search messages")} />
          <div className="home-messages__list">
            {messagesPreview.length > 0 ? (
              messagesPreview.map((msg) => (
                <button key={msg.id} type="button" className="home-messages__item" onClick={() => navigate("/chat")}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(msg.name)}`} width="34" height="34" alt="" />
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
