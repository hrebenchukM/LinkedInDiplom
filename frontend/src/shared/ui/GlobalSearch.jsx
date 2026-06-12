import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUiSettings } from "../../app/providers/AppProviders";
import * as jobsApi from "../../features/jobs/jobsApi";
import { useNetworkStore } from "../../features/network/NetworkStore";
import { useChatStore } from "../../features/chat/ChatStore";
import { useProfileStore } from "../../features/profile/ProfileStore";
import { getMessagePreview } from "../lib/callMessage";
import { useBackendApi } from "../hooks/useBackendApi";
const MIN_QUERY_LENGTH = 2;

const pages = [
  { id: "p1", titleKey: "nav.home", fallback: "Home feed", to: "/home" },
  { id: "p2", titleKey: "nav.network", fallback: "My network", to: "/network" },
  { id: "p3", titleKey: "nav.vacancies", fallback: "Vacancies", to: "/vacancies" },
  { id: "p4", titleKey: "nav.messages", fallback: "Messages", to: "/chat" },
  { id: "p5", titleKey: "nav.profile", fallback: "My profile", to: "/profile" },
];

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useUiSettings();
  const useApi = useBackendApi();
  const { people } = useNetworkStore();
  const { chats, setActiveChat } = useChatStore();
  const { profile } = useProfileStore();
  const [apiVacancies, setApiVacancies] = useState([]);
  const vacancies = useApi ? apiVacancies : [];

  useEffect(() => {
    if (!useApi) {
      setApiVacancies([]);
      return;
    }
    let cancelled = false;
    jobsApi
      .fetchVacancies({ page: 1, pageSize: 50 })
      .then((result) => {
        if (!cancelled) setApiVacancies(result.items || []);
      })
      .catch(() => {
        if (!cancelled) setApiVacancies([]);
      });
    return () => {
      cancelled = true;
    };
  }, [useApi]);

  const searchIndex = useMemo(() => {
    const pageItems = pages.map((item) => ({
      id: item.id,
      title: t(item.titleKey, item.fallback),
      kind: t("search.kind.page", "Page"),
      to: item.to,
      keywords: [t(item.titleKey, item.fallback), item.to.replace("/", "")],
    }));

    const peopleItems = people.map((person) => ({
      id: `person-${person.id}`,
      title: person.name,
      kind: t("search.kind.person", "Person"),
      subtitle: person.role,
      to: person.userId ? `/profile/${person.userId}` : "/network",
      keywords: [person.name, person.role, person.handle, person.keywords],
    }));

    const chatItems = chats.map((chat) => {
      const lastMessage = chat.messages?.[chat.messages.length - 1] || null;
      const lastText = lastMessage ? getMessagePreview(lastMessage, t) : "";
      return {
        id: `chat-${chat.id}`,
        title: chat.peer,
        kind: t("search.kind.chat", "Chat"),
        subtitle: lastText,
        to: "/chat",
        chatId: chat.id,
        keywords: [chat.peer, lastText],
      };
    });

    const vacancyItems = vacancies.map((job) => ({
      id: `vac-${job.id}`,
      title: job.title || job.role || "",
      kind: t("search.kind.job", "Job"),
      subtitle: [job.company, job.city || job.location].filter(Boolean).join(" · "),
      to: "/vacancies",
      keywords: [job.title || "", job.role || "", job.company || "", job.city || "", job.location || ""],
    }));

    const profileItems = [
      {
        id: "profile-main",
        title: profile.name || t("nav.profile", "Profile"),
        kind: t("search.kind.profile", "Profile"),
        subtitle: profile.headline || "",
        to: "/profile",
        keywords: [profile.name || "", profile.headline || "", profile.city || "", profile.about || ""],
      },
      {
        id: "section-notifications",
        title: t("notify.title", "Notifications"),
        kind: t("search.kind.section", "Section"),
        to: "/home",
        keywords: [t("notify.title", "Notifications"), t("notify.unread", "Unread")],
      },
      {
        id: "section-skills",
        title: t("profile.skills", "Skills"),
        kind: t("search.kind.section", "Section"),
        to: "/profile",
        keywords: [t("profile.skills", "Skills"), t("profile.projectName", "Project name"), t("profile.field.education", "Education")],
      },
    ];

    return [...pageItems, ...peopleItems, ...chatItems, ...vacancyItems, ...profileItems];
  }, [chats, people, profile, setActiveChat, t, vacancies]);

  const suggestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < MIN_QUERY_LENGTH) {
      return [];
    }
    return searchIndex
      .filter((item) => item.to !== location.pathname)
      .map((item) => ({
        ...item,
        haystack: [item.title, item.subtitle, ...(item.keywords || [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      }))
      .filter((item) => item.haystack.includes(normalized))
      .slice(0, 12);
  }, [location.pathname, query, searchIndex]);

  const showSuggestions = isOpen && suggestions.length > 0;

  function goTo(item) {
    if (!item) return;
    if (item.chatId) setActiveChat(item.chatId);
    setQuery("");
    setIsOpen(false);
    navigate(item.to);
  }

  useEffect(() => {
    function handleDocumentClick(event) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleDocumentClick);
    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
    };
  }, []);

  return (
    <div className="global-search" ref={rootRef}>
      <input
        className="global-search__input"
        value={query}
        onFocus={() => {
          if (query.trim().length >= MIN_QUERY_LENGTH && suggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        onChange={(event) => {
          const value = event.target.value;
          setQuery(value);
          setActiveIndex(0);
          setIsOpen(value.trim().length >= MIN_QUERY_LENGTH);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
            return;
          }
          if (!showSuggestions) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((prev) => (prev + 1) % suggestions.length);
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
          }
          if (event.key === "Enter") {
            event.preventDefault();
            goTo(suggestions[activeIndex]);
          }
        }}
        placeholder={t("nav.searchAll", "Search all...")}
        aria-label={t("nav.globalSearch", "Global search")}
      />

      {showSuggestions && (
        <ul className="global-search__list" role="listbox">
          {suggestions.map((item, idx) => (
            <li key={item.id}>
              <button
                className={idx === activeIndex ? "global-search__item global-search__item--active" : "global-search__item"}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => goTo(item)}
              >
                <span className="global-search__main">
                  <span className="global-search__title">{item.title}</span>
                  {item.subtitle ? (
                    <span className="global-search__subtitle">{item.subtitle}</span>
                  ) : null}
                </span>
                <span className="global-search__kind">{item.kind || t("common.page", "page")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
