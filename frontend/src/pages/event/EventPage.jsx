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
import { useParams } from 'react-router-dom';

import './EventPage.css';
import SimpleProfileCard from '../../features/SimpleProfileCard/SimpleProfileCard';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import { getErrorMessage } from '../../shared/lib/apiError';
import {
  getEventById,
  getEventSchedule,
  getEventSpeakers,
  joinEvent,
  leaveEvent,
} from '../../features/events/eventsApi';
import { enrichEventWithOrganizer } from '../../features/events/enrichEventsWithOrganizers';

const EventPage = ({ onNavigate }) => {
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
    return <main className="main-content">Loading...</main>;
  }

  if (error || !event) {
    return (
      <main className="main-content">
        {error || 'Event not found'}
      </main>
    );
  }

  const dateLabel = event.date || 'Date TBD';
  const timeLabel = event.time || 'Time TBD';
  const attendeesCount = event.attendeesCount ?? 0;

  return (
    <main className="main-content">
      <div className="container">
        <div className="event-page">
          <div className="event-content-grid">
            <div className="event-main">

              <div className="event-header-card">
                <div className="event-image">
                  <img
                    src={event.coverImageUrl || event.coverUrl || '/assets/event-cover.jpg'}
                    alt={event.title}
                  />
                  <span
                    className={`event-type-badge ${event.isOnline ? 'virtual' : 'in-person'}`}
                  >
                    {event.isOnline ? 'Virtual' : 'In-person'}
                  </span>
                </div>

                <div className="event-header-content">
                  <h1 className="event-title">{event.title}</h1>

                  <div className="event-organizer">
                    <img
                      src={
                        organizer?.avatar
                          || organizer?.avatarUrl
                          || '/assets/avatar-placeholder.png'
                      }
                      alt={organizer?.name || 'Organizer'}
                    />
                    <div>
                      <div className="organizer-name">
                        <span>
                          {organizer
                            ? `${organizer.firstName} ${organizer.secondName}`.trim()
                              || organizer.name
                            : 'Organizer'}
                        </span>
                        {!organizer?.isCompany && (
                          <CheckCircle size={16} fill="#0ea5e9" color="white" />
                        )}
                      </div>
                      <span className="organizer-label">
                        {organizer?.profileTitle || 'Organizer'}
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
                      <span>{event.location || 'Location TBD'}</span>
                    </div>
                    <div className="event-detail">
                      <Users size={20} />
                      <span>{attendeesCount} attendees</span>
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
                          {attendanceLoading ? 'Updating...' : 'Attending'}
                        </>
                      ) : (
                        attendanceLoading ? 'Registering...' : 'Register'
                      )}
                    </button>
                    <button type="button" className="btn-secondary">
                      <Share2 size={18} />
                      Share
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
                <h2>About this event</h2>
                <p>{event.description || 'No description provided.'}</p>
              </div>

              <div className="event-section-card">
                <h2>Schedule</h2>
                <div className="event-schedule">
                  {schedule.length === 0 ? (
                    <p className="event-section-empty">No schedule items yet.</p>
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
                <h2>Speakers</h2>
                <div className="speakers-grid">
                  {speakers.length === 0 ? (
                    <p className="event-section-empty">No speakers listed yet.</p>
                  ) : (
                    speakers.map((speaker) => (
                      <div key={speaker.id} className="speaker-card">
                        <img
                          src={speaker.avatarUrl || '/assets/avatar-placeholder.png'}
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
