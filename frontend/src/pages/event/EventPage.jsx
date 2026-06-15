import { useEffect, useState, useContext } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Bookmark,
  MoreHorizontal,
  CheckCircle
} from 'lucide-react';

import './EventPage.css';
import SimpleProfileCard from '../../features/SimpleProfileCard/SimpleProfileCard';
import MessagesPanel from '../../features/MessagesPanel/MessagesPanel';
import AppContext from '../../features/appContext/AppContext';
import { fileUrl } from '../../shared/api/files';

import { useParams } from 'react-router-dom';

const EventPage = ({ onNavigate }) => {
  const { id: eventId } = useParams();


  const { request } = useContext(AppContext);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);

    request(`api://events/${eventId}`)
      .then(res => {
        if (!cancelled) {
          setData(res);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => (cancelled = true);
  }, [eventId]);

  if (loading) {
    return <main className="main-content">Loading...</main>;
  }

  if (!data) {
    return <main className="main-content">Event not found</main>;
  }

 const { event, organizer, attendeesCount, schedule, speakers } = data;

  const startDate = new Date(event.startAt);
  const endDate = event.endAt ? new Date(event.endAt) : null;

  const dateLabel = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const timeLabel = endDate
    ? `${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="main-content">
      <div className="container">
        <div className="event-page">
          <div className="event-content-grid">
            <div className="event-main">

              {/* ================= HEADER ================= */}
              <div className="event-header-card">
                <div className="event-image">
                  <img
                    src={event.coverImageUrl ? fileUrl(event.coverImageUrl) : '/assets/event-cover.jpg'}
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
                      organizer?.avatarUrl
                        ? fileUrl(organizer.avatarUrl)
                        : '/assets/avatar-placeholder.png'
                    }
                    alt={`${organizer?.firstName} ${organizer?.secondName}`}
                  />
                  <div>
                    <div className="organizer-name">
                      <span>
                        {organizer
                          ? `${organizer.firstName} ${organizer.secondName}`
                          : 'Organizer'}
                      </span>

                      {/* пользователь верифицирован условно */}
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
                      <span>{event.location}</span>
                    </div>
                    <div className="event-detail">
                      <Users size={20} />
                      <span>{attendeesCount} attendees</span>
                    </div>
                  </div>

                  <div className="event-actions">
                    <button
                      className={`btn-primary ${isAttending ? 'attending' : ''}`}
                      onClick={() => setIsAttending(!isAttending)}
                    >
                      {isAttending ? (
                        <>
                          <CheckCircle size={18} />
                          Attending
                        </>
                      ) : (
                        'Register'
                      )}
                    </button>
                    <button className="btn-secondary">
                      <Share2 size={18} />
                      Share
                    </button>
                    <button className="btn-secondary">
                      <Bookmark size={18} />
                    </button>
                    <button className="btn-secondary">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ================= ABOUT ================= */}
              <div className="event-section-card">
                <h2>About this event</h2>
                <p>{event.description}</p>
              </div>

              {/* ================= SCHEDULE ================= */}
              <div className="event-section-card">
                <h2>Schedule</h2>
                <div className="event-schedule">
                  {schedule.map(item => (
                    <div key={item.id} className="schedule-item">
                      <div className="schedule-time">{item.timeLabel}</div>
                      <div className="schedule-content">
                        <h4>{item.title}</h4>
                        {item.speakerName && <p>{item.speakerName}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= SPEAKERS ================= */}
              <div className="event-section-card">
                <h2>Speakers</h2>
                <div className="speakers-grid">
                  {speakers.map(s => (
                    <div key={s.id} className="speaker-card">
                      <img
                        src={s.avatarUrl ? fileUrl(s.avatarUrl) : '/assets/avatar-placeholder.png'}
                        alt={s.name}
                      />
                      <h4>{s.name}</h4>
                      <p>{s.title}</p>
                    </div>
                  ))}
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
