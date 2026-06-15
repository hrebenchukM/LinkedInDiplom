import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../features/appContext/AppContext';
import { fileUrl } from '../../shared/api/files';
import noNotificationsImg from '../../shared/assets/illustrations/no-new-notifications.png';

import './NotificationsPage.css';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import SimpleProfileCard from '../../features/SimpleProfileCard/SimpleProfileCard';

const NotificationsPage = ({ onNavigate }) => {
  const { request } = useContext(AppContext);

  const [activeFilter, setActiveFilter] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // ================= LOAD =================

  useEffect(() => {
    setLoading(true);

    const filterParam =
      activeFilter === 'all' ? '' : `?filter=${activeFilter}`;

    request(`api://notifications${filterParam}`, {}, true)
      .then(r => {
        setNotifications(mapFromApi(r.data));
        setUnreadCount(parseInt(r.meta?.params?.unread || 0));
      })
      .finally(() => setLoading(false));

  }, [activeFilter]);

  // ================= MAPPER =================

  const mapFromApi = (data = []) =>
    data.map(n => ({
      id: n.id,
      type: n.type === 'vacancy' ? 'job' : n.type,
      unread: n.isRead === 0,
      time: timeAgo(n.createdAt),

      actor: n.actor && {
        name: `${n.actor.firstName} ${n.actor.secondName}`,
        avatar: n.actor.avatarUrl ? fileUrl(n.actor.avatarUrl) : '/assets/avatar-placeholder.png',
        title: n.actor.profileTitle
      },

      vacancy: n.vacancy && {
        title: n.vacancy.title,
        location: n.vacancy.location,
        company: n.vacancy.company && {
          name: n.vacancy.company.name,
          logo: n.vacancy.company.logoUrl
            ? fileUrl(n.vacancy.company.logoUrl)
            : '/assets/company-placeholder.png'
        }
      },

      action: getActionText(n),
      content: getContentText(n)
    }));

  // ================= HELPERS =================

  const getActionText = (n) => {
    switch (n.type) {
      case 'like': return 'liked your post';
      case 'comment': return 'commented on your post';
      case 'connection': return 'accepted your connection request';
      case 'mention': return 'mentioned you';
      case 'vacancy': return 'posted a new job';
      default: return '';
    }
  };

  const getContentText = (n) =>
    n.entityType === 'post' ? n.body : null;

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // ================= RENDER =================

  const renderNotification = (notification) => {

    // -------- Vacancy --------
    if (notification.type === 'job' && notification.vacancy) {
      return (
        <div
          key={notification.id}
          className={`notification-item ${notification.unread ? 'unread' : ''}`}
        >
          <img
            src={notification.vacancy.company.logo}
            className="notification-avatar"
            alt={notification.vacancy.company.name}
          />

          <div className="notification-content">
            <p className="notification-text">
              <strong>{notification.vacancy.company.name}</strong> {notification.action}
            </p>

            <p className="notification-position">
              {notification.vacancy.title}
            </p>

            {notification.vacancy.location && (
              <p className="notification-location">
                {notification.vacancy.location}
              </p>
            )}

            <span className="notification-time">
              {notification.time}
            </span>
          </div>

          {notification.unread && <div className="notification-dot" />}
        </div>
      );
    }

    // -------- User activity --------
    return (
      <div
        key={notification.id}
        className={`notification-item ${notification.unread ? 'unread' : ''}`}
      >
        <img
          src={notification.actor?.avatar}
          className="notification-avatar"
          alt={notification.actor?.name}
        />

        <div className="notification-content">
          <p className="notification-text">
            <strong>{notification.actor?.name}</strong> {notification.action}
          </p>

          {notification.actor?.title && (
            <p className="notification-subtitle">
              {notification.actor.title}
            </p>
          )}

          {notification.content && (
            <p className="notification-excerpt">
              {notification.content}
            </p>
          )}

          <span className="notification-time">
            {notification.time}
          </span>
        </div>

        {notification.unread && <div className="notification-dot" />}
      </div>
    );
  };

  return (
    <main className="main-content">
      <div className="container">
        <div className="content-grid">

          <aside className="sidebar-left">
            <SimpleProfileCard unreadNotifications={unreadCount} />
          </aside>

          <section className="notifications-feed">

            <div className="notifications-filters">
              {['all', 'vacancies', 'publications', 'mentions'].map(f => (
                <button
                  key={f}
                  className={`filter-btn ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>

            {!loading && notifications.length > 0 && (
              <div className="notifications-list">
                {notifications.map(renderNotification)}
              </div>
            )}

{!loading && notifications.length === 0 && (
  <div className="notifications-empty">

  <div className="empty-illustration">
  <img
    src={noNotificationsImg}
    alt="No notifications"
    className="empty-illustration-img"
  />
</div>


    <h2 className="empty-title">
      No new notifications
    </h2>

    <p className="empty-subtitle">
      Check out the other updates on the home page
    </p>

    <button
      className="home-page-btn"
      onClick={() => onNavigate('home')}
    >
      Home page
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
