import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Bookmark,
  MoreHorizontal,
  CheckCircle,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

import './EventPage.css';
import SimpleProfileCard from '../../features/SimpleProfileCard/SimpleProfileCard';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import { getErrorMessage } from '../../shared/lib/apiError';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../../shared/api/files';
import SafeImage from '../../shared/ui/SafeImage';
import {
  getEventById,
  getEventSchedule,
  getEventSpeakers,
  joinEvent,
  leaveEvent,
} from '../../features/events/eventsApi';
import { enrichEventWithOrganizer } from '../../features/events/enrichEventsWithOrganizers';
import { useTranslation } from '../../app/i18n/LocaleContext.jsx';

const EventPage = ({ onNavigate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isAttending, setIsAttending] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!eventId) return;

    setLoading(true);
    setError('');

    try {
      const [eventDto, speakersList, scheduleList] = await Promise.all([
        getEventById(eventId),
        getEventSpeakers(eventId),
        getEventSchedule(eventId),
      ]);

      if (!eventDto) {
        setEvent(null);
        return;
      }

      const enriched = await enrichEventWithOrganizer({
        ...eventDto,
        speakers: speakersList,
        schedule: scheduleList,
      });

      setEvent(enriched);
      setOrganizer(enriched.organizer);
      setSpeakers(speakersList);
      setSchedule(scheduleList);
      setIsAttending(Boolean(enriched.isAttending));
    } catch (err) {
      setError(getErrorMessage(err));
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleAttendanceToggle = async () => {
    if (!eventId || attendanceLoading) return;

    setActionError('');
    setAttendanceLoading(true);

    const previous = isAttending;
    const next = !previous;
    setIsAttending(next);
    setEvent((prev) => (prev ? { ...prev, isAttending: next } : prev));

    try {
      if (next) {
        await joinEvent(eventId);
      } else {
        await leaveEvent(eventId);
      }
    } catch (err) {
      setIsAttending(previous);
      setEvent((prev) => (prev ? { ...prev, isAttending: previous } : prev));
      setActionError(getErrorMessage(err));
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) {
    return <main className="main-content">{t('common.loading', 'Loading...')}</main>;
  }

  if (error || !event) {
    return (
      <main className="main-content">
        {error || t('event.notFound', 'Event not found')}
      </main>
    );
  }

  const dateLabel = event.date || t('event.dateTbd', 'Date TBD');
  const timeLabel = event.time || t('event.timeTbd', 'Time TBD');
  const attendeesCount = event.attendeesCount ?? 0;

  return (
    <main className="main-content">
      <div className="container">
        <div className="event-page">
          <div className="event-content-grid">
            <div className="event-main">

              <div className="event-header-card">
                <div className="event-image">
                  <SafeImage
                    src={event.coverImageUrl || event.coverUrl}
                    fallback={IMAGE_PLACEHOLDERS.event}
                    alt={event.title}
                  />
                  <span
                    className={`event-type-badge ${event.isOnline ? 'virtual' : 'in-person'}`}
                  >
                    {event.isOnline
                      ? t('event.virtual', 'Virtual')
                      : t('event.inPerson', 'In-person')}
                  </span>
                </div>

                <div className="event-header-content">
                  <h1 className="event-title">{event.title}</h1>

                  <div
                    className={`event-organizer${organizer?.id ? ' event-organizer--clickable' : ''}`}
                    onClick={
                      organizer?.id
                        ? () => navigate(`/app/profile/${organizer.id}`)
                        : undefined
                    }
                    onKeyDown={
                      organizer?.id
                        ? (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              navigate(`/app/profile/${organizer.id}`);
                            }
                          }
                        : undefined
                    }
                    role={organizer?.id ? 'button' : undefined}
                    tabIndex={organizer?.id ? 0 : undefined}
                    style={organizer?.id ? { cursor: 'pointer' } : undefined}
                  >
                    <SafeImage
                      src={organizer?.avatar || organizer?.avatarUrl}
                      fallback={IMAGE_PLACEHOLDERS.avatar}
                      alt={organizer?.name || t('event.organizer', 'Organizer')}
                    />
                    <div>
                      <div className="organizer-name">
                        <span>
                          {organizer
                            ? `${organizer.firstName} ${organizer.secondName}`.trim()
                              || organizer.name
                            : t('event.organizer', 'Organizer')}
                        </span>
                        {!organizer?.isCompany && (
                          <CheckCircle size={16} fill="#0ea5e9" color="white" />
                        )}
                      </div>
                      <span className="organizer-label">
                        {organizer?.profileTitle || t('event.organizer', 'Organizer')}
                      </span>
                    </div>
                  </div>

                  <div className="event-details">
                    <div className="event-detail">
                      <Calendar size={20} />
                      <span>{dateLabel}</span>
                    </div>
                    <div className="event-detail">
                      <Clock size={20} />
                      <span>{timeLabel}</span>
                    </div>
                    <div className="event-detail">
                      <MapPin size={20} />
                      <span>{event.location || t('event.locationTbd', 'Location TBD')}</span>
                    </div>
                    <div className="event-detail">
                      <Users size={20} />
                      <span>{t('event.attendeesCount', '{n} attendees', { n: attendeesCount })}</span>
                    </div>
                  </div>

                  {actionError && (
                    <p className="event-action-error">{actionError}</p>
                  )}

                  <div className="event-actions">
                    <button
                      type="button"
                      className={`btn-primary ${isAttending ? 'attending' : ''}`}
                      onClick={handleAttendanceToggle}
                      disabled={attendanceLoading}
                    >
                      {isAttending ? (
                        <>
                          <CheckCircle size={18} />
                          {attendanceLoading
                            ? t('event.updating', 'Updating...')
                            : t('network.events.badge.attending', 'Attending')}
                        </>
                      ) : (
                        attendanceLoading
                          ? t('event.registering', 'Registering...')
                          : t('event.register', 'Register')
                      )}
                    </button>
                    <button type="button" className="btn-secondary">
                      <Share2 size={18} />
                      {t('common.share', 'Share')}
                    </button>
                    <button type="button" className="btn-secondary">
                      <Bookmark size={18} />
                    </button>
                    <button type="button" className="btn-secondary">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="event-section-card">
                <h2>{t('event.aboutTitle', 'About this event')}</h2>
                <p>{event.description || t('event.noDescription', 'No description provided.')}</p>
              </div>

              <div className="event-section-card">
                <h2>{t('event.schedule', 'Schedule')}</h2>
                <div className="event-schedule">
                  {schedule.length === 0 ? (
                    <p className="event-section-empty">{t('event.emptySchedule', 'No schedule items yet.')}</p>
                  ) : (
                    schedule.map((item) => (
                      <div key={item.id} className="schedule-item">
                        <div className="schedule-time">{item.timeLabel}</div>
                        <div className="schedule-content">
                          <h4>{item.title}</h4>
                          {item.speakerName && <p>{item.speakerName}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="event-section-card">
                <h2>{t('event.speakers', 'Speakers')}</h2>
                <div className="speakers-grid">
                  {speakers.length === 0 ? (
                    <p className="event-section-empty">{t('event.emptySpeakers', 'No speakers listed yet.')}</p>
                  ) : (
                    speakers.map((speaker) => (
                      <div key={speaker.id} className="speaker-card">
                        <img
                          src={getAssetUrl(speaker.avatarUrl, IMAGE_PLACEHOLDERS.avatar)}
                          alt={speaker.name}
                        />
                        <h4>{speaker.name}</h4>
                        <p>{speaker.title}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            <aside className="event-sidebar">
              <SimpleProfileCard />
              <MessagesPanel onNavigate={onNavigate} />
            </aside>

          </div>
        </div>
      </div>
    </main>
  );
};

export default EventPage;
