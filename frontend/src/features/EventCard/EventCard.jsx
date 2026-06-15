import React from 'react';
import { Calendar, Briefcase, GraduationCap, Cake } from 'lucide-react';
import './EventCard.css';
import { fileUrl } from '../../shared/api/files';

const EventCard = ({ event }) => {
  // -------- helpers: safe JSON meta --------
  const parseMeta = (meta) => {
    if (!meta) return {};
    if (typeof meta === 'object') return meta;
    try { return JSON.parse(meta); }
    catch { return {}; }
  };

  const meta = parseMeta(event?.meta);

  // -------- map backend -> UI fields (same classNames, same layout) --------
  const type = event?.action || 'event';

  const userName =
    event?.user
      ? `${event.user.firstName || ''} ${event.user.secondName || ''}`.trim()
      : '';

  const avatar = event?.user?.avatarUrl
    ? fileUrl(event.user.avatarUrl)
    : '';

  // title/description: берем из meta, иначе аккуратные дефолты
  const title =
    meta.title ||
    (type === 'career' ? 'Career update'
      : type === 'birthday' ? 'Birthday'
      : type === 'education' ? 'Education update'
      : 'Event');

  const description =
    meta.description ||
    meta.institution ||
    '';

  // date: на бекенде createdAt — уже строка, но new Date() это съест
  const dateValue = event?.createdAt;

  const getIcon = () => {
    switch (type) {
      case 'career':
        return <Briefcase size={20} />;
      case 'birthday':
        return <Cake size={20} />;
      case 'education':
        return <GraduationCap size={20} />;
      default:
        return <Calendar size={20} />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'career':
        return 'Career Update';
      case 'birthday':
        return 'Birthday';
      case 'education':
        return 'Education';
      default:
        return 'Event';
    }
  };

  const formatDate = (date) => {
    const eventDate = new Date(date);
    if (Number.isNaN(eventDate.getTime())) return '';

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfEvent = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

    const diffTime = startOfEvent - startOfToday;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`;
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

    return eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="event-card">
      <img
        src={avatar}
        alt={userName}
        className="event-card-avatar"
      />
      <div className="event-card-content">
        <div className="event-card-header">
          <div>
            <h4 className="event-card-name">{userName}</h4>
            <p className="event-card-title">{title}</p>
          </div>
          <div className={`event-card-badge event-card-badge-${type}`}>
            {getIcon()}
            <span>{getTypeLabel()}</span>
          </div>
        </div>

        {description && (
          <p className="event-card-description">{description}</p>
        )}

        <div className="event-card-footer">
          <Calendar size={14} />
          <span>{formatDate(dateValue)}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
