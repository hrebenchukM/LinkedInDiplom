import React, { useState } from 'react';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './EventCard.css';
import { joinEvent, leaveEvent } from '../events/eventsApi';
import { getErrorMessage } from '../../shared/lib/apiError';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const EventCard = ({
  event,
  onOpen,
  onJoin,
  onLeave,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAttending, setIsAttending] = useState(Boolean(event?.isAttending));
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!event) return null;

  const isLegacyActivity = Boolean(event?.action || event?.user);

  if (isLegacyActivity) {
    return <LegacyActivityCard event={event} t={t} />;
  }

  const organizerName =
    event.organizer?.name
    || `${event.organizer?.firstName || ''} ${event.organizer?.secondName || ''}`.trim()
    || t('event.organizer', 'Organizer');

  const avatar = getAssetUrl(
    event.organizer?.avatar
      || event.organizer?.avatarUrl
      || event.coverUrl
      || event.coverImageUrl,
    IMAGE_PLACEHOLDERS.event,
  );

  const formatDate = (dateValue) => {
    const eventDate = new Date(dateValue);
    if (Number.isNaN(eventDate.getTime())) return event.date || '';

    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfEvent = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
    );

    const diffDays = Math.round((startOfEvent - startOfToday) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('eventCard.today', 'Today');
    if (diffDays === 1) return t('eventCard.tomorrow', 'Tomorrow');
    if (diffDays > 1 && diffDays <= 7) return t('eventCard.inDays', 'In {n} days', { n: diffDays });
    if (diffDays === -1) return t('eventCard.yesterday', 'Yesterday');
    if (diffDays < -1 && diffDays >= -7) {
      return t('eventCard.daysAgo', '{n} days ago', { n: Math.abs(diffDays) });
    }

    return event.date || eventDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleAttendance = async (eventClick) => {
    eventClick.preventDefault();
    eventClick.stopPropagation();

    if (!event.id || loading) return;

    setActionError('');
    setLoading(true);

    const previous = isAttending;
    const next = !previous;
    setIsAttending(next);

    try {
      if (next) {
        await (onJoin ? onJoin(event.id) : joinEvent(event.id));
      } else {
        await (onLeave ? onLeave(event.id) : leaveEvent(event.id));
      }
    } catch (err) {
      setIsAttending(previous);
      setActionError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const organizerId = event.organizer?.id ?? null;

  const handleOrganizerProfileClick = (clickEvent) => {
    clickEvent.preventDefault();
    clickEvent.stopPropagation();
    if (organizerId) navigate(`/app/profile/${organizerId}`);
  };

  const cardContent = (
    <>
      <SafeImage
        src={avatar}
        fallback={IMAGE_PLACEHOLDERS.event}
        alt={organizerName}
        className={`event-card-avatar${organizerId ? ' event-card-avatar--clickable' : ''}`}
        onClick={organizerId ? handleOrganizerProfileClick : undefined}
        style={organizerId ? { cursor: 'pointer' } : undefined}
      />
      <div className="event-card-content">
        <div className="event-card-header">
          <div>
            <h4
              className={`event-card-name${organizerId ? ' event-card-name--clickable' : ''}`}
              onClick={organizerId ? handleOrganizerProfileClick : undefined}
              role={organizerId ? 'button' : undefined}
              tabIndex={organizerId ? 0 : undefined}
              onKeyDown={
                organizerId
                  ? (keyEvent) => {
                      if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                        keyEvent.preventDefault();
                        keyEvent.stopPropagation();
                        navigate(`/app/profile/${organizerId}`);
                      }
                    }
                  : undefined
              }
            >
              {organizerName}
            </h4>
            <p className="event-card-title">{event.title}</p>
          </div>
          <div className={`event-card-badge event-card-badge-${event.isOnline ? 'education' : 'career'}`}>
            <Calendar size={20} />
            <span>{event.isOnline
              ? t('network.events.badge.online', 'Online')
              : t('network.events.badge.inPerson', 'In person')}</span>
          </div>
        </div>

        {event.location && (
          <p className="event-card-description">{event.location}</p>
        )}

        <div className="event-card-footer">
          <Calendar size={14} />
          <span>{formatDate(event.startAt || event.createdAt)}</span>
          {event.attendeesCount > 0 && (
            <>
              <Users size={14} />
              <span>{event.attendeesCount}</span>
            </>
          )}
          {event.location && (
            <>
              <MapPin size={14} />
              <span>{event.location}</span>
            </>
          )}
        </div>

        {actionError && (
          <p className="event-card-action-error">{actionError}</p>
        )}

        <div className="event-card-actions">
          <button
            type="button"
            className={`event-card-action-btn ${isAttending ? 'is-attending' : ''}`}
            onClick={handleAttendance}
            disabled={loading}
          >
            {loading
              ? t('eventCard.saving', 'Saving...')
              : isAttending
                ? t('network.events.badge.attending', 'Attending')
                : t('network.events.join', 'Join')}
          </button>
        </div>
      </div>
    </>
  );

  if (onOpen && event.id) {
    return (
      <Link
        to={`/app/event/${event.id}`}
        className="event-card event-card-link"
        onClick={() => onOpen?.(event.id)}
      >
        {cardContent}
      </Link>
    );
  }

  return <div className="event-card">{cardContent}</div>;
};

function LegacyActivityCard({ event, t }) {
  const parseMeta = (meta) => {
    if (!meta) return {};
    if (typeof meta === 'object') return meta;
    try { return JSON.parse(meta); }
    catch { return {}; }
  };

  const meta = parseMeta(event?.meta);
  const type = event?.action || 'event';
  const userName = event?.user
    ? `${event.user.firstName || ''} ${event.user.secondName || ''}`.trim()
    : '';
  const avatar = getAssetUrl(
    event?.user?.avatarUrl || event?.user?.avatar,
    IMAGE_PLACEHOLDERS.avatar,
  );
  const title = meta.title || t('eventCard.eventFallback', 'Event');
  const description = meta.description || meta.institution || '';

  return (
    <div className="event-card">
      <SafeImage
        src={avatar}
        fallback={IMAGE_PLACEHOLDERS.avatar}
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
            <Calendar size={20} />
            <span>{type}</span>
          </div>
        </div>
        {description && <p className="event-card-description">{description}</p>}
      </div>
    </div>
  );
}

export default EventCard;
