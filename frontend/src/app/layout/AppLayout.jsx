import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { PageTransitionOutlet } from "./PageTransitionOutlet";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../features/auth/AuthContext";
import { useChatStore } from "../../features/chat/ChatStore";
import { useNetworkStore } from "../../features/network/NetworkStore";
import * as notificationsApi from "../../features/notifications/notificationsApi";
import { mapNotificationDtoToUi } from "../../features/notifications/mapNotifications";
import { useBackendApi } from "../../shared/hooks/useBackendApi";
import { useUiSettings } from "../providers/AppProviders";
import { GlobalSearch } from "../../shared/ui/GlobalSearch";
import { AiWelcomeToast } from "../../shared/ui/AiWelcomeToast";
import { countUnreadIncoming, markInboxPeerRead } from "../../shared/lib/messageRead";
import { readJson, writeJson } from "../../shared/lib/storage";
import {
  getAiWelcomeUserKey,
  markAiWelcomeDelivered,
  shouldShowAiWelcome,
} from "../../shared/lib/aiWelcomeNotification";
const READ_NOTIFICATIONS_KEY = "readNotificationIds";

function hydrateNotifications() {
  const readIds = new Set(readJson(READ_NOTIFICATIONS_KEY, []));
  return initialNotifications.map((item) => ({
    ...item,
    unread: readIds.has(item.id) ? false : item.unread,
  }));
}

function persistNotificationRead(notificationId) {
  const readIds = new Set(readJson(READ_NOTIFICATIONS_KEY, []));
  readIds.add(notificationId);
  writeJson(READ_NOTIFICATIONS_KEY, [...readIds]);
}

const navItems = [
  { to: "/home", labelKey: "nav.home", icon: "home" },
  { to: "/network", labelKey: "nav.network", icon: "network" },
  { to: "/vacancies", labelKey: "nav.vacancies", icon: "jobs" },
  { to: "/chat", labelKey: "nav.messages", icon: "messages" },
  { to: "/profile", labelKey: "nav.profile", icon: "profile" },
];

const initialNotifications = [
  {
    id: "n-1",
    unread: true,
    peerId: "sarahchen",
    textKey: "notify.item.newMessage",
    fallback: "New message from Sarah Chen",
    timeKey: "notify.time.2m",
    timeFallback: "2m",
    to: "/chat",
  },
  {
    id: "n-2",
    unread: true,
    textKey: "notify.item.jobUpdate",
    fallback: "Your application status was updated",
    timeKey: "notify.time.14m",
    timeFallback: "14m",
    to: "/vacancies",
  },
  {
    id: "n-3",
    unread: false,
    textKey: "notify.item.profileView",
    fallback: "Someone viewed your profile",
    timeKey: "notify.time.1h",
    timeFallback: "1h",
    to: "/profile",
  },
];

function NavMonoIcon({ icon }) {
  if (icon === "home") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.8V20h13V9.8" />
      </svg>
    );
  }
  if (icon === "network") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16.5" cy="7.5" r="2.5" />
        <path d="M3.5 19c0-3 2.2-5 4.9-5H9c2.7 0 4.9 2 4.9 5" />
        <path d="M13.7 18.5c.4-2 1.8-3.3 3.9-3.3 2.2 0 3.9 1.5 3.9 3.8" />
      </svg>
    );
  }
  if (icon === "jobs") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="7" width="17" height="12.5" rx="2.2" />
        <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      </svg>
    );
  }
  if (icon === "messages") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 6.5h15a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9l-4.5 3v-3h-1.5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.2" r="3.2" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function BellMonoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 9.5a5.5 5.5 0 0 1 11 0v4.2l1.5 2.2v1.1h-14v-1.1l1.5-2.2z" />
      <path d="M10 18.5a2 2 0 0 0 4 0" />
    </svg>
  );
}

export function AppLayout() {
  const { session, logout } = useAuth();
  const { chats, markChatAsReadByPeer, openAiAssistantChat, ensureAiAssistantWelcomeChat, totalUnreadCount } = useChatStore();
  const { pendingContactCounts } = useNetworkStore();
  const useApi = useBackendApi();
  const pendingIncomingCount = useApi ? pendingContactCounts.incomingCount : 0;
  const { theme, lang, setLang, supportedLangs, t, toggleTheme } = useUiSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [transitionActive, setTransitionActive] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [notifications, setNotifications] = useState(hydrateNotifications);
  const [messageReadTick, setMessageReadTick] = useState(0);
  const [aiToastVisible, setAiToastVisible] = useState(false);
  const lastScrollY = useRef(0);
  const ensureAiWelcomeRef = useRef(ensureAiAssistantWelcomeChat);
  const translateRef = useRef(t);

  ensureAiWelcomeRef.current = ensureAiAssistantWelcomeChat;
  translateRef.current = t;

  const canonicalPeerId =
    typeof window.canonicalPeerId === "function"
      ? window.canonicalPeerId
      : (value) => String(value || "").trim().toLowerCase();

  const unreadCount = notifications.filter((item) => item.unread).length;

  function markMessageNotificationsRead(peer) {
    const slug = canonicalPeerId(peer);
    if (!slug) return;
    markInboxPeerRead(slug);
    setNotifications((prev) =>
      prev.map((item) => {
        if (!item.peerId || canonicalPeerId(item.peerId) !== slug || !item.unread) {
          return item;
        }
        persistNotificationRead(item.id);
        return { ...item, unread: false };
      }),
    );
  }

  async function markNotificationRead(notificationId) {
    const target = notifications.find((item) => item.id === notificationId);
    if (useApi && target?._api) {
      try {
        await notificationsApi.markNotificationRead(notificationId);
      } catch {
        // still update UI locally
      }
    }
    persistNotificationRead(notificationId);
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId && item.unread ? { ...item, unread: false } : item,
      ),
    );
  }

  function openNotification(notificationId, to) {
    const notification = notifications.find((item) => item.id === notificationId);
    if (notification?.peerId) {
      const slug = canonicalPeerId(notification.peerId);
      markInboxPeerRead(slug);
      markChatAsReadByPeer(notification.peerId);
    }
    markNotificationRead(notificationId);
    navigate(to);
  }

  function dismissAiToast() {
    setAiToastVisible(false);
  }

  function acceptAiToast() {
    const welcomeText = t(
      "notify.toast.aiMessage",
      "Welcome! I can help you set up your profile and connect with the right people.",
    );
    openAiAssistantChat({
      peerName: t("notify.aiAssistantName", "AI Assistant"),
      welcomeText,
    });
    setAiToastVisible(false);
    navigate("/chat");
  }

  useEffect(() => {
    if (location.pathname !== "/home") {
      setAiToastVisible(false);
      return undefined;
    }

    if (!session.isAuthenticated) return undefined;

    const userKey = getAiWelcomeUserKey();
    if (!shouldShowAiWelcome(userKey)) return undefined;

    const timer = window.setTimeout(() => {
      const key = getAiWelcomeUserKey();
      if (!shouldShowAiWelcome(key)) return;

      const tr = translateRef.current;
      ensureAiWelcomeRef.current({
        peerName: tr("notify.aiAssistantName", "AI Assistant"),
        welcomeText: tr(
          "notify.toast.aiMessage",
          "Welcome! I can help you set up your profile and connect with the right people.",
        ),
      });
      setAiToastVisible(true);
      markAiWelcomeDelivered(key);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [location.pathname, session.isAuthenticated, session.user?.email, session.user?.userName]);

  useEffect(() => {
    function onChatRead(event) {
      markMessageNotificationsRead(event.detail?.peer);
      setMessageReadTick((value) => value + 1);
    }

    document.addEventListener("chatread", onChatRead);
    return () => document.removeEventListener("chatread", onChatRead);
  }, []);

  useEffect(() => {
    const readIds = new Set(readJson(READ_NOTIFICATIONS_KEY, []));

    setNotifications((prev) => {
      let changed = false;
      const next = prev.map((item) => {
        if (!item.unread) return item;
        if (readIds.has(item.id)) {
          changed = true;
          return { ...item, unread: false };
        }
        if (!item.peerId) return item;

        const slug = canonicalPeerId(item.peerId);
        const chat = chats.find((entry) => {
          const chatPeer = canonicalPeerId(entry.peer);
          const chatId = canonicalPeerId(entry.id);
          return chatPeer === slug || chatId === slug;
        });
        const chatUnread = chat ? countUnreadIncoming(chat) : 0;
        const shouldMarkRead = chatUnread === 0;

        if (!shouldMarkRead) return item;

        changed = true;
        persistNotificationRead(item.id);
        return { ...item, unread: false };
      });

      return changed ? next : prev;
    });
  }, [chats, messageReadTick, canonicalPeerId]);

  useEffect(() => {
    if (!useApi) return;
    let cancelled = false;
    notificationsApi
      .fetchMyNotifications({ limit: 30 })
      .then((items) => {
        if (cancelled) return;
        const mapped = items.map(mapNotificationDtoToUi);
        setNotifications(mapped.length ? mapped : hydrateNotifications());
      })
      .catch(() => {
        if (!cancelled) setNotifications(hydrateNotifications());
      });
    return () => {
      cancelled = true;
    };
  }, [useApi, session.user?.id]);

  useEffect(() => {
    const routeReadMap = {
      "/vacancies": "n-2",
      "/profile": "n-3",
    };
    const notificationId = routeReadMap[location.pathname];
    if (!notificationId) return;

    setNotifications((prev) => {
      const target = prev.find((item) => item.id === notificationId);
      if (!target?.unread) return prev;
      persistNotificationRead(notificationId);
      return prev.map((item) =>
        item.id === notificationId ? { ...item, unread: false } : item,
      );
    });
  }, [location.pathname]);

  const handleTransitionStart = useCallback(() => {
    setTransitionActive(true);
    setHeaderHidden(false);
    lastScrollY.current = window.scrollY;
    document.documentElement.classList.add("page-header-enter");
  }, []);

  const handleTransitionEnd = useCallback(() => {
    setTransitionActive(false);
    document.documentElement.classList.remove("page-header-enter");
  }, []);

  useEffect(() => {
    let ticking = false;

    function updateHeaderVisibility() {
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY.current;

      if (currentY <= 72) {
        setHeaderHidden(false);
      } else if (delta > 10) {
        setHeaderHidden(true);
      } else if (delta < -10) {
        setHeaderHidden(false);
      }

      lastScrollY.current = currentY;
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeaderVisibility);
    }

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="app-shell">
      <div className={transitionActive ? "page-transition-overlay page-transition-overlay--active" : "page-transition-overlay"}>
        {transitionActive && <div className="page-transition-overlay__glow" />}
      </div>
      <header className={headerHidden ? "app-header app-header--hidden" : "app-header"}>
        <div className="app-header__inner">
          <div className="app-header__start">
            <div className="app-header__left">
              <button className="brand-btn" onClick={() => navigate("/home")}>
                <span className="brand-btn__logo" aria-hidden="true">
                  In
                </span>
              </button>
            </div>

            <div className="app-header__center">
              <GlobalSearch />
            </div>
          </div>

          <nav className="app-header__nav" aria-label="Main navigation">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "header-nav-link header-nav-link--active" : "header-nav-link"
                }
              >
                <span className="header-nav-link__icon" aria-hidden="true">
                  <NavMonoIcon icon={item.icon} />
                </span>
                <span>{t(item.labelKey, item.labelKey)}</span>
                {item.to === "/chat" && totalUnreadCount > 0 ? (
                  <span className="header-nav-link__badge">{totalUnreadCount}</span>
                ) : null}
                {item.to === "/network" && pendingIncomingCount > 0 ? (
                  <span className="header-nav-link__badge">{pendingIncomingCount}</span>
                ) : null}
              </NavLink>
            ))}
          </nav>

          <div className="app-header__right">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            data-theme-toggle="true"
            aria-pressed={theme === "dark" ? "true" : "false"}
            aria-label={theme === "dark" ? t("theme.switchLight", "Switch to light theme") : t("theme.switchDark", "Switch to dark theme")}
            title={theme === "dark" ? t("theme.light", "Light theme") : t("theme.dark", "Dark theme")}
          >
            <svg
              className="theme-toggle__icon theme-toggle__icon--moon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3c0 0-1.2 6.8 2.8 10.8S21 12.79 21 12.79z" />
            </svg>
            <svg
              className="theme-toggle__icon theme-toggle__icon--sun"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </button>
          <div className="header-notify">
            <button
              type="button"
              className="theme-toggle header-notify__btn"
              aria-label={t("notify.label", "Notifications")}
              title={t("notify.title", "Notifications")}
            >
              <BellMonoIcon />
              {unreadCount > 0 ? <span className="header-notify__badge">{unreadCount}</span> : null}
            </button>
            <div className="header-notify__menu" role="menu" aria-label={t("notify.menu", "Unread and missed notifications")}>
              <div className="header-notify__head">
                <strong>{t("notify.title", "Notifications")}</strong>
                <span>{t("notify.unread", "Unread")}: {unreadCount}</span>
              </div>
              <div className="header-notify__list">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      item.unread
                        ? "header-notify__item header-notify__item--unread"
                        : "header-notify__item"
                    }
                    onClick={() => openNotification(item.id, item.to)}
                  >
                    <span className="header-notify__text">
                      {item._api ? item.text : t(item.textKey, item.fallback)}
                    </span>
                    <span className="header-notify__time">
                      {item._api ? item.time : t(item.timeKey, item.timeFallback || item.time)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <select
            id="lang-select"
            className="small-btn"
            value={lang}
            onChange={(event) => setLang(event.target.value)}
            aria-label="Language"
            title="Language"
          >
            {supportedLangs.map((code) => (
              <option key={code} value={code}>
                {t(`lang.${code}`, code.toUpperCase())}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="user-pill"
            title={session.user?.name || "Guest"}
            onClick={() => navigate("/profile")}
          >
            {session.user?.name || t("common.guest", "Guest")}
          </button>
          <button
            type="button"
            className="small-btn"
            onClick={async () => {
              await logout();
              navigate("/auth");
            }}
          >
            {t("nav.logout", "Logout")}
          </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <PageTransitionOutlet
          onTransitionStart={handleTransitionStart}
          onTransitionEnd={handleTransitionEnd}
        />
      </main>
      <footer className="home-footer">
        <div className="home-footer__inner">
          <div className="home-footer__cols">
            <div className="home-footer__col">
              <span className="home-footer__link">{t("network.footer.about", "About")}</span>
              <span className="home-footer__link">{t("network.footer.careers", "Careers")}</span>
              <span className="home-footer__link">{t("network.footer.ads", "Ad settings")}</span>
            </div>
            <div className="home-footer__col">
              <span className="home-footer__link">{t("network.footer.accessibility", "Accessibility")}</span>
              <span className="home-footer__link">{t("network.footer.privacy", "Privacy & Terms")}</span>
              <span className="home-footer__link">{t("network.footer.mobile", "Mobile app")}</span>
            </div>
            <div className="home-footer__col">
              <span className="home-footer__link">{t("network.footer.guidelines", "Community guidelines")}</span>
              <span className="home-footer__link">{t("network.footer.solutions", "Ad solutions")}</span>
            </div>
            <div className="home-footer__col">
              <span className="home-footer__link">{t("network.footer.questions", "Questions?")}</span>
              <span className="home-footer__link">{t("network.footer.transparency", "Recommendation transparency")}</span>
            </div>
          </div>
        </div>
      </footer>

      <AiWelcomeToast
        visible={aiToastVisible}
        onAccept={acceptAiToast}
        onDismiss={dismissAiToast}
      />
    </div>
  );
}
