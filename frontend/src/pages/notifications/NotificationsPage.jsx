import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import noNotificationsImg from '../../shared/assets/illustrations/no-new-notifications.png';
import { DEFAULT_PAGE_SIZE } from '../../shared/api/config';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';
import { getErrorMessage } from '../../shared/lib/apiError';
import {
  deleteNotification,
  getMyNotifications,
  getUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../features/notifications/notificationsApi';
import { enrichNotifications } from '../../features/notifications/enrichNotifications';
import { mapNotificationDto } from '../../features/notifications/mapNotifications';
import {
  onNotificationCreated,
  offNotificationCreated,
} from '../../features/notifications/notificationsSignalRService';
import { notifyNotificationsUnreadChanged } from '../../features/notifications/notificationsEvents';

import './NotificationsPage.css';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import SimpleProfileCard from '../../features/SimpleProfileCard/SimpleProfileCard';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const NotificationsPage = ({ onNavigate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const resolveIsReadFilter = () => {
    if (activeFilter === 'unread') return false;
    if (activeFilter === 'read') return true;
    return undefined;
  };

  const refreshUnreadCount = useCallback(async () => {
    const count = await getUnreadCount();
    setUnreadCount(count);
  }, []);

  const loadNotifications = useCallback(async ({
    pageToLoad = 1,
    append = false,
    filter = activeFilter,
  } = {}) => {
    if (pageToLoad === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError('');

    const isRead = filter === 'unread'
      ? false
      : filter === 'read'
        ? true
        : undefined;

    try {
      const response = await getMyNotifications({
        page: pageToLoad,
        pageSize: DEFAULT_PAGE_SIZE,
        isRead,
      });

      const enriched = await enrichNotifications(response.items);

      setNotifications((prev) => (append ? [...prev, ...enriched] : enriched));
      setPage(response.page);
      setHasNextPage(response.hasNextPage);

      if (filter === 'all' || filter === 'unread') {
        const count = await getUnreadCount();
        setUnreadCount(count);
        notifyNotificationsUnreadChanged(count);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      if (!append) {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeFilter, refreshUnreadCount]);

  useEffect(() => {
    loadNotifications({ pageToLoad: 1, append: false, filter: activeFilter });
  }, [activeFilter]);

  useEffect(() => {
    const handleCreated = async (payload) => {
      if (!payload?.id) return;
      if (activeFilter === 'read') return;

      const mapped = mapNotificationDto(payload);
      if (!mapped) return;

      const [enriched] = await enrichNotifications([mapped]);
      if (!enriched) return;

      setNotifications((prev) => {
        if (prev.some((item) => item.id === enriched.id)) {
          return prev;
        }

        if (activeFilter === 'unread' && enriched.isRead) {
          return prev;
        }

        return [enriched, ...prev];
      });

      if (!enriched.isRead) {
        setUnreadCount((prev) => {
          const next = prev + 1;
          notifyNotificationsUnreadChanged(next);
          return next;
        });
      }
    };

    onNotificationCreated(handleCreated);

    return () => {
      offNotificationCreated(handleCreated);
    };
  }, [activeFilter]);

  const handleNotificationClick = async (notification) => {
    if (!notification?.id) return;

    if (!notification.isRead) {
      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true, unread: false }
            : item,
        ),
      );
      setUnreadCount((prev) => {
        const next = Math.max(0, prev - 1);
        notifyNotificationsUnreadChanged(next);
        return next;
      });

      try {
        await markNotificationAsRead(notification.id);
      } catch {
        await loadNotifications({ pageToLoad: 1, append: false });
      }
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDelete = async (event, notificationId) => {
    event.stopPropagation();

    const removed = notifications.find((item) => item.id === notificationId);
    setNotifications((prev) => prev.filter((item) => item.id !== notificationId));

    if (removed && !removed.isRead) {
      setUnreadCount((prev) => {
        const next = Math.max(0, prev - 1);
        notifyNotificationsUnreadChanged(next);
        return next;
      });
    }

    try {
      await deleteNotification(notificationId);
    } catch (err) {
      setError(getErrorMessage(err));
      await loadNotifications({ pageToLoad: 1, append: false });
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    setError('');

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, isRead: true, unread: false })),
    );
    setUnreadCount(0);
    notifyNotificationsUnreadChanged(0);

    try {
      await markAllNotificationsAsRead();
    } catch (err) {
      setError(getErrorMessage(err));
      await loadNotifications({ pageToLoad: 1, append: false });
    } finally {
      setMarkingAll(false);
    }
  };

  const handleLoadMore = () => {
    if (!hasNextPage || loadingMore) return;
    loadNotifications({ pageToLoad: page + 1, append: true });
  };

  const renderNotification = (notification) => {
    const vacancy = notification.entity?.type === 'vacancy'
      ? notification.entity.data
      : null;

    if ((notification.type === 'job' || notification.type === 'vacancy') && vacancy) {
      return (
        <div
          key={notification.id}
          className={`notification-item ${notification.unread ? 'unread' : ''}`}
          onClick={() => handleNotificationClick(notification)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') handleNotificationClick(notification);
          }}
          role="button"
          tabIndex={0}
        >
          <SafeImage
            src={getAssetUrl(vacancy.companyLogo || vacancy.company?.logo, IMAGE_PLACEHOLDERS.company)}
            fallback={IMAGE_PLACEHOLDERS.company}
            className="notification-avatar"
            alt={vacancy.companyName || 'Company'}
          />

          <div className="notification-content">
            <p className="notification-text">
              <strong>{vacancy.companyName || 'Company'}</strong>{' '}
              {notification.action || notification.displayTitle}
            </p>

            <p className="notification-position">{vacancy.title}</p>

            {vacancy.location && (
              <p className="notification-location">{vacancy.location}</p>
            )}

            <span className="notification-time">{notification.time}</span>
          </div>

          <button
            type="button"
            className="notification-delete-btn"
            onClick={(event) => handleDelete(event, notification.id)}
            aria-label={t('notify.delete', 'Delete notification')}
          >
            <X size={16} />
          </button>

          {notification.unread && <div className="notification-dot" />}
        </div>
      );
    }

    const avatar = getAssetUrl(
      notification.actorAvatar || notification.actor?.avatar,
      IMAGE_PLACEHOLDERS.avatar,
    );
    const actorName = notification.actorName || notification.actor?.name || 'User';
    const actorUserId =
      notification.actorUserId ?? notification.actor?.id ?? null;

    const openActorProfile = (event) => {
      if (!actorUserId) return;
      event.stopPropagation();
      navigate(`/app/profile/${actorUserId}`);
    };

    return (
      <div
        key={notification.id}
        className={`notification-item ${notification.unread ? 'unread' : ''}`}
        onClick={() => handleNotificationClick(notification)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleNotificationClick(notification);
        }}
        role="button"
        tabIndex={0}
      >
        <SafeImage
          src={avatar}
          fallback={IMAGE_PLACEHOLDERS.avatar}
          className={`notification-avatar${actorUserId ? ' notification-avatar--clickable' : ''}`}
          alt={actorName}
          onClick={actorUserId ? openActorProfile : undefined}
          style={actorUserId ? { cursor: 'pointer' } : undefined}
        />

        <div className="notification-content">
          <p className="notification-text">
            {notification.title ? (
              <strong>{notification.displayTitle}</strong>
            ) : (
              <>
                {actorUserId ? (
                  <button
                    type="button"
                    className="notification-actor-link"
                    onClick={openActorProfile}
                  >
                    {actorName}
                  </button>
                ) : (
                  <strong>{actorName}</strong>
                )}{' '}
                {notification.action}
              </>
            )}
          </p>

          {(notification.actor?.title || notification.actor?.profileTitle) && (
            <p className="notification-subtitle">
              {notification.actor.title || notification.actor.profileTitle}
            </p>
          )}

          {notification.displayBody && (
            <p className="notification-excerpt">{notification.displayBody}</p>
          )}

          <span className="notification-time">{notification.time}</span>
        </div>

        <button
          type="button"
          className="notification-delete-btn"
          onClick={(event) => handleDelete(event, notification.id)}
          aria-label={t('notify.delete', 'Delete notification')}
        >
          <X size={16} />
        </button>

        {notification.unread && <div className="notification-dot" />}
      </div>
    );
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="content-grid">

          <aside className="sidebar-left">
            <SimpleProfileCard />
          </aside>

          <section className="notifications-feed">

            <div className="notifications-toolbar">
              <div className="notifications-filters">
                {[
                  { id: 'all', labelKey: 'notify.filter.all', fallback: 'All' },
                  { id: 'unread', labelKey: 'notify.filter.unread', fallback: 'Unread' },
                  { id: 'read', labelKey: 'notify.filter.read', fallback: 'Read' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFilter(filter.id);
                      setPage(1);
                    }}
                  >
                    {t(filter.labelKey, filter.fallback)}
                    {filter.id === 'unread' && unreadCount > 0 && (
                      <span className="filter-count">{unreadCount}</span>
                    )}
                  </button>
                ))}
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="mark-all-read-btn"
                  onClick={handleMarkAllRead}
                  disabled={markingAll}
                >
                  {markingAll ? t('common.marking', 'Marking...') : t('notify.markAllAsRead', 'Mark all as read')}
                </button>
              )}
            </div>

            {error && <div className="notifications-error">{error}</div>}

            {loading && (
              <div className="notifications-loading">{t('notify.loading', 'Loading notifications...')}</div>
            )}

            {!loading && notifications.length > 0 && (
              <div className="notifications-list">
                {notifications.map(renderNotification)}
              </div>
            )}

            {!loading && hasNextPage && (
              <button
                type="button"
                className="notifications-load-more"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? t('common.loading', 'Loading...') : t('common.loadMore', 'Load more')}
              </button>
            )}

            {!loading && notifications.length === 0 && (
              <div className="notifications-empty">
                <div className="empty-illustration">
                  <img
                    src={noNotificationsImg}
                    alt={t('notify.emptyTitle', 'No new notifications')}
                    className="empty-illustration-img"
                  />
                </div>

                <h2 className="empty-title">{t('notify.emptyTitle', 'No new notifications')}</h2>

                <p className="empty-subtitle">
                  {t('notify.emptySubtitle', 'Check out the other updates on the home page')}
                </p>

                <button
                  type="button"
                  className="home-page-btn"
                  onClick={() => (onNavigate ? onNavigate('home') : navigate('/app'))}
                >
                  {t('notify.homePage', 'Home page')}
                </button>
              </div>
            )}

          </section>

          <aside className="sidebar-right">
            <MessagesPanel onNavigate={onNavigate} onSelectChat={() => {}} />
          </aside>

        </div>
      </div>
    </main>
  );
};

export default NotificationsPage;
